/**
 * Componentes base de la interfaz. Todos leen el tema activo (claro/oscuro y rol)
 * para que cada pantalla se vea coherente sin repetir estilos.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import type { ThemeColors } from '../lib/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
export type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export const radius = { sm: 10, md: 14, lg: 18, xl: 24 };

export function toneColors(theme: ThemeColors, tone: Tone) {
  switch (tone) {
    case 'warning':
      return { fg: theme.warning, bg: theme.warningBg, border: theme.warningBorder };
    case 'danger':
      return { fg: theme.danger, bg: theme.dangerBg, border: theme.dangerBorder };
    case 'info':
      return { fg: theme.info, bg: theme.infoBg, border: theme.infoBg };
    case 'neutral':
      return { fg: theme.textSecondary, bg: theme.surfaceAlt, border: theme.cardBorder };
    case 'primary':
    case 'success':
    default:
      return { fg: theme.primary, bg: theme.primaryLight, border: theme.primaryLightBorder };
  }
}

/** Sombra suave solo en modo claro; en oscuro se usa el borde */
export function useElevation(level: 1 | 2 = 1): ViewStyle {
  const { theme, isDarkMode } = useApp();
  if (isDarkMode) return {};
  return {
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: level === 1 ? 2 : 6 },
    shadowOpacity: level === 1 ? 0.05 : 0.09,
    shadowRadius: level === 1 ? 8 : 16,
    elevation: level === 1 ? 1 : 4,
  };
}

