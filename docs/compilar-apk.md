# Compilar el APK

El APK se compila en la nube con **EAS Build**, así que no hace falta Android Studio.

## 1. Preparar

```bash
cd mobile
npm install
npx eas-cli login        # cuenta de Expo dueña del proyecto
```

## 2. Configurar la URL del proxy

La app no lleva la clave de Gemini: toda variable `EXPO_PUBLIC_` queda dentro del APK y cualquiera puede extraerla. La clave vive solo en el proxy (`backend/`), y la app solo necesita su URL, que es pública:

```bash
npx eas-cli env:create --name EXPO_PUBLIC_API_URL --value "https://pmp-smart-api.<tu-subdominio>.workers.dev" \
  --environment preview --visibility plaintext
```

Nunca crees una variable con la clave de Gemini en EAS.

## 3. Compilar

```bash
npm run build:apk
```

Usa el perfil `preview` de `eas.json`, que genera un `.apk`. Al terminar, EAS muestra un enlace y un QR para descargarlo.

## 4. Instalar en el celular

1. Abre el enlace desde el celular y descarga el `.apk`.
2. Android pedirá permitir la instalación desde el navegador o el administrador de archivos: acéptalo.
3. Abre el archivo y toca **Instalar**.
