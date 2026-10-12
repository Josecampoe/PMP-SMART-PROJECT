import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useApp, Cultivo } from '../../context/AppContext';

const VARIEDADES_PAPA = [
  'Papa Pastusa Suprema',
  'Papa Diacol Capiro',
  'Papa Criolla Colombia',
  'Papa Única',
  'Papa Betina',
  'Papa Superior',
];

export default function CultivosScreen() {
  const router = useRouter();
  const {
    rolActivo,
    cultivos,
    addCultivo,
    deleteCultivo,
    vincularParcelaPorCodigo,
    desvincularParcela,
    setSelectedCultivoId,
    analisisHistorial,
    theme,
    isDarkMode,
    language,
    t,
  } = useApp();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalVincularVisible, setModalVincularVisible] = useState(false);
  const [codigoVincularInput, setCodigoVincularInput] = useState('');

  const [nombre, setNombre] = useState('');
  const [variedad, setVariedad] = useState(VARIEDADES_PAPA[0]);
  const [hectareas, setHectareas] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [fechaSiembra, setFechaSiembra] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const handleCompartirParcela = async (cultivo: Cultivo) => {
    try {
      const code = cultivo.codigoAcceso || '';
      const msg =
        language === 'en'
          ? `🌱 PMP Smart - Access code for plot "${cultivo.nombre}" (${cultivo.variedad}): ${code}\nEnter this code in the app to audit this potato crop.`
          : `🌱 PMP Smart - Código de acceso a la parcela "${cultivo.nombre}" (${cultivo.variedad}): ${code}\nIngresa este código en tu app en modo Técnico para revisar esta parcela y sus diagnósticos de PMP.`;

      await Share.share({
        message: msg,
        title: language === 'en' ? 'Share Plot Code' : 'Compartir código de parcela',
      });
    } catch {
      // Ignorar al cancelar compartir
    }
  };

  const handleVincularParcela = async () => {
    if (!codigoVincularInput.trim()) {
      return Alert.alert('Error', language === 'en' ? 'Please enter the access code' : 'Ingresa el código');
    }
    try {
      const res = await vincularParcelaPorCodigo(codigoVincularInput.trim().toUpperCase());
      if (res.success && res.data) {
        Alert.alert(
          language === 'en' ? 'Plot Linked!' : '¡Parcela Vinculada!',
          language === 'en'
            ? `Plot "${res.data.cultivo.nombre}" has been linked to your surveillance.`
            : `Parcela "${res.data.cultivo.nombre}" agregada a tu vigilancia agronómica.`
        );
        setModalVincularVisible(false);
        setCodigoVincularInput('');
      } else {
        Alert.alert('Error', res.error || (language === 'en' ? 'Invalid code' : 'Código inválido o parcela no encontrada'));
      }
    } catch {
      Alert.alert('Error', language === 'en' ? 'Connection error' : 'Problema de conexión');
    }
  };

  const handleDesvincular = (cultivo: Cultivo) => {
    Alert.alert(
      language === 'en' ? 'Unlink Plot' : 'Desvincular Parcela',
      language === 'en'
        ? `Remove "${cultivo.nombre}" from your monitored plots?`
        : `¿Deseas desvincular la parcela "${cultivo.nombre}" de tu vigilancia?`,
      [
        { text: t('cancelar'), style: 'cancel' },
        {
          text: language === 'en' ? 'Unlink' : 'Desvincular',
          style: 'destructive',
          onPress: async () => {
            if (cultivo.codigoAcceso) {
              await desvincularParcela(cultivo.codigoAcceso);
              Alert.alert(
                language === 'en' ? 'Unlinked' : 'Desvinculada',
                language === 'en' ? 'Plot removed from your surveillance.' : 'La parcela fue retirada de tu lista de vigilancia.'
              );
            }
          },
        },
      ]
    );
  };

  const obtenerUbicacionGPS = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          language === 'en' ? 'Permission Denied' : 'Permiso denegado',
          language === 'en' ? 'Location permission is required.' : 'No se puede acceder a la ubicación del dispositivo.'
        );
        setIsLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        const partes = [address.city || address.subregion, address.region, address.country].filter(Boolean);
        setUbicacion(partes.join(', '));
      } else {
        setUbicacion(`${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`);
      }
    } catch {
      Alert.alert(language === 'en' ? 'GPS Error' : 'Error GPS', language === 'en' ? 'Could not obtain location.' : 'No se pudo obtener la ubicación actual.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleCrearCultivo = () => {
    if (!nombre.trim()) {
      Alert.alert(language === 'en' ? 'Required field' : 'Campo requerido', language === 'en' ? 'Please enter plot name.' : 'Por favor ingresa el nombre de la parcela.');
      return;
    }
    const haNum = parseFloat(hectareas.replace(',', '.'));
    if (isNaN(haNum) || haNum <= 0) {
      Alert.alert(language === 'en' ? 'Invalid field' : 'Campo inválido', language === 'en' ? 'Enter a valid number of hectares.' : 'Por favor ingresa un número válido de hectáreas.');
      return;
    }

    const nuevo = addCultivo({
      nombre: nombre.trim(),
      variedad,
      hectareas: Number(haNum.toFixed(1)),
      ubicacion: ubicacion.trim() || (language === 'en' ? 'Rural Area' : 'Zona Rural'),
      fechaSiembra: fechaSiembra.trim() || (language === 'en' ? 'Recent' : 'Reciente'),
      estadoFitosanitario: 'optimo',
    });

    setNombre('');
    setHectareas('');
    setUbicacion('');
    setFechaSiembra('');
    setModalVisible(false);
    Alert.alert(
      language === 'en' ? 'Plot Saved' : '¡Parcela Guardada!',
      language === 'en'
        ? `Plot registered successfully.\nUnique Access Code: ${nuevo.codigoAcceso}\nShare this code with your technician so they can review this plot.`
        : `Tu cultivo ha sido registrado exitosamente.\nCódigo único de acceso: ${nuevo.codigoAcceso}\nComparte este código con tu agrónomo para que audite esta parcela.`
    );
  };

  const handleEliminarCultivo = (cultivo: Cultivo) => {
    Alert.alert(
      t('eliminarParcela'),
      t('confirmarEliminarParcela'),
      [
        { text: t('cancelar'), style: 'cancel' },
        {
          text: language === 'en' ? 'Delete' : 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteCultivo(cultivo.id);
            Alert.alert(language === 'en' ? 'Deleted' : 'Eliminada', language === 'en' ? 'Plot removed.' : 'La parcela fue eliminada.');
          },
        },
      ]
    );
  };

  const iniciarEscaneoCultivo = (cultivoId: string) => {
    setSelectedCultivoId(cultivoId);
    router.push({
      pathname: '/camera',
      params: { cultivoId },
    });
  };

  const getBadgeEstado = (estado: Cultivo['estadoFitosanitario']) => {
    switch (estado) {
      case 'alerta':
        return {
          text: t('estadoAlerta'),
          bg: theme.warningBg,
          textColor: theme.warning,
          dotColor: theme.warning,
        };
      case 'observacion':
        return {
          text: t('estadoRevision'),
          bg: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
          textColor: '#3B82F6',
          dotColor: '#3B82F6',
        };
      case 'optimo':
      default:
        return {
          text: t('estadoOptimo'),
          bg: theme.primaryLight,
          textColor: theme.primary,
          dotColor: theme.primary,
        };
    }
  };

  const totalHectareas = cultivos.reduce((acc, c) => acc + (c.hectareas || 0), 0);
  const cultivosEnAlerta = cultivos.filter((c) => c.estadoFitosanitario === 'alerta').length;
  const cultivosOptimos = cultivos.filter((c) => c.estadoFitosanitario === 'optimo').length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* 1. ENCABEZADO */}
      <View style={{ backgroundColor: theme.bannerBg, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: 'white', letterSpacing: -0.3 }}>
              {rolActivo === 'agricultor' ? (language === 'en' ? 'My Plots' : 'Mis Parcelas') : (language === 'en' ? 'Field Surveillance' : 'Vigilancia')}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '500', marginTop: 3 }}>
              {t('cultivosSubtitulo')}
            </Text>
          </View>

          {rolActivo === 'agricultor' ? (
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={{
                backgroundColor: theme.accent,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 14,
                paddingVertical: 9,
                borderRadius: 14,
              }}>
              <Ionicons name="add" size={16} color="white" />
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '700', marginLeft: 4 }}>
                {t('nuevaParcela')}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setModalVincularVisible(true)}
              style={{
                backgroundColor: isDarkMode ? '#2563EB' : '#1D4ED8',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 14,
                paddingVertical: 9,
                borderRadius: 14,
              }}>
              <Ionicons name="key-outline" size={15} color="white" />
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '700', marginLeft: 6 }}>
                {language === 'en' ? 'Link Plot' : 'Vincular parcela'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* 2. RESUMEN DE INDICADORES (KPIs) */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          <View style={{ flex: 1, backgroundColor: theme.card, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: theme.cardBorder }}>
            <Text style={{ fontSize: 10, fontWeight: '800', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {language === 'en' ? 'SURFACE' : 'SUPERFICIE'}
            </Text>
            <Text style={{ fontSize: 20, fontWeight: '800', color: theme.text, marginTop: 4 }}>
              {totalHectareas.toFixed(1)} <Text style={{ fontSize: 11, color: theme.textMuted }}>{t('ha')}</Text>
            </Text>
          </View>

          <View style={{ flex: 1, backgroundColor: theme.card, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: theme.cardBorder }}>
            <Text style={{ fontSize: 10, fontWeight: '800', color: theme.warning, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {language === 'en' ? 'ALERTS' : 'ALERTAS'}
            </Text>
            <Text style={{ fontSize: 20, fontWeight: '800', color: theme.warning, marginTop: 4 }}>
              {cultivosEnAlerta}
            </Text>
          </View>

          <View style={{ flex: 1, backgroundColor: theme.card, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: theme.cardBorder }}>
            <Text style={{ fontSize: 10, fontWeight: '800', color: theme.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {language === 'en' ? 'HEALTHY' : 'SANOS'}
            </Text>
            <Text style={{ fontSize: 20, fontWeight: '800', color: theme.primary, marginTop: 4 }}>
              {cultivosOptimos}
            </Text>
          </View>
        </View>

        {/* 3. LISTADO DE CULTIVOS */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 }}>
          <Text style={{ fontSize: 12, fontWeight: '800', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            {language === 'en' ? `REGISTERED PLOTS (${cultivos.length})` : `PARCELAS REGISTRADAS (${cultivos.length})`}
          </Text>
        </View>

        {cultivos.length === 0 ? (
          <View style={{ backgroundColor: theme.card, borderRadius: 24, padding: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.cardBorder }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: theme.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Ionicons name={rolActivo === 'tecnico' ? 'shield-checkmark' : 'leaf'} size={28} color={theme.primary} />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text, textAlign: 'center', marginBottom: 6 }}>
              {rolActivo === 'tecnico'
                ? (language === 'en' ? 'No Plots Under Surveillance' : 'Sin parcelas bajo vigilancia')
                : t('sinCultivos')}
            </Text>
            <Text style={{ fontSize: 12, color: theme.textMuted, textAlign: 'center', marginBottom: 20, lineHeight: 18 }}>
              {rolActivo === 'tecnico'
                ? (language === 'en'
                    ? 'Enter a plot code provided by a farmer to monitor and audit their potato field.'
                    : 'Ingresa el código único de la parcela del agricultor para comenzar su vigilancia agronómica.')
                : (language === 'en'
                    ? 'Add your potato field plots to keep track of AI phytosanitary scans.'
                    : 'Añade tu primera parcela para empezar a llevar el control fitosanitario con la cámara de IA.')}
            </Text>
            {rolActivo === 'agricultor' ? (
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={{ backgroundColor: theme.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="add" size={16} color="white" />
                <Text style={{ color: 'white', fontSize: 13, fontWeight: '700', marginLeft: 6 }}>
                  {t('agregarParcelaBtn')}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setModalVincularVisible(true)}
                style={{ backgroundColor: isDarkMode ? '#2563EB' : '#1D4ED8', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="key-outline" size={16} color="white" />
                <Text style={{ color: 'white', fontSize: 13, fontWeight: '700', marginLeft: 6 }}>
                  {language === 'en' ? 'Enter Plot Code' : 'Ingresar código de parcela'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          cultivos.map((cultivo) => {
            const badge = getBadgeEstado(cultivo.estadoFitosanitario);
            const analisisDeEsteLote = analisisHistorial.filter(
              (a) => a.cultivoId === cultivo.id || a.cultivoNombre === cultivo.nombre
            );
            return (
              <View
                key={cultivo.id}
                style={{
                  backgroundColor: theme.card,
                  borderRadius: 20,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: theme.cardBorder,
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 4 }}>
                      {cultivo.nombre}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="location-outline" size={12} color={theme.textMuted} />
                      <Text style={{ fontSize: 11, color: theme.textMuted, marginLeft: 4 }}>
                        {cultivo.ubicacion}
                      </Text>
                    </View>
                  </View>

                  <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: badge.bg, flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: badge.dotColor, marginRight: 6 }} />
                    <Text style={{ fontSize: 10, fontWeight: '800', color: badge.textColor }}>
                      {badge.text}
                    </Text>
                  </View>
                </View>

                {/* Detalles de la parcela */}
                <View style={{ backgroundColor: theme.inputBg, borderRadius: 14, padding: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: theme.cardBorderSubtle }}>
                  <View>
                    <Text style={{ fontSize: 9, color: theme.textMuted, fontWeight: '800', textTransform: 'uppercase' }}>
                      {language === 'en' ? 'VARIETY' : 'VARIEDAD'}
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text, marginTop: 2 }}>
                      {cultivo.variedad}
                    </Text>
                  </View>
                  <View style={{ borderLeftWidth: 1, borderLeftColor: theme.cardBorderSubtle, paddingLeft: 12 }}>
                    <Text style={{ fontSize: 9, color: theme.textMuted, fontWeight: '800', textTransform: 'uppercase' }}>
                      {language === 'en' ? 'AREA' : 'ÁREA'}
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text, marginTop: 2 }}>
                      {cultivo.hectareas} {t('ha')}
                    </Text>
                  </View>
                  <View style={{ borderLeftWidth: 1, borderLeftColor: theme.cardBorderSubtle, paddingLeft: 12 }}>
                    <Text style={{ fontSize: 9, color: theme.textMuted, fontWeight: '800', textTransform: 'uppercase' }}>
                      {t('metricasEscaneos')}
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text, marginTop: 2 }}>
                      {analisisDeEsteLote.length}
                    </Text>
                  </View>
                </View>

                {/* Código Único de Parcela y Compartir */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: rolActivo === 'tecnico'
                      ? (isDarkMode ? 'rgba(59, 130, 246, 0.12)' : '#EFF6FF')
                      : (isDarkMode ? 'rgba(16, 185, 129, 0.12)' : '#F0FDF4'),
                    borderWidth: 1,
                    borderColor: rolActivo === 'tecnico'
                      ? (isDarkMode ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE')
                      : (isDarkMode ? 'rgba(16, 185, 129, 0.3)' : '#DCFCE7'),
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 14,
                    marginBottom: 12,
                  }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Ionicons
                      name={rolActivo === 'tecnico' ? 'shield-checkmark-outline' : 'key-outline'}
                      size={16}
                      color={rolActivo === 'tecnico' ? (isDarkMode ? '#60A5FA' : '#2563EB') : theme.primary}
                      style={{ marginRight: 8 }}
                    />
                    <View>
                      <Text style={{ fontSize: 9, fontWeight: '800', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {rolActivo === 'tecnico'
                          ? (language === 'en' ? 'MONITORED CODE' : 'CÓDIGO AUDITADO')
                          : (language === 'en' ? 'ACCESS CODE' : 'CÓDIGO DE ACCESO')}
                      </Text>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: '800',
                          color: rolActivo === 'tecnico' ? (isDarkMode ? '#60A5FA' : '#2563EB') : theme.primary,
                          letterSpacing: 2,
                          marginTop: 1,
                        }}>
                        {cultivo.codigoAcceso || '---'}
                      </Text>
                    </View>
                  </View>

                  {rolActivo === 'agricultor' ? (
                    <TouchableOpacity
                      onPress={() => handleCompartirParcela(cultivo)}
                      activeOpacity={0.8}
                      style={{
                        backgroundColor: theme.primary,
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        borderRadius: 10,
                      }}>
                      <Ionicons name="share-social" size={13} color="white" />
                      <Text style={{ color: 'white', fontSize: 11, fontWeight: '700', marginLeft: 4 }}>
                        {language === 'en' ? 'Share' : 'Compartir'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleDesvincular(cultivo)}
                      activeOpacity={0.8}
                      style={{
                        backgroundColor: theme.dangerBg,
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 10,
                      }}>
                      <Ionicons name="close-circle-outline" size={13} color={theme.danger} />
                      <Text style={{ color: theme.danger, fontSize: 11, fontWeight: '700', marginLeft: 4 }}>
                        {language === 'en' ? 'Unlink' : 'Desvincular'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Acciones */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 11, color: theme.textMuted }}>
                    {language === 'en' ? 'Planted:' : 'Siembra:'} <Text style={{ color: theme.text, fontWeight: '600' }}>{cultivo.fechaSiembra}</Text>
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {rolActivo === 'agricultor' ? (
                      <>
                        <TouchableOpacity
                          onPress={() => handleEliminarCultivo(cultivo)}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            backgroundColor: theme.dangerBg,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <Ionicons name="trash-outline" size={16} color={theme.danger} />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => iniciarEscaneoCultivo(cultivo.id)}
                          style={{
                            backgroundColor: theme.primary,
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 10,
                          }}>
                          <Ionicons name="camera" size={14} color="white" />
                          <Text style={{ color: 'white', fontSize: 12, fontWeight: '700', marginLeft: 6 }}>
                            {t('escanear')}
                          </Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity
                        onPress={() => router.push('/(tabs)/historial')}
                        style={{
                          backgroundColor: isDarkMode ? '#2563EB' : '#1D4ED8',
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 10,
                        }}>
                        <Ionicons name="clipboard-outline" size={14} color="white" />
                        <Text style={{ color: 'white', fontSize: 12, fontWeight: '700', marginLeft: 6 }}>
                          {language === 'en' ? 'View Diagnoses' : 'Ver diagnósticos'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* MODAL: REGISTRAR NUEVA PARCELA */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, maxHeight: '90%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: theme.cardBorderSubtle }}>
              <View>
                <Text style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>
                  {t('nuevaParcela')}
                </Text>
                <Text style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>
                  {language === 'en' ? 'Register crop plot details' : 'Datos reales de tu cultivo de papa'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: theme.textMuted, marginBottom: 6 }}>
                  {language === 'en' ? 'PLOT NAME *' : 'NOMBRE DE PARCELA *'}
                </Text>
                <TextInput
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder={t('nombreParcelaPlaceholder')}
                  placeholderTextColor={theme.textMuted}
                  style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.inputBorder, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: theme.text }}
                />
              </View>

              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: theme.textMuted, marginBottom: 6 }}>
                  {language === 'en' ? 'POTATO VARIETY' : 'VARIEDAD DE PAPA'}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', gap: 6, marginVertical: 4 }}>
                  {VARIEDADES_PAPA.map((v) => (
                    <TouchableOpacity
                      key={v}
                      onPress={() => setVariedad(v)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        borderRadius: 10,
                        backgroundColor: variedad === v ? theme.primary : theme.inputBg,
                        borderWidth: 1,
                        borderColor: variedad === v ? theme.primary : theme.cardBorderSubtle,
                        marginRight: 6,
                      }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: variedad === v ? 'white' : theme.textSecondary }}>
                        {v}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.textMuted, marginBottom: 6 }}>
                    {language === 'en' ? 'HECTARES *' : 'HECTÁREAS *'}
                  </Text>
                  <TextInput
                    value={hectareas}
                    onChangeText={setHectareas}
                    placeholder="2.5"
                    keyboardType="decimal-pad"
                    placeholderTextColor={theme.textMuted}
                    style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.inputBorder, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: theme.text }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.textMuted, marginBottom: 6 }}>
                    {language === 'en' ? 'PLANTING DATE' : 'FECHA SIEMBRA'}
                  </Text>
                  <TextInput
                    value={fechaSiembra}
                    onChangeText={setFechaSiembra}
                    placeholder="Ene 2026"
                    placeholderTextColor={theme.textMuted}
                    style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.inputBorder, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: theme.text }}
                  />
                </View>
              </View>

              <View style={{ marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.textMuted }}>
                    {language === 'en' ? 'LOCATION / GPS' : 'UBICACIÓN / GPS'}
                  </Text>
                  <TouchableOpacity onPress={obtenerUbicacionGPS} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {isLocating ? (
                      <ActivityIndicator size="small" color={theme.primary} />
                    ) : (
                      <>
                        <Ionicons name="navigate-outline" size={12} color={theme.primary} />
                        <Text style={{ fontSize: 11, color: theme.primary, fontWeight: '700', marginLeft: 3 }}>
                          {language === 'en' ? 'Detect GPS' : 'Detectar GPS'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                <TextInput
                  value={ubicacion}
                  onChangeText={setUbicacion}
                  placeholder={t('ubicacionPlaceholder')}
                  placeholderTextColor={theme.textMuted}
                  style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.inputBorder, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: theme.text }}
                />
              </View>
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.cardBorderSubtle }}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.cardBorder, alignItems: 'center' }}>
                <Text style={{ color: theme.textSecondary, fontWeight: '700', fontSize: 13 }}>{t('cancelar')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCrearCultivo}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: theme.primary, alignItems: 'center' }}>
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>{t('guardar')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: VINCULAR PARCELA (TÉCNICO) */}
      <Modal visible={modalVincularVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 10,
                  }}>
                  <Ionicons name="key-outline" size={18} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                </View>
                <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text }}>
                  {language === 'en' ? 'Link Plot by Code' : 'Vincular parcela por código'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVincularVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={22} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 18, lineHeight: 18 }}>
              {language === 'en'
                ? 'Enter the 6-character access code provided by the potato farmer to monitor this specific plot.'
                : 'Ingresa el código único de 6 caracteres de la parcela del agricultor para agregarla a tu vigilancia fitosanitaria.'}
            </Text>
            <TextInput
              value={codigoVincularInput}
              onChangeText={setCodigoVincularInput}
              placeholder="A7B9X2"
              autoCapitalize="characters"
              maxLength={6}
              placeholderTextColor={theme.textMuted}
              style={{
                backgroundColor: theme.inputBg,
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 24,
                fontWeight: '800',
                textAlign: 'center',
                letterSpacing: 8,
                color: isDarkMode ? '#60A5FA' : '#2563EB',
                marginBottom: 20,
                borderWidth: 1,
                borderColor: theme.inputBorder,
              }}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => setModalVincularVisible(false)}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: theme.cardBorder, alignItems: 'center' }}>
                <Text style={{ color: theme.textSecondary, fontWeight: '700', fontSize: 13 }}>{t('cancelar')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleVincularParcela}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: isDarkMode ? '#2563EB' : '#1D4ED8', alignItems: 'center' }}>
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>
                  {language === 'en' ? 'Link Plot' : 'Vincular parcela'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
