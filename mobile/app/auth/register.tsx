import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { authApi } from '../../lib/api';
import type { RolUsuario } from '../../lib/types';
import FieldBackground from '../../components/FieldBackground';
import { AUTH, AuthBrand, AuthButton, AuthField } from '../../components/AuthUI';

export default function RegisterScreen() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rol, setRol] = useState<RolUsuario>('agricultor');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    if (!nombre.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Completa todos los campos obligatorios.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Contraseña débil', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Las contraseñas no coinciden', 'Verifica que ambas contraseñas sean iguales.');
      return;
    }

    setIsLoading(true);

    const result = await authApi.register({
      email: email.trim(),
      password,
      nombre: nombre.trim(),
      rol,
    });

    setIsLoading(false);

    if (!result.success) {
      Alert.alert('Error de Registro', result.error || 'No se pudo crear la cuenta.');
      return;
    }

    if (result.data) {
      router.replace('/(tabs)');
    } else {
      Alert.alert(
        '¡Cuenta Creada!',
        result.message || 'Revisa tu correo electrónico para confirmar tu cuenta antes de iniciar sesión.',
        [{ text: 'Ir al Login', onPress: () => router.replace('/auth/login') }]
      );
    }
  };

  const roles = [
    { key: 'agricultor' as RolUsuario, icon: 'pagelines' as const, label: 'Agricultor', sub: 'Gestiono mis cultivos' },
    { key: 'tecnico' as RolUsuario, icon: 'stethoscope' as const, label: 'Técnico', sub: 'Reviso diagnósticos' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#0A1410' }}>
      <StatusBar style="light" />
      <FieldBackground />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 26, paddingTop: 12, paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled">
            {/* Volver */}
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Volver"
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: AUTH.fieldBg,
                borderWidth: 1,
                borderColor: AUTH.fieldBorder,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}>
              <FontAwesome name="chevron-left" size={13} color={AUTH.text} />
            </TouchableOpacity>

            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              {/* Encabezado */}
              <View style={{ marginBottom: 24 }}>
                <View style={{ marginBottom: 18 }}>
                  <AuthBrand />
                </View>
                <Text style={{ fontSize: 32, fontWeight: '800', color: AUTH.text, letterSpacing: -0.8, lineHeight: 38 }}>Crea tu cuenta</Text>
                <Text style={{ fontSize: 15, color: AUTH.textSoft, marginTop: 6 }}>Cuéntanos cómo vas a usar la app.</Text>
              </View>

              <View style={{ backgroundColor: AUTH.panel, borderRadius: 24, borderWidth: 1, borderColor: AUTH.panelBorder, padding: 22 }}>
                {/* Rol */}
                <Text style={{ color: AUTH.textSoft, fontSize: 13, fontWeight: '500', marginBottom: 8 }}>Soy</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                  {roles.map((item) => {
                    const selected = rol === item.key;
                    return (
                      <TouchableOpacity
                        key={item.key}
                        onPress={() => setRol(item.key)}
                        activeOpacity={0.8}
                        accessibilityState={{ selected }}
                        style={{
                          flex: 1,
                          padding: 14,
                          borderRadius: 16,
                          borderWidth: 1.5,
                          borderColor: selected ? AUTH.lime : AUTH.fieldBorder,
                          backgroundColor: selected ? 'rgba(165, 207, 95, 0.10)' : AUTH.fieldBg,
                        }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <FontAwesome name={item.icon} size={18} color={selected ? AUTH.lime : AUTH.textFaint} />
                          <View
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 9,
                              borderWidth: 1.5,
                              borderColor: selected ? AUTH.lime : AUTH.textFaint,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            {selected && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: AUTH.lime }} />}
                          </View>
                        </View>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: selected ? AUTH.text : AUTH.textSoft }}>{item.label}</Text>
                        <Text style={{ fontSize: 12, color: AUTH.textFaint, marginTop: 2 }}>{item.sub}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <AuthField
                  label="Nombre completo"
                  icon="user-o"
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder={rol === 'agricultor' ? 'Juan Pérez' : 'Ing. María López'}
                  autoCapitalize="words"
                />
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
                  placeholder="Mínimo 6 caracteres"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  secureToggle={{ visible: showPassword, onToggle: () => setShowPassword(!showPassword) }}
                />
                <AuthField
                  label="Confirmar contraseña"
                  icon="lock"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repite tu contraseña"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />

                <AuthButton label="Crear cuenta" onPress={handleRegister} loading={isLoading} />
              </View>

              {/* Ir al login */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
                <Text style={{ color: AUTH.textSoft, fontSize: 14 }}>¿Ya tienes cuenta? </Text>
                <TouchableOpacity onPress={() => router.replace('/auth/login')} hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}>
                  <Text style={{ color: AUTH.wheat, fontSize: 14, fontWeight: '700' }}>Inicia sesión</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
