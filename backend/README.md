# PMP Smart · Proxy de la IA

Worker de **Cloudflare** en TypeScript. Recibe la foto desde la app, consulta a Google Gemini con la clave guardada como secreto del servidor y devuelve el diagnóstico. La clave nunca está en la app ni en el repositorio.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor local en `http://localhost:8787` (lee la clave de `.dev.vars`) |
| `npm run deploy` | Publica el Worker en Cloudflare |
| `npm run typecheck` | Revisa los tipos |

## Clave de Gemini

- **En producción:** se guarda como secreto, una sola vez:
  ```bash
  npx wrangler secret put GEMINI_API_KEY
  ```
- **En local:** copia `.dev.vars.example` como `.dev.vars` y pon la clave. `.dev.vars` está en `.gitignore`.

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/health` | Estado del servidor |
| `POST` | `/api/analisis/procesar` | Analiza una foto. Cuerpo: `{ "imageBase64": "...", "language": "es" }` |

Respuesta correcta:

```json
{
  "success": true,
  "data": {
    "diagnostico": "Posible PMP",
    "estado": "alerta",
    "severidad": "moderada",
    "confianza": 92,
    "sintomas": ["..."],
    "recomendaciones": ["..."]
  }
}
```

Respuesta con error: `{ "success": false, "code": "IMAGEN_INVALIDA", "error": "La imagen no es válida..." }`. El mensaje sale en español o en inglés según `language`.

| Código | HTTP | Cuándo |
| --- | --- | --- |
| `IMAGEN_FALTANTE` | 400 | No se envió imagen |
| `IMAGEN_INVALIDA` | 415 / 422 | No es JPEG, PNG ni WebP, o Gemini no pudo leerla |
| `IMAGEN_GRANDE` | 413 | Más de 6 MB |
| `LIMITE_MINUTO` | 429 | Más de 5 análisis por minuto desde la misma IP |
| `LIMITE_DIARIO` | 429 | Más de 30 análisis al día desde la misma IP |
| `CUOTA_AGOTADA` | 503 | Se agotó la cuota de Gemini |
| `IA_NO_DISPONIBLE` | 503 | Gemini no respondió |
| `SERVIDOR_SIN_CLAVE` | 500 | Falta el secreto o la clave es inválida |

## Protección de la cuota

- El tipo de imagen se valida con sus primeros bytes, no con lo que diga el cliente.
- Límite por minuto con el [Rate Limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/) de Workers.
- Límite diario por IP con un contador en Workers KV (`CUOTA`).
- Los límites se cambian en `wrangler.toml` (`LIMITE_DIARIO`, `[[ratelimits]]`), igual que la lista de modelos (`MODELOS`).
