export interface ThemeColors {
  bg: string;
  card: string;
  cardBorder: string;
  cardBorderSubtle: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryLightBorder: string;
  accent: string;
  bannerBg: string;
  bannerText: string;
  danger: string;
  dangerBg: string;
  warning: string;
  warningBg: string;
  tabBarBg: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
  inputBg: string;
  inputBorder: string;
  headerBg: string;
  pillBg: string;
}

// ==========================================
// PALETA AGRICULTOR (Verde Campo / Naturaleza)
// ==========================================
export const lightThemeAgricultor: ThemeColors = {
  bg: '#F8FAF6',
  card: '#FFFFFF',
  cardBorder: '#E6ECE2',
  cardBorderSubtle: '#F0F4ED',
  text: '#131C13',
  textSecondary: '#4A5B4C',
  textMuted: '#7D8E7F',
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  primaryLight: '#E8F5E9',
  primaryLightBorder: '#C8E6C9',
  accent: '#388E3C',
  bannerBg: '#1B5E20',
  bannerText: '#FFFFFF',
  danger: '#DC2626',
  dangerBg: '#FEE2E2',
  warning: '#D97706',
  warningBg: '#FEF3C7',
  tabBarBg: '#FFFFFF',
  tabBarBorder: '#EEEEEE',
  tabBarActive: '#2E7D32',
  tabBarInactive: '#8E8E93',
  inputBg: '#F9FAF8',
  inputBorder: '#DCE2D8',
  headerBg: '#F8FAF6',
  pillBg: '#E8F5E9',
};

export const darkThemeAgricultor: ThemeColors = {
  bg: '#0B1118',
  card: '#131C26',
  cardBorder: '#1F2E3E',
  cardBorderSubtle: '#182432',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  primary: '#22C55E',
  primaryDark: '#16A34A',
  primaryLight: 'rgba(34, 197, 94, 0.15)',
  primaryLightBorder: 'rgba(34, 197, 94, 0.28)',
  accent: '#4ADE80',
  bannerBg: '#0F2F1D',
  bannerText: '#FFFFFF',
  danger: '#EF4444',
  dangerBg: 'rgba(239, 68, 68, 0.18)',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.18)',
  tabBarBg: '#0E1620',
  tabBarBorder: '#1A2533',
  tabBarActive: '#4ADE80',
  tabBarInactive: '#64748B',
  inputBg: '#16212E',
  inputBorder: '#28384C',
  headerBg: '#0B1118',
  pillBg: 'rgba(34, 197, 94, 0.15)',
};

// ==========================================
// PALETA TÉCNICO (Azul Científico / Agronómico)
// ==========================================
export const lightThemeTecnico: ThemeColors = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  cardBorderSubtle: '#F1F5F9',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#EFF6FF',
  primaryLightBorder: '#BFDBFE',
  accent: '#3B82F6',
  bannerBg: '#1E40AF',
  bannerText: '#FFFFFF',
  danger: '#DC2626',
  dangerBg: '#FEE2E2',
  warning: '#D97706',
  warningBg: '#FEF3C7',
  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  tabBarActive: '#2563EB',
  tabBarInactive: '#94A3B8',
  inputBg: '#F8FAFC',
  inputBorder: '#CBD5E1',
  headerBg: '#F8FAFC',
  pillBg: '#EFF6FF',
};

export const darkThemeTecnico: ThemeColors = {
  bg: '#0B1118',
  card: '#131C26',
  cardBorder: '#1F2E3E',
  cardBorderSubtle: '#182432',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryLight: 'rgba(59, 130, 246, 0.18)',
  primaryLightBorder: 'rgba(59, 130, 246, 0.35)',
  accent: '#60A5FA',
  bannerBg: '#1E3A8A',
  bannerText: '#FFFFFF',
  danger: '#EF4444',
  dangerBg: 'rgba(239, 68, 68, 0.18)',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.18)',
  tabBarBg: '#0E1620',
  tabBarBorder: '#1A2533',
  tabBarActive: '#60A5FA',
  tabBarInactive: '#64748B',
  inputBg: '#16212E',
  inputBorder: '#28384C',
  headerBg: '#0B1118',
  pillBg: 'rgba(59, 130, 246, 0.18)',
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
