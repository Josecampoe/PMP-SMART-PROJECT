import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, FlashMode, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
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

  return (
    <View className="flex-1 bg-black">
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
        <View className="absolute z-50 w-full h-full bg-black/60 items-center justify-center">
          <ActivityIndicator size="large" color="#43A047" />
          <Text className="text-white mt-4 font-bold text-base">Procesando imagen...</Text>
        </View>
      )}

      <SafeAreaView className="absolute w-full h-full justify-between" pointerEvents="box-none">
          {/* Barra superior */}
          <View className="bg-black/40 px-4 py-3 flex-row justify-between items-center backdrop-blur-md">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center bg-black/30 px-3 py-1.5 rounded-full">
              <FontAwesome name="arrow-left" size={14} color="white" />
              <Text className="text-white text-xs ml-2 font-medium">Volver</Text>
            </TouchableOpacity>

            <Text className="text-white text-base font-bold tracking-wider">ANALIZAR PLANTA</Text>

            <TouchableOpacity
              onPress={toggleFlash}
              className={`w-9 h-9 rounded-full items-center justify-center ${
                flash !== 'off' ? 'bg-[#F9A825]' : 'bg-black/40 border border-white/20'
              }`}>
              <FontAwesome
                name="bolt"
                size={16}
                color={flash !== 'off' ? '#000' : 'white'}
              />
            </TouchableOpacity>
          </View>

          {/* Área central con retícula */}
          <View className="items-center justify-center flex-1 px-8">
            <View className="bg-black/60 px-4 py-2 rounded-full mb-6 border border-white/10">
              <Text className="text-white text-xs text-center">
                💡 Enfoca hojas apicales y brotes con buena iluminación
              </Text>
            </View>

            <View className="w-64 h-64 border-2 border-dashed border-[#43A047]/70 rounded-2xl relative items-center justify-center">
              <View className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#43A047] rounded-tl-lg" />
              <View className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#43A047] rounded-tr-lg" />
              <View className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#43A047] rounded-bl-lg" />
              <View className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#43A047] rounded-br-lg" />

              {flash !== 'off' && (
                <View className="absolute top-3 right-3 bg-black/60 px-2 py-0.5 rounded-md">
                  <Text className="text-xs text-[#F9A825] font-bold">
                    Flash: {flash.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Controles inferiores */}
          <View className="bg-black/75 pt-4 pb-8 px-6 rounded-t-3xl border-t border-white/10 items-center">
            {/* Selector de cultivo */}
            <TouchableOpacity
              onPress={() => setSelectorVisible(true)}
              className="bg-white/15 active:bg-white/25 rounded-full px-4 py-2 mb-6 flex-row items-center border border-white/20">
              <FontAwesome name="map-marker" size={13} color="#81C784" />
              <Text className="text-white text-xs font-semibold ml-2">
                {currentCultivo.nombre} ({currentCultivo.variedad})
              </Text>
              <FontAwesome name="chevron-down" size={11} color="#D1D5DB" className="ml-2.5" />
            </TouchableOpacity>

            {/* Fila de disparadores */}
            <View className="flex-row items-center justify-around w-full max-w-xs">
              <TouchableOpacity
                onPress={pickImageFromGallery}
                className="w-12 h-12 rounded-full bg-white/15 items-center justify-center border border-white/20 active:scale-90"
                accessibilityLabel="Abrir galería">
                <FontAwesome name="image" size={18} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={takePicture}
                disabled={isCapturing || !isCameraReady}
                className={`w-20 h-20 rounded-full border-4 border-white items-center justify-center shadow-lg active:scale-95 ${
                  isCapturing || !isCameraReady ? 'bg-white/10 opacity-50' : 'bg-white/20'
                }`}>
                <View className="w-16 h-16 rounded-full bg-white shadow-md" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={toggleFacing}
                className="w-12 h-12 rounded-full bg-white/15 items-center justify-center border border-white/20 active:scale-90"
                accessibilityLabel="Cambiar cámara">
                <FontAwesome name="refresh" size={18} color="white" />
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
