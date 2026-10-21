import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ApiResponse,
  AuthResponse,
  LoginDTO,
  RegisterDTO,
  PerfilResponse,
  Cultivo,
  CreateCultivoDTO,
  UpdateCultivoDTO,
  Analisis,
  CreateAnalisisDTO,
  CreateRevisionDTO,
  RevisionTecnica,
  RolUsuario,
} from './types';
import * as FileSystem from 'expo-file-system/legacy'; // For reading/moving files
import { LogBox } from 'react-native';

LogBox.ignoreLogs(["Response.blob() is using React Native's Blob"]);

export type {
  ApiResponse,
  AuthResponse,
  LoginDTO,
  RegisterDTO,
  PerfilResponse,
  Cultivo,
  CreateCultivoDTO,
  UpdateCultivoDTO,
  Analisis,
  CreateAnalisisDTO,
  CreateRevisionDTO,
  RevisionTecnica,
  RolUsuario,
};

// ============================================================
// Configuración
// ============================================================
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

// Constantes de AsyncStorage
const TOKEN_KEY = '@pmp_smart_access_token';
const PERFIL_KEY = '@pmp_smart_perfil';
const CULTIVOS_KEY = '@pmp_smart_cultivos';
const ANALISIS_KEY = '@pmp_smart_analisis';
const USERS_KEY = '@pmp_smart_users';
const PARCELAS_VINCULADAS_KEY = '@pmp_smart_parcelas_vinculadas_tecnico';

export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

// Generador de IDs locales
const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

// Generador de código único de 6 caracteres para parcelas (ej: A7B9X2)
export function generarCodigoParcela(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Formatear fecha (similar al backend anterior)
function formatearFecha(): string {
  const now = new Date();
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const dia = String(now.getDate()).padStart(2, '0');
  const mes = meses[now.getMonth()];
  const anio = now.getFullYear();
  const horas = now.getHours();
  const minutos = String(now.getMinutes()).padStart(2, '0');
  const ampm = horas >= 12 ? 'PM' : 'AM';
  const hora12 = horas % 12 || 12;
  return `${dia} ${mes} ${anio} - ${hora12}:${minutos} ${ampm}`;
}

// Helper para AsyncStorage
async function getLocalData<T>(key: string, defaultValue: T): Promise<T> {
  const data = await AsyncStorage.getItem(key);
  if (!data) return defaultValue;
  try {
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

async function saveLocalData<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// Fetch (Solo usado para el AI endpoint)
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    return (await response.json()) as ApiResponse<T>;
  } catch (error) {
    console.warn(`Error en API ${endpoint}:`, error);
    return { success: false, error: 'Error de conexión con el servidor.' };
  }
}

// ============================================================
// Eventos de Autenticación
// ============================================================

type AuthListener = (isAuthenticated: boolean) => void;
const authListeners = new Set<AuthListener>();

export const authEvents = {
  subscribe: (listener: AuthListener) => {
    authListeners.add(listener);
    return () => { authListeners.delete(listener); };
  },
  notify: (isAuthenticated: boolean) => {
    authListeners.forEach(l => l(isAuthenticated));
  }
};

// ============================================================
// API de Autenticación (Mocked)
// ============================================================

export const authApi = {
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    // Validar usuario contra el registro local
    const users = await getLocalData<any[]>(USERS_KEY, []);
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      // Intentar login por defecto solo si no hay usuarios creados (para desarrollo fácil)
      if (users.length > 0) {
        return { success: false, error: 'Credenciales inválidas. Verifica tu correo y contraseña.' };
      }
    }

    const dummyToken = 'local_dummy_token_' + email;
    await AsyncStorage.setItem(TOKEN_KEY, dummyToken);
    
    // Configurar perfil por defecto si no existe o actualizarlo al del usuario actual
    const perfil = await getLocalData<PerfilResponse | null>(PERFIL_KEY, null);
    if (!perfil || (user && perfil.rol !== user.rol)) {
      await saveLocalData<PerfilResponse>(PERFIL_KEY, {
        rol: user ? user.rol : 'agricultor',
        agricultor: {
          nombre: user ? user.nombre : 'Usuario Local',
          email,
          fincaPrincipal: 'Mi Finca',
          ubicacion: 'Local',
          telefono: '',
          notificaciones: true,
          modoOffline: true
        }
      });
    }

    authEvents.notify(true);
    return {
      success: true,
      data: {
        accessToken: dummyToken,
        refreshToken: dummyToken,
        user: { id: 'local_user', email }
      }
    };
  },

  async register(data: RegisterDTO): Promise<ApiResponse<AuthResponse>> {
    const users = await getLocalData<any[]>(USERS_KEY, []);
    const existing = users.find(u => u.email === data.email);
    
    if (existing) {
      return { success: false, error: 'Este correo ya se encuentra registrado.' };
    }
    
    users.push({
      email: data.email,
      password: data.password,
      nombre: data.nombre,
      rol: data.rol
    });
    
    await saveLocalData(USERS_KEY, users);

    const dummyToken = 'local_dummy_token_' + data.email;
    await AsyncStorage.setItem(TOKEN_KEY, dummyToken);

    const perfil: PerfilResponse = {
      rol: data.rol,
      ...(data.rol === 'agricultor' ? {
        agricultor: {
          nombre: data.nombre,
          email: data.email,
          fincaPrincipal: 'Mi Finca',
          ubicacion: '',
          telefono: '',
          notificaciones: true,
          modoOffline: true
        }
      } : {
        tecnico: {
          nombre: data.nombre,
          email: data.email,
          registroProfesional: '',
          especialidad: '',
          entidad: '',
          telefono: '',
          notificaciones: true
        }
      })
    };

    await saveLocalData(PERFIL_KEY, perfil);

    authEvents.notify(true);
    return {
      success: true,
      data: {
        accessToken: dummyToken,
        refreshToken: dummyToken,
        user: { id: 'local_user', email: data.email }
      }
    };
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
    authEvents.notify(false);
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return !!token;
  },
};

// ============================================================
// API de Perfil (Mocked)
// ============================================================

export const perfilApi = {
  async get(): Promise<ApiResponse<PerfilResponse>> {
    const perfil = await getLocalData<PerfilResponse | null>(PERFIL_KEY, null);
    if (!perfil) return { success: false, error: 'Perfil no encontrado' };
    return { success: true, data: perfil };
  },

  async update(datos: Record<string, any>): Promise<ApiResponse> {
    const perfil = await getLocalData<PerfilResponse | null>(PERFIL_KEY, null);
    if (!perfil) return { success: false, error: 'Perfil no encontrado' };
    
    if (perfil.rol === 'agricultor' && perfil.agricultor) {
      perfil.agricultor = { ...perfil.agricultor, ...datos };
    } else if (perfil.rol === 'tecnico' && perfil.tecnico) {
      perfil.tecnico = { ...perfil.tecnico, ...datos };
    }

    await saveLocalData(PERFIL_KEY, perfil);
    return { success: true };
  },

  async cambiarRol(rol: RolUsuario): Promise<ApiResponse> {
    const perfil = await getLocalData<PerfilResponse | null>(PERFIL_KEY, null);
    if (!perfil) return { success: false, error: 'Perfil no encontrado' };
    
    perfil.rol = rol;
    if (rol === 'agricultor' && !perfil.agricultor) {
      perfil.agricultor = {
        nombre: perfil.tecnico?.nombre || 'Usuario',
        email: perfil.tecnico?.email || '',
        fincaPrincipal: 'Mi Finca',
        ubicacion: '',
        telefono: perfil.tecnico?.telefono || '',
        notificaciones: true,
        modoOffline: true
      };
    } else if (rol === 'tecnico' && !perfil.tecnico) {
      perfil.tecnico = {
        nombre: perfil.agricultor?.nombre || 'Usuario',
        email: perfil.agricultor?.email || '',
        registroProfesional: '',
        especialidad: '',
        entidad: '',
        telefono: perfil.agricultor?.telefono || '',
        notificaciones: true
      };
    }

    await saveLocalData(PERFIL_KEY, perfil);
    return { success: true };
  },
};

// ============================================================
// API de Cultivos (Local Storage)
// ============================================================

export const cultivosApi = {
  async list(): Promise<ApiResponse<Cultivo[]>> {
    let cultivos = await getLocalData<Cultivo[]>(CULTIVOS_KEY, []);
    let modified = false;
    cultivos = cultivos.map(c => {
      if (!c.codigoAcceso) {
        modified = true;
        return { ...c, codigoAcceso: generarCodigoParcela() };
      }
      return c;
    });
    if (modified) {
      await saveLocalData(CULTIVOS_KEY, cultivos);
    }
    return { success: true, data: cultivos };
  },

  async create(data: CreateCultivoDTO): Promise<ApiResponse<Cultivo>> {
    const cultivos = await getLocalData<Cultivo[]>(CULTIVOS_KEY, []);
    const newCultivo: Cultivo = {
      ...data,
      id: generateId(),
      codigoAcceso: data.codigoAcceso || generarCodigoParcela(),
      estadoFitosanitario: data.estadoFitosanitario || 'optimo',
      analisisCount: 0,
      ultimaRevision: 'Nunca',
    };
    cultivos.push(newCultivo);
    await saveLocalData(CULTIVOS_KEY, cultivos);
    return { success: true, data: newCultivo };
  },

  async update(id: string, data: UpdateCultivoDTO): Promise<ApiResponse<Cultivo>> {
    const cultivos = await getLocalData<Cultivo[]>(CULTIVOS_KEY, []);
    const idx = cultivos.findIndex(c => c.id === id);
    if (idx === -1) return { success: false, error: 'Cultivo no encontrado' };
    
    cultivos[idx] = { ...cultivos[idx], ...data };
    await saveLocalData(CULTIVOS_KEY, cultivos);
    return { success: true, data: cultivos[idx] };
  },

  async delete(id: string): Promise<ApiResponse> {
    let cultivos = await getLocalData<Cultivo[]>(CULTIVOS_KEY, []);
    cultivos = cultivos.filter(c => c.id !== id);
    await saveLocalData(CULTIVOS_KEY, cultivos);
    return { success: true };
  },
};

// ============================================================
// API de Análisis (Local Storage + Backend AI)
// ============================================================

export const analisisApi = {
  // Procesar imagen directamente con Gemini AI (sin depender de un backend o servidor)
  async procesar(imageUri: string, language: 'es' | 'en' = 'es'): Promise<ApiResponse<any>> {
    if (!GEMINI_API_KEY) {
      return {
        success: false,
        error: language === 'en'
          ? 'The AI key is not configured (EXPO_PUBLIC_GEMINI_API_KEY).'
          : 'Falta configurar la clave de la IA (EXPO_PUBLIC_GEMINI_API_KEY).',
      };
    }
    try {
      const cleanUri = decodeURIComponent(imageUri);
      let base64 = '';
      let mimeType = 'image/jpeg';

      if (cleanUri.startsWith('data:image')) {
        const parts = cleanUri.split(';base64,');
        mimeType = parts[0].replace('data:', '') || 'image/jpeg';
        base64 = parts[1];
      } else if (cleanUri.startsWith('http')) {
        const response = await fetch(cleanUri);
        const blob = await response.blob();
        base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              const res = reader.result;
              if (res.includes(';base64,')) {
                resolve(res.split(';base64,')[1]);
              } else {
                resolve(res);
              }
            } else {
              reject(new Error('FileReader no retornó string'));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        base64 = await FileSystem.readAsStringAsync(cleanUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        if (cleanUri.toLowerCase().endsWith('.png')) {
          mimeType = 'image/png';
        }
      }

      if (!base64) {
        return { success: false, error: language === 'en' ? 'Could not retrieve image for analysis.' : 'No se pudo obtener la imagen para el análisis.' };
      }

      const prompt = language === 'en'
        ? `You are an expert plant pathologist and agronomist specializing in potato diseases. Analyze the following potato plant/leaf image.
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
Notice: 'estado' and 'severidad' must remain as standard key values, but 'diagnostico', 'sintomas', and 'recomendaciones' MUST be written entirely in fluent, professional English.`
        : `Eres un agrónomo experto en patología vegetal de la papa. Analiza la siguiente imagen.
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

      // Modelos oficiales vigentes y verificados con respaldo automático
      const models = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.5-flash'];
      let parsedData: any = null;
      let lastErrorMessage = '';

      for (const model of models) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: base64,
                    }
                  }
                ]
              }],
              generationConfig: {
                responseMimeType: 'application/json'
              }
            })
          });

          if (!response.ok) {
            const errJson = await response.json().catch(() => null);
            lastErrorMessage = errJson?.error?.message || `HTTP ${response.status}`;
            console.warn(`[Gemini Direct] Modelo ${model} respondió error:`, lastErrorMessage);
            continue;
          }

          const result = await response.json();
          const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText) {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              parsedData = JSON.parse(jsonMatch[0]);
              break;
            }
          }
        } catch (mErr: any) {
          lastErrorMessage = mErr.message;
          console.warn(`[Gemini Direct] Excepción con modelo ${model}:`, mErr.message);
        }
      }

      if (!parsedData) {
        return {
          success: false,
          error: lastErrorMessage ? `Error de IA: ${lastErrorMessage}` : 'No se pudo generar el diagnóstico con IA.'
        };
      }

      return { success: true, data: parsedData };
    } catch (e: any) {
      console.warn('Error procesando imagen localmente:', e.message);
      return { success: false, error: 'Error procesando la imagen con IA.' };
    }
  },

  async list(): Promise<ApiResponse<Analisis[]>> {
    const analisisList = await getLocalData<Analisis[]>(ANALISIS_KEY, []);
    // Ordenar por fecha o simplemente devolver invertido para mostrar los más recientes primero
    return { success: true, data: analisisList.reverse() };
  },

  async create(data: CreateAnalisisDTO, localImageUri?: string): Promise<ApiResponse<Analisis>> {
    // Si la imagen es temporal en Expo (ej. Cache), es buena idea moverla al DocumentDirectory
    // Pero para simplificar, asumiremos que Expo Camera ya nos dio una URI usable, o que 
    // la guardamos localmente tal cual.
    let finalImageUri = localImageUri || data.imageUri || '';

    // En un app real sin backend, querrás copiar la imagen a FileSystem.documentDirectory
    // para evitar que se borre de la caché.
    if (finalImageUri && finalImageUri.startsWith('file://')) {
      try {
        const fileName = finalImageUri.split('/').pop() || `img_${Date.now()}.jpg`;
        const newPath = FileSystem.documentDirectory + fileName;
        await FileSystem.copyAsync({ from: finalImageUri, to: newPath });
        finalImageUri = newPath;
      } catch (e) {
        console.warn('Error copiando imagen al directorio de documentos:', e);
      }
    }

    const analisisList = await getLocalData<Analisis[]>(ANALISIS_KEY, []);
    const newAnalisis: Analisis = {
      ...data,
      id: generateId(),
      fecha: formatearFecha(),
      imageUri: finalImageUri,
      estadoRevision: data.estadoRevision || 'sin_solicitar',
      sintomas: data.sintomas || [],
      recomendaciones: data.recomendaciones || [],
    };
    
    analisisList.push(newAnalisis);
    await saveLocalData(ANALISIS_KEY, analisisList);

    // Actualizar contadores del cultivo local si aplica
    if (data.cultivoId && !data.cultivoId.startsWith('c-')) {
      const cultivos = await getLocalData<Cultivo[]>(CULTIVOS_KEY, []);
      const cIdx = cultivos.findIndex(c => c.id === data.cultivoId);
      if (cIdx !== -1) {
        cultivos[cIdx].analisisCount = (cultivos[cIdx].analisisCount || 0) + 1;
        cultivos[cIdx].ultimaRevision = 'Hoy';
        if (data.estado === 'alerta') cultivos[cIdx].estadoFitosanitario = 'alerta';
        else if (data.estado === 'observacion' && cultivos[cIdx].estadoFitosanitario !== 'alerta') cultivos[cIdx].estadoFitosanitario = 'observacion';
        await saveLocalData(CULTIVOS_KEY, cultivos);
      }
    }

    return { success: true, data: newAnalisis };
  },

  async delete(id: string): Promise<ApiResponse> {
    let analisisList = await getLocalData<Analisis[]>(ANALISIS_KEY, []);
    analisisList = analisisList.filter(a => a.id !== id);
    await saveLocalData(ANALISIS_KEY, analisisList);
    return { success: true };
  },

  async solicitarRevision(id: string): Promise<ApiResponse> {
    const analisisList = await getLocalData<Analisis[]>(ANALISIS_KEY, []);
    const aIdx = analisisList.findIndex(a => a.id === id);
    if (aIdx !== -1) {
      analisisList[aIdx].estadoRevision = 'pendiente';
      await saveLocalData(ANALISIS_KEY, analisisList);
    }
    return { success: true };
  },
};

// ============================================================
// API de Revisiones Técnicas (Mocked Local Storage)
// ============================================================

export const revisionesApi = {
  async listPendientes(): Promise<ApiResponse<Analisis[]>> {
    const analisisList = await getLocalData<Analisis[]>(ANALISIS_KEY, []);
    const pendientes = analisisList.filter(a => a.estadoRevision === 'pendiente');
    return { success: true, data: pendientes };
  },

  async guardarDictamen(analisisId: string, data: CreateRevisionDTO): Promise<ApiResponse<RevisionTecnica>> {
    const analisisList = await getLocalData<Analisis[]>(ANALISIS_KEY, []);
    const aIdx = analisisList.findIndex(a => a.id === analisisId);
    if (aIdx === -1) return { success: false, error: 'Análisis no encontrado' };

    const revision: RevisionTecnica = {
      ...data,
      fechaRevision: formatearFecha(),
    };
    analisisList[aIdx].estadoRevision = 'revisado';
    analisisList[aIdx].revisionTecnica = revision;

    await saveLocalData(ANALISIS_KEY, analisisList);
    return { success: true, data: revision };
  },
};

// ============================================================
// API de Vínculos (Mocked Local Storage)
// ============================================================

export const vinculosApi = {
  async getCodigosVinculados(): Promise<string[]> {
    return getLocalData<string[]>(PARCELAS_VINCULADAS_KEY, []);
  },

  async vincular(codigo: string): Promise<ApiResponse<{ cultivo: Cultivo; agricultorNombre: string }>> {
    const cleanCode = codigo.trim().toUpperCase();
    const cultivos = await getLocalData<Cultivo[]>(CULTIVOS_KEY, []);
    const cultivo = cultivos.find(c => (c.codigoAcceso || '').toUpperCase() === cleanCode);

    if (!cultivo) {
      return {
        success: false,
        error: 'No se encontró ninguna parcela con este código. Verifica el código con el agricultor.',
      };
    }

    const vinculosActuales = await getLocalData<string[]>(PARCELAS_VINCULADAS_KEY, []);
    if (!vinculosActuales.includes(cleanCode)) {
      vinculosActuales.push(cleanCode);
      await saveLocalData(PARCELAS_VINCULADAS_KEY, vinculosActuales);
    }

    const perfil = await getLocalData<PerfilResponse | null>(PERFIL_KEY, null);
    const agricultorNombre = perfil?.agricultor?.nombre || 'Agricultor';

    return {
      success: true,
      data: {
        cultivo,
        agricultorNombre,
      },
    };
  },

  async desvincular(codigo: string): Promise<ApiResponse<void>> {
    const cleanCode = codigo.trim().toUpperCase();
    let vinculosActuales = await getLocalData<string[]>(PARCELAS_VINCULADAS_KEY, []);
    vinculosActuales = vinculosActuales.filter(c => c !== cleanCode);
    await saveLocalData(PARCELAS_VINCULADAS_KEY, vinculosActuales);
    return { success: true };
  },

  async getAgricultores(): Promise<ApiResponse<any[]>> {
    return { success: true, data: [] };
  },

  async revocar(id: string): Promise<ApiResponse<void>> {
    return { success: true };
  },
};
