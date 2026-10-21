import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { vinculosApi } from '../../lib/api';
import {
  Badge,
  Button,
  Card,
  Divider,
  EmptyState,
  Field,
  IconTile,
  SectionTitle,
  Sheet,
  StatTile,
  useElevation,
  type Tone,
} from '../../components/ui';

const { width: SCREEN_W } = Dimensions.get('window');

export default function Inicio() {
  const router = useRouter();
  const {
    rolActivo,
    cultivos,
    analisisHistorial,
    perfilAgricultor,
    perfilTecnico,
    setSelectedCultivoId,
    addCultivo,
    vincularParcelaPorCodigo,
    theme,
    isDarkMode,
    toggleDarkMode,
    language,
    t,
  } = useApp();

  const [modalNuevoLote, setModalNuevoLote] = useState(false);
  const [nombreLote, setNombreLote] = useState('');
  const [variedadLote, setVariedadLote] = useState('Papa Pastusa Suprema');
  const [hectareasLote, setHectareasLote] = useState('');
  const [ubicacionLote, setUbicacionLote] = useState('');

  const [modalVincular, setModalVincular] = useState(false);
  const [codigoInput, setCodigoInput] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const btnScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
      ]),
      Animated.spring(btnScale, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const getSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return t('saludoManana');
    if (hora < 18) return t('saludoTarde');
    return t('saludoNoche');
  };

  const handleVincular = async () => {
    if (!codigoInput.trim()) {
      return Alert.alert('Error', language === 'en' ? 'Please enter the access code' : 'Ingresa el código');
    }
    try {
      const res = await vincularParcelaPorCodigo(codigoInput.trim().toUpperCase());
      if (res.success && res.data) {
        Alert.alert(
          language === 'en' ? 'Plot Linked!' : '¡Parcela Vinculada!',
          language === 'en'
            ? `Plot "${res.data.cultivo.nombre}" linked successfully. You can now audit this plot.`
            : `Parcela "${res.data.cultivo.nombre}" vinculada correctamente. Ahora puedes auditarla y revisar sus diagnósticos.`
        );
        setModalVincular(false);
        setCodigoInput('');
      } else {
        Alert.alert('Error', res.error || (language === 'en' ? 'Invalid code or plot not found' : 'Código inválido o parcela no encontrada'));
      }
    } catch (e) {
      Alert.alert('Error', language === 'en' ? 'Connection error' : 'Problema de conexión');
    }
  };

  const casosPendientes = (analisisHistorial || []).filter((a) => a?.estadoRevision === 'pendiente');
  const casosRevisados = (analisisHistorial || []).filter((a) => a?.estadoRevision === 'revisado');

  const nombre =
    rolActivo === 'agricultor'
      ? (perfilAgricultor?.nombre || (language === 'en' ? 'Farmer' : 'Agricultor')).trim().split(' ')[0]
      : (perfilTecnico?.nombre || (language === 'en' ? 'Agronomist' : 'Técnico')).trim().split(' ')[0];

  const handleCrearPrimerLote = () => {
    if (!nombreLote.trim()) {
      Alert.alert(
        language === 'en' ? 'Required field' : 'Campo requerido',
        language === 'en' ? 'Enter your plot name.' : 'Ingresa el nombre de tu parcela o finca.'
      );
      return;
    }
    const ha = parseFloat(hectareasLote.replace(',', '.'));
    if (isNaN(ha) || ha <= 0) {
      Alert.alert(
        language === 'en' ? 'Invalid field' : 'Campo inválido',
        language === 'en' ? 'Enter a valid number of hectares.' : 'Ingresa un número válido de hectáreas.'
      );
      return;
    }

    const nuevo = addCultivo({
      nombre: nombreLote.trim(),
      variedad: variedadLote,
      hectareas: Number(ha.toFixed(1)),
      ubicacion: ubicacionLote.trim() || perfilAgricultor?.ubicacion || (language === 'en' ? 'Rural Area' : 'Zona Rural'),
      fechaSiembra: language === 'en' ? 'Recent' : 'Reciente',
      estadoFitosanitario: 'optimo',
    });

    setNombreLote('');
    setHectareasLote('');
    setUbicacionLote('');
    setModalNuevoLote(false);
    Alert.alert(
      language === 'en' ? 'Plot Registered!' : '¡Parcela Registrada!',
      language === 'en'
        ? `Plot created successfully.\nUnique Access Code: ${nuevo.codigoAcceso}\nShare this code with your technician so they can review this plot.`
        : `Tu parcela ha sido guardada.\nCódigo único de acceso: ${nuevo.codigoAcceso}\nComparte este código con tu técnico agrónomo para que pueda auditarla.`
    );
  };

  // -------------------------------------------------------------------------
  // Encabezado común
  // -------------------------------------------------------------------------
  const Header = (
    <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name={rolActivo === 'agricultor' ? 'leaf' : 'shield-checkmark'} size={18} color={theme.primary} />
        <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text, marginLeft: 7, letterSpacing: -0.2 }}>
          PMP <Text style={{ color: theme.primary }}>Smart</Text>
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => router.push('/(tabs)/perfil')}
        activeOpacity={0.75}
        accessibilityLabel={language === 'en' ? 'Open profile' : 'Abrir perfil'}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: theme.primaryLight,
          borderWidth: 1,
          borderColor: theme.primaryLightBorder,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: theme.primary }}>{nombre.charAt(0).toUpperCase()}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      {Header}

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}>

        {rolActivo === 'agricultor' ? (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Greeting */}
            <Text style={{ fontSize: 24, fontWeight: '800', color: theme.text, marginBottom: 3, letterSpacing: -0.4 }}>
              {getSaludo()}, {nombre}
            </Text>
            <Text style={{ fontSize: 13, color: theme.textMuted, marginBottom: 20, fontWeight: '400' }}>
              {t('subtituloInicio')}
            </Text>

            {/* Empty State */}
            {cultivos.length === 0 && (
              <View
                style={{
                  backgroundColor: theme.card,
                  borderRadius: 20,
                  padding: 24,
                  borderWidth: 1,
                  borderColor: theme.cardBorder,
                  marginBottom: 20,
                }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: theme.primaryLight,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14,
                  }}>
                  <Ionicons name="map" size={22} color={theme.primary} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 6 }}>
                  {t('sinParcelasTitulo')}
                </Text>
                <Text style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 19, marginBottom: 18 }}>
                  {t('sinParcelasDesc')}
                </Text>
                <TouchableOpacity
                  onPress={() => setModalNuevoLote(true)}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: theme.primary,
                    paddingVertical: 13,
                    borderRadius: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Ionicons name="add" size={16} color="white" />
                  <Text style={{ color: 'white', fontSize: 13, fontWeight: '600', marginLeft: 6 }}>
                    {t('agregarParcelaBtn')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Main CTA: Analizar planta */}
            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <TouchableOpacity
                onPress={() => router.push('/camera')}
                activeOpacity={0.9}
                style={{
                  backgroundColor: theme.bannerBg,
                  borderRadius: 22,
                  padding: 22,
                  marginBottom: 24,
                  borderWidth: isDarkMode ? 1 : 0,
                  borderColor: isDarkMode ? 'rgba(74, 222, 128, 0.3)' : 'transparent',
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 15,
                      backgroundColor: 'rgba(255,255,255,0.18)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Ionicons name="camera" size={24} color="white" />
                  </View>
                  <View style={{ marginLeft: 14, flex: 1 }}>
                    <Text style={{ color: 'white', fontSize: 17, fontWeight: '800', letterSpacing: -0.2 }}>
                      {t('analizarPlanta')}
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 3 }}>
                      {t('subtituloAnalizar')}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.7)" />
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Reviewed Alert if any */}
            {casosRevisados.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/historial')}
                activeOpacity={0.85}
                style={{
                  backgroundColor: theme.primaryLight,
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 24,
                  borderWidth: 1,
                  borderColor: theme.primaryLightBorder,
                }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: theme.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                  <Ionicons name="checkmark" size={18} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: theme.primary }}>
                    {language === 'en' ? 'Agronomist report ready' : 'Dictamen técnico disponible'}
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 1 }}>
                    {language === 'en' ? 'Review feedback on your scans' : 'Tienes recomendaciones de un agrónomo'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={theme.primary} />
              </TouchableOpacity>
            )}

            {/* Metrics Stats */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 28 }}>
              {[
                { value: cultivos.length, label: t('metricasParcelas'), color: theme.primary },
                { value: analisisHistorial.length, label: t('metricasEscaneos'), color: theme.accent },
                { value: casosPendientes.length, label: t('metricasEnRevision'), color: theme.warning },
              ].map((stat, i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    backgroundColor: theme.card,
                    padding: 16,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: theme.cardBorder,
                    alignItems: 'center',
                  }}>
                  <Text style={{ fontSize: 22, fontWeight: '800', color: stat.color }}>{stat.value}</Text>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: theme.textMuted, marginTop: 4, letterSpacing: 0.5 }}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Parcelas List */}
            {cultivos.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text }}>
                    {t('tusParcelas')}
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/(tabs)/cultivos')}>
                    <Text style={{ fontSize: 12, color: theme.primary, fontWeight: '600' }}>
                      {t('verTodas')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {cultivos.slice(0, 3).map((cultivo) => (
                  <TouchableOpacity
                    key={cultivo.id}
                    onPress={() => {
                      setSelectedCultivoId(cultivo.id);
                      router.push({ pathname: '/camera', params: { cultivoId: cultivo.id } });
                    }}
                    activeOpacity={0.85}
                    style={{
                      backgroundColor: theme.card,
                      borderRadius: 16,
                      padding: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: theme.cardBorder,
                      marginBottom: 10,
                    }}>
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        backgroundColor: cultivo.estadoFitosanitario === 'alerta' ? theme.warningBg : theme.primaryLight,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}>
                      <Ionicons
                        name="leaf"
                        size={18}
                        color={cultivo.estadoFitosanitario === 'alerta' ? theme.warning : theme.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text }}>{cultivo.nombre}</Text>
                      <Text style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>
                        {cultivo.variedad} · {cultivo.hectareas} {t('ha')}{cultivo.codigoAcceso ? ` · Cód: ${cultivo.codigoAcceso}` : ''}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: theme.primaryLight,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 10,
                      }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: theme.primary }}>
                        {t('escanear')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Recent Analyses */}
            {analisisHistorial.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text }}>
                    {t('analisisRecientes')}
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/(tabs)/historial')}>
                    <Text style={{ fontSize: 12, color: theme.primary, fontWeight: '600' }}>
                      {t('verTodas')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {analisisHistorial.slice(0, 2).map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => router.push('/(tabs)/historial')}
                    activeOpacity={0.85}
                    style={{
                      backgroundColor: theme.card,
                      borderRadius: 16,
                      padding: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: theme.cardBorder,
                      marginBottom: 10,
                    }}>
                    <Image
                      source={{ uri: item.imageUri || 'https://images.unsplash.com/photo-1555431189-0ab279e2be3a' }}
                      style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: theme.cardBorder }}
                      resizeMode="cover"
                    />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: '700',
                            color: item.estado === 'alerta' ? theme.warning : theme.primary,
                          }}>
                          {item.diagnostico || (language === 'en' ? 'Diagnosis' : 'Diagnóstico')}
                        </Text>
                        {item.estadoRevision === 'revisado' && (
                          <View style={{ backgroundColor: theme.primaryLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                            <Text style={{ fontSize: 9, fontWeight: '700', color: theme.primary }}>
                              {t('estadoRevisado')}
                            </Text>
                          </View>
                        )}
                        {item.estadoRevision === 'pendiente' && (
                          <View style={{ backgroundColor: theme.warningBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                            <Text style={{ fontSize: 9, fontWeight: '700', color: theme.warning }}>
                              {t('estadoPendiente')}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>
                        {item.cultivoNombre || (language === 'en' ? 'Plot' : 'Parcela')} · {item.fecha || ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Animated.View>
        ) : (
          /* ===== MODO TÉCNICO ===== */
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Tech Panel */}
            <View
              style={{
                backgroundColor: isDarkMode ? '#1E293B' : '#EFF6FF',
                borderRadius: 16,
                padding: 18,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: isDarkMode ? '#334155' : '#DBEAFE',
              }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#3B82F6', marginBottom: 4 }}>
                {language === 'en' ? 'Agronomist Technician Panel' : 'Panel técnico agronómico'}
              </Text>
              <Text style={{ fontSize: 12, color: theme.textSecondary }}>
                {perfilTecnico?.nombre || (language === 'en' ? 'Agronomist' : 'Ing. Agrónomo')} · {perfilTecnico?.registroProfesional || 'Reg. Profesional'}
              </Text>
            </View>

            {/* Tech Stats */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
              {[
                { value: casosPendientes.length, label: language === 'en' ? 'To Review' : 'Por revisar', color: theme.warning },
                { value: casosRevisados.length, label: language === 'en' ? 'Audited' : 'Auditados', color: isDarkMode ? '#60A5FA' : '#2563EB' },
                { value: cultivos.length, label: t('metricasParcelas'), color: '#3B82F6' },
              ].map((stat, i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    backgroundColor: theme.card,
                    padding: 16,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: theme.cardBorder,
                    alignItems: 'center',
                  }}>
                  <Text style={{ fontSize: 22, fontWeight: '800', color: stat.color }}>{stat.value}</Text>
                  <Text style={{ fontSize: 9, fontWeight: '700', color: theme.textMuted, marginTop: 4, letterSpacing: 0.5 }}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Pending Cases */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text, marginBottom: 14 }}>
                {language === 'en' ? `Pending cases (${casosPendientes.length})` : `Casos pendientes (${casosPendientes.length})`}
              </Text>

              {casosPendientes.length === 0 ? (
                <View
                  style={{
                    backgroundColor: theme.card,
                    borderRadius: 16,
                    padding: 32,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: theme.cardBorder,
                  }}>
                  <Ionicons name="checkmark-circle" size={32} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                  <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text, marginTop: 10 }}>
                    {language === 'en' ? 'No pending reviews' : 'Sin revisiones pendientes'}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.textMuted, textAlign: 'center', marginTop: 4 }}>
                    {language === 'en' ? 'New farmer submissions will appear here' : 'Los casos nuevos aparecerán aquí'}
                  </Text>
                </View>
              ) : (
                casosPendientes.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => router.push('/(tabs)/historial')}
                    activeOpacity={0.85}
                    style={{
                      backgroundColor: theme.card,
                      borderRadius: 16,
                      padding: 14,
                      marginBottom: 10,
                      borderWidth: 1,
                      borderColor: theme.cardBorder,
                    }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Image
                        source={{ uri: item.imageUri || 'https://images.unsplash.com/photo-1555431189-0ab279e2be3a' }}
                        style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: theme.cardBorder }}
                        resizeMode="cover"
                      />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: theme.warning }}>
                          {item.diagnostico || (language === 'en' ? 'Possible PMP' : 'Posible PMP')}
                        </Text>
                        <Text style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>
                          {item.cultivoNombre || (language === 'en' ? 'Plot' : 'Parcela')} · {item.confianza || 90}% IA
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>

            {/* Actions (Azul armónico para rol técnico) */}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/historial')}
              activeOpacity={0.85}
              style={{
                backgroundColor: isDarkMode ? '#2563EB' : '#1D4ED8',
                paddingVertical: 14,
                borderRadius: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 10,
              }}>
              <Ionicons name="clipboard" size={16} color="white" />
              <Text style={{ color: 'white', fontSize: 13, fontWeight: '700', marginLeft: 8 }}>
                {language === 'en' ? 'View Full History' : 'Ver historial completo'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVincular(true)}
              activeOpacity={0.85}
              style={{
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.4)' : '#DBEAFE',
                paddingVertical: 14,
                borderRadius: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}>
              <Ionicons name="key-outline" size={16} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
              <Text style={{ color: isDarkMode ? '#60A5FA' : '#2563EB', fontSize: 13, fontWeight: '700', marginLeft: 8 }}>
                {language === 'en' ? 'Link Plot by Code' : 'Vincular parcela por código'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>

      {/* Nueva parcela */}
      <Sheet
        visible={modalNuevoLote}
        onClose={() => setModalNuevoLote(false)}
        title={t('nuevaParcela')}
        subtitle={language === 'en' ? 'Basic details of your field' : 'Datos básicos de tu cultivo'}
        icon="leaf-outline"
        footer={
          <>
            <Button label={t('cancelar')} variant="secondary" onPress={() => setModalNuevoLote(false)} flex />
            <Button label={t('guardar')} onPress={handleCrearPrimerLote} flex />
          </>
        }>
        <Field
          label={language === 'en' ? 'Name' : 'Nombre'}
          required
          value={nombreLote}
          onChangeText={setNombreLote}
          placeholder={t('nombreParcelaPlaceholder')}
        />
        <Field
          label={language === 'en' ? 'Variety' : 'Variedad'}
          value={variedadLote}
          onChangeText={setVariedadLote}
          placeholder={t('variedadPlaceholder')}
        />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Field
            style={{ flex: 1 }}
            label={language === 'en' ? 'Hectares' : 'Hectáreas'}
            required
            value={hectareasLote}
            onChangeText={setHectareasLote}
            placeholder="2.0"
            keyboardType="decimal-pad"
          />
          <Field
            style={{ flex: 1 }}
            label={language === 'en' ? 'Location' : 'Ubicación'}
            value={ubicacionLote}
            onChangeText={setUbicacionLote}
            placeholder={t('ubicacionPlaceholder')}
          />
        </View>
      </Sheet>

      {/* Vincular parcela (técnico) */}
      <Sheet
        visible={modalVincular}
        onClose={() => setModalVincular(false)}
        title={language === 'en' ? 'Link plot' : 'Vincular parcela'}
        subtitle={language === 'en' ? 'Use the code shared by the farmer' : 'Usa el código que te compartió el agricultor'}
        icon="key-outline"
        footer={<Button label={language === 'en' ? 'Link plot' : 'Vincular parcela'} onPress={handleVincular} flex />}>
        <Text style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 16, lineHeight: 20 }}>
          {language === 'en'
            ? 'Enter the 6-character access code provided by the potato farmer to monitor this specific plot.'
            : 'Ingresa el código único de 6 caracteres proporcionado por el agricultor para auditar únicamente esta parcela.'}
        </Text>
        <Field
          value={codigoInput}
          onChangeText={setCodigoInput}
          placeholder="A7B9X2"
          autoCapitalize="characters"
          maxLength={6}
          inputStyle={{ fontSize: 26, fontWeight: '800', textAlign: 'center', letterSpacing: 8, paddingVertical: 14, color: theme.primary }}
        />
      </Sheet>
    </SafeAreaView>
  );
}
