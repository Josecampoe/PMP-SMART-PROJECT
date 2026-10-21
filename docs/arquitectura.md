# Arquitectura

## Visión general

```
Celular (Expo)                         Nube
┌──────────────────────────┐
│ Pantallas (expo-router)  │
│        │                 │
│   AppContext (estado)    │
│        │                 │
│   lib/api.ts ────────────┼──────► Google Gemini (diagnóstico)
│        │                 │
│   AsyncStorage (local)   │        backend/ (proxy opcional)
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
2. `resultado.tsx` la envía a `analisisApi.procesar`, que consulta Gemini con varios modelos de respaldo.
3. El usuario guarda el análisis, con o sin solicitud de revisión técnica.
4. El técnico lo ve en su historial y emite el dictamen, que actualiza el estado de la parcela.
