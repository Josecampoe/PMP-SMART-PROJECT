/**
 * Piezas de movimiento compartidas. Todo anima solo transform y opacity
 * en el hilo de UI (Reanimated) y respeta "reducir movimiento".
 */
import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useIsFocused } from 'expo-router';

/** true si el sistema tiene activado "reducir movimiento" (se actualiza en vivo) */
export function useReduceMotion(): boolean {
  const initial = useReducedMotion();
  const [reduce, setReduce] = useState(initial);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => sub.remove();
  }, []);
  return reduce;
}

// ---------------------------------------------------------------------------
// Entrada escalonada
// ---------------------------------------------------------------------------
const STAGGER_MS = 50;
const RISE_PX = 12;

/**
 * Aparece con fade y una subida corta. `index` define el orden dentro de la
 * pantalla. Se repite cada vez que la pantalla vuelve a tener foco.
 */
export function Reveal({
  index = 0,
  children,
  style,
}: {
  index?: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const reduce = useReduceMotion();
  const focused = useIsFocused();
  const p = useSharedValue(0);

  useEffect(() => {
    if (!focused) {
      // Se reinicia oculto mientras la pantalla no se ve
      p.value = 0;
      return;
    }
    const delay = Math.min(index, 10) * STAGGER_MS;
    p.value = withDelay(delay, withTiming(1, { duration: reduce ? 180 : 420, easing: Easing.out(Easing.cubic) }));
  }, [focused, reduce]);

  const animated = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: reduce ? 0 : (1 - p.value) * RISE_PX }],
  }));

  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

// ---------------------------------------------------------------------------
// Número que cuenta de 0 al valor
// ---------------------------------------------------------------------------
/**
 * Devuelve un número que sube desde el valor anterior (0 al inicio) hasta
 * `target`. Solo cambia el texto; con "reducir movimiento" salta directo.
 */
export function useCountUp(target: number, duration = 700): number {
  const reduce = useReduceMotion();
  const [display, setDisplay] = useState(reduce ? target : 0);
  const fromRef = useRef(0);

  useEffect(() => {
    if (reduce) {
      fromRef.current = target;
      setDisplay(target);
      return;
    }
    const from = fromRef.current;
    const start = Date.now();
    let frame = 0;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (target - from) * eased);
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      fromRef.current = target;
    };
  }, [target, reduce]);

  return display;
}

// ---------------------------------------------------------------------------
// Presión con escala
// ---------------------------------------------------------------------------
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const SPRING = { damping: 18, stiffness: 320, mass: 0.6 };

/**
 * Reemplazo de TouchableOpacity: se encoge un poco al presionar y vuelve
 * con un resorte suave. Con "reducir movimiento" solo baja la opacidad.
 * No pisa la opacidad del estilo (p. ej. botones deshabilitados).
 */
export function PressableScale({
  style,
  scaleTo = 0.97,
  children,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  children?: React.ReactNode;
}) {
  const reduce = useReduceMotion();
  const pressed = useSharedValue(0);
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * (1 - scaleTo) }],
  }));

  if (reduce) {
    // Sin escala: solo una leve baja de opacidad mientras se presiona
    return (
      <Pressable
        {...rest}
        disabled={disabled}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={({ pressed: isPressed }) => [style, isPressed ? { opacity: 0.75 } : null]}>
        {children}
      </Pressable>
    );
  }

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(e) => {
        pressed.value = withSpring(1, SPRING);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        pressed.value = withSpring(0, SPRING);
        onPressOut?.(e);
      }}
      style={[style, animated]}>
      {children}
    </AnimatedPressable>
  );
}
