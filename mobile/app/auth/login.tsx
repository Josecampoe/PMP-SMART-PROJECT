import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { authApi } from '../../lib/api';
import FieldBackground from '../../components/FieldBackground';
import { AUTH, AuthBrand, AuthButton, AuthField } from '../../components/AuthUI';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Entrada escalonada: encabezado y luego el formulario
  const headIn = useRef(new Animated.Value(0)).current;
  const formIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);
    Animated.stagger(140, [
      Animated.timing(headIn, { toValue: 1, duration: 700, easing: ease, useNativeDriver: true }),
      Animated.timing(formIn, { toValue: 1, duration: 700, easing: ease, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa tu correo y contraseña.');
      return;
    }

    setIsLoading(true);
    const result = await authApi.login(email.trim(), password);
    setIsLoading(false);

    if (!result.success) {
      Alert.alert('Error de Acceso', result.error || 'No se pudo iniciar sesión.');
      return;
    }

    router.replace('/(tabs)');
  };

  const rise = (v: Animated.Value, from = 24) => ({
    opacity: v,
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) }],
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#0A1410' }}>
      <StatusBar style="light" />
      <FieldBackground />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 26, paddingVertical: 32 }}
            keyboardShouldPersistTaps="handled">
            {/* Encabezado */}
            <Animated.View style={[{ marginBottom: 30 }, rise(headIn, 16)]}>
              <View style={{ marginBottom: 26 }}>
                <AuthBrand />
              </View>
              <Text style={{ color: AUTH.text, fontSize: 34, fontWeight: '800', lineHeight: 40, letterSpacing: -0.8 }}>
                Hola de nuevo
              </Text>
              <Text style={{ color: AUTH.textSoft, fontSize: 15, marginTop: 8, lineHeight: 22 }}>
                Entra para ver cómo van tus parcelas de papa.
              </Text>
            </Animated.View>

            {/* Formulario */}
            <Animated.View
              style={[
                { backgroundColor: AUTH.panel, borderRadius: 24, borderWidth: 1, borderColor: AUTH.panelBorder, padding: 22 },
                rise(formIn),
              ]}>
              <AuthField
                label="Correo electrónico"
                icon="envelope-o"
                value={email}
                onChangeText={setEmail}
                placeholder="nombre@finca.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <AuthField
                label="Contraseña"
                icon="lock"
                value={password}
                onChangeText={setPassword}
                placeholder="Tu contraseña"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                secureToggle={{ visible: showPassword, onToggle: () => setShowPassword(!showPassword) }}
              />
              <AuthButton label="Entrar" onPress={handleLogin} loading={isLoading} />
            </Animated.View>

            {/* Registro */}
            <Animated.View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 26, opacity: formIn }}>
              <Text style={{ color: AUTH.textSoft, fontSize: 14 }}>¿Primera vez aquí? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')} hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}>
                <Text style={{ color: AUTH.wheat, fontSize: 14, fontWeight: '700' }}>Crea tu cuenta</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
