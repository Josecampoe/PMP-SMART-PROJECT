# PMP Smart · App móvil

App en **Expo SDK 57** con **expo-router**.

## Requisitos

- Node.js 20 o superior
- Expo Go en el celular, o un emulador Android

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm start` | Inicia el servidor de desarrollo (escanea el QR con Expo Go) |
| `npm run tunnel` | Igual, pero accesible desde otra red |
| `npm run typecheck` | Revisa los tipos de TypeScript |
| `npm run build:apk` | Compila un APK instalable con EAS |

## Variables de entorno

Copia `.env.example` como `.env.local`:

- `EXPO_PUBLIC_GEMINI_API_KEY`: clave de Google Gemini para el diagnóstico.
- `EXPO_PUBLIC_API_URL`: URL del backend (opcional).

`.env.local` está en `.gitignore` y nunca se sube al repositorio.

## Organización del código

```
app/            Pantallas (expo-router)
  auth/         Login y registro
  (tabs)/       Inicio, Cultivos, Historial y Perfil
  camera.tsx    Captura de la foto
  resultado.tsx Diagnóstico de la IA
components/     Componentes de interfaz reutilizables
context/        Estado global de la app (AppContext)
lib/            API, tema de colores, textos (i18n) y tipos
```
