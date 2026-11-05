/**
 * Bloques de carga con un brillo que recorre la forma. Se usan mientras
 * llegan los datos en Inicio, Cultivos e Historial.
 */
import React, { useEffect, useState } from 'react';
import { View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useApp } from '../context/AppContext';
import { useReduceMotion } from './motion';
import { radius } from './ui';

export function SkeletonBlock({
  width = '100%',
  height = 14,
  r = 8,
  style,
}: {
  width?: DimensionValue;
  height?: number;
  r?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useApp();
  const reduce = useReduceMotion();
  const [w, setW] = useState(0);
  const t = useSharedValue(0);

  useEffect(() => {
    if (reduce || !w) return;
    t.value = 0;
    t.value = withRepeat(withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.quad) }), -1, false);
    return () => cancelAnimation(t);
  }, [reduce, w]);

  const shine = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.5, 1], [0, 1, 0]),
    transform: [{ translateX: interpolate(t.value, [0, 1], [-w * 0.6, w]) }],
  }));

  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={[{ width, height, borderRadius: r, backgroundColor: theme.skeleton, overflow: 'hidden' }, style]}>
      {!reduce && w > 0 ? (
        <Animated.View
          style={[{ position: 'absolute', top: 0, bottom: 0, width: w * 0.6, backgroundColor: theme.skeletonHighlight }, shine]}
        />
      ) : null}
    </View>
  );
}

/** Tarjeta de vidrio con forma de fila (ícono + dos líneas) */
function SkeletonRowCard({ media = 44 }: { media?: number }) {
  const { theme } = useApp();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        marginBottom: 10,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: theme.glassBorder,
        backgroundColor: theme.glassBg,
      }}>
      <SkeletonBlock width={media} height={media} r={14} />
      <View style={{ flex: 1, marginLeft: 14, gap: 8 }}>
        <SkeletonBlock width="65%" height={14} />
        <SkeletonBlock width="40%" height={11} />
      </View>
    </View>
  );
}

function SkeletonStats() {
  const { theme } = useApp();
  return (
    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{ flex: 1, padding: 14, borderRadius: radius.xl, borderWidth: 1, borderColor: theme.glassBorder, backgroundColor: theme.glassBg, gap: 10 }}>
          <SkeletonBlock width={30} height={30} r={9} />
          <SkeletonBlock width="50%" height={20} />
          <SkeletonBlock width="70%" height={10} />
        </View>
      ))}
    </View>
  );
}

/** Contenido de Inicio mientras carga (debajo del saludo) */
export function HomeSkeleton() {
  const { t } = useApp();
  return (
    <View accessibilityLabel={t('cargando')} accessible>
      <SkeletonBlock height={150} r={22} style={{ marginBottom: 16 }} />
      <SkeletonStats />
      <SkeletonBlock width={140} height={16} style={{ marginBottom: 12 }} />
      <SkeletonRowCard />
      <SkeletonRowCard />
    </View>
  );
}

/** Listado (Cultivos o Historial) mientras carga */
export function ListSkeleton({ stats, rows = 4, media }: { stats?: boolean; rows?: number; media?: number }) {
  const { t } = useApp();
  return (
    <View accessibilityLabel={t('cargando')} accessible>
      {stats ? <SkeletonStats /> : null}
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonRowCard key={i} media={media} />
      ))}
    </View>
  );
}
