# Compilar el APK

El APK se compila en la nube con **EAS Build**, así que no hace falta Android Studio.

## 1. Preparar

```bash
cd mobile
npm install
npx eas-cli login        # cuenta de Expo dueña del proyecto
```

## 2. Configurar la clave de la IA

`.env.local` no se sube a EAS, así que la clave se guarda como variable del proyecto:

```bash
npx eas-cli env:create --name EXPO_PUBLIC_GEMINI_API_KEY --value "TU_CLAVE" \
  --environment preview --visibility sensitive
```

## 3. Compilar

```bash
npm run build:apk
```

Usa el perfil `preview` de `eas.json`, que genera un `.apk`. Al terminar, EAS muestra un enlace y un QR para descargarlo.

## 4. Instalar en el celular

1. Abre el enlace desde el celular y descarga el `.apk`.
2. Android pedirá permitir la instalación desde el navegador o el administrador de archivos: acéptalo.
3. Abre el archivo y toca **Instalar**.
