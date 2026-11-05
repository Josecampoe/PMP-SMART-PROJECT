# Registro de cambios

## Sin publicar

### Interfaz
- El menú usa el mismo mundo nocturno del login: fondo animado ligero detrás de las 4 pestañas.
- Tarjetas, métricas y hojas tipo vidrio; paleta del login unificada en `lib/theme.ts`.
- Barra de pestañas de vidrio con indicador que se desliza.
- Entrada escalonada en cada pestaña, botones que se encogen al presionarlos y fundido del login al menú.
- Contadores animados en Inicio, bloques de carga en Inicio, Cultivos e Historial y entrada animada en Resultado.
- Marcador local con ícono de hoja en lugar de fotos de internet cuando no hay imagen.
- Los errores de login y registro aparecen dentro del formulario.
- La app arranca en tema oscuro si el usuario no eligió uno.

## 1.1.0

### Interfaz
- Nuevo login y registro con fondo animado de un campo al atardecer.
- Paletas de color revisadas para modo claro y oscuro, por rol.
- Componentes compartidos (`components/ui.tsx`) usados en todas las pantallas.
- Formularios y detalles en ventanas que suben desde abajo.
- Textos en mayúscula inicial en lugar de MAYÚSCULAS.

### Funciones
- La app sigue el tema del sistema hasta que el usuario elija uno.
- Deslizar hacia abajo para actualizar en Inicio, Cultivos e Historial.
- El fondo animado respeta la opción "reducir movimiento".
- Perfil del técnico con especialidad, entidad, teléfono y correo.
- Guía de Punta Morada con la sección de manejo y prevención.

### Correcciones
- El modo oscuro y el idioma se recuerdan también con la sesión iniciada.
- Los filtros del historial funcionan en el modo técnico.
- Ya no se abren dos ventanas superpuestas al emitir un dictamen.
- La clave de la IA se lee solo desde variables de entorno.
- El backend valida la respuesta de la IA y usa un modelo vigente.

## 1.0.0
- Primera versión: diagnóstico con IA, parcelas con código, roles agricultor y técnico.
