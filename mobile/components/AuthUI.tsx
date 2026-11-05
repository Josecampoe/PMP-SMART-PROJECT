/**
 * Piezas visuales compartidas por login y registro (siempre sobre el fondo animado oscuro).
 */
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, type TextInputProps } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { fieldTheme } from '../lib/theme';

/** Alias legibles de la paleta "campo" (lib/theme.ts) para login y registro */
export const AUTH = {
  bg: fieldTheme.bg,
  text: fieldTheme.text,
  textSoft: fieldTheme.textSecondary,
  textFaint: fieldTheme.textMuted,
  placeholder: fieldTheme.placeholder,
  lime: fieldTheme.primary,
  limeText: fieldTheme.onPrimary,
  limeSoft: fieldTheme.primaryLight,
  wheat: fieldTheme.highlight,
  fieldBg: fieldTheme.inputBg,
  fieldBgFocus: fieldTheme.inputBgFocus,
  fieldBorder: fieldTheme.inputBorder,
  panel: fieldTheme.glassBg,
  panelBorder: fieldTheme.glassBorder,
  danger: fieldTheme.danger,
  dangerBg: fieldTheme.dangerBg,
  dangerBorder: fieldTheme.dangerBorder,
};

export function AuthBrand() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <FontAwesome name="leaf" size={16} color={AUTH.lime} />
      <Text style={{ color: AUTH.text, fontSize: 15, fontWeight: '700', marginLeft: 8 }}>
        PMP <Text style={{ color: AUTH.lime }}>Smart</Text>
      </Text>
    </View>
  );
}

export function AuthField({
  label,
  icon,
  secureToggle,
  style,
  ...inputProps
}: TextInputProps & {
  label: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  /** Muestra el botón de ver/ocultar contraseña */
  secureToggle?: { visible: boolean; onToggle: () => void };
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[{ marginBottom: 16 }, style as any]}>
      <Text style={{ color: AUTH.textSoft, fontSize: 13, fontWeight: '500', marginBottom: 8 }}>{label}</Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: focused ? AUTH.fieldBgFocus : AUTH.fieldBg,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: focused ? AUTH.lime : AUTH.fieldBorder,
          paddingHorizontal: 16,
        }}>
        <FontAwesome name={icon} size={15} color={focused ? AUTH.lime : AUTH.textFaint} style={{ width: 16, textAlign: 'center' }} />
        <TextInput
          placeholderTextColor={AUTH.placeholder}
          {...inputProps}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 12, color: AUTH.text, fontSize: 15 }}
        />
        {secureToggle ? (
          <TouchableOpacity
            onPress={secureToggle.onToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel={secureToggle.visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
            <FontAwesome name={secureToggle.visible ? 'eye-slash' : 'eye'} size={16} color={AUTH.textFaint} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

export function AuthButton({ label, onPress, loading }: { label: string; onPress: () => void; loading?: boolean }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.85}
      accessibilityRole="button"
      style={{
        backgroundColor: AUTH.lime,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginTop: 10,
        opacity: loading ? 0.75 : 1,
      }}>
      {loading ? (
        <ActivityIndicator color={AUTH.limeText} />
      ) : (
        <>
          <Text style={{ color: AUTH.limeText, fontWeight: '700', fontSize: 16 }}>{label}</Text>
          <FontAwesome name="arrow-right" size={14} color={AUTH.limeText} style={{ marginLeft: 10 }} />
        </>
      )}
    </TouchableOpacity>
  );
}
