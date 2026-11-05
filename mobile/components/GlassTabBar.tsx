import React, { useEffect, useState } from 'react';
import { Pressable, Text, View, type ColorValue } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Tabs } from 'expo-router';
import { useApp } from '../context/AppContext';
import { useReduceMotion } from './motion';

/** Props que expo-router entrega a una barra de pestañas personalizada */
export type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

const BAR_PADDING = 8;
const SPRING = { damping: 20, stiffness: 220, mass: 0.7 };

function TabItem({
  label,
  focused,
  renderIcon,
  onPress,
  onLongPress,
  accessibilityLabel,
}: {
  label: string;
  focused: boolean;
  renderIcon: (props: { focused: boolean; color: ColorValue; size: number }) => React.ReactNode;
  onPress: () => void;
  onLongPress: () => void;
  accessibilityLabel?: string;
}) {
  const { theme } = useApp();
  const reduce = useReduceMotion();
  const scale = useSharedValue(focused ? 1.12 : 1);

  useEffect(() => {
    scale.value = reduce ? 1 : withSpring(focused ? 1.12 : 1, SPRING);
  }, [focused, reduce]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const color = focused ? theme.tabBarActive : theme.tabBarInactive;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 }}>
      <Animated.View style={iconStyle}>{renderIcon({ focused, color, size: 21 })}</Animated.View>
      <Text style={{ fontSize: 11, fontWeight: focused ? '700' : '600', color, marginTop: 3 }} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * Barra inferior tipo vidrio: fondo semitransparente sobre el fondo animado,
 * un indicador que se desliza hasta la pestaña activa e ícono activo con
 * un ligero aumento de escala.
 */
export default function GlassTabBar({ state, descriptors, navigation }: TabBarProps) {
  const { theme } = useApp();
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();
  const [width, setWidth] = useState(0);

  const count = state.routes.length;
  const itemWidth = width > 0 ? (width - BAR_PADDING * 2) / count : 0;
  const x = useSharedValue(0);

  useEffect(() => {
    if (!itemWidth) return;
    const target = state.index * itemWidth;
    x.value = reduce ? withTiming(target, { duration: 0 }) : withSpring(target, SPRING);
  }, [state.index, itemWidth, reduce]);

  const indicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View
      style={{
        backgroundColor: theme.tabBarBg,
        borderTopWidth: 1,
        borderTopColor: theme.tabBarBorder,
        paddingBottom: Math.max(insets.bottom, 10),
        paddingTop: 6,
      }}>
      <View
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={{ flexDirection: 'row', paddingHorizontal: BAR_PADDING }}>
        {itemWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: BAR_PADDING + 8,
                width: itemWidth - 16,
                borderRadius: 16,
                backgroundColor: theme.primaryLight,
                borderWidth: 1,
                borderColor: theme.primaryLightBorder,
              },
              indicatorStyle,
            ]}
          />
        ) : null}

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const label = typeof options.title === 'string' ? options.title : route.name;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };
          const onLongPress = () => navigation.emit({ type: 'tabLongPress', target: route.key });

          return (
            <TabItem
              key={route.key}
              label={label}
              focused={focused}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              renderIcon={(p) => options.tabBarIcon?.(p) ?? null}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}
