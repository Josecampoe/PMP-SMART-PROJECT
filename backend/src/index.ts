// Proxy de PMP Smart: recibe la foto desde la app, llama a Google Gemini con la
// clave guardada como secreto del servidor y devuelve el diagnóstico.

export interface Env {
  GEMINI_API_KEY: string;
  LIMITE_DIARIO: string;
  MODELOS: string;
  LIMITE_MINUTO: RateLimit;
  CUOTA: KVNamespace;
}

type Idioma = 'es' | 'en';

const VERSION = '1.3.0';
const MAX_IMAGEN_BYTES = 6 * 1024 * 1024; // 6 MB de imagen
const MAX_CUERPO_BYTES = Math.ceil((MAX_IMAGEN_BYTES * 4) / 3) + 64 * 1024; // en base64 + margen
const TIEMPO_POR_MODELO_MS = 20_000;

const ESTADOS = ['alerta', 'sano', 'observacion'];
const SEVERIDADES = ['baja', 'moderada', 'alta', 'ninguna'];

// ------------------------------------------------------------
// Errores
// ------------------------------------------------------------

type CodigoError =
  | 'IMAGEN_FALTANTE'
  | 'IMAGEN_INVALIDA'
  | 'IMAGEN_GRANDE'
  | 'PETICION_INVALIDA'
  | 'LIMITE_MINUTO'
  | 'LIMITE_DIARIO'
  | 'CUOTA_AGOTADA'
  | 'IA_NO_DISPONIBLE'
  | 'IA_RESPUESTA_INVALIDA'
  | 'SERVIDOR_SIN_CLAVE'
  | 'RUTA_NO_ENCONTRADA';

const MENSAJES: Record<CodigoError, Record<Idioma, string>> = {
  IMAGEN_FALTANTE: {
    es: 'No se envió ninguna imagen para analizar.',
    en: 'No image was sent for analysis.',
  },
  IMAGEN_INVALIDA: {
    es: 'La imagen no es válida. Usa una foto JPG, PNG o WebP.',
    en: 'The image is not valid. Use a JPG, PNG or WebP photo.',
  },
  IMAGEN_GRANDE: {
    es: 'La imagen es demasiado grande (máximo 6 MB). Toma la foto de nuevo.',
    en: 'The image is too large (6 MB max). Please take the photo again.',
  },
  PETICION_INVALIDA: {
    es: 'La petición no tiene el formato esperado.',
    en: 'The request does not have the expected format.',
  },
  LIMITE_MINUTO: {
    es: 'Hiciste muchos análisis seguidos. Espera un minuto e intenta de nuevo.',
    en: 'Too many analyses in a row. Wait a minute and try again.',
  },
  LIMITE_DIARIO: {
    es: 'Llegaste al límite de análisis de hoy. Vuelve a intentarlo mañana.',
    en: 'You reached today’s analysis limit. Try again tomorrow.',
  },
  CUOTA_AGOTADA: {
    es: 'La IA alcanzó su cuota de uso por ahora. Intenta de nuevo más tarde.',
    en: 'The AI reached its usage quota for now. Try again later.',
  },
  IA_NO_DISPONIBLE: {
    es: 'La IA no está disponible en este momento. Intenta de nuevo en unos minutos.',
    en: 'The AI is not available right now. Try again in a few minutes.',
  },
  IA_RESPUESTA_INVALIDA: {
    es: 'La IA no devolvió un diagnóstico válido. Intenta con otra foto.',
    en: 'The AI did not return a valid diagnosis. Try another photo.',
  },
  SERVIDOR_SIN_CLAVE: {
    es: 'El servidor no tiene configurada la IA. Avisa al administrador.',
    en: 'The server has no AI configured. Please contact the administrator.',
  },
  RUTA_NO_ENCONTRADA: {
    es: 'Ruta no encontrada.',
    en: 'Route not found.',
  },
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

function json(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS, ...extra },
  });
}

function error(code: CodigoError, status: number, idioma: Idioma, extra: Record<string, string> = {}): Response {
  return json({ success: false, code, error: MENSAJES[code][idioma] }, status, extra);
}

// ------------------------------------------------------------
// Imagen
// ------------------------------------------------------------

/** Lee los primeros bytes y devuelve el tipo real de la imagen, o null si no es JPEG, PNG ni WebP. */
function detectarTipo(base64: string): string | null {
  let bytes: string;
  try {
    bytes = atob(base64.slice(0, 16));
  } catch {
    return null;
  }
  const b = (i: number) => bytes.charCodeAt(i);
  if (b(0) === 0xff && b(1) === 0xd8 && b(2) === 0xff) return 'image/jpeg';
  if (b(0) === 0x89 && bytes.slice(1, 4) === 'PNG') return 'image/png';
  if (bytes.slice(0, 4) === 'RIFF' && bytes.slice(8, 12) === 'WEBP') return 'image/webp';
  return null;
}

function bytesDeBase64(base64: string): number {
  const relleno = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - relleno;
}

// ------------------------------------------------------------
// Gemini
// ------------------------------------------------------------

function prompt(idioma: Idioma): string {
  if (idioma === 'en') {
    return `You are an expert plant pathologist and agronomist specializing in potato diseases. Analyze the following potato plant/leaf image.
Look for visual symptoms of "Potato Purple Top" (PMP) or "Zebra Chip" syndrome.
Strictly return a valid JSON object matching this exact structure (no markdown fences, no explanatory text outside the JSON):
{
  "diagnostico": "Possible PMP" or "Healthy" or "Severe PMP" or "Nutritional Deficiency",
  "estado": "alerta" or "sano" or "observacion",
  "severidad": "baja" or "moderada" or "alta" or "ninguna",
  "confianza": 95,
  "sintomas": ["symptom 1 in English", "symptom 2 in English"],
  "recomendaciones": ["recommendation 1 in English", "recommendation 2 in English"]
}
Notice: 'estado' and 'severidad' must remain as standard key values, but 'diagnostico', 'sintomas', and 'recomendaciones' MUST be written entirely in fluent, professional English.`;
  }
  return `Eres un agrónomo experto en patología vegetal de la papa. Analiza la siguiente imagen.
Busca signos visuales de "Punta Morada de la Papa" (PMP).
Devuelve estrictamente un JSON válido con esta estructura exacta (no uses markdown ni texto adicional fuera del JSON):
{
  "diagnostico": "Posible PMP" o "Sano" o "PMP Severo" o "Deficiencia Nutricional",
  "estado": "alerta" o "sano" o "observacion",
  "severidad": "baja" o "moderada" o "alta" o "ninguna",
  "confianza": 95,
  "sintomas": ["sintoma 1", "sintoma 2"],
  "recomendaciones": ["recomendacion 1", "recomendacion 2"]
}`;
}

/** Acepta 92 o 0.92 y devuelve un entero entre 0 y 100. */
function porcentaje(valor: unknown): number {
  let n = Number(valor) || 0;
  if (n > 0 && n <= 1) n *= 100;
  return Math.round(Math.max(0, Math.min(100, n)));
}

function normalizar(datos: any) {
  const texto = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const lista = (v: unknown) => (Array.isArray(v) ? v.map(texto).filter(Boolean).slice(0, 8) : []);
  return {
    diagnostico: texto(datos?.diagnostico) || 'Sin diagnóstico',
    estado: ESTADOS.includes(datos?.estado) ? datos.estado : 'observacion',
    severidad: SEVERIDADES.includes(datos?.severidad) ? datos.severidad : 'ninguna',
    confianza: porcentaje(datos?.confianza),
    sintomas: lista(datos?.sintomas),
    recomendaciones: lista(datos?.recomendaciones),
  };
}

type ResultadoGemini =
  | { ok: true; data: ReturnType<typeof normalizar>; modelo: string }
  | { ok: false; code: CodigoError; status: number };

async function analizarConGemini(env: Env, base64: string, mimeType: string, idioma: Idioma): Promise<ResultadoGemini> {
  const cuerpo = JSON.stringify({
    contents: [{ parts: [{ text: prompt(idioma) }, { inlineData: { mimeType, data: base64 } }] }],
    // Razonamiento bajo: responde en segundos en lugar de medio minuto
    generationConfig: { responseMimeType: 'application/json', temperature: 0.2, thinkingConfig: { thinkingLevel: 'low' } },
  });

  const modelos = env.MODELOS.split(',').map((m) => m.trim()).filter(Boolean);
  let fallo: { code: CodigoError; status: number } = { code: 'IA_NO_DISPONIBLE', status: 503 };

  for (const modelo of modelos) {
    let res: Response;
    try {
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
        body: cuerpo,
        signal: AbortSignal.timeout(TIEMPO_POR_MODELO_MS),
      });
    } catch (e: any) {
      console.warn(`[${modelo}] sin respuesta: ${e?.message}`);
      continue;
    }

    if (!res.ok) {
      const detalle: any = await res.json().catch(() => null);
      const estado = detalle?.error?.status as string | undefined;
      console.warn(`[${modelo}] HTTP ${res.status} ${estado ?? ''}: ${detalle?.error?.message ?? ''}`);

      const claveInvalida =
        JSON.stringify(detalle?.error?.details ?? '').includes('API_KEY_INVALID') ||
        /api key/i.test(detalle?.error?.message ?? '');
      if (claveInvalida || res.status === 401 || res.status === 403) {
        return { ok: false, code: 'SERVIDOR_SIN_CLAVE', status: 500 };
      }
      if (res.status === 400 && estado === 'INVALID_ARGUMENT' && /image|inline|mime|base64/i.test(detalle?.error?.message ?? '')) {
        // Gemini no pudo leer la imagen: otro modelo tampoco podrá
        return { ok: false, code: 'IMAGEN_INVALIDA', status: 422 };
      }
      if (res.status === 429) fallo = { code: 'CUOTA_AGOTADA', status: 503 };
      continue; // 400 por configuración, 404 (modelo retirado), 429, 5xx: probar el siguiente
    }

    const resultado: any = await res.json().catch(() => null);
    const texto: string | undefined = resultado?.candidates?.[0]?.content?.parts?.find((p: any) => p?.text)?.text;
    const coincidencia = texto?.match(/\{[\s\S]*\}/);
    if (!coincidencia) {
      fallo = { code: 'IA_RESPUESTA_INVALIDA', status: 502 };
      continue;
    }
    try {
      return { ok: true, data: normalizar(JSON.parse(coincidencia[0])), modelo };
    } catch {
      fallo = { code: 'IA_RESPUESTA_INVALIDA', status: 502 };
    }
  }

  return { ok: false, ...fallo };
}

// ------------------------------------------------------------
// Límite diario por IP
// ------------------------------------------------------------

/** Suma un análisis al contador de hoy. Devuelve false si la IP ya llegó al límite. */
async function contarAnalisisDiario(env: Env, ip: string): Promise<boolean> {
  const limite = Number(env.LIMITE_DIARIO) || 30;
  const hoy = new Date().toISOString().slice(0, 10);
  const clave = `dia:${hoy}:${ip}`;
  try {
    const usados = Number(await env.CUOTA.get(clave)) || 0;
    if (usados >= limite) return false;
    await env.CUOTA.put(clave, String(usados + 1), { expirationTtl: 60 * 60 * 48 });
  } catch (e: any) {
    // Si KV falla (por ejemplo, por su propio límite gratis) no se bloquea al usuario:
    // el límite por minuto sigue protegiendo la cuota.
    console.warn(`KV no disponible: ${e?.message}`);
  }
  return true;
}

// ------------------------------------------------------------
// Rutas
// ------------------------------------------------------------

async function procesar(request: Request, env: Env): Promise<Response> {
  const idiomaCabecera: Idioma = (request.headers.get('Accept-Language') || '').startsWith('en') ? 'en' : 'es';

  if (!env.GEMINI_API_KEY) {
    console.error('Falta el secreto GEMINI_API_KEY');
    return error('SERVIDOR_SIN_CLAVE', 500, idiomaCabecera);
  }

  const tamano = Number(request.headers.get('Content-Length') || 0);
  if (tamano > MAX_CUERPO_BYTES) return error('IMAGEN_GRANDE', 413, idiomaCabecera);

  let cuerpo: any;
  try {
    const texto = await request.text();
    if (texto.length > MAX_CUERPO_BYTES) return error('IMAGEN_GRANDE', 413, idiomaCabecera);
    cuerpo = JSON.parse(texto);
  } catch {
    return error('PETICION_INVALIDA', 400, idiomaCabecera);
  }

  const idioma: Idioma = cuerpo?.language === 'en' ? 'en' : cuerpo?.language === 'es' ? 'es' : idiomaCabecera;

  let base64 = typeof cuerpo?.imageBase64 === 'string' ? cuerpo.imageBase64.trim() : '';
  if (!base64) return error('IMAGEN_FALTANTE', 400, idioma);
  const coma = base64.indexOf(';base64,');
  if (base64.startsWith('data:') && coma !== -1) base64 = base64.slice(coma + 8);

  if (bytesDeBase64(base64) > MAX_IMAGEN_BYTES) return error('IMAGEN_GRANDE', 413, idioma);
  const mimeType = detectarTipo(base64);
  if (!mimeType || bytesDeBase64(base64) < 1024) return error('IMAGEN_INVALIDA', 415, idioma);

  // Límites por IP: solo cuentan las peticiones válidas que sí llegarían a Gemini
  const ip = request.headers.get('CF-Connecting-IP') || 'desconocida';
  const { success: dentroDelMinuto } = await env.LIMITE_MINUTO.limit({ key: ip });
  if (!dentroDelMinuto) return error('LIMITE_MINUTO', 429, idioma, { 'Retry-After': '60' });
  if (!(await contarAnalisisDiario(env, ip))) return error('LIMITE_DIARIO', 429, idioma);

  const resultado = await analizarConGemini(env, base64, mimeType, idioma);
  if (!resultado.ok) return error(resultado.code, resultado.status, idioma);

  return json({ success: true, data: resultado.data });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    if (request.method === 'GET' && (pathname === '/api/health' || pathname === '/')) {
      return json({ success: true, message: 'PMP Smart API funcionando.', version: VERSION, ia: Boolean(env.GEMINI_API_KEY) });
    }

    if (request.method === 'POST' && pathname === '/api/analisis/procesar') {
      try {
        return await procesar(request, env);
      } catch (e: any) {
        console.error(`Error no controlado: ${e?.message}`);
        return error('IA_NO_DISPONIBLE', 500, 'es');
      }
    }

    return error('RUTA_NO_ENCONTRADA', 404, 'es');
  },
} satisfies ExportedHandler<Env>;
