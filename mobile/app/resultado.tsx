import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { analisisApi } from '../lib/api';
import { Button, Card, IconButton, IconTile } from '../components/ui';

export default function ResultadoScreen() {
  const router = useRouter();
  const { cultivoId, cultivoNombre } = useLocalSearchParams<{
    cultivoId?: string;
    cultivoNombre?: string;
  }>();

  const { addAnalisis, cultivos, currentImageB64, theme, isDarkMode, language, t } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const insets = useSafeAreaInsets();

  const displayImageUri = currentImageB64
    ? `data:image/jpeg;base64,${currentImageB64}`
    : 'https://images.unsplash.com/photo-1555431189-0ab279e2be3a';

  const targetCultivo =
    cultivos.find((c) => c.id === cultivoId) ||
    cultivos[0] || { id: 'lote-general', nombre: cultivoNombre || (language === 'en' ? 'Field Sample' : 'Muestra de Campo') };

  const finalCultivoNombre = cultivoNombre || targetCultivo.nombre;
  const finalCultivoId = cultivoId || targetCultivo.id;

  const [isProcessing, setIsProcessing] = useState(true);
  const [aiData, setAiData] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const resultFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    const procesarIA = async () => {
      try {
        const res = await analisisApi.procesar(displayImageUri, language);
        if (res.success && res.data) {
          setAiData(res.data);
        } else {
          setApiError(res.error || (language === 'en' ? 'AI could not process the image.' : 'La IA no pudo procesar la imagen.'));
        }
      } catch (err) {
        setApiError(language === 'en' ? 'AI connection issue.' : 'Problema de conexión con la IA.');
      } finally {
        setIsProcessing(false);
        Animated.timing(resultFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      }
    };
    procesarIA();
  }, []);

  const sintomasDetectados = aiData?.sintomas || (language === 'en' ? [
    'Purple or reddish discoloration on apical leaves',
    'Upward rolling and thickening of leaflets',
    'Shortened internodes and slight stem node swelling',
  ] : [
    'Coloración rojiza/púrpura en foliolos apicales superiores',
    'Foliolos con enrollamiento hacia el haz (formación en cuchara)',
    'Acortamiento de entrenudos y engrosamiento leve en nudos',
  ]);

  const recomendacionesAgro = aiData?.recomendaciones || (language === 'en' ? [
    'Install perimeter yellow sticky traps to capture the psyllid vector.',
    'Isolate and inspect adjacent plants within a 5 to 10 meter radius.',
    'Do not use tubers from suspicious lots as seed for future cycles.',
    'Request technical consultation with an agronomist for pest control.',
  ] : [
    'Instalar trampas cromáticas amarillas perimetrales para capturar el psílido vector.',
    'Aislar e inspeccionar las plantas adyacentes en un radio de 5 a 10 metros.',
    'No emplear tubérculos de lotes sospechosos como semilla para futuros ciclos.',
    'Solicitar dictamen técnico a un agrónomo para formular plan de control fitosanitario.',
  ]);

  const diagnosticoTexto = aiData?.diagnostico || (language === 'en' ? 'POSSIBLE PMP' : 'POSIBLE PMP');
  const confianzaNum = aiData?.confianza || 92;
  const estadoVisual = aiData?.estado || 'alerta';

  const handleGuardar = (solicitarRevision: boolean) => {
    try {
      setIsSaving(true);
      addAnalisis({
        cultivoId: finalCultivoId,
        cultivoNombre: finalCultivoNombre,
        imageUri: displayImageUri,
        diagnostico: diagnosticoTexto,
        estado: estadoVisual,
        severidad: aiData?.severidad || 'moderada',
        confianza: confianzaNum,
        sintomas: sintomasDetectados,
        recomendaciones: recomendacionesAgro,
        estadoRevision: solicitarRevision ? 'pendiente' : 'sin_solicitar',
        notas: language === 'en' ? `Phytosanitary inspection at ${finalCultivoNombre}.` : `Análisis fitosanitario en ${finalCultivoNombre}.`,
      });

      Alert.alert(
        solicitarRevision
          ? (language === 'en' ? 'Sent for Review' : 'Enviado a revisión')
          : (language === 'en' ? 'Saved' : 'Guardado'),
        solicitarRevision
          ? (language === 'en' ? 'Scan was submitted to agronomist for formal verdict.' : 'El análisis fue enviado al técnico agrónomo para su dictamen.')
          : (language === 'en' ? 'Diagnosis saved to your history.' : 'El diagnóstico quedó registrado en tu historial.'),
        [{ text: language === 'en' ? 'View History' : 'Ver historial', onPress: () => router.push('/(tabs)/historial') }]
      );
    } catch (error) {
      Alert.alert('Error', language === 'en' ? 'Could not save analysis.' : 'No se pudo guardar el análisis.');
    } finally {
      setIsSaving(false);
    }
  };

  const isAlerta = estadoVisual === 'alerta';

  const bloqueado = isSaving || isProcessing || !!apiError;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Encabezado */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' }}>
        <IconButton icon="chevron-back" onPress={() => router.back()} accessibilityLabel={language === 'en' ? 'Back' : 'Volver'} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: theme.text }}>{t('resultadoTitulo')}</Text>
          <Text style={{ fontSize: 12, color: theme.textMuted }} numberOfLines={1}>
            {finalCultivoNombre}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Image */}
          <View
            style={{
              height: 210,
              borderRadius: 20,
              overflow: 'hidden',
              marginBottom: 16,
              backgroundColor: theme.cardBorder,
              borderWidth: 1,
              borderColor: theme.cardBorder,
            }}>
            <Image
              source={{ uri: displayImageUri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            <View
              style={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                backgroundColor: 'rgba(0,0,0,0.65)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 10,
              }}>
              <Text style={{ fontSize: 12, color: 'white', fontWeight: '600' }}>
                {finalCultivoNombre}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Loading / Error / Result */}
        <Animated.View style={{ opacity: isProcessing ? fadeAnim : resultFade }}>
          {isProcessing ? (
            <View
              style={{
                backgroundColor: theme.card,
                borderRadius: 20,
                padding: 32,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.cardBorder,
                marginBottom: 16,
              }}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={{ fontSize: 15, fontWeight: '700', color: theme.primary, marginTop: 16 }}>
                {t('analizando')}
              </Text>
              <Text style={{ fontSize: 12, color: theme.textMuted, marginTop: 4, textAlign: 'center' }}>
                {t('analizandoDesc')}
              </Text>
            </View>
          ) : apiError ? (
            <View
              style={{
                backgroundColor: theme.dangerBg,
                borderRadius: 20,
                padding: 24,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(239, 68, 68, 0.3)',
                marginBottom: 16,
              }}>
              <Ionicons name="warning" size={32} color={theme.danger} style={{ marginBottom: 10 }} />
              <Text style={{ fontSize: 15, fontWeight: '800', color: theme.danger, marginBottom: 6 }}>
                {language === 'en' ? 'Analysis Error' : 'Error en el análisis'}
              </Text>
              <Text style={{ fontSize: 12, color: theme.text, textAlign: 'center', lineHeight: 18 }}>
                {apiError}
              </Text>
            </View>
          ) : (
            <>
              {/* Diagnosis Card */}
              <View
                style={{
                  backgroundColor: isAlerta ? theme.warningBg : theme.primaryLight,
                  borderRadius: 20,
                  padding: 22,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: isAlerta ? 'rgba(245, 158, 11, 0.4)' : theme.primaryLightBorder,
                  marginBottom: 16,
                }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: isAlerta ? theme.warning : theme.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}>
                  <Ionicons
                    name={isAlerta ? 'alert' : 'checkmark'}
                    size={24}
                    color="white"
                  />
                </View>
                <Text
                  style={{
                    fontSize: 19,
                    fontWeight: '800',
                    color: isAlerta ? theme.warning : theme.primary,
                    marginBottom: 6,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}>
                  {diagnosticoTexto}
                </Text>
                <View
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)',
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                    borderRadius: 20,
                    marginBottom: 12,
                  }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text }}>
                    {confianzaNum}% {language === 'en' ? 'confidence' : 'coincidencia'}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: theme.textSecondary, textAlign: 'center', lineHeight: 18 }}>
                  {isAlerta
                    ? (language === 'en'
                        ? 'Visual patterns consistent with Potato Purple Top / Zebra Chip detected. Request agronomist review to confirm.'
                        : 'Se detectaron patrones compatibles con Punta Morada. Solicita una revisión técnica para confirmar.')
                    : (language === 'en'
                        ? 'No Potato Purple Top patterns identified. Maintain periodic scouting.'
                        : 'No se detectaron patrones de Punta Morada. Mantén el monitoreo periódico.')}
                </Text>
              </View>

              {/* Symptoms */}
              <View
                style={{
                  backgroundColor: theme.card,
                  borderRadius: 20,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: theme.cardBorder,
                  marginBottom: 14,
                }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
                  {t('sintomasDetectados')}
                </Text>
                {sintomasDetectados.map((sintoma: string, idx: number) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: isAlerta ? theme.warning : theme.primary,
                        marginTop: 6,
                        marginRight: 10,
                      }}
                    />
                    <Text style={{ fontSize: 13, color: theme.text, flex: 1, lineHeight: 18 }}>{sintoma}</Text>
                  </View>
                ))}
              </View>

              {/* Recommendations */}
              <View
                style={{
                  backgroundColor: theme.card,
                  borderRadius: 20,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: theme.cardBorder,
                  marginBottom: 16,
                }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
                  {t('recomendacionesAgro')}
                </Text>
                {recomendacionesAgro.map((rec: string, idx: number) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: theme.primary, marginRight: 8, width: 18 }}>
                      {idx + 1}.
                    </Text>
                    <Text style={{ fontSize: 13, color: theme.text, flex: 1, lineHeight: 18 }}>{rec}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </Animated.View>
      </ScrollView>

      {/* Acciones */}
      <View
        style={{
          backgroundColor: theme.card,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 14),
          borderTopWidth: 1,
          borderTopColor: theme.cardBorder,
          gap: 10,
        }}>
        <Button
          label={isSaving ? (language === 'en' ? 'Saving...' : 'Guardando...') : t('guardarYSolicitar')}
          icon="paper-plane-outline"
          onPress={() => handleGuardar(true)}
          disabled={bloqueado}
          size="lg"
        />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button label={t('guardarAnalisis')} icon="bookmark-outline" variant="secondary" onPress={() => handleGuardar(false)} disabled={bloqueado} flex />
          <Button label={t('repetirFoto')} icon="camera-reverse-outline" variant="ghost" onPress={() => router.back()} disabled={isSaving || isProcessing} flex />
        </View>
      </View>
    </SafeAreaView>
  );
}
