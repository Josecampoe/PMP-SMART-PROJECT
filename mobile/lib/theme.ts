export interface ThemeColors {
  bg: string;
  card: string;
  cardBorder: string;
  cardBorderSubtle: string;
  /** Fondo para paneles internos dentro de una tarjeta */
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  placeholder: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryLightBorder: string;
  /** Color del texto/iconos sobre un fondo `primary` */
  onPrimary: string;
  accent: string;
  /** Acento cálido (trigo) para enlaces y detalles */
  highlight: string;
  bannerBg: string;
  bannerText: string;
  bannerTextSoft: string;
  bannerChipBg: string;
  bannerDecor: string;
  danger: string;
  onDanger: string;
  dangerBg: string;
  dangerBorder: string;
  warning: string;
  onWarning: string;
  warningBg: string;
  warningBorder: string;
  info: string;
  infoBg: string;
  tabBarBg: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
  inputBg: string;
  inputBgFocus: string;
  inputBorder: string;
  headerBg: string;
  pillBg: string;
  overlay: string;
  shadow: string;
  /** Tarjetas tipo vidrio sobre el fondo animado */
  glassBg: string;
  glassBorder: string;
  /** Vidrio más opaco para hojas modales y la barra de pestañas */
  glassStrong: string;
  /** Bloques de carga */
  skeleton: string;
  skeletonHighlight: string;
  /** Escena animada de fondo */
  sceneBase: string;
  sceneSky: string;
  sceneGlowWarm: string;
  sceneGlowCool: string;
  sceneHillFar: string;
  sceneHillMid: string;
  sceneHillNear: string;
  sceneStar: string;
  sceneFirefly: string;
  sceneFireflyHalo: string;
}

// ==========================================
// AGRICULTOR · modo claro: campo de día
// ==========================================
export const lightThemeAgricultor: ThemeColors = {
  bg: '#F4F5F0',
  card: '#FFFFFF',
  cardBorder: '#E3E6DC',
  cardBorderSubtle: '#EDEFE7',
  surfaceAlt: 'rgba(23, 32, 21, 0.04)',
  text: '#172015',
  textSecondary: '#4A5545',
  textMuted: '#6F7A68',
  placeholder: '#9AA393',
  primary: '#2E7334',
  primaryDark: '#205626',
  primaryLight: '#E8F2E5',
  primaryLightBorder: '#CDE3C8',
  onPrimary: '#FFFFFF',
  accent: '#4E9A3F',
  highlight: '#9A6B12',
  bannerBg: '#1E4A26',
  bannerText: '#FFFFFF',
  bannerTextSoft: 'rgba(255, 255, 255, 0.75)',
  bannerChipBg: 'rgba(255, 255, 255, 0.14)',
  bannerDecor: 'rgba(255, 255, 255, 0.06)',
  danger: '#C53A2F',
  onDanger: '#FFFFFF',
  dangerBg: '#FBEBE9',
  dangerBorder: '#F1CAC5',
  warning: '#B26A00',
  onWarning: '#FFFFFF',
  warningBg: '#FCF1DD',
  warningBorder: '#F0D8A8',
  info: '#2862C9',
  infoBg: '#E8EFFB',
  tabBarBg: 'rgba(255, 255, 255, 0.86)',
  tabBarBorder: 'rgba(23, 32, 21, 0.08)',
  tabBarActive: '#2E7334',
  tabBarInactive: '#7E8878',
  inputBg: 'rgba(255, 255, 255, 0.85)',
  inputBgFocus: '#FFFFFF',
  inputBorder: '#DADFD2',
  headerBg: '#F4F5F0',
  pillBg: '#E8F2E5',
  overlay: 'rgba(14, 20, 13, 0.55)',
  shadow: '#1B2A17',
  glassBg: 'rgba(255, 255, 255, 0.74)',
  glassBorder: 'rgba(23, 32, 21, 0.08)',
  glassStrong: 'rgba(250, 251, 247, 0.97)',
  skeleton: 'rgba(23, 32, 21, 0.07)',
  skeletonHighlight: 'rgba(255, 255, 255, 0.7)',
  sceneBase: '#EEF2E6',
  sceneSky: '#E7EEDD',
  sceneGlowWarm: '#F6D78B',
  sceneGlowCool: '#BFE0B5',
  sceneHillFar: '#DCE8CF',
  sceneHillMid: '#D0E1BF',
  sceneHillNear: '#C3D8AF',
  sceneStar: '#FFFFFF',
  sceneFirefly: '#D9AE4F',
  sceneFireflyHalo: 'rgba(217, 174, 79, 0.18)',
};

// ==========================================
// AGRICULTOR · modo oscuro "campo" (misma paleta del login)
// ==========================================
export const darkThemeAgricultor: ThemeColors = {
  bg: '#0A1410',
  card: '#132219',
  cardBorder: 'rgba(255, 255, 255, 0.09)',
  cardBorderSubtle: 'rgba(255, 255, 255, 0.06)',
  surfaceAlt: 'rgba(255, 255, 255, 0.04)',
  text: '#F3F1E7',
  textSecondary: 'rgba(243, 241, 231, 0.68)',
  textMuted: 'rgba(243, 241, 231, 0.45)',
  placeholder: 'rgba(243, 241, 231, 0.28)',
  primary: '#A5CF5F',
  primaryDark: '#8DBA47',
  primaryLight: 'rgba(165, 207, 95, 0.12)',
  primaryLightBorder: 'rgba(165, 207, 95, 0.30)',
  onPrimary: '#12230F',
  accent: '#B9DB7E',
  highlight: '#E2B866',
  bannerBg: '#1C4429',
  bannerText: '#F3F1E7',
  bannerTextSoft: 'rgba(243, 241, 231, 0.75)',
  bannerChipBg: 'rgba(255, 255, 255, 0.12)',
  bannerDecor: 'rgba(255, 255, 255, 0.06)',
  danger: '#EF7469',
  onDanger: '#1F0907',
  dangerBg: 'rgba(239, 116, 105, 0.13)',
  dangerBorder: 'rgba(239, 116, 105, 0.32)',
  warning: '#F0B64A',
  onWarning: '#1F1400',
  warningBg: 'rgba(240, 182, 74, 0.13)',
  warningBorder: 'rgba(240, 182, 74, 0.32)',
  info: '#7AA7F5',
  infoBg: 'rgba(122, 167, 245, 0.14)',
  tabBarBg: 'rgba(8, 18, 12, 0.82)',
  tabBarBorder: 'rgba(255, 255, 255, 0.07)',
  tabBarActive: '#A5CF5F',
  tabBarInactive: 'rgba(243, 241, 231, 0.45)',
  inputBg: 'rgba(255, 255, 255, 0.05)',
  inputBgFocus: 'rgba(255, 255, 255, 0.09)',
  inputBorder: 'rgba(255, 255, 255, 0.10)',
  headerBg: '#0A1410',
  pillBg: 'rgba(165, 207, 95, 0.12)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: '#000000',
  glassBg: 'rgba(8, 18, 12, 0.72)',
  glassBorder: 'rgba(255, 255, 255, 0.07)',
  glassStrong: 'rgba(10, 21, 15, 0.97)',
  skeleton: 'rgba(255, 255, 255, 0.06)',
  skeletonHighlight: 'rgba(255, 255, 255, 0.08)',
  sceneBase: '#0A1410',
  sceneSky: '#0E1B1A',
  sceneGlowWarm: '#E0A040',
  sceneGlowCool: '#2E7D32',
  sceneHillFar: '#10261A',
  sceneHillMid: '#14301F',
  sceneHillNear: '#183A25',
  sceneStar: '#F4F1DE',
  sceneFirefly: '#EEF5A6',
  sceneFireflyHalo: 'rgba(230, 238, 156, 0.25)',
};

// ==========================================
// TÉCNICO · modo claro: azul agronómico
// ==========================================
export const lightThemeTecnico: ThemeColors = {
  bg: '#F3F5F9',
  card: '#FFFFFF',
  cardBorder: '#E0E5EE',
  cardBorderSubtle: '#ECEFF5',
  surfaceAlt: 'rgba(18, 26, 43, 0.04)',
  text: '#121A2B',
  textSecondary: '#46526A',
  textMuted: '#6B7791',
  placeholder: '#97A0B3',
  primary: '#2158C9',
  primaryDark: '#1A46A3',
  primaryLight: '#E8EFFC',
  primaryLightBorder: '#C9D8F6',
  onPrimary: '#FFFFFF',
  accent: '#3B74E0',
  highlight: '#0F8A7E',
  bannerBg: '#173E8F',
  bannerText: '#FFFFFF',
  bannerTextSoft: 'rgba(255, 255, 255, 0.75)',
  bannerChipBg: 'rgba(255, 255, 255, 0.14)',
  bannerDecor: 'rgba(255, 255, 255, 0.06)',
  danger: '#C53A2F',
  onDanger: '#FFFFFF',
  dangerBg: '#FBEBE9',
  dangerBorder: '#F1CAC5',
  warning: '#B26A00',
  onWarning: '#FFFFFF',
  warningBg: '#FCF1DD',
  warningBorder: '#F0D8A8',
  info: '#0F8A7E',
  infoBg: '#E3F5F2',
  tabBarBg: 'rgba(255, 255, 255, 0.86)',
  tabBarBorder: 'rgba(18, 26, 43, 0.08)',
  tabBarActive: '#2158C9',
  tabBarInactive: '#7F899D',
  inputBg: 'rgba(255, 255, 255, 0.85)',
  inputBgFocus: '#FFFFFF',
  inputBorder: '#D5DCE8',
  headerBg: '#F3F5F9',
  pillBg: '#E8EFFC',
  overlay: 'rgba(12, 18, 30, 0.55)',
  shadow: '#111A2E',
  glassBg: 'rgba(255, 255, 255, 0.74)',
  glassBorder: 'rgba(18, 26, 43, 0.08)',
  glassStrong: 'rgba(249, 250, 253, 0.97)',
  skeleton: 'rgba(18, 26, 43, 0.07)',
  skeletonHighlight: 'rgba(255, 255, 255, 0.7)',
  sceneBase: '#EEF2F8',
  sceneSky: '#E6ECF6',
  sceneGlowWarm: '#F3D9A0',
  sceneGlowCool: '#B9CDF2',
  sceneHillFar: '#DCE4F1',
  sceneHillMid: '#D0DBEC',
  sceneHillNear: '#C4D2E8',
  sceneStar: '#FFFFFF',
  sceneFirefly: '#5D8FE6',
  sceneFireflyHalo: 'rgba(93, 143, 230, 0.16)',
};

// ==========================================
// TÉCNICO · modo oscuro: noche azul
// ==========================================
export const darkThemeTecnico: ThemeColors = {
  bg: '#0A0F18',
  card: '#131A25',
  cardBorder: 'rgba(255, 255, 255, 0.09)',
  cardBorderSubtle: 'rgba(255, 255, 255, 0.06)',
  surfaceAlt: 'rgba(255, 255, 255, 0.04)',
  text: '#EEF2F8',
  textSecondary: 'rgba(238, 242, 248, 0.68)',
  textMuted: 'rgba(238, 242, 248, 0.45)',
  placeholder: 'rgba(238, 242, 248, 0.28)',
  primary: '#6EA2F7',
  primaryDark: '#4F88EE',
  primaryLight: 'rgba(110, 162, 247, 0.14)',
  primaryLightBorder: 'rgba(110, 162, 247, 0.32)',
  onPrimary: '#0A1424',
  accent: '#8DB6FA',
  highlight: '#4CC7B6',
  bannerBg: '#18305E',
  bannerText: '#EEF2F8',
  bannerTextSoft: 'rgba(238, 242, 248, 0.75)',
  bannerChipBg: 'rgba(255, 255, 255, 0.12)',
  bannerDecor: 'rgba(255, 255, 255, 0.06)',
  danger: '#EF7469',
  onDanger: '#1F0907',
  dangerBg: 'rgba(239, 116, 105, 0.13)',
  dangerBorder: 'rgba(239, 116, 105, 0.32)',
  warning: '#F0B64A',
  onWarning: '#1F1400',
  warningBg: 'rgba(240, 182, 74, 0.13)',
  warningBorder: 'rgba(240, 182, 74, 0.32)',
  info: '#4CC7B6',
  infoBg: 'rgba(76, 199, 182, 0.14)',
  tabBarBg: 'rgba(8, 12, 20, 0.82)',
  tabBarBorder: 'rgba(255, 255, 255, 0.07)',
  tabBarActive: '#8DB6FA',
  tabBarInactive: 'rgba(238, 242, 248, 0.45)',
  inputBg: 'rgba(255, 255, 255, 0.05)',
  inputBgFocus: 'rgba(255, 255, 255, 0.09)',
  inputBorder: 'rgba(255, 255, 255, 0.10)',
  headerBg: '#0A0F18',
  pillBg: 'rgba(110, 162, 247, 0.14)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: '#000000',
  glassBg: 'rgba(8, 12, 22, 0.72)',
  glassBorder: 'rgba(255, 255, 255, 0.07)',
  glassStrong: 'rgba(11, 16, 26, 0.97)',
  skeleton: 'rgba(255, 255, 255, 0.06)',
  skeletonHighlight: 'rgba(255, 255, 255, 0.08)',
  sceneBase: '#0A0F18',
  sceneSky: '#0D1522',
  sceneGlowWarm: '#C98A3A',
  sceneGlowCool: '#2A5BB8',
  sceneHillFar: '#0F1A2A',
  sceneHillMid: '#132136',
  sceneHillNear: '#172842',
  sceneStar: '#E8EEF8',
  sceneFirefly: '#B9D3FF',
  sceneFireflyHalo: 'rgba(150, 190, 255, 0.22)',
};

/**
 * Paleta fija del login y el registro: siempre el tema "campo" nocturno,
 * sin importar el modo claro/oscuro elegido dentro de la app.
 */
export const fieldTheme: ThemeColors = darkThemeAgricultor;

/**
 * Colores de la pantalla de cámara: siempre van sobre la imagen en vivo,
 * así que no cambian con el tema.
 */
export const cameraColors = {
  bg: '#000000',
  text: '#FFFFFF',
  textSoft: 'rgba(255, 255, 255, 0.7)',
  glass: 'rgba(0, 0, 0, 0.45)',
  glassBorder: 'rgba(255, 255, 255, 0.15)',
  scrim: 'rgba(0, 0, 0, 0.6)',
  reticle: fieldTheme.primary,
  flashActive: fieldTheme.warning,
  onFlashActive: fieldTheme.onWarning,
  shutter: '#FFFFFF',
};

// Compatibilidad por defecto
export const lightTheme: ThemeColors = lightThemeAgricultor;
export const darkTheme: ThemeColors = darkThemeAgricultor;

/**
 * Obtiene el tema completo adaptado al rol activo y modo oscuro
 */
export function getAppTheme(isDarkMode: boolean, rol: 'agricultor' | 'tecnico' = 'agricultor'): ThemeColors {
  if (rol === 'tecnico') {
    return isDarkMode ? darkThemeTecnico : lightThemeTecnico;
  }
  return isDarkMode ? darkThemeAgricultor : lightThemeAgricultor;
}
