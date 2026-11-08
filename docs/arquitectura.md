# Arquitectura

## Visión general

```
Celular (Expo)                         Nube
┌──────────────────────────┐
│ Pantallas (expo-router)  │
│        │                 │
│   AppContext (estado)    │
│        │                 │
│   lib/api.ts ────────────┼──────► backend/ (Cloudflare Worker)
│        │                 │            │  clave como secreto
│   AsyncStorage (local)   │            ▼
│                          │        Google Gemini (diagnóstico)
└──────────────────────────┘
```

## Datos

La app funciona sin base de datos: parcelas, análisis, perfiles y vínculos se guardan en `AsyncStorage` del dispositivo. `lib/api.ts` expone la misma interfaz que tendría una API remota (`cultivosApi`, `analisisApi`, `perfilApi`, `vinculosApi`), lo que permite cambiar a un servidor real sin tocar las pantallas.

## Estado global

`context/AppContext.tsx` concentra:

- Rol activo (agricultor o técnico) y perfiles.
- Parcelas y análisis, filtrados según el rol: el técnico solo ve las parcelas que vinculó con un código.
- Preferencias: modo oscuro e idioma, guardadas entre sesiones.
- El tema de colores activo (`theme`) y la función de traducción `t()`.

## Flujo de un diagnóstico

1. `camera.tsx` toma la foto (o la elige de la galería) en base64 y la guarda en el contexto.
2. `camera.tsx` reduce la foto a 1280 px (`lib/imagen.ts`) para que suba rápido con poca señal.
3. `resultado.tsx` la envía a `analisisApi.procesar`, que la manda al proxy (`EXPO_PUBLIC_API_URL`). Si tarda, muestra "Despertando el servidor…" y reintenta.
4. El proxy valida la imagen, aplica los límites por IP y consulta Gemini con varios modelos de respaldo.
5. El usuario guarda el análisis, con o sin solicitud de revisión técnica.
6. El técnico lo ve en su historial y emite el dictamen, que actualiza el estado de la parcela.
