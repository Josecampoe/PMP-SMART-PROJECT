# PMP Smart · Backend

API REST en **Express 5** y TypeScript. Recibe una imagen en base64 y la analiza con Google Gemini.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor con recarga automática |
| `npm start` | Servidor sin recarga |
| `npm run typecheck` | Revisa los tipos |
| `npm run build` | Compila a `dist/` |

## Variables de entorno

Copia `.env.example` como `.env` y completa los valores. El archivo `.env` está en `.gitignore`.

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/health` | Estado del servidor |
| `POST` | `/api/analisis/procesar` | Analiza una imagen. Cuerpo: `{ "imageBase64": "data:image/jpeg;base64,..." }` |

Respuesta de `/procesar`:

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
