import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useApp, Cultivo } from '../../context/AppContext';
import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  Field,
  IconButton,
  IconTile,
  ScreenHeader,
  SectionTitle,
  Sheet,
  StatTile,
  type Tone,
} from '../../components/ui';

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

  const getBadgeEstado = (estado: Cultivo['estadoFitosanitario']): { text: string; tone: Tone } => {
    switch (estado) {
      case 'alerta':
        return { text: t('estadoAlerta'), tone: 'warning' };
      case 'observacion':
        return { text: t('estadoRevision'), tone: 'info' };
      case 'optimo':
      default:
        return { text: t('estadoOptimo'), tone: 'success' };
    }
  };

  const totalHectareas = cultivos.reduce((acc, c) => acc + (c.hectareas || 0), 0);
  const cultivosEnAlerta = cultivos.filter((c) => c.estadoFitosanitario === 'alerta').length;
  const cultivosOptimos = cultivos.filter((c) => c.estadoFitosanitario === 'optimo').length;

  const esTecnico = rolActivo === 'tecnico';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader
        title={esTecnico ? (language === 'en' ? 'Surveillance' : 'Vigilancia') : (language === 'en' ? 'My plots' : 'Mis parcelas')}
        subtitle={t('cultivosSubtitulo')}
        right={
          esTecnico ? (
            <IconButton icon="key-outline" filled onPress={() => setModalVincularVisible(true)} accessibilityLabel={language === 'en' ? 'Link plot' : 'Vincular parcela'} size={44} />
          ) : (
            <IconButton icon="add" filled onPress={() => setModalVisible(true)} accessibilityLabel={t('nuevaParcela')} size={44} />
          )
        }
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Resumen */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
          <StatTile value={totalHectareas.toFixed(1)} label={language === 'en' ? 'Hectares' : 'Hectáreas'} icon="resize-outline" tone="neutral" />
          <StatTile value={cultivosEnAlerta} label={language === 'en' ? 'Alerts' : 'Alertas'} icon="warning-outline" tone="warning" />
          <StatTile value={cultivosOptimos} label={language === 'en' ? 'Healthy' : 'Sanas'} icon="checkmark-circle-outline" tone="primary" />
        </View>

        <SectionTitle title={language === 'en' ? `Registered plots · ${cultivos.length}` : `Parcelas registradas · ${cultivos.length}`} />

        {cultivos.length === 0 ? (
          <EmptyState
            icon={esTecnico ? 'shield-checkmark-outline' : 'leaf-outline'}
            title={esTecnico ? (language === 'en' ? 'No plots under surveillance' : 'Sin parcelas bajo vigilancia') : t('sinCultivos')}
            description={
              esTecnico
                ? language === 'en'
                  ? 'Enter a plot code provided by a farmer to monitor and audit their potato field.'
                  : 'Ingresa el código único de la parcela del agricultor para comenzar su vigilancia agronómica.'
                : language === 'en'
                ? 'Add your potato field plots to keep track of phytosanitary scans.'
                : 'Añade tu primera parcela para empezar a llevar el control fitosanitario con la cámara.'
            }
            action={
              esTecnico ? (
                <Button label={language === 'en' ? 'Enter plot code' : 'Ingresar código de parcela'} icon="key-outline" onPress={() => setModalVincularVisible(true)} />
              ) : (
                <Button label={t('agregarParcelaBtn')} icon="add" onPress={() => setModalVisible(true)} />
              )
            }
          />
        ) : (
          cultivos.map((cultivo) => {
            const badge = getBadgeEstado(cultivo.estadoFitosanitario);
            const analisisDeEsteLote = analisisHistorial.filter(
              (a) => a.cultivoId === cultivo.id || a.cultivoNombre === cultivo.nombre
            );
            return (
              <Card key={cultivo.id} style={{ marginBottom: 14 }} padding={0}>
                {/* Encabezado de la tarjeta */}
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 12 }}>
                  <IconTile icon="leaf" tone={badge.tone} size={44} />
                  <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
                    <Text style={{ fontSize: 17, fontWeight: '700', color: theme.text, letterSpacing: -0.2 }} numberOfLines={1}>
                      {cultivo.nombre}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                      <Ionicons name="location-outline" size={13} color={theme.textMuted} />
                      <Text style={{ fontSize: 13, color: theme.textMuted, marginLeft: 3, flexShrink: 1 }} numberOfLines={1}>
                        {cultivo.ubicacion}
                      </Text>
                    </View>
                  </View>
                  <Badge label={badge.text} tone={badge.tone} dot />
                </View>

                {/* Datos */}
                <View style={{ flexDirection: 'row', marginHorizontal: 16, backgroundColor: theme.surfaceAlt, borderRadius: 14, paddingVertical: 12 }}>
                  {[
                    { label: language === 'en' ? 'Variety' : 'Variedad', value: (cultivo.variedad || '').replace(/^Papa\s+/i, '') },
                    { label: language === 'en' ? 'Area' : 'Área', value: `${cultivo.hectareas} ${t('ha')}` },
                    { label: language === 'en' ? 'Scans' : 'Escaneos', value: String(analisisDeEsteLote.length) },
                  ].map((d, i) => (
                    <View key={d.label} style={{ flex: i === 0 ? 1.6 : 1, paddingHorizontal: 12, borderLeftWidth: i > 0 ? 1 : 0, borderLeftColor: theme.cardBorder }}>
                      <Text style={{ fontSize: 12, color: theme.textMuted }}>{d.label}</Text>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text, marginTop: 2 }} numberOfLines={1}>
                        {d.value}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Código de acceso */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginHorizontal: 16,
                    marginTop: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderStyle: 'dashed',
                    borderColor: theme.primaryLightBorder,
                  }}>
                  <View>
                    <Text style={{ fontSize: 12, color: theme.textMuted }}>
                      {esTecnico ? (language === 'en' ? 'Monitored code' : 'Código auditado') : (language === 'en' ? 'Access code' : 'Código de acceso')}
                    </Text>
                    <Text style={{ fontSize: 17, fontWeight: '800', color: theme.primary, letterSpacing: 2.5, marginTop: 1 }}>
                      {cultivo.codigoAcceso || '---'}
                    </Text>
                  </View>
                  {esTecnico ? (
                    <Button label={language === 'en' ? 'Unlink' : 'Desvincular'} variant="dangerSoft" size="sm" icon="close-circle-outline" onPress={() => handleDesvincular(cultivo)} />
                  ) : (
                    <Button label={language === 'en' ? 'Share' : 'Compartir'} variant="soft" size="sm" icon="share-social-outline" onPress={() => handleCompartirParcela(cultivo)} />
                  )}
                </View>

                {/* Pie */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                    <Ionicons name="calendar-outline" size={14} color={theme.textMuted} />
                    <Text style={{ fontSize: 13, color: theme.textMuted, marginLeft: 5 }} numberOfLines={1}>
                      {language === 'en' ? 'Planted ' : 'Siembra '}
                      <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>{cultivo.fechaSiembra}</Text>
                    </Text>
                  </View>

                  {esTecnico ? (
                    <Button label={language === 'en' ? 'Diagnoses' : 'Diagnósticos'} size="sm" icon="time-outline" onPress={() => router.push('/(tabs)/historial')} />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <IconButton icon="trash-outline" tone="danger" size={36} onPress={() => handleEliminarCultivo(cultivo)} accessibilityLabel={t('eliminarParcela')} />
                      <Button label={t('escanear')} size="sm" icon="camera-outline" onPress={() => iniciarEscaneoCultivo(cultivo.id)} />
                    </View>
                  )}
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Registrar nueva parcela */}
      <Sheet
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={t('nuevaParcela')}
        subtitle={language === 'en' ? 'Register crop plot details' : 'Datos reales de tu cultivo de papa'}
        icon="leaf-outline"
        footer={
          <>
            <Button label={t('cancelar')} variant="secondary" onPress={() => setModalVisible(false)} flex />
            <Button label={t('guardar')} onPress={handleCrearCultivo} flex />
          </>
        }>
        <Field
          label={language === 'en' ? 'Plot name' : 'Nombre de la parcela'}
          required
          value={nombre}
          onChangeText={setNombre}
          placeholder={t('nombreParcelaPlaceholder')}
        />

        <Text style={{ fontSize: 13, fontWeight: '600', color: theme.textSecondary, marginBottom: 8 }}>
          {language === 'en' ? 'Potato variety' : 'Variedad de papa'}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16, marginHorizontal: -20 }}
          contentContainerStyle={{ paddingHorizontal: 20 }}>
          {VARIEDADES_PAPA.map((v) => (
            <Chip key={v} label={v.replace(/^Papa\s+/i, '')} selected={variedad === v} onPress={() => setVariedad(v)} />
          ))}
        </ScrollView>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Field
            style={{ flex: 1 }}
            label={language === 'en' ? 'Hectares' : 'Hectáreas'}
            required
            value={hectareas}
            onChangeText={setHectareas}
            placeholder="2.5"
            keyboardType="decimal-pad"
          />
          <Field
            style={{ flex: 1 }}
            label={language === 'en' ? 'Planting date' : 'Fecha de siembra'}
            value={fechaSiembra}
            onChangeText={setFechaSiembra}
            placeholder="Ene 2026"
          />
        </View>

        <Field
          label={language === 'en' ? 'Location' : 'Ubicación'}
          icon="location-outline"
          value={ubicacion}
          onChangeText={setUbicacion}
          placeholder={t('ubicacionPlaceholder')}
          right={
            <TouchableOpacity
              onPress={obtenerUbicacionGPS}
              disabled={isLocating}
              style={{ flexDirection: 'row', alignItems: 'center' }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              {isLocating ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <>
                  <Ionicons name="navigate" size={13} color={theme.primary} />
                  <Text style={{ fontSize: 13, color: theme.primary, fontWeight: '700', marginLeft: 4 }}>
                    {language === 'en' ? 'Use GPS' : 'Usar GPS'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          }
        />
      </Sheet>

      {/* Vincular parcela (técnico) */}
      <Sheet
        visible={modalVincularVisible}
        onClose={() => setModalVincularVisible(false)}
        title={language === 'en' ? 'Link plot' : 'Vincular parcela'}
        subtitle={language === 'en' ? 'Use the code shared by the farmer' : 'Usa el código que te compartió el agricultor'}
        icon="key-outline"
        footer={
          <>
            <Button label={t('cancelar')} variant="secondary" onPress={() => setModalVincularVisible(false)} flex />
            <Button label={language === 'en' ? 'Link plot' : 'Vincular'} onPress={handleVincularParcela} flex />
          </>
        }>
        <Text style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 16, lineHeight: 20 }}>
          {language === 'en'
            ? 'Enter the 6-character access code provided by the potato farmer to monitor this specific plot.'
            : 'Ingresa el código único de 6 caracteres de la parcela del agricultor para agregarla a tu vigilancia fitosanitaria.'}
        </Text>
        <Field
          value={codigoVincularInput}
          onChangeText={setCodigoVincularInput}
          placeholder="A7B9X2"
          autoCapitalize="characters"
          maxLength={6}
          inputStyle={{ fontSize: 26, fontWeight: '800', textAlign: 'center', letterSpacing: 8, paddingVertical: 14, color: theme.primary }}
        />
      </Sheet>
    </SafeAreaView>
  );
}
