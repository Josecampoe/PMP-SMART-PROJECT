import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

/**
 * Fondo animado del login: un campo al atardecer con colinas que se mecen,
 * hojas que flotan con el viento, luciérnagas y estrellas que titilan.
 * Usa solo transform/opacity con el driver nativo para que vaya fluido.
 */

// Generador pseudoaleatorio con semilla: la escena es igual en cada render
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function loop(value: Animated.Value, duration: number, delay = 0, easing = Easing.inOut(Easing.sin)) {
  return Animated.loop(
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(value, { toValue: 1, duration, easing, useNativeDriver: true }),
      Animated.timing(value, { toValue: 0, duration, easing, useNativeDriver: true }),
    ])
  );
}

// ---------- Brillo del cielo (sol poniente + auroras verdes) ----------
function Glow({
  size, color, opacity, top, left, drift, duration,
}: { size: number; color: string; opacity: number; top: number; left: number; drift: number; duration: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = loop(t, duration);
    a.start();
    return () => a.stop();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top,
        left,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: t.interpolate({ inputRange: [0, 1], outputRange: [opacity * 0.7, opacity] }),
        transform: [
          { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [-drift, drift] }) },
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [drift * 0.4, -drift * 0.4] }) },
          { scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.08] }) },
        ],
      }}
    />
  );
}

// ---------- Estrellas ----------
function Star({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = loop(t, 1800 + delay / 3, delay);
    a.start();
    return () => a.stop();
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size,
        backgroundColor: '#F4F1DE',
        opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.8] }),
      }}
    />
  );
}

// ---------- Colinas ----------
function Hill({
  width, height, bottom, color, sway, duration, offsetX,
}: { width: number; height: number; bottom: number; color: string; sway: number; duration: number; offsetX: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = loop(t, duration);
    a.start();
    return () => a.stop();
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        bottom,
        left: offsetX,
        width,
        height,
        borderTopLeftRadius: width / 2,
        borderTopRightRadius: width / 2,
        backgroundColor: color,
        transform: [{ translateX: t.interpolate({ inputRange: [0, 1], outputRange: [-sway, sway] }) }],
      }}
    />
  );
}

// ---------- Hojas que flotan con el viento ----------
function Leaf({
  startX, size, color, duration, delay, screenH, drift, spin,
}: {
  startX: number; size: number; color: string; duration: number; delay: number;
  screenH: number; drift: number; spin: number;
}) {
  const rise = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const r = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(rise, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(rise, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    const s = loop(sway, duration / 4);
    r.start();
    s.start();
    return () => {
      r.stop();
      s.stop();
    };
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: startX,
        top: 0,
        opacity: rise.interpolate({ inputRange: [0, 0.12, 0.8, 1], outputRange: [0, 0.55, 0.4, 0] }),
        transform: [
          { translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [screenH + 30, screenH * 0.1] }) },
          { translateX: rise.interpolate({ inputRange: [0, 1], outputRange: [0, drift] }) },
          { translateX: sway.interpolate({ inputRange: [0, 1], outputRange: [-14, 14] }) },
          { rotate: rise.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${spin}deg`] }) },
          { rotateY: sway.interpolate({ inputRange: [0, 1], outputRange: ['-40deg', '40deg'] }) },
        ],
      }}>
      <FontAwesome name="leaf" size={size} color={color} />
    </Animated.View>
  );
}

// ---------- Luciérnagas ----------
function Firefly({ x, y, delay, range }: { x: number; y: number; delay: number; range: number }) {
  const wander = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const w = loop(wander, 3200 + delay, delay);
    const b = loop(blink, 900 + (delay % 700), delay / 2);
    w.start();
    b.start();
    return () => {
      w.stop();
      b.stop();
    };
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 10,
        height: 10,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: blink.interpolate({ inputRange: [0, 1], outputRange: [0.1, 1] }),
        transform: [
          { translateX: wander.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, range, -range * 0.4] }) },
          { translateY: wander.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -range * 0.6, range * 0.5] }) },
        ],
      }}>
      <View style={{ position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(230, 238, 156, 0.25)' }} />
      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#EEF5A6' }} />
    </Animated.View>
  );
}

export default function FieldBackground() {
  const { width: W, height: H } = useWindowDimensions();

  const scene = useMemo(() => {
    const rand = seeded(7);
    const stars = Array.from({ length: 22 }, (_, i) => ({
      key: `s${i}`,
      x: rand() * W,
      y: rand() * H * 0.45,
      size: rand() > 0.8 ? 2.5 : 1.5,
      delay: Math.floor(rand() * 3000),
    }));
    const leafColors = ['#7CB342', '#9CCC65', '#558B2F', '#AED581', '#C5A253'];
    const leaves = Array.from({ length: 11 }, (_, i) => ({
      key: `l${i}`,
      startX: rand() * W,
      size: 10 + Math.round(rand() * 10),
      color: leafColors[i % leafColors.length],
      duration: 14000 + Math.floor(rand() * 10000),
      delay: Math.floor(rand() * 12000),
      drift: (rand() - 0.3) * W * 0.5,
      spin: (rand() > 0.5 ? 1 : -1) * (120 + rand() * 240),
    }));
    const fireflies = Array.from({ length: 9 }, (_, i) => ({
      key: `f${i}`,
      x: rand() * W,
      y: H * 0.55 + rand() * H * 0.35,
      delay: Math.floor(rand() * 2500),
      range: 12 + rand() * 22,
    }));
    return { stars, leaves, fireflies };
  }, [W, H]);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#0A1410', overflow: 'hidden' }]}>
      {/* Cielo: banda cálida del atardecer y auroras */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: H * 0.5, backgroundColor: '#0E1B1A' }} />
      <Glow size={W * 1.1} color="#E0A040" opacity={0.1} top={H * 0.32} left={W * 0.25} drift={18} duration={7000} />
      <Glow size={W * 0.45} color="#F2C06B" opacity={0.16} top={H * 0.47} left={W * 0.55} drift={6} duration={5000} />
      <Glow size={W * 1.2} color="#2E7D32" opacity={0.14} top={-W * 0.5} left={-W * 0.4} drift={40} duration={9000} />
      <Glow size={W * 0.9} color="#1B7A5A" opacity={0.12} top={H * 0.08} left={W * 0.45} drift={30} duration={11000} />

      {scene.stars.map(({ key, ...s }) => <Star key={key} {...s} />)}

      {/* Colinas en capas (parallax) */}
      <Hill width={W * 2.2} height={H * 0.42} bottom={-H * 0.06} offsetX={-W * 0.9} color="#10261A" sway={10} duration={9000} />
      <Hill width={W * 2} height={H * 0.34} bottom={-H * 0.08} offsetX={-W * 0.2} color="#14301F" sway={16} duration={7500} />
      <Hill width={W * 2.4} height={H * 0.26} bottom={-H * 0.1} offsetX={-W * 0.7} color="#183A25" sway={24} duration={6000} />

      {scene.fireflies.map(({ key, ...f }) => <Firefly key={key} {...f} />)}
      {scene.leaves.map(({ key, ...l }) => <Leaf key={key} {...l} screenH={H} />)}
    </View>
  );
}
