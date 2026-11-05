/**
 * Piezas de movimiento compartidas. Todo anima solo transform y opacity
 * en el hilo de UI (Reanimated) y respeta "reducir movimiento".
 */
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

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
