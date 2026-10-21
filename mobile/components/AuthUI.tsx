/**
 * Piezas visuales compartidas por login y registro (siempre sobre el fondo animado oscuro).
 */
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, type TextInputProps } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export const AUTH = {
  text: '#F3F1E7',
  textSoft: 'rgba(243, 241, 231, 0.68)',
  textFaint: 'rgba(243, 241, 231, 0.4)',
  placeholder: 'rgba(243, 241, 231, 0.28)',
  lime: '#A5CF5F',
  limeText: '#12230F',
  wheat: '#E2B866',
  fieldBg: 'rgba(255, 255, 255, 0.05)',
  fieldBgFocus: 'rgba(255, 255, 255, 0.09)',
  fieldBorder: 'rgba(255, 255, 255, 0.10)',
  panel: 'rgba(8, 18, 12, 0.72)',
  panelBorder: 'rgba(255, 255, 255, 0.07)',
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

