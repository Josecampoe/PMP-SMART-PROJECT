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

