import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
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
import { FontAwesome } from '@expo/vector-icons';
import { authApi } from '../../lib/api';
import FieldBackground from '../../components/FieldBackground';

const C = {
  text: '#F3F1E7',
  textSoft: 'rgba(243, 241, 231, 0.68)',
  textFaint: 'rgba(243, 241, 231, 0.4)',
  lime: '#A5CF5F',
  limeText: '#12230F',
  wheat: '#E2B866',
  fieldBg: 'rgba(255, 255, 255, 0.05)',
  fieldBorder: 'rgba(255, 255, 255, 0.10)',
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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

  const fieldStyle = (name: string) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: focusedField === name ? 'rgba(255,255,255,0.09)' : C.fieldBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: focusedField === name ? C.lime : C.fieldBorder,
    paddingHorizontal: 16,
  });

  const rise = (v: Animated.Value, from = 24) => ({
    opacity: v,
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) }],
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#0A1410' }}>
      <StatusBar style="light" />
      <FieldBackground />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 26, paddingVertical: 32 }}
            keyboardShouldPersistTaps="handled">

            {/* Encabezado */}
            <Animated.View style={[{ marginBottom: 30 }, rise(headIn, 16)]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 26 }}>
                <FontAwesome name="leaf" size={16} color={C.lime} />
                <Text style={{ color: C.text, fontSize: 15, fontWeight: '700', marginLeft: 8 }}>
                  PMP <Text style={{ color: C.lime }}>Smart</Text>
                </Text>
              </View>

              <Text style={{ color: C.text, fontSize: 34, fontWeight: '800', lineHeight: 40, letterSpacing: -0.8 }}>
                Hola de nuevo
              </Text>
              <Text style={{ color: C.textSoft, fontSize: 15, marginTop: 8, lineHeight: 22 }}>
                Entra para ver cómo van tus parcelas de papa.
              </Text>
            </Animated.View>

            {/* Formulario */}
            <Animated.View
              style={[
                {
                  backgroundColor: 'rgba(8, 18, 12, 0.72)',
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.07)',
                  padding: 22,
                },
                rise(formIn),
              ]}>
              <Text style={{ color: C.textSoft, fontSize: 13, fontWeight: '500', marginBottom: 8 }}>
                Correo electrónico
              </Text>
              <View style={[fieldStyle('email'), { marginBottom: 18 }]}>
                <FontAwesome name="envelope-o" size={14} color={focusedField === 'email' ? C.lime : C.textFaint} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="nombre@finca.com"
                  placeholderTextColor="rgba(243, 241, 231, 0.28)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 12, color: C.text, fontSize: 15 }}
                />
              </View>

              <Text style={{ color: C.textSoft, fontSize: 13, fontWeight: '500', marginBottom: 8 }}>
                Contraseña
              </Text>
              <View style={fieldStyle('password')}>
                <FontAwesome name="lock" size={16} color={focusedField === 'password' ? C.lime : C.textFaint} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Tu contraseña"
                  placeholderTextColor="rgba(243, 241, 231, 0.28)"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 12, color: C.text, fontSize: 15 }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <FontAwesome name={showPassword ? 'eye-slash' : 'eye'} size={16} color={C.textFaint} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.85}
                style={{
                  backgroundColor: C.lime,
                  paddingVertical: 16,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  marginTop: 26,
                  opacity: isLoading ? 0.75 : 1,
                }}>
                {isLoading ? (
                  <ActivityIndicator color={C.limeText} />
                ) : (
                  <>
                    <Text style={{ color: C.limeText, fontWeight: '700', fontSize: 16 }}>Entrar</Text>
                    <FontAwesome name="arrow-right" size={14} color={C.limeText} style={{ marginLeft: 10 }} />
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Registro */}
            <Animated.View style={[{ flexDirection: 'row', justifyContent: 'center', marginTop: 26 }, { opacity: formIn }]}>
              <Text style={{ color: C.textSoft, fontSize: 14 }}>¿Primera vez aquí? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')} hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}>
                <Text style={{ color: C.wheat, fontSize: 14, fontWeight: '700' }}>Crea tu cuenta</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
