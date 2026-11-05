import React, { useEffect, useState } from 'react';
import { Image, View, type ImageStyle, type StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

/**
 * Foto de una hoja. Si no hay imagen o no carga (por ejemplo sin conexión),
 * muestra un marcador local con un ícono de hoja en los colores del tema.
 */
export default function LeafImage({
  uri,
  style,
  iconSize = 22,
}: {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  iconSize?: number;
}) {
  const { theme } = useApp();
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [uri]);

  if (!uri || failed) {
    return (
      <View
        style={[
          style as any,
          {
            backgroundColor: theme.primaryLight,
            borderWidth: 1,
            borderColor: theme.primaryLightBorder,
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}>
        <Ionicons name="leaf" size={iconSize} color={theme.primary} />
      </View>
    );
  }

  return <Image source={{ uri }} style={[{ backgroundColor: theme.surfaceAlt }, style]} resizeMode="cover" onError={() => setFailed(true)} />;
}
