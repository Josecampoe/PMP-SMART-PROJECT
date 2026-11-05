# Sistema de diseño

## Colores

Los colores viven en `mobile/lib/theme.ts`. Hay cuatro paletas: agricultor (verde) y técnico (azul), cada una en claro y oscuro. Las pantallas nunca usan colores fijos: leen `theme` desde `useApp()`.

El oscuro del agricultor es el tema "campo", el mismo del login, y es el que se usa si el usuario no ha elegido uno. Login y registro usan siempre `fieldTheme` (alias del tema "campo"), y la cámara usa `cameraColors`, porque va sobre la imagen en vivo.

| Token | Uso |
| --- | --- |
| `bg` | Fondo de la pantalla |
| `card`, `cardBorder` | Tarjetas y su borde |
| `surfaceAlt` | Paneles dentro de una tarjeta |
| `text`, `textSecondary`, `textMuted` | Jerarquía del texto |
| `primary`, `onPrimary` | Color de marca y el texto que va encima |
| `primaryLight`, `primaryLightBorder` | Fondos suaves de la marca |
| `warning`, `danger`, `info` (+ `Bg`, `Border`) | Estados |
| `overlay`, `shadow` | Fondo detrás de las hojas modales y sombras |
| `glassBg`, `glassBorder` | Tarjetas tipo vidrio sobre el fondo animado |
| `glassStrong` | Vidrio casi opaco para hojas modales y barras fijas |
| `placeholder`, `inputBgFocus` | Texto de ayuda y fondo del campo con foco |
| `highlight` | Acento cálido (trigo) para enlaces |
| `bannerText`, `bannerTextSoft`, `bannerChipBg`, `bannerDecor` | Contenido sobre `bannerBg` |
| `onDanger`, `onWarning` | Texto sobre fondos de peligro o aviso |
| `skeleton`, `skeletonHighlight` | Bloques de carga y su brillo |
| `scene*` | Colores del fondo animado (cielo, brillos, colinas, estrellas, luciérnagas) |

En modo oscuro `onPrimary` es oscuro, porque el verde y el azul son claros y el texto blanco no tendría suficiente contraste.

## Componentes

Todos están en `mobile/components/ui.tsx`:

| Componente | Para qué |
| --- | --- |
| `ScreenHeader` | Título grande de cada pestaña con acción a la derecha |
| `Card` | Contenedor con borde y sombra suave (solo en claro) |
| `Button` | Variantes `primary`, `secondary`, `soft`, `ghost`, `danger`, `dangerSoft` |
| `IconButton`, `IconTile` | Íconos en círculo o cuadro con tinte |
| `Badge`, `Chip` | Estados y filtros |
| `Field` | Campo de texto con etiqueta y foco resaltado |
| `StatTile` | Métrica con ícono |
| `SettingsRow`, `GroupLabel`, `Divider` | Listas tipo ajustes |
| `EmptyState` | Pantallas sin datos |
| `Sheet` | Ventana que sube desde abajo para formularios y detalles |

Otros componentes:

| Archivo | Para qué |
| --- | --- |
| `components/motion.tsx` | `Reveal` (entrada escalonada), `PressableScale` (se encoge al presionar), `useCountUp` y `useReduceMotion` |
| `components/FieldBackgroundLite.tsx` | Fondo animado ligero detrás de las pestañas |
| `components/GlassTabBar.tsx` | Barra de pestañas de vidrio con indicador deslizante |
| `components/Skeleton.tsx` | `HomeSkeleton` y `ListSkeleton` mientras cargan los datos |
| `components/LeafImage.tsx` | Foto de la hoja o, si no hay o no carga, un marcador con ícono de hoja |

## Movimiento

- Solo se animan `transform` y `opacity`, con Reanimated, en el hilo de UI.
- Entrada: fade más una subida de 12 px, con 50 ms entre elementos. Se repite al volver a la pestaña.
- Presión: escala a 0,97 y vuelve con un resorte suave.
- Con "reducir movimiento" no hay desplazamientos ni escalas: solo fades cortos, y el fondo queda quieto.
- El fondo del menú se pausa cuando la app pasa a segundo plano o cuando se abre la cámara o un resultado encima.

## Tipografía y espaciado

- Títulos de pantalla: 28 px, peso 800. Secciones: 17 px, peso 700. Texto: 14–15 px.
- Etiquetas en mayúscula inicial, no en MAYÚSCULAS.
- Margen lateral de 20 px; radios de 10, 14, 18 y 24 px.

## Login y registro

Usan un fondo animado propio (`FieldBackground`) con colinas, hojas, luciérnagas y estrellas. Solo anima posición y opacidad para que sea fluido, y se detiene si el sistema tiene activado "reducir movimiento".
