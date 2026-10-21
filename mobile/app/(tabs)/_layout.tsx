import { Tabs } from 'expo-router';
import { View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { theme, isDarkMode, rolActivo, t } = useApp();
  const bottomPadding = Math.max(insets.bottom, 10);

  const isTecnico = rolActivo === 'tecnico';
  const tabActiveColor = isTecnico ? (isDarkMode ? '#60A5FA' : '#2563EB') : theme.tabBarActive;
  const tabActiveBg = isTecnico
    ? (isDarkMode ? 'rgba(96, 165, 250, 0.2)' : 'rgba(37, 99, 235, 0.12)')
    : (isDarkMode ? 'rgba(74, 222, 128, 0.16)' : 'rgba(46, 125, 50, 0.12)');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabActiveColor,
        tabBarInactiveTintColor: theme.tabBarInactive,
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarStyle: {
          backgroundColor: theme.tabBarBg,
          borderTopWidth: 1,
          borderTopColor: theme.tabBarBorder,
          height: Platform.OS === 'ios' ? 84 : 64 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 6,
          elevation: isDarkMode ? 0 : 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDarkMode ? 0.3 : 0.05,
          shadowRadius: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabInicio'),
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 44,
                height: 28,
                borderRadius: 14,
                backgroundColor: focused ? tabActiveBg : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="cultivos"
        options={{
          title: t('tabCultivos'),
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 44,
                height: 28,
                borderRadius: 14,
                backgroundColor: focused ? tabActiveBg : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Ionicons name={focused ? 'leaf' : 'leaf-outline'} size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          title: t('tabHistorial'),
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 44,
                height: 28,
                borderRadius: 14,
                backgroundColor: focused ? tabActiveBg : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Ionicons name={focused ? 'clipboard' : 'clipboard-outline'} size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: t('tabPerfil'),
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 44,
                height: 28,
                borderRadius: 14,
                backgroundColor: focused ? tabActiveBg : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={20} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}



