import { useEffect, useMemo, useState } from 'react';
import { AppState, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useIsFocused } from 'expo-router';
import { useApp } from '../context/AppContext';
import { useReduceMotion } from './motion';

/**
 * Versión ligera del fondo del login para las pantallas del menú:
 * cielo, dos brillos, tres colinas, pocas estrellas y luciérnagas.
 * Sin hojas y con menos de la mitad de partículas.
 * Se pausa con la app en segundo plano o cuando el menú no está visible.
 */

const STAR_COUNT = 10;
const FIREFLY_COUNT = 4;

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** Valor 0 → 1 → 0 en bucle mientras `active` sea true */
function useLoop(active: boolean, duration: number, delay = 0): SharedValue<number> {
  const t = useSharedValue(0);
  useEffect(() => {
    if (!active) {
      cancelAnimation(t);
      return;
    }
    t.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true)
    );
    return () => cancelAnimation(t);
  }, [active]);
  return t;
}

function Glow({
  active, size, color, opacity, top, left, drift, duration,
}: {
  active: boolean; size: number; color: string; opacity: number; top: number; left: number; drift: number; duration: number;
}) {
  const t = useLoop(active, duration);
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 1], [opacity * 0.7, opacity]),
    transform: [
      { translateX: interpolate(t.value, [0, 1], [-drift, drift]) },
      { translateY: interpolate(t.value, [0, 1], [drift * 0.4, -drift * 0.4]) },
      { scale: interpolate(t.value, [0, 1], [0.94, 1.06]) },
    ],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', top, left, width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        style,
      ]}
    />
  );
}

function Hill({
  active, width, height, bottom, color, sway, duration, offsetX,
}: {
  active: boolean; width: number; height: number; bottom: number; color: string; sway: number; duration: number; offsetX: number;
}) {
  const t = useLoop(active, duration);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(t.value, [0, 1], [-sway, sway]) }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          bottom,
          left: offsetX,
          width,
          height,
          borderTopLeftRadius: width / 2,
          borderTopRightRadius: width / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

function Star({ active, x, y, size, delay, color }: { active: boolean; x: number; y: number; size: number; delay: number; color: string }) {
  const t = useLoop(active, 2200 + delay / 3, delay);
  const style = useAnimatedStyle(() => ({ opacity: interpolate(t.value, [0, 1], [0.15, 0.7]) }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size, backgroundColor: color, opacity: 0.4 }, style]}
    />
  );
}

function Firefly({
  active, x, y, delay, range, color, halo,
}: {
  active: boolean; x: number; y: number; delay: number; range: number; color: string; halo: string;
}) {
  const wander = useLoop(active, 4200 + delay, delay);
  const blink = useLoop(active, 1100 + (delay % 700), delay / 2);
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(blink.value, [0, 1], [0.1, 0.9]),
    transform: [
      { translateX: interpolate(wander.value, [0, 0.5, 1], [0, range, -range * 0.4]) },
      { translateY: interpolate(wander.value, [0, 0.5, 1], [0, -range * 0.6, range * 0.5]) },
    ],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', left: x, top: y, width: 10, height: 10, alignItems: 'center', justifyContent: 'center' }, style]}>
      <View style={{ position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: halo }} />
      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color }} />
    </Animated.View>
  );
}

export default function FieldBackgroundLite() {
  const { width: W, height: H } = useWindowDimensions();
  const { theme, isDarkMode } = useApp();
  const reduceMotion = useReduceMotion();
  const isFocused = useIsFocused();
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setAppActive(s === 'active'));
    return () => sub.remove();
  }, []);

  const active = appActive && isFocused && !reduceMotion;

  const scene = useMemo(() => {
    const rand = seeded(11);
    const stars = Array.from({ length: STAR_COUNT }, (_, i) => ({
      key: `s${i}`,
      x: rand() * W,
      y: rand() * H * 0.4,
      size: rand() > 0.8 ? 2.5 : 1.5,
      delay: Math.floor(rand() * 3000),
    }));
    const fireflies = Array.from({ length: FIREFLY_COUNT }, (_, i) => ({
      key: `f${i}`,
      x: rand() * W,
      y: H * 0.6 + rand() * H * 0.3,
      delay: Math.floor(rand() * 2500),
      range: 12 + rand() * 18,
    }));
    return { stars, fireflies };
  }, [W, H]);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: theme.sceneBase, overflow: 'hidden' }]}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: H * 0.5, backgroundColor: theme.sceneSky }} />
      <Glow active={active} size={W * 1.2} color={theme.sceneGlowCool} opacity={isDarkMode ? 0.12 : 0.35} top={-W * 0.5} left={-W * 0.4} drift={30} duration={10000} />
      <Glow active={active} size={W * 0.9} color={theme.sceneGlowWarm} opacity={isDarkMode ? 0.08 : 0.3} top={H * 0.4} left={W * 0.35} drift={14} duration={8000} />

      {isDarkMode && scene.stars.map(({ key, ...s }) => <Star key={key} active={active} color={theme.sceneStar} {...s} />)}

      <Hill active={active} width={W * 2.2} height={H * 0.3} bottom={-H * 0.06} offsetX={-W * 0.9} color={theme.sceneHillFar} sway={8} duration={11000} />
      <Hill active={active} width={W * 2} height={H * 0.24} bottom={-H * 0.08} offsetX={-W * 0.2} color={theme.sceneHillMid} sway={12} duration={9000} />
      <Hill active={active} width={W * 2.4} height={H * 0.18} bottom={-H * 0.1} offsetX={-W * 0.7} color={theme.sceneHillNear} sway={18} duration={7500} />

      {!reduceMotion &&
        scene.fireflies.map(({ key, ...f }) => (
          <Firefly key={key} active={active} color={theme.sceneFirefly} halo={theme.sceneFireflyHalo} {...f} />
        ))}
    </View>
  );
}
