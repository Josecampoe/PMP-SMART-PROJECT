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

// ---------------------------------------------------------------------------
// Encabezado de pantalla
// ---------------------------------------------------------------------------
export function ScreenHeader({
  title,
  subtitle,
  right,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  eyebrow?: string;
}) {
  const { theme } = useApp();
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 14,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        backgroundColor: theme.bg,
      }}>
      <View style={{ flex: 1, marginRight: 12 }}>
        {eyebrow ? (
          <Text style={{ fontSize: 13, fontWeight: '600', color: theme.primary, marginBottom: 2 }}>{eyebrow}</Text>
        ) : null}
        <Text style={{ fontSize: 28, fontWeight: '800', color: theme.text, letterSpacing: -0.6 }} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ fontSize: 14, color: theme.textMuted, marginTop: 2 }} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Tarjeta
// ---------------------------------------------------------------------------
export function Card({
  children,
  style,
  onPress,
  padding = 16,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padding?: number;
}) {
  const { theme } = useApp();
  const elevation = useElevation(1);
  const base: ViewStyle = {
    backgroundColor: theme.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    padding,
    ...elevation,
  };
  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[base, style]}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[base, style]}>{children}</View>;
}

// ---------------------------------------------------------------------------
// Botón
// ---------------------------------------------------------------------------
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dangerSoft' | 'soft';

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  iconRight,
  loading,
  disabled,
  size = 'md',
  style,
  flex,
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  flex?: boolean;
}) {
  const { theme } = useApp();

  const palette: Record<ButtonVariant, { bg: string; fg: string; border: string }> = {
    primary: { bg: theme.primary, fg: theme.onPrimary, border: theme.primary },
    secondary: { bg: theme.card, fg: theme.text, border: theme.cardBorder },
    soft: { bg: theme.primaryLight, fg: theme.primary, border: 'transparent' },
    ghost: { bg: 'transparent', fg: theme.textSecondary, border: 'transparent' },
    danger: { bg: theme.danger, fg: '#FFFFFF', border: theme.danger },
    dangerSoft: { bg: theme.dangerBg, fg: theme.danger, border: 'transparent' },
  };
  const p = palette[variant];
  const dims = {
    sm: { py: 8, px: 12, font: 13, icon: 14, r: radius.sm },
    md: { py: 13, px: 18, font: 15, icon: 17, r: radius.md },
    lg: { py: 16, px: 20, font: 16, icon: 18, r: radius.md },
  }[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
      accessibilityRole="button"
      style={[
        {
          backgroundColor: p.bg,
          borderColor: p.border,
          borderWidth: 1,
          borderRadius: dims.r,
          paddingVertical: dims.py,
          paddingHorizontal: dims.px,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isDisabled ? 0.45 : 1,
        },
        flex ? { flex: 1 } : null,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={p.fg} size="small" />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={dims.icon} color={p.fg} style={{ marginRight: 8 }} /> : null}
          <Text style={{ color: p.fg, fontSize: dims.font, fontWeight: '700' }} numberOfLines={1}>
            {label}
          </Text>
          {iconRight ? <Ionicons name={iconRight} size={dims.icon} color={p.fg} style={{ marginLeft: 8 }} /> : null}
        </>
      )}
    </TouchableOpacity>
  );
}

/** Botón redondo solo con icono (acciones de encabezado) */
export function IconButton({
  icon,
  onPress,
  tone = 'neutral',
  filled,
  accessibilityLabel,
  size = 40,
}: {
  icon: IconName;
  onPress?: () => void;
  tone?: Tone;
  filled?: boolean;
  accessibilityLabel?: string;
  size?: number;
}) {
  const { theme } = useApp();
  const c = toneColors(theme, tone);
  const bg = filled ? theme.primary : tone === 'neutral' ? theme.card : c.bg;
  const fg = filled ? theme.onPrimary : tone === 'neutral' ? theme.text : c.fg;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        borderWidth: tone === 'neutral' && !filled ? 1 : 0,
        borderColor: theme.cardBorder,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Ionicons name={icon} size={size * 0.45} color={fg} />
    </TouchableOpacity>
  );
}

