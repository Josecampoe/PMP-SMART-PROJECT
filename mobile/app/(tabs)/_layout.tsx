import { Tabs } from 'expo-router';
import { View, type ColorValue } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import FieldBackgroundLite from '../../components/FieldBackgroundLite';
import GlassTabBar from '../../components/GlassTabBar';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export default function TabLayout() {
  const { theme, t } = useApp();

  const icon = (active: IconName, inactive: IconName) =>
    ({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) => (
      <Ionicons name={focused ? active : inactive} size={size} color={color} />
    );

  return (
    <View style={{ flex: 1, backgroundColor: theme.sceneBase }}>
      {/* Fondo animado compartido por las 4 pestañas */}
      <FieldBackgroundLite />
      <Tabs
        tabBar={(props) => <GlassTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: 'transparent' },
        }}>
        <Tabs.Screen name="index" options={{ title: t('tabInicio'), tabBarIcon: icon('home', 'home-outline') }} />
        <Tabs.Screen name="cultivos" options={{ title: t('tabCultivos'), tabBarIcon: icon('leaf', 'leaf-outline') }} />
        <Tabs.Screen name="historial" options={{ title: t('tabHistorial'), tabBarIcon: icon('time', 'time-outline') }} />
        <Tabs.Screen name="perfil" options={{ title: t('tabPerfil'), tabBarIcon: icon('person', 'person-outline') }} />
      </Tabs>
    </View>
  );
}
