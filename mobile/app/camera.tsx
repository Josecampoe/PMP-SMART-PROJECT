import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, FlashMode, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useApp } from '../context/AppContext';
import { Button, Field, IconButton, IconTile, Sheet } from '../components/ui';

export default function CameraScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ cultivoId?: string }>();
  const cameraRef = useRef<CameraView>(null);

  const { cultivos, selectedCultivoId, setSelectedCultivoId, addCultivo, setCurrentImageB64, theme, language, t } = useApp();

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => {
        // Retrasamos el desmontaje para evitar el pantallazo negro durante la transición
        setTimeout(() => setIsFocused(false), 500);
      };
    }, [])
  );

  // Modal para crear parcela rápida si no tiene
  const [modalNuevoLote, setModalNuevoLote] = useState(false);
  const [nuevoLoteNombre, setNuevoLoteNombre] = useState('');
  const [nuevoLoteVariedad, setNuevoLoteVariedad] = useState('Papa Pastusa Suprema');
  const [nuevoLoteHectareas, setNuevoLoteHectareas] = useState('1.0');

  useEffect(() => {
    if (params.cultivoId) {
      setSelectedCultivoId(params.cultivoId);
    }
  }, [params.cultivoId]);

  const currentCultivo =
    cultivos.find((c) => c.id === selectedCultivoId) ||
    cultivos[0] || {
      id: 'lote-general',
      nombre: 'Muestra General de Campo',
      variedad: 'Papa Comercial',
    };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
        base64: true,
      });

      if (!result.canceled && result.assets?.[0]?.base64) {
        setCurrentImageB64(result.assets[0].base64);

        router.push({
          pathname: '/resultado',
          params: {
            cultivoId: currentCultivo.id,
            cultivoNombre: currentCultivo.nombre,
          },
        });
      }
    } catch (error) {
      console.error('Error al abrir galería:', error);
      Alert.alert('Error', 'No se pudo abrir la galería de imágenes.');
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing || !isCameraReady) return;

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.75, // Previene OOM al no solicitar máxima resolución
        base64: true, // Previene saturación del bridge nativo
      });

      if (photo?.base64) {
        // Restaurar la vista previa
        if (cameraRef.current.resumePreview) {
          await cameraRef.current.resumePreview();
        }

        setCurrentImageB64(photo.base64);

        router.push({
          pathname: '/resultado',
          params: {
            cultivoId: currentCultivo.id,
            cultivoNombre: currentCultivo.nombre,
          },
        });
      }
    } catch (error) {
      console.error('Error al capturar foto:', error);
      Alert.alert('Error', 'No se pudo capturar la foto. Intenta de nuevo.');
      if (cameraRef.current?.resumePreview) {
        await cameraRef.current.resumePreview();
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const toggleFlash = () => {
    setFlash((current) => {
      if (current === 'off') return 'on';
      if (current === 'on') return 'auto';
      return 'off';
    });
  };

  const toggleFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const handleCrearLoteRapido = () => {
    if (!nuevoLoteNombre.trim()) {
      Alert.alert('Campo requerido', 'Ingresa el nombre del lote.');
      return;
    }
    const ha = parseFloat(nuevoLoteHectareas.replace(',', '.')) || 1.0;
    const nuevo = addCultivo({
      nombre: nuevoLoteNombre.trim(),
      variedad: nuevoLoteVariedad,
      hectareas: Number(ha.toFixed(1)),
      ubicacion: 'Zona Rural',
      fechaSiembra: 'Reciente',
      estadoFitosanitario: 'optimo',
    });

    setSelectedCultivoId(nuevo.id);
    setNuevoLoteNombre('');
    setModalNuevoLote(false);
    setSelectorVisible(false);
  };

  const flashIcon = flash === 'on' ? 'flash' : flash === 'auto' ? 'flash-outline' : 'flash-off-outline';
  const RETICLE = '#A5CF5F';

  if (!permission) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={RETICLE} />
        <Text style={{ color: '#FFFFFF', fontSize: 14, marginTop: 12 }}>
          {language === 'en' ? 'Starting camera...' : 'Iniciando cámara...'}
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg, paddingHorizontal: 24, paddingVertical: 12 }}>
        <IconButton icon="chevron-back" onPress={() => router.back()} accessibilityLabel={language === 'en' ? 'Back' : 'Volver'} />

        <View style={{ flex: 1, justifyContent: 'center' }}>
          <IconTile icon="camera-outline" size={72} />
          <Text style={{ fontSize: 26, fontWeight: '800', color: theme.text, marginTop: 24, letterSpacing: -0.5 }}>
            {language === 'en' ? 'Camera access' : 'Acceso a la cámara'}
          </Text>
          <Text style={{ fontSize: 15, color: theme.textSecondary, lineHeight: 22, marginTop: 8, marginBottom: 28 }}>
            {language === 'en'
              ? 'To photograph your potato leaves and detect Purple Top symptoms, we need permission to use the camera.'
              : 'Para fotografiar las hojas de tus cultivos de papa y detectar síntomas de Punta Morada, necesitamos permiso para usar la cámara.'}
          </Text>
          <Button label={language === 'en' ? 'Allow camera' : 'Permitir cámara'} icon="camera" size="lg" onPress={requestPermission} />
          <Button
            label={language === 'en' ? 'Choose from gallery' : 'Elegir de la galería'}
            icon="images-outline"
            variant="secondary"
            onPress={pickImageFromGallery}
            style={{ marginTop: 10 }}
          />
        </View>

        <Text style={{ fontSize: 12, color: theme.textMuted, textAlign: 'center', lineHeight: 18 }}>
          {language === 'en'
            ? 'Your photos are only used for the phytosanitary diagnosis of your plots.'
            : 'Tus fotografías solo se usan para el diagnóstico fitosanitario de tus parcelas.'}
        </Text>
      </SafeAreaView>
    );
  }

  const glass = { backgroundColor: 'rgba(0,0,0,0.45)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' };
  const corner = { position: 'absolute' as const, width: 28, height: 28, borderColor: RETICLE };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar style="light" />
      {isFocused && (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          flash={flash}
          onCameraReady={() => setIsCameraReady(true)}
        />
      )}

      {isCapturing && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 50, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color={RETICLE} />
          <Text style={{ color: '#FFFFFF', marginTop: 14, fontWeight: '700', fontSize: 15 }}>
            {language === 'en' ? 'Processing image...' : 'Procesando imagen...'}
          </Text>
        </View>
      )}

      <SafeAreaView style={[StyleSheet.absoluteFill, { justifyContent: 'space-between' }]} pointerEvents="box-none">
        {/* Barra superior */}
        <View style={{ paddingHorizontal: 16, paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityLabel={language === 'en' ? 'Back' : 'Volver'}
            style={[glass, { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' }]}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>{t('camaraTitulo')}</Text>

          <TouchableOpacity
            onPress={toggleFlash}
            accessibilityLabel="Flash"
            style={[
              glass,
              { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
              flash !== 'off' ? { backgroundColor: '#F0B64A', borderColor: '#F0B64A' } : null,
            ]}>
            <Ionicons name={flashIcon} size={19} color={flash !== 'off' ? '#1F1400' : '#FFFFFF'} />
            {flash === 'auto' && (
              <Text style={{ position: 'absolute', bottom: 4, right: 7, fontSize: 8, fontWeight: '900', color: '#1F1400' }}>A</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Retícula */}
        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, paddingHorizontal: 32 }} pointerEvents="none">
          <View style={{ width: 260, height: 260 }}>
            <View style={[corner, { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 18 }]} />
            <View style={[corner, { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 18 }]} />
            <View style={[corner, { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 18 }]} />
            <View style={[corner, { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 18 }]} />
          </View>
          <View style={[glass, { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginTop: 20 }]}>
            <Ionicons name="sunny-outline" size={14} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 13, marginLeft: 6 }}>
              {language === 'en' ? 'Focus on top leaves in good light' : 'Enfoca hojas superiores con buena luz'}
            </Text>
          </View>
        </View>

        {/* Controles inferiores */}
        <View style={{ paddingBottom: 20, paddingHorizontal: 24, alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => setSelectorVisible(true)}
            activeOpacity={0.8}
            style={[glass, { flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9, marginBottom: 22, maxWidth: '100%' }]}>
            <Ionicons name="leaf" size={14} color={RETICLE} />
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginLeft: 7, flexShrink: 1 }} numberOfLines={1}>
              {currentCultivo.nombre}
            </Text>
            <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.7)" style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 300 }}>
            <TouchableOpacity
              onPress={pickImageFromGallery}
              accessibilityLabel={language === 'en' ? 'Open gallery' : 'Abrir galería'}
              style={[glass, { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="images-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={takePicture}
              disabled={isCapturing || !isCameraReady}
              activeOpacity={0.85}
              accessibilityLabel={t('tomarFoto')}
              style={{
                width: 82,
                height: 82,
                borderRadius: 41,
                borderWidth: 4,
                borderColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isCapturing || !isCameraReady ? 0.5 : 1,
              }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFFFFF' }} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleFacing}
              accessibilityLabel={t('cambiarCamara')}
              style={[glass, { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="camera-reverse-outline" size={23} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Seleccionar parcela */}
      <Sheet
        visible={selectorVisible && !modalNuevoLote}
        onClose={() => setSelectorVisible(false)}
        title={language === 'en' ? 'Select plot' : 'Selecciona tu parcela'}
        subtitle={language === 'en' ? 'The analysis will be saved to this plot' : 'El análisis se guardará en esta parcela'}
        footer={<Button label={language === 'en' ? 'Register new plot' : 'Registrar nueva parcela'} icon="add" variant="secondary" onPress={() => setModalNuevoLote(true)} flex />}>
        {cultivos.length === 0 ? (
          <View style={{ padding: 16, backgroundColor: theme.surfaceAlt, borderRadius: 14 }}>
            <Text style={{ fontSize: 14, color: theme.textSecondary, textAlign: 'center', lineHeight: 20 }}>
              {language === 'en'
                ? 'You have no plots yet. You can scan as a "General Sample" or register your first plot.'
                : 'Aún no tienes parcelas registradas. Puedes escanear como "Muestra General" o registrar tu primer lote.'}
            </Text>
          </View>
        ) : (
          cultivos.map((cultivo) => {
            const isSelected = cultivo.id === currentCultivo.id;
            return (
              <TouchableOpacity
                key={cultivo.id}
                onPress={() => {
                  setSelectedCultivoId(cultivo.id);
                  setSelectorVisible(false);
                }}
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 14,
                  borderRadius: 14,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: isSelected ? theme.primary : theme.cardBorder,
                  backgroundColor: isSelected ? theme.primaryLight : theme.card,
                }}>
                <IconTile icon="leaf" size={36} tone={isSelected ? 'primary' : 'neutral'} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text }}>{cultivo.nombre}</Text>
                  <Text style={{ fontSize: 13, color: theme.textMuted, marginTop: 1 }}>
                    {cultivo.variedad} · {cultivo.hectareas} ha
                  </Text>
                </View>
                <Ionicons name={isSelected ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={isSelected ? theme.primary : theme.cardBorder} />
              </TouchableOpacity>
            );
          })
        )}
      </Sheet>

      {/* Registrar lote rápido */}
      <Sheet
        visible={modalNuevoLote}
        onClose={() => setModalNuevoLote(false)}
        title={language === 'en' ? 'New plot' : 'Nueva parcela'}
        subtitle={language === 'en' ? 'It will be linked to this analysis' : 'Se vinculará a este análisis'}
        icon="leaf-outline"
        footer={
          <>
            <Button label={t('cancelar')} variant="secondary" onPress={() => setModalNuevoLote(false)} flex />
            <Button label={language === 'en' ? 'Save' : 'Guardar'} onPress={handleCrearLoteRapido} flex />
          </>
        }>
        <Field
          label={language === 'en' ? 'Plot name' : 'Nombre del lote'}
          required
          value={nuevoLoteNombre}
          onChangeText={setNuevoLoteNombre}
          placeholder="Ej: Lote El Trapiche"
        />
        <Field
          label={language === 'en' ? 'Potato variety' : 'Variedad de papa'}
          required
          value={nuevoLoteVariedad}
          onChangeText={setNuevoLoteVariedad}
          placeholder="Ej: Pastusa Suprema, Capiro"
        />
      </Sheet>
    </View>
  );
}
