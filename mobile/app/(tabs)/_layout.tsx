import { Tabs } from 'expo-router';
import { View, Platform, type ColorValue } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { theme, isDarkMode, t } = useApp();
  const bottomPadding = Math.max(insets.bottom, 10);

  const icon = (active: IconName, inactive: IconName) =>
    ({ color, focused }: { color: ColorValue; focused: boolean }) => (
      <View
        style={{
          width: 52,
          height: 30,
          borderRadius: 15,
          backgroundColor: focused ? theme.primaryLight : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Ionicons name={focused ? active : inactive} size={21} color={color} />
      </View>
    );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        headerShown: false,
        sceneStyle: { backgroundColor: theme.bg },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 3,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarStyle: {
          backgroundColor: theme.tabBarBg,
          borderTopWidth: 1,
          borderTopColor: theme.tabBarBorder,
          height: Platform.OS === 'ios' ? 84 : 66 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          elevation: 0,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDarkMode ? 0 : 0.04,
          shadowRadius: 12,
        },
      }}>
      <Tabs.Screen name="index" options={{ title: t('tabInicio'), tabBarIcon: icon('home', 'home-outline') }} />
      <Tabs.Screen name="cultivos" options={{ title: t('tabCultivos'), tabBarIcon: icon('leaf', 'leaf-outline') }} />
      <Tabs.Screen name="historial" options={{ title: t('tabHistorial'), tabBarIcon: icon('time', 'time-outline') }} />
      <Tabs.Screen name="perfil" options={{ title: t('tabPerfil'), tabBarIcon: icon('person', 'person-outline') }} />
    </Tabs>
  );
}
