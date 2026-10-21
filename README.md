# PMP Smart

Aplicación móvil para el monitoreo fitosanitario de cultivos de papa. Permite fotografiar una hoja y detectar con IA señales de **Punta Morada de la Papa (PMP)**, llevar el registro de cada parcela y compartirlo con un técnico agrónomo para que emita un dictamen.

## Estructura

| Carpeta | Contenido |
| --- | --- |
| [`mobile/`](mobile) | App en Expo (React Native) para Android e iOS |
| [`backend/`](backend) | API en Express que hace de intermediario con Gemini |
| [`docs/`](docs) | Arquitectura, sistema de diseño y guía para compilar el APK |

## Funciones principales

- **Diagnóstico con IA:** foto desde la cámara o la galería, análisis con Google Gemini y recomendaciones agronómicas.
- **Parcelas:** registro de lotes con variedad, área, ubicación por GPS y un código único para compartir.
- **Dos roles:** el agricultor registra y escanea; el técnico vincula parcelas por código y emite dictámenes.
- **Historial:** búsqueda y filtros por estado, con el reporte completo de cada análisis.
- **Modo claro y oscuro**, en español e inglés.

## Inicio rápido

```bash
# App móvil
cd mobile
npm install
cp .env.example .env.local   # completa la clave de Gemini
npm start

# Backend (opcional)
cd backend
npm install
cp .env.example .env
npm run dev
```

Para generar el APK instalable consulta [`docs/compilar-apk.md`](docs/compilar-apk.md).
