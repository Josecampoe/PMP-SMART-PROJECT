import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp, Analisis, RevisionTecnica } from '../../context/AppContext';

const OPCIONES_DIAGNOSTICO_TECNICO: RevisionTecnica['diagnosticoValidado'][] = [
  'PMP Confirmado',
  'Sospecha Moderada',
  'Descartado - Sano',
  'Deficiencia Nutricional',
  'Virosis / Otra Afección',
];

export default function Historial() {
  const router = useRouter();
  const {
    rolActivo,
    analisisHistorial,
    deleteAnalisis,
    solicitarRevisionTecnica,
    guardarRevisionTecnica,
    perfilTecnico,
    theme,
    isDarkMode,
    language,
    t,
  } = useApp();

  const [filtro, setFiltro] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [selectedAnalisis, setSelectedAnalisis] = useState<Analisis | null>(null);

  // Estados para el formulario de dictamen técnico
  const [modalDictamenVisible, setModalDictamenVisible] = useState(false);
  const [diagValidado, setDiagValidado] = useState<RevisionTecnica['diagnosticoValidado']>(
    'PMP Confirmado'
  );
  const [observacionesTecnicas, setObservacionesTecnicas] = useState('');
  const [tratamientoSugerido, setTratamientoSugerido] = useState('');

  // Filtrado de análisis
  const itemsFiltrados = (analisisHistorial || []).filter((item) => {
    if (!item) return false;

    let matchFiltro = true;
    if (rolActivo === 'tecnico') {
      if (filtro === 'pendientes') matchFiltro = item.estadoRevision === 'pendiente';
      else if (filtro === 'revisados') matchFiltro = item.estadoRevision === 'revisado';
    } else {
      if (filtro === 'alerta')
        matchFiltro = item.estado === 'alerta' || Boolean(item.diagnostico?.includes('PMP'));
      else if (filtro === 'pendiente') matchFiltro = item.estadoRevision === 'pendiente';
      else if (filtro === 'revisado') matchFiltro = item.estadoRevision === 'revisado';
    }

    const matchBusqueda =
      busqueda.trim() === '' ||
      item.cultivoNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.diagnostico?.toLowerCase().includes(busqueda.toLowerCase()) ||
      (item.sintomas || []).some((s) => s.toLowerCase().includes(busqueda.toLowerCase()));

    return matchFiltro && matchBusqueda;
  });

  const handleEliminar = (id: string) => {
    Alert.alert(
      language === 'en' ? 'Delete Analysis' : 'Eliminar Registro',
      language === 'en' ? 'Are you sure you want to delete this scan record?' : '¿Estás seguro de que deseas eliminar este registro?',
      [
        { text: t('cancelar'), style: 'cancel' },
        {
          text: language === 'en' ? 'Delete' : 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteAnalisis(id);
            if (selectedAnalisis?.id === id) setSelectedAnalisis(null);
            Alert.alert(language === 'en' ? 'Deleted' : 'Eliminado', language === 'en' ? 'Record was removed.' : 'Registro eliminado.');
          },
        },
      ]
    );
  };

  const handleSolicitarRevision = (item: Analisis) => {
    solicitarRevisionTecnica(item.id);
    setSelectedAnalisis({ ...item, estadoRevision: 'pendiente' });
    Alert.alert(
      language === 'en' ? 'Review Requested' : 'Solicitud Enviada',
      language === 'en'
        ? 'Your scan has been sent to the agronomist.'
        : 'Tu solicitud de revisión técnica fue enviada exitosamente.'
    );
  };

  const abrirFormularioDictamen = (analisis: Analisis) => {
    if (analisis.revisionTecnica) {
      setDiagValidado(analisis.revisionTecnica.diagnosticoValidado);
      setObservacionesTecnicas(analisis.revisionTecnica.observaciones || '');
      setTratamientoSugerido(analisis.revisionTecnica.tratamientoRecomendado || '');
    } else {
      setDiagValidado('PMP Confirmado');
      setObservacionesTecnicas('');
      setTratamientoSugerido('');
    }
    setModalDictamenVisible(true);
  };

  const handleGuardarDictamen = () => {
    if (!selectedAnalisis) return;
    if (!observacionesTecnicas.trim()) {
      Alert.alert(language === 'en' ? 'Required field' : 'Campo requerido', language === 'en' ? 'Please enter technical field observations.' : 'Por favor ingresa tus observaciones técnicas de campo.');
      return;
    }

    guardarRevisionTecnica(selectedAnalisis.id, {
      tecnicoNombre: perfilTecnico?.nombre || (language === 'en' ? 'Agronomist Technician' : 'Ing. Agrónomo Fitosanitario'),
      registroProfesional: perfilTecnico?.registroProfesional || 'ICA-COL',
      diagnosticoValidado: diagValidado,
      observaciones: observacionesTecnicas.trim(),
      tratamientoRecomendado:
        tratamientoSugerido.trim() ||
        (language === 'en'
          ? 'Periodic visual scouting and perimeter yellow sticky traps.'
          : 'Seguimiento visual periódico e instalación de trampas amarillas perimetrales.'),
    });

    setModalDictamenVisible(false);
    setSelectedAnalisis(null);
    Alert.alert(
      language === 'en' ? 'Verdict Issued' : 'Dictamen Emitido',
      language === 'en' ? 'Technical report submitted to farmer.' : 'El informe técnico ha sido firmado y notificado al agricultor exitosamente.'
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* 1. ENCABEZADO */}
      <View style={{ backgroundColor: theme.card, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: theme.cardBorder }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: theme.text }}>
              {t('historialTitulo')}
            </Text>
            <Text style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
              {t('historialSubtitulo')}
            </Text>
          </View>
          {rolActivo === 'agricultor' && (
            <TouchableOpacity
              onPress={() => router.push('/camera')}
              style={{
                backgroundColor: theme.primary,
                width: 38,
                height: 38,
                borderRadius: 19,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Ionicons name="camera" size={18} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* 2. BUSCADOR */}
        <View style={{ backgroundColor: theme.card, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.cardBorder, marginBottom: 12 }}>
          <Ionicons name="search" size={16} color={theme.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder={language === 'en' ? 'Search by plot, symptom, diagnosis...' : 'Buscar por lote, síntoma o dictamen...'}
            placeholderTextColor={theme.textMuted}
            style={{ flex: 1, fontSize: 13, color: theme.text, padding: 0 }}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda('')}>
              <Ionicons name="close-circle" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* 3. FILTROS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginBottom: 14 }}>
          {[
            { id: 'todos', label: `${t('filtroTodos')} (${analisisHistorial.length})` },
            { id: 'alerta', label: `⚠️ ${t('filtroAlerta')}` },
            { id: 'revisado', label: `✓ ${t('estadoRevisado')}` },
            { id: 'pendiente', label: `⏳ ${t('filtroPendientes')}` },
          ].map((f) => (
            <TouchableOpacity
              key={f.id}
              onPress={() => setFiltro(f.id)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 20,
                backgroundColor: filtro === f.id ? theme.primary : theme.card,
                borderWidth: 1,
                borderColor: filtro === f.id ? theme.primary : theme.cardBorder,
                marginRight: 8,
              }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: filtro === f.id ? '#FFFFFF' : theme.textSecondary }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 4. LISTADO DE ANÁLISIS */}
        {itemsFiltrados.length === 0 ? (
          <View style={{ backgroundColor: theme.card, borderRadius: 24, padding: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.cardBorder, marginTop: 10 }}>
            <Ionicons name="clipboard-outline" size={36} color={theme.textMuted} style={{ marginBottom: 10 }} />
            <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text, textAlign: 'center', marginBottom: 6 }}>
              {t('sinAnalisis')}
            </Text>
            <Text style={{ fontSize: 12, color: theme.textMuted, textAlign: 'center', marginBottom: 16 }}>
              {t('sinAnalisisDesc')}
            </Text>
            {rolActivo === 'agricultor' && (
              <TouchableOpacity
                onPress={() => router.push('/camera')}
                style={{ backgroundColor: theme.primary, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 }}>
                <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>
                  + {t('analizarPlanta')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          itemsFiltrados.map((item) => {
            const esAlerta = item.estado === 'alerta' || Boolean(item.diagnostico?.includes('PMP'));
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setSelectedAnalisis(item)}
                activeOpacity={0.85}
                style={{
                  backgroundColor: theme.card,
                  borderRadius: 18,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: theme.cardBorder,
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 10,
                }}>
                <Image
                  source={{ uri: item.imageUri || 'https://images.unsplash.com/photo-1555431189-0ab279e2be3a' }}
                  style={{ width: 70, height: 70, borderRadius: 12, backgroundColor: theme.cardBorder }}
                  resizeMode="cover"
                />

                <View style={{ flex: 1, marginLeft: 12, justifyContent: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: esAlerta ? theme.warning : theme.primary }}>
                      {item.diagnostico || (language === 'en' ? 'Diagnosis' : 'Diagnóstico')}
                    </Text>
                    <Text style={{ fontSize: 10, color: theme.textMuted, fontWeight: '600' }}>
                      {item.fecha || ''}
                    </Text>
                  </View>

                  <Text style={{ fontSize: 12, fontWeight: '600', color: theme.text, marginBottom: 4 }}>
                    {item.cultivoNombre || (language === 'en' ? 'Field Plot' : 'Parcela')}
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ backgroundColor: theme.inputBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: theme.textSecondary }}>
                        {item.confianza || 90}% IA
                      </Text>
                    </View>

                    {item.estadoRevision === 'revisado' && (
                      <View style={{ backgroundColor: theme.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: theme.primary }}>
                          ✓ {t('estadoRevisado')}
                        </Text>
                      </View>
                    )}
                    {item.estadoRevision === 'pendiente' && (
                      <View style={{ backgroundColor: theme.warningBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: theme.warning }}>
                          ⏳ {t('estadoPendiente')}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* MODAL DETALLES DEL ANÁLISIS */}
      {selectedAnalisis && (
        <Modal visible={Boolean(selectedAnalisis)} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: theme.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '92%' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: theme.cardBorderSubtle }}>
                <View>
                  <Text style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>
                    {language === 'en' ? 'Phytosanitary Report' : 'Reporte Fitosanitario'}
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.textMuted }}>{selectedAnalisis.fecha || ''}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedAnalisis(null)}>
                  <Ionicons name="close" size={22} color={theme.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 14 }}>
                <View style={{ width: '100%', height: 200, borderRadius: 16, overflow: 'hidden', marginBottom: 14, backgroundColor: theme.cardBorder }}>
                  <Image source={{ uri: selectedAnalisis.imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                </View>

                {/* Dictamen oficial */}
                {selectedAnalisis.estadoRevision === 'revisado' && selectedAnalisis.revisionTecnica ? (
                  <View style={{ backgroundColor: theme.primaryLight, borderWidth: 1, borderColor: theme.primaryLightBorder, borderRadius: 16, padding: 14, marginBottom: 14 }}>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: theme.primary, textTransform: 'uppercase', marginBottom: 4 }}>
                      {language === 'en' ? 'Official Agronomist Verdict' : 'Dictamen Técnico Oficial'}
                    </Text>
                    <Text style={{ fontSize: 12, color: theme.text, fontWeight: '600' }}>
                      {selectedAnalisis.revisionTecnica.tecnicoNombre} · {selectedAnalisis.revisionTecnica.registroProfesional}
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: theme.primary, marginTop: 4 }}>
                      {selectedAnalisis.revisionTecnica.diagnosticoValidado}
                    </Text>
                    <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4 }}>
                      {selectedAnalisis.revisionTecnica.observaciones}
                    </Text>
                  </View>
                ) : null}

                {/* Diagnóstico IA */}
                <View style={{ backgroundColor: theme.inputBg, borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: theme.cardBorderSubtle }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: theme.primary, marginBottom: 4 }}>
                    {selectedAnalisis.diagnostico} ({selectedAnalisis.confianza}% IA)
                  </Text>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: theme.textMuted, textTransform: 'uppercase', marginTop: 8, marginBottom: 4 }}>
                    {t('sintomasDetectados')}
                  </Text>
                  {(selectedAnalisis.sintomas || []).map((s, idx) => (
                    <Text key={idx} style={{ fontSize: 12, color: theme.text, marginTop: 2 }}>
                      • {s}
                    </Text>
                  ))}

                  <Text style={{ fontSize: 11, fontWeight: '800', color: theme.textMuted, textTransform: 'uppercase', marginTop: 10, marginBottom: 4 }}>
                    {t('recomendacionesAgro')}
                  </Text>
                  {(selectedAnalisis.recomendaciones || []).map((r, idx) => (
                    <Text key={idx} style={{ fontSize: 12, color: theme.text, marginTop: 2 }}>
                      {idx + 1}. {r}
                    </Text>
                  ))}
                </View>

                {/* Acciones */}
                {rolActivo === 'agricultor' && selectedAnalisis.estadoRevision === 'sin_solicitar' && (
                  <TouchableOpacity
                    onPress={() => handleSolicitarRevision(selectedAnalisis)}
                    style={{ backgroundColor: '#1E40AF', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>
                      {t('solicitarRevisionBtn')}
                    </Text>
                  </TouchableOpacity>
                )}

                {rolActivo === 'tecnico' && (
                  <TouchableOpacity
                    onPress={() => abrirFormularioDictamen(selectedAnalisis)}
                    style={{ backgroundColor: '#1E40AF', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>
                      {selectedAnalisis.estadoRevision === 'revisado' ? (language === 'en' ? 'Edit Verdict' : 'Editar Dictamen') : (language === 'en' ? 'Emit Technical Verdict' : 'Emitir Dictamen Técnico')}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => handleEliminar(selectedAnalisis.id)}
                  style={{ paddingVertical: 10, alignItems: 'center' }}>
                  <Text style={{ color: theme.danger, fontWeight: '700', fontSize: 12 }}>
                    {language === 'en' ? 'Delete this record' : 'Eliminar este registro'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* MODAL EMITIR DICTAMEN TÉCNICO */}
      <Modal visible={modalDictamenVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>
                {language === 'en' ? 'Technical Agronomic Verdict' : 'Dictamen Técnico Agronómico'}
              </Text>
              <TouchableOpacity onPress={() => setModalDictamenVisible(false)}>
                <Ionicons name="close" size={22} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: theme.textMuted, marginBottom: 6 }}>
                {language === 'en' ? 'DIAGNOSIS' : 'DIAGNÓSTICO OFICIAL'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginBottom: 12 }}>
                {OPCIONES_DIAGNOSTICO_TECNICO.map((opc) => (
                  <TouchableOpacity
                    key={opc}
                    onPress={() => setDiagValidado(opc)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      borderRadius: 10,
                      backgroundColor: diagValidado === opc ? theme.primary : theme.inputBg,
                      borderWidth: 1,
                      borderColor: diagValidado === opc ? theme.primary : theme.cardBorderSubtle,
                      marginRight: 6,
                    }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: diagValidado === opc ? 'white' : theme.textSecondary }}>
                      {opc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={{ fontSize: 11, fontWeight: '700', color: theme.textMuted, marginBottom: 6 }}>
                {language === 'en' ? 'FIELD OBSERVATIONS *' : 'OBSERVACIONES TÉCNICAS *'}
              </Text>
              <TextInput
                value={observacionesTecnicas}
                onChangeText={setObservacionesTecnicas}
                placeholder={language === 'en' ? 'Enter clinical agronomic observations...' : 'Ingresa tus observaciones de campo...'}
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={3}
                style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.inputBorder, borderRadius: 12, padding: 12, fontSize: 13, color: theme.text, marginBottom: 12, minHeight: 70 }}
              />

              <Text style={{ fontSize: 11, fontWeight: '700', color: theme.textMuted, marginBottom: 6 }}>
                {language === 'en' ? 'PRESCRIBED TREATMENT' : 'TRATAMIENTO SUGERIDO'}
              </Text>
              <TextInput
                value={tratamientoSugerido}
                onChangeText={setTratamientoSugerido}
                placeholder={language === 'en' ? 'Sanitary recommendations...' : 'Medidas de control...'}
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={3}
                style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.inputBorder, borderRadius: 12, padding: 12, fontSize: 13, color: theme.text, marginBottom: 14, minHeight: 70 }}
              />
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => setModalDictamenVisible(false)}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.cardBorder, alignItems: 'center' }}>
                <Text style={{ color: theme.textSecondary, fontWeight: '700', fontSize: 13 }}>{t('cancelar')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleGuardarDictamen}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: theme.primary, alignItems: 'center' }}>
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>{t('guardar')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
