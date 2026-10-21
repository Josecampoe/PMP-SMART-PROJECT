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
import { Badge, Button, Card, Chip, EmptyState, Field, IconButton, IconTile, ScreenHeader, Sheet } from '../../components/ui';

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

  const filtros =
    rolActivo === 'tecnico'
      ? [
          { id: 'todos', label: t('filtroTodos'), count: analisisHistorial.length },
          { id: 'pendientes', label: t('filtroPendientes'), icon: 'hourglass-outline' as const },
          { id: 'revisados', label: t('estadoRevisado'), icon: 'checkmark-done-outline' as const },
        ]
      : [
          { id: 'todos', label: t('filtroTodos'), count: analisisHistorial.length },
          { id: 'alerta', label: t('filtroAlerta'), icon: 'warning-outline' as const },
          { id: 'revisado', label: t('estadoRevisado'), icon: 'checkmark-done-outline' as const },
          { id: 'pendiente', label: t('filtroPendientes'), icon: 'hourglass-outline' as const },
        ];

  const estadoRevisionBadge = (item: Analisis) => {
    if (item.estadoRevision === 'revisado') return <Badge label={t('estadoRevisado')} tone="success" icon="checkmark" />;
    if (item.estadoRevision === 'pendiente') return <Badge label={t('estadoPendiente')} tone="warning" icon="time-outline" />;
    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScreenHeader
        title={t('historialTitulo')}
        subtitle={t('historialSubtitulo')}
        right={
          rolActivo === 'agricultor' ? (
            <IconButton icon="camera" filled size={44} onPress={() => router.push('/camera')} accessibilityLabel={t('analizarPlanta')} />
          ) : undefined
        }
      />

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

      {/* Detalle del análisis */}
      {selectedAnalisis && (
        <Sheet
          visible={Boolean(selectedAnalisis) && !modalDictamenVisible}
          onClose={() => setSelectedAnalisis(null)}
          title={language === 'en' ? 'Phytosanitary report' : 'Reporte fitosanitario'}
          subtitle={`${selectedAnalisis.cultivoNombre || ''}${selectedAnalisis.fecha ? ` · ${selectedAnalisis.fecha}` : ''}`}>
          <View style={{ width: '100%', height: 200, borderRadius: 18, overflow: 'hidden', marginBottom: 16, backgroundColor: theme.surfaceAlt }}>
            <Image source={{ uri: selectedAnalisis.imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          </View>

          {/* Diagnóstico */}
          {(() => {
            const esAlerta = selectedAnalisis.estado === 'alerta' || Boolean(selectedAnalisis.diagnostico?.includes('PMP'));
            return (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <IconTile icon={esAlerta ? 'alert-circle' : 'checkmark-circle'} tone={esAlerta ? 'warning' : 'success'} size={44} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text }}>{selectedAnalisis.diagnostico}</Text>
                  <Text style={{ fontSize: 13, color: theme.textMuted, marginTop: 1 }}>
                    {selectedAnalisis.confianza}% {language === 'en' ? 'match' : 'de coincidencia'}
                  </Text>
                </View>
                {estadoRevisionBadge(selectedAnalisis)}
              </View>
            );
          })()}

          {/* Dictamen oficial */}
          {selectedAnalisis.estadoRevision === 'revisado' && selectedAnalisis.revisionTecnica ? (
            <View style={{ backgroundColor: theme.primaryLight, borderWidth: 1, borderColor: theme.primaryLightBorder, borderRadius: 16, padding: 14, marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="ribbon" size={16} color={theme.primary} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: theme.primary, marginLeft: 6 }}>
                  {language === 'en' ? 'Official agronomist verdict' : 'Dictamen técnico oficial'}
                </Text>
              </View>
              <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text }}>{selectedAnalisis.revisionTecnica.diagnosticoValidado}</Text>
              <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 6, lineHeight: 20 }}>{selectedAnalisis.revisionTecnica.observaciones}</Text>
              {selectedAnalisis.revisionTecnica.tratamientoRecomendado ? (
                <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 6, lineHeight: 20 }}>
                  <Text style={{ fontWeight: '700', color: theme.text }}>{language === 'en' ? 'Treatment: ' : 'Tratamiento: '}</Text>
                  {selectedAnalisis.revisionTecnica.tratamientoRecomendado}
                </Text>
              ) : null}
              <Text style={{ fontSize: 12, color: theme.textMuted, marginTop: 10 }}>
                {selectedAnalisis.revisionTecnica.tecnicoNombre} · {selectedAnalisis.revisionTecnica.registroProfesional}
              </Text>
            </View>
          ) : null}

          {/* Síntomas */}
          <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text, marginBottom: 8 }}>{t('sintomasDetectados')}</Text>
          <View style={{ marginBottom: 16 }}>
            {(selectedAnalisis.sintomas || []).map((s, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.warning, marginTop: 7, marginRight: 10 }} />
                <Text style={{ fontSize: 14, color: theme.textSecondary, flex: 1, lineHeight: 20 }}>{s}</Text>
              </View>
            ))}
          </View>

          {/* Recomendaciones */}
          <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text, marginBottom: 8 }}>{t('recomendacionesAgro')}</Text>
          <View style={{ marginBottom: 20 }}>
            {(selectedAnalisis.recomendaciones || []).map((r, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: theme.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: theme.primary }}>{idx + 1}</Text>
                </View>
                <Text style={{ fontSize: 14, color: theme.textSecondary, flex: 1, lineHeight: 20 }}>{r}</Text>
              </View>
            ))}
          </View>

          {/* Acciones */}
          <View style={{ gap: 10 }}>
            {rolActivo === 'agricultor' && selectedAnalisis.estadoRevision === 'sin_solicitar' && (
              <Button label={t('solicitarRevisionBtn')} icon="paper-plane-outline" onPress={() => handleSolicitarRevision(selectedAnalisis)} />
            )}
            {rolActivo === 'tecnico' && (
              <Button
                label={
                  selectedAnalisis.estadoRevision === 'revisado'
                    ? language === 'en' ? 'Edit verdict' : 'Editar dictamen'
                    : language === 'en' ? 'Issue technical verdict' : 'Emitir dictamen técnico'
                }
                icon="create-outline"
                onPress={() => abrirFormularioDictamen(selectedAnalisis)}
              />
            )}
            <Button
              label={language === 'en' ? 'Delete this record' : 'Eliminar este registro'}
              variant="ghost"
              icon="trash-outline"
              onPress={() => handleEliminar(selectedAnalisis.id)}
              style={{ marginBottom: 4 }}
            />
          </View>
        </Sheet>
      )}

      {/* Emitir dictamen técnico */}
      <Sheet
        visible={modalDictamenVisible}
        onClose={() => setModalDictamenVisible(false)}
        title={language === 'en' ? 'Technical verdict' : 'Dictamen técnico'}
        subtitle={selectedAnalisis?.cultivoNombre}
        icon="ribbon-outline"
        footer={
          <>
            <Button label={t('cancelar')} variant="secondary" onPress={() => setModalDictamenVisible(false)} flex />
            <Button label={t('guardar')} onPress={handleGuardarDictamen} flex />
          </>
        }>
        <Text style={{ fontSize: 13, fontWeight: '600', color: theme.textSecondary, marginBottom: 8 }}>
          {language === 'en' ? 'Diagnosis' : 'Diagnóstico oficial'}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {OPCIONES_DIAGNOSTICO_TECNICO.map((opc) => {
            const sel = diagValidado === opc;
            return (
              <TouchableOpacity
                key={opc}
                onPress={() => setDiagValidado(opc)}
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 12,
                  backgroundColor: sel ? theme.primaryLight : theme.inputBg,
                  borderWidth: 1,
                  borderColor: sel ? theme.primary : theme.inputBorder,
                }}>
                <Ionicons name={sel ? 'radio-button-on' : 'radio-button-off'} size={15} color={sel ? theme.primary : theme.textMuted} style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 13, fontWeight: '600', color: sel ? theme.primary : theme.textSecondary }}>{opc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Field
          label={language === 'en' ? 'Field observations' : 'Observaciones técnicas'}
          required
          value={observacionesTecnicas}
          onChangeText={setObservacionesTecnicas}
          placeholder={language === 'en' ? 'Enter clinical agronomic observations...' : 'Ingresa tus observaciones de campo...'}
          multiline
          numberOfLines={3}
        />
        <Field
          label={language === 'en' ? 'Prescribed treatment' : 'Tratamiento sugerido'}
          value={tratamientoSugerido}
          onChangeText={setTratamientoSugerido}
          placeholder={language === 'en' ? 'Sanitary recommendations...' : 'Medidas de control...'}
          multiline
          numberOfLines={3}
        />
      </Sheet>
    </SafeAreaView>
  );
}
