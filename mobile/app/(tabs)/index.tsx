import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, Animated, Easing, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp, Cultivo } from '../../context/AppContext';
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

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1555431189-0ab279e2be3a';

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
    refreshData,
    theme,
    language,
    t,
  } = useApp();
  const heroShadow = useElevation(2);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } finally {
      setRefreshing(false);
    }
  };

  const [modalNuevoLote, setModalNuevoLote] = useState(false);
  const [nombreLote, setNombreLote] = useState('');
  const [variedadLote, setVariedadLote] = useState('Papa Pastusa Suprema');
  const [hectareasLote, setHectareasLote] = useState('');
  const [ubicacionLote, setUbicacionLote] = useState('');

  const [modalVincular, setModalVincular] = useState(false);
  const [codigoInput, setCodigoInput] = useState('');

  // Entrada suave del contenido
  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, []);
  const enterStyle = {
    opacity: enter,
    transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
  };

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

  const nombreCompleto =
    rolActivo === 'agricultor'
      ? perfilAgricultor?.nombre || (language === 'en' ? 'Farmer' : 'Agricultor')
      : perfilTecnico?.nombre || (language === 'en' ? 'Agronomist' : 'Técnico');
  const nombre = nombreCompleto.trim().split(' ')[0];

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

  const estadoCultivo = (estado: Cultivo['estadoFitosanitario']): { label: string; tone: Tone } => {
    if (estado === 'alerta') return { label: t('estadoAlerta'), tone: 'warning' };
    if (estado === 'observacion') return { label: t('estadoRevision'), tone: 'info' };
    return { label: t('estadoOptimo'), tone: 'success' };
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      {Header}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} colors={[theme.primary]} />}
        showsVerticalScrollIndicator={false}>
        {rolActivo === 'agricultor' ? (
          <Animated.View style={enterStyle}>
            {/* Saludo */}
            <Text style={{ fontSize: 15, color: theme.textMuted, fontWeight: '500' }}>{getSaludo()},</Text>
            <Text style={{ fontSize: 30, fontWeight: '800', color: theme.text, letterSpacing: -0.8, marginBottom: 4 }}>
              {nombre}
            </Text>
            <Text style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 20 }}>{t('subtituloInicio')}</Text>

            {/* Acción principal */}
            <TouchableOpacity
              onPress={() => router.push('/camera')}
              activeOpacity={0.9}
              accessibilityRole="button"
              style={{
                backgroundColor: theme.bannerBg,
                borderRadius: 22,
                padding: 20,
                marginBottom: 16,
                overflow: 'hidden',
                ...heroShadow,
              }}>
              {/* Hojas decorativas */}
              <Ionicons name="leaf" size={150} color="rgba(255,255,255,0.06)" style={{ position: 'absolute', right: -28, top: -30, transform: [{ rotate: '-20deg' }] }} />
              <Ionicons name="leaf" size={70} color="rgba(255,255,255,0.05)" style={{ position: 'absolute', right: 90, bottom: -22, transform: [{ rotate: '35deg' }] }} />

              <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Ionicons name="scan" size={24} color="#FFFFFF" />
              </View>
              <Text style={{ color: theme.bannerText, fontSize: 21, fontWeight: '800', letterSpacing: -0.4 }}>{t('analizarPlanta')}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 4, marginBottom: 16, lineHeight: 20 }}>
                {t('subtituloAnalizar')}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999 }}>
                <Ionicons name="camera" size={15} color={theme.bannerBg} />
                <Text style={{ color: theme.bannerBg, fontSize: 14, fontWeight: '700', marginLeft: 6 }}>
                  {language === 'en' ? 'Open camera' : 'Abrir cámara'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Aviso de dictamen */}
            {casosRevisados.length > 0 && (
              <Card onPress={() => router.push('/(tabs)/historial')} style={{ marginBottom: 16 }} padding={14}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <IconTile icon="checkmark-done" tone="success" size={40} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text }}>
                      {language === 'en' ? 'Agronomist report ready' : 'Dictamen técnico disponible'}
                    </Text>
                    <Text style={{ fontSize: 13, color: theme.textMuted, marginTop: 1 }}>
                      {language === 'en' ? 'Review feedback on your scans' : 'Tienes recomendaciones de un agrónomo'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
                </View>
              </Card>
            )}

            {/* Métricas */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 28 }}>
              <StatTile value={cultivos.length} label={t('metricasParcelas')} icon="map-outline" tone="primary" />
              <StatTile value={analisisHistorial.length} label={t('metricasEscaneos')} icon="scan-outline" tone="info" />
              <StatTile value={casosPendientes.length} label={t('metricasEnRevision')} icon="hourglass-outline" tone="warning" />
            </View>

            {/* Sin parcelas */}
            {cultivos.length === 0 && (
              <View style={{ marginBottom: 28 }}>
                <EmptyState
                  icon="map-outline"
                  title={t('sinParcelasTitulo')}
                  description={t('sinParcelasDesc')}
                  action={<Button label={t('agregarParcelaBtn')} icon="add" onPress={() => setModalNuevoLote(true)} />}
                />
              </View>
            )}

            {/* Parcelas */}
            {cultivos.length > 0 && (
              <View style={{ marginBottom: 28 }}>
                <SectionTitle title={t('tusParcelas')} actionLabel={t('verTodas')} onAction={() => router.push('/(tabs)/cultivos')} />
                <Card padding={0}>
                  {cultivos.slice(0, 3).map((cultivo, i) => {
                    const estado = estadoCultivo(cultivo.estadoFitosanitario);
                    return (
                      <View key={cultivo.id}>
                        {i > 0 && <Divider inset={68} />}
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedCultivoId(cultivo.id);
                            router.push({ pathname: '/camera', params: { cultivoId: cultivo.id } });
                          }}
                          activeOpacity={0.7}
                          style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}>
                          <IconTile icon="leaf" tone={estado.tone} size={40} />
                          <View style={{ flex: 1, marginLeft: 14 }}>
                            <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text }} numberOfLines={1}>
                              {cultivo.nombre}
                            </Text>
                            <Text style={{ fontSize: 13, color: theme.textMuted, marginTop: 2 }} numberOfLines={1}>
                              {cultivo.variedad} · {cultivo.hectareas} {t('ha')}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.primaryLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
                            <Ionicons name="camera-outline" size={14} color={theme.primary} />
                            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.primary, marginLeft: 4 }}>{t('escanear')}</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </Card>
              </View>
            )}

            {/* Análisis recientes */}
            {analisisHistorial.length > 0 && (
              <View>
                <SectionTitle title={t('analisisRecientes')} actionLabel={t('verTodas')} onAction={() => router.push('/(tabs)/historial')} />
                <Card padding={0}>
                  {analisisHistorial.slice(0, 3).map((item, i) => (
                    <View key={item.id}>
                      {i > 0 && <Divider inset={74} />}
                      <TouchableOpacity
                        onPress={() => router.push('/(tabs)/historial')}
                        activeOpacity={0.7}
                        style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>
                        <Image
                          source={{ uri: item.imageUri || FALLBACK_IMG }}
                          style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: theme.surfaceAlt }}
                          resizeMode="cover"
                        />
                        <View style={{ flex: 1, marginLeft: 14 }}>
                          <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text }} numberOfLines={1}>
                            {item.diagnostico || (language === 'en' ? 'Diagnosis' : 'Diagnóstico')}
                          </Text>
                          <Text style={{ fontSize: 13, color: theme.textMuted, marginTop: 2 }} numberOfLines={1}>
                            {item.cultivoNombre || (language === 'en' ? 'Plot' : 'Parcela')} · {item.fecha || ''}
                          </Text>
                        </View>
                        {item.estadoRevision === 'revisado' && <Badge label={t('estadoRevisado')} tone="success" />}
                        {item.estadoRevision === 'pendiente' && <Badge label={t('estadoPendiente')} tone="warning" />}
                        {item.estadoRevision !== 'revisado' && item.estadoRevision !== 'pendiente' && (
                          <Badge label={item.estado === 'alerta' ? t('estadoAlerta') : t('estadoOptimo')} tone={item.estado === 'alerta' ? 'warning' : 'success'} dot />
                        )}
                      </TouchableOpacity>
                    </View>
                  ))}
                </Card>
              </View>
            )}
          </Animated.View>
        ) : (
          /* ===== MODO TÉCNICO ===== */
          <Animated.View style={enterStyle}>
            <Text style={{ fontSize: 15, color: theme.textMuted, fontWeight: '500' }}>{getSaludo()},</Text>
            <Text style={{ fontSize: 30, fontWeight: '800', color: theme.text, letterSpacing: -0.8, marginBottom: 16 }}>
              {nombre}
            </Text>

            {/* Credencial */}
            <View
              style={{
                backgroundColor: theme.bannerBg,
                borderRadius: 22,
                padding: 20,
                marginBottom: 16,
                overflow: 'hidden',
                ...heroShadow,
              }}>
              <Ionicons name="shield-checkmark" size={140} color="rgba(255,255,255,0.06)" style={{ position: 'absolute', right: -24, top: -24 }} />
              <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>
                {language === 'en' ? 'Agronomist panel' : 'Panel técnico agronómico'}
              </Text>
              <Text style={{ fontSize: 19, fontWeight: '800', color: theme.bannerText, marginTop: 4 }} numberOfLines={1}>
                {perfilTecnico?.nombre || (language === 'en' ? 'Agronomist' : 'Ing. Agrónomo')}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.14)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 }}>
                  <Ionicons name="ribbon-outline" size={13} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600', marginLeft: 5 }}>
                    {perfilTecnico?.registroProfesional || 'Reg. Profesional'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Métricas */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 28 }}>
              <StatTile value={casosPendientes.length} label={language === 'en' ? 'To review' : 'Por revisar'} icon="hourglass-outline" tone="warning" />
              <StatTile value={casosRevisados.length} label={language === 'en' ? 'Audited' : 'Auditados'} icon="checkmark-done-outline" tone="primary" />
              <StatTile value={cultivos.length} label={t('metricasParcelas')} icon="map-outline" tone="info" />
            </View>

            {/* Casos pendientes */}
            <SectionTitle
              title={language === 'en' ? 'Pending cases' : 'Casos pendientes'}
              actionLabel={casosPendientes.length > 0 ? t('verTodas') : undefined}
              onAction={() => router.push('/(tabs)/historial')}
            />
            {casosPendientes.length === 0 ? (
              <EmptyState
                icon="checkmark-circle-outline"
                title={language === 'en' ? 'No pending reviews' : 'Sin revisiones pendientes'}
                description={language === 'en' ? 'New farmer submissions will appear here' : 'Los casos nuevos aparecerán aquí'}
              />
            ) : (
              <Card padding={0}>
                {casosPendientes.map((item, i) => (
                  <View key={item.id}>
                    {i > 0 && <Divider inset={74} />}
                    <TouchableOpacity
                      onPress={() => router.push('/(tabs)/historial')}
                      activeOpacity={0.7}
                      style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>
                      <Image
                        source={{ uri: item.imageUri || FALLBACK_IMG }}
                        style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: theme.surfaceAlt }}
                        resizeMode="cover"
                      />
                      <View style={{ flex: 1, marginLeft: 14 }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text }} numberOfLines={1}>
                          {item.diagnostico || (language === 'en' ? 'Possible PMP' : 'Posible PMP')}
                        </Text>
                        <Text style={{ fontSize: 13, color: theme.textMuted, marginTop: 2 }} numberOfLines={1}>
                          {item.cultivoNombre || (language === 'en' ? 'Plot' : 'Parcela')} · {item.confianza || 90}% {language === 'en' ? 'match' : 'coincidencia'}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
                    </TouchableOpacity>
                  </View>
                ))}
              </Card>
            )}

            <View style={{ marginTop: 24, gap: 10 }}>
              <Button label={language === 'en' ? 'View full history' : 'Ver historial completo'} icon="time-outline" onPress={() => router.push('/(tabs)/historial')} />
              <Button
                label={language === 'en' ? 'Link plot by code' : 'Vincular parcela por código'}
                icon="key-outline"
                variant="secondary"
                onPress={() => setModalVincular(true)}
              />
            </View>
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
