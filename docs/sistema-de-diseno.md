# Sistema de diseño

## Colores

Los colores viven en `mobile/lib/theme.ts`. Hay cuatro paletas: agricultor (verde) y técnico (azul), cada una en claro y oscuro. Las pantallas nunca usan colores fijos: leen `theme` desde `useApp()`.

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

## Tipografía y espaciado

- Títulos de pantalla: 28 px, peso 800. Secciones: 17 px, peso 700. Texto: 14–15 px.
- Etiquetas en mayúscula inicial, no en MAYÚSCULAS.
- Margen lateral de 20 px; radios de 10, 14, 18 y 24 px.

## Login y registro

Usan un fondo animado propio (`FieldBackground`) con colinas, hojas, luciérnagas y estrellas. Solo anima posición y opacidad para que sea fluido, y se detiene si el sistema tiene activado "reducir movimiento".
