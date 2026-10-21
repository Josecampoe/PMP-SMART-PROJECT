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

  const { addAnalisis, cultivos, currentImageB64, theme, language, t } = useApp();
  const insets = useSafeAreaInsets();
  const [isSaving, setIsSaving] = useState(false);

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

  const diagnosticoTexto = aiData?.diagnostico || (language === 'en' ? 'Possible PMP' : 'Posible PMP');
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
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

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* Foto */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={{ height: 230, borderRadius: 22, overflow: 'hidden', marginBottom: 16, backgroundColor: theme.surfaceAlt }}>
            <Image source={{ uri: displayImageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            {!isProcessing && !apiError && (
              <View
                style={{
                  position: 'absolute',
                  left: 12,
                  bottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 999,
                }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: isAlerta ? '#F0B64A' : '#6DBF71', marginRight: 6 }} />
                <Text style={{ fontSize: 12, color: '#FFFFFF', fontWeight: '600' }}>
                  {confianzaNum}% {language === 'en' ? 'match' : 'coincidencia'}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: isProcessing ? fadeAnim : resultFade }}>
          {isProcessing ? (
            <Card padding={28} style={{ alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text, marginTop: 16, textAlign: 'center' }}>{t('analizando')}</Text>
              <Text style={{ fontSize: 14, color: theme.textMuted, marginTop: 4, textAlign: 'center', lineHeight: 20 }}>{t('analizandoDesc')}</Text>
            </Card>
          ) : apiError ? (
            <View style={{ backgroundColor: theme.dangerBg, borderRadius: 18, padding: 22, alignItems: 'center', borderWidth: 1, borderColor: theme.dangerBorder }}>
              <IconTile icon="cloud-offline-outline" tone="danger" size={48} />
              <Text style={{ fontSize: 16, fontWeight: '800', color: theme.danger, marginTop: 12, marginBottom: 4 }}>
                {language === 'en' ? 'Analysis error' : 'Error en el análisis'}
              </Text>
              <Text style={{ fontSize: 14, color: theme.textSecondary, textAlign: 'center', lineHeight: 20 }}>{apiError}</Text>
            </View>
          ) : (
            <>
              {/* Diagnóstico */}
              <View
                style={{
                  backgroundColor: isAlerta ? theme.warningBg : theme.primaryLight,
                  borderRadius: 20,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: isAlerta ? theme.warningBorder : theme.primaryLightBorder,
                  marginBottom: 16,
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: isAlerta ? theme.warning : theme.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Ionicons name={isAlerta ? 'alert' : 'checkmark'} size={26} color={isAlerta ? '#1F1400' : theme.onPrimary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: isAlerta ? theme.warning : theme.primary }}>
                      {language === 'en' ? 'Result' : 'Resultado'}
                    </Text>
                    <Text style={{ fontSize: 21, fontWeight: '800', color: theme.text, letterSpacing: -0.4 }}>{diagnosticoTexto}</Text>
                  </View>
                </View>

                {/* Barra de confianza */}
                <View style={{ marginTop: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontSize: 13, color: theme.textSecondary }}>{language === 'en' ? 'Confidence' : 'Coincidencia'}</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>{confianzaNum}%</Text>
                  </View>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: theme.card, overflow: 'hidden' }}>
                    <View style={{ width: `${Math.max(0, Math.min(100, confianzaNum))}%`, height: '100%', borderRadius: 3, backgroundColor: isAlerta ? theme.warning : theme.primary }} />
                  </View>
                </View>

                <Text style={{ fontSize: 14, color: theme.textSecondary, lineHeight: 20, marginTop: 14 }}>
                  {isAlerta
                    ? language === 'en'
                      ? 'Visual patterns consistent with Potato Purple Top / Zebra Chip detected. Request agronomist review to confirm.'
                      : 'Se detectaron patrones compatibles con Punta Morada. Solicita una revisión técnica para confirmar.'
                    : language === 'en'
                    ? 'No Potato Purple Top patterns identified. Maintain periodic scouting.'
                    : 'No se detectaron patrones de Punta Morada. Mantén el monitoreo periódico.'}
                </Text>
              </View>

              {/* Síntomas */}
              <Card style={{ marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <IconTile icon="eye-outline" tone={isAlerta ? 'warning' : 'success'} size={32} />
                  <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text, marginLeft: 10 }}>{t('sintomasDetectados')}</Text>
                </View>
                {sintomasDetectados.map((sintoma: string, idx: number) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isAlerta ? theme.warning : theme.primary, marginTop: 7, marginRight: 10 }} />
                    <Text style={{ fontSize: 14, color: theme.textSecondary, flex: 1, lineHeight: 20 }}>{sintoma}</Text>
                  </View>
                ))}
              </Card>

              {/* Recomendaciones */}
              <Card>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <IconTile icon="clipboard-outline" tone="info" size={32} />
                  <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text, marginLeft: 10 }}>{t('recomendacionesAgro')}</Text>
                </View>
                {recomendacionesAgro.map((rec: string, idx: number) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
                    <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: theme.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: theme.primary }}>{idx + 1}</Text>
                    </View>
                    <Text style={{ fontSize: 14, color: theme.textSecondary, flex: 1, lineHeight: 20 }}>{rec}</Text>
                  </View>
                ))}
              </Card>
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
