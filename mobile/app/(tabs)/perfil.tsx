import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { authApi } from '../../lib/api';
import { Badge, Button, Card, Divider, Field, GroupLabel, IconButton, ScreenHeader, SettingsRow, Sheet } from '../../components/ui';

export default function PerfilScreen() {
  const router = useRouter();
  const {
    rolActivo,
    setRolActivo,
    perfilAgricultor,
    perfilTecnico,
    updatePerfilAgricultor,
    updatePerfilTecnico,
    cultivos,
    analisisHistorial,
    limpiarTodosLosDatos,
    cargarDatosDemo,
    theme,
    isDarkMode,
    toggleDarkMode,
    language,
    setLanguage,
    t,
  } = useApp();

  const handleCerrarSesion = () => {
    Alert.alert(
      t('cerrarSesion'),
      language === 'en' ? 'Are you sure you want to sign out?' : '¿Estás seguro de que deseas cerrar tu sesión?',
      [
        { text: t('cancelar'), style: 'cancel' },
        {
          text: t('cerrarSesion'),
          style: 'destructive',
          onPress: async () => {
            await authApi.logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  // Estados de edición Agricultor
  const [modalEditAgr, setModalEditAgr] = useState(false);
  const [nombreAgr, setNombreAgr] = useState(perfilAgricultor?.nombre || '');
  const [fincaAgr, setFincaAgr] = useState(perfilAgricultor?.fincaPrincipal || '');
  const [ubicacionAgr, setUbicacionAgr] = useState(perfilAgricultor?.ubicacion || '');
  const [telefonoAgr, setTelefonoAgr] = useState(perfilAgricultor?.telefono || '');
  const [emailAgr, setEmailAgr] = useState(perfilAgricultor?.email || '');

  // Estados de edición Técnico
  const [modalEditTec, setModalEditTec] = useState(false);
  const [nombreTec, setNombreTec] = useState(perfilTecnico?.nombre || '');
  const [regTec, setRegTec] = useState(perfilTecnico?.registroProfesional || '');
  const [espTec, setEspTec] = useState(perfilTecnico?.especialidad || '');
  const [entidadTec, setEntidadTec] = useState(perfilTecnico?.entidad || '');
  const [telefonoTec, setTelefonoTec] = useState(perfilTecnico?.telefono || '');
  const [emailTec, setEmailTec] = useState(perfilTecnico?.email || '');

  // Guía colapsable
  const [seccionGuiaAbierta, setSeccionGuiaAbierta] = useState<string | null>('que-es');

  const handleGuardarPerfilAgr = () => {
    if (!nombreAgr.trim()) {
      Alert.alert(language === 'en' ? 'Required field' : 'Campo requerido', language === 'en' ? 'Please enter your name.' : 'Por favor ingresa tu nombre.');
      return;
    }
    updatePerfilAgricultor({
      nombre: nombreAgr.trim(),
      fincaPrincipal: fincaAgr.trim() || (language === 'en' ? 'Main Farm' : 'Finca Principal'),
      ubicacion: ubicacionAgr.trim() || 'Colombia',
      telefono: telefonoAgr.trim(),
      email: emailAgr.trim(),
    });
    setModalEditAgr(false);
    Alert.alert(language === 'en' ? 'Profile Updated' : 'Perfil actualizado', language === 'en' ? 'Farmer details saved.' : 'Datos de agricultor guardados correctamente.');
  };

  const handleGuardarPerfilTec = () => {
    if (!nombreTec.trim()) {
      Alert.alert(language === 'en' ? 'Required field' : 'Campo requerido', language === 'en' ? 'Please enter your name.' : 'Por favor ingresa tu nombre.');
      return;
    }
    updatePerfilTecnico({
      nombre: nombreTec.trim(),
      registroProfesional: regTec.trim() || 'ICA-REG',
      especialidad: espTec.trim() || (language === 'en' ? 'Plant Pathology' : 'Sanidad Vegetal'),
      entidad: entidadTec.trim() || (language === 'en' ? 'Technical Advisory' : 'Asistencia Técnica'),
      telefono: telefonoTec.trim(),
      email: emailTec.trim(),
    });
    setModalEditTec(false);
    Alert.alert(language === 'en' ? 'Profile Updated' : 'Perfil actualizado', language === 'en' ? 'Agronomist details saved.' : 'Datos de técnico guardados correctamente.');
  };

  const handleLimpiarDatos = () => {
    Alert.alert(
      t('restablecerDatos'),
      language === 'en'
        ? 'Do you want to clear all plots and scan history from local storage?'
        : '¿Deseas vaciar todas las parcelas y registros de escaneos para comenzar desde cero con datos reales?',
      [
        { text: t('cancelar'), style: 'cancel' },
        {
          text: language === 'en' ? 'Reset All' : 'Restablecer Todo',
          style: 'destructive',
          onPress: () => {
            limpiarTodosLosDatos();
            Alert.alert(language === 'en' ? 'Database Cleared' : 'Datos Restablecidos', language === 'en' ? 'Local database is now empty.' : 'Se ha limpiado la base de datos local.');
          },
        },
      ]
    );
  };

  const handleCargarDemo = () => {
    Alert.alert(
      t('cargarDemo'),
      language === 'en'
        ? 'Load demo potato plots and AI diagnostic scans?'
        : '¿Deseas cargar parcelas y análisis de prueba para evaluar el flujo de agricultor y técnico?',
      [
        { text: t('cancelar'), style: 'cancel' },
        {
          text: t('cargarDemo'),
          onPress: () => {
            cargarDatosDemo();
            Alert.alert(language === 'en' ? 'Demo Loaded' : 'Datos cargados', language === 'en' ? 'Sample records added to history.' : 'Se han cargado casos de prueba en tu historial.');
          },
        },
      ]
    );
  };

  const toggleSeccion = (seccion: string) => {
    setSeccionGuiaAbierta(seccionGuiaAbierta === seccion ? null : seccion);
  };

  const esTecnico = rolActivo === 'tecnico';

  const abrirEditor = () => {
    if (rolActivo === 'agricultor') {
      setNombreAgr(perfilAgricultor?.nombre || '');
      setFincaAgr(perfilAgricultor?.fincaPrincipal || '');
      setUbicacionAgr(perfilAgricultor?.ubicacion || '');
      setTelefonoAgr(perfilAgricultor?.telefono || '');
      setEmailAgr(perfilAgricultor?.email || '');
      setModalEditAgr(true);
    } else {
      setNombreTec(perfilTecnico?.nombre || '');
      setRegTec(perfilTecnico?.registroProfesional || '');
      setEspTec(perfilTecnico?.especialidad || '');
      setEntidadTec(perfilTecnico?.entidad || '');
      setTelefonoTec(perfilTecnico?.telefono || '');
      setEmailTec(perfilTecnico?.email || '');
      setModalEditTec(true);
    }
  };

  const nombreMostrado = esTecnico
    ? perfilTecnico?.nombre || (language === 'en' ? 'Plant Pathologist Agronomist' : 'Ing. Agrónomo Fitosanitario')
    : perfilAgricultor?.nombre || (language === 'en' ? 'Potato Grower' : 'Productor de Papa');
  const iniciales = nombreMostrado
    .split(' ')
    .filter((p) => p && /[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(p[0]))
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

  const contacto = esTecnico
    ? [
        { icon: 'ribbon-outline' as const, text: perfilTecnico?.registroProfesional || 'ICA-COL' },
        { icon: 'business-outline' as const, text: `${perfilTecnico?.especialidad || 'Sanidad Vegetal'} · ${perfilTecnico?.entidad || 'Asistencia Técnica'}` },
        { icon: 'call-outline' as const, text: perfilTecnico?.telefono || (language === 'en' ? 'No phone registered' : 'Teléfono no registrado'), muted: !perfilTecnico?.telefono },
        { icon: 'mail-outline' as const, text: perfilTecnico?.email || (language === 'en' ? 'No email registered' : 'Correo no registrado'), muted: !perfilTecnico?.email },
      ]
    : [
        { icon: 'home-outline' as const, text: `${perfilAgricultor?.fincaPrincipal || 'Finca'} · ${perfilAgricultor?.ubicacion || 'Colombia'}` },
        { icon: 'call-outline' as const, text: perfilAgricultor?.telefono || (language === 'en' ? 'No phone registered' : 'Teléfono no registrado'), muted: !perfilAgricultor?.telefono },
        { icon: 'mail-outline' as const, text: perfilAgricultor?.email || (language === 'en' ? 'No email registered' : 'Correo no registrado'), muted: !perfilAgricultor?.email },
      ];

  const guia = [
    { id: 'que-es', icon: 'help-circle-outline' as const, title: t('guiaPmpQueEs'), body: t('guiaPmpQueEsDesc') },
    { id: 'sintomas', icon: 'eye-outline' as const, title: t('guiaPmpSintomas'), body: t('guiaPmpSintomasDesc') },
    { id: 'control', icon: 'shield-outline' as const, title: t('guiaPmpControl'), body: t('guiaPmpControlDesc') },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScreenHeader
        title={language === 'en' ? 'Profile' : 'Perfil'}
        subtitle={t('perfilSubtitulo')}
        right={<IconButton icon="create-outline" size={44} onPress={abrirEditor} accessibilityLabel={t('editarPerfil')} />}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* 2. CARD DE APARIENCIA E IDIOMA (DARK MODE & ENGLISH) */}
        <Text style={{ fontSize: 11, fontWeight: '800', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginLeft: 4 }}>
          {t('seccionApariencia')}
        </Text>
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 20,
            padding: 18,
            borderWidth: 1,
            borderColor: theme.cardBorder,
            marginBottom: 20,
          }}>
          {/* Switch Modo Oscuro */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.12)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                <Ionicons name={isDarkMode ? 'moon' : 'sunny'} size={20} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text }}>
                  {t('modoOscuro')}
                </Text>
                <Text style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>
                  {t('modoOscuroDesc')}
                </Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#D1D5DB', true: rolActivo === 'tecnico' ? (isDarkMode ? '#3B82F6' : '#2563EB') : theme.primary }}
              thumbColor={'#FFFFFF'}
            />
          </View>

          <View style={{ height: 1, backgroundColor: theme.cardBorderSubtle, marginBottom: 16 }} />

          {/* Selector de Idioma (Español / English) */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: rolActivo === 'tecnico' ? (isDarkMode ? 'rgba(59, 130, 246, 0.18)' : '#EFF6FF') : theme.primaryLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                <Ionicons name="language" size={20} color={rolActivo === 'tecnico' ? (isDarkMode ? '#60A5FA' : '#2563EB') : theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text }}>
                  {t('idioma')}
                </Text>
                <Text style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>
                  {t('idiomaDesc')}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', backgroundColor: theme.inputBg, borderRadius: 12, padding: 3, borderWidth: 1, borderColor: theme.cardBorder }}>
              <TouchableOpacity
                onPress={() => setLanguage('es')}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 10,
                  backgroundColor: language === 'es' ? (rolActivo === 'tecnico' ? (isDarkMode ? '#2563EB' : '#1D4ED8') : theme.primary) : 'transparent',
                }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: language === 'es' ? '#FFFFFF' : theme.textMuted }}>
                  ES
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setLanguage('en')}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 10,
                  backgroundColor: language === 'en' ? (rolActivo === 'tecnico' ? (isDarkMode ? '#2563EB' : '#1D4ED8') : theme.primary) : 'transparent',
                }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: language === 'en' ? '#FFFFFF' : theme.textMuted }}>
                  EN
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 3. TARJETA DE PERFIL SEGÚN ROL */}
        <Text style={{ fontSize: 11, fontWeight: '800', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginLeft: 4 }}>
          {t('seccionUsuario')}
        </Text>
        {rolActivo === 'agricultor' ? (
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 20,
              padding: 18,
              borderWidth: 1,
              borderColor: theme.cardBorder,
              marginBottom: 20,
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  backgroundColor: theme.primaryLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: theme.primaryLightBorder,
                  marginRight: 14,
                }}>
                <Text style={{ fontSize: 26 }}>👨‍🌾</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>
                  {perfilAgricultor?.nombre || (language === 'en' ? 'Potato Grower' : 'Productor de Papa')}
                </Text>
                <Text style={{ fontSize: 12, color: theme.primary, fontWeight: '700', marginTop: 2 }}>
                  {t('rolAgricultor')}
                </Text>
                <Text style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>
                  📍 {perfilAgricultor?.fincaPrincipal || 'Finca'} · {perfilAgricultor?.ubicacion || 'Colombia'}
                </Text>
              </View>
            </View>

            <View style={{ backgroundColor: theme.inputBg, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: theme.cardBorderSubtle }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Ionicons name="call-outline" size={14} color={theme.textMuted} />
                <Text style={{ fontSize: 12, color: theme.textSecondary, marginLeft: 8 }}>
                  {perfilAgricultor?.telefono || (language === 'en' ? 'No phone registered' : 'Teléfono no registrado')}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="mail-outline" size={14} color={theme.textMuted} />
                <Text style={{ fontSize: 12, color: theme.textSecondary, marginLeft: 8 }}>
                  {perfilAgricultor?.email || (language === 'en' ? 'No email registered' : 'Correo no registrado')}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 20,
              padding: 18,
              borderWidth: 1,
              borderColor: theme.cardBorder,
              marginBottom: 20,
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: 'rgba(59, 130, 246, 0.3)',
                  marginRight: 14,
                }}>
                <Text style={{ fontSize: 26 }}>🔬</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>
                  {perfilTecnico?.nombre || (language === 'en' ? 'Plant Pathologist Agronomist' : 'Ing. Agrónomo Fitosanitario')}
                </Text>
                <Text style={{ fontSize: 12, color: '#3B82F6', fontWeight: '700', marginTop: 2 }}>
                  Reg: {perfilTecnico?.registroProfesional || 'ICA-REG'}
                </Text>
                <Text style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>
                  {perfilTecnico?.especialidad || 'Sanidad Vegetal'} · {perfilTecnico?.entidad || 'Asistencia Técnica'}
                </Text>
              </View>
            </View>

            <View style={{ backgroundColor: theme.inputBg, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: theme.cardBorderSubtle }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="ribbon-outline" size={14} color="#3B82F6" />
                <Text style={{ fontSize: 12, color: theme.textSecondary, marginLeft: 8 }}>
                  {perfilTecnico?.registroProfesional || 'ICA-COL'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 4. RESUMEN ESTADÍSTICO */}
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: theme.cardBorder,
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginBottom: 20,
          }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: rolActivo === 'tecnico' ? (isDarkMode ? '#60A5FA' : '#2563EB') : theme.primary }}>{(cultivos || []).length}</Text>
            <Text style={{ fontSize: 10, fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', marginTop: 2 }}>
              {t('metricasParcelas')}
            </Text>
          </View>
          <View style={{ width: 1, backgroundColor: theme.cardBorderSubtle }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: theme.text }}>
              {(analisisHistorial || []).length}
            </Text>
            <Text style={{ fontSize: 10, fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', marginTop: 2 }}>
              {t('metricasEscaneos')}
            </Text>
          </View>
          <View style={{ width: 1, backgroundColor: theme.cardBorderSubtle }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: theme.warning }}>
              {(analisisHistorial || []).filter((a) => a?.estadoRevision === 'revisado').length}
            </Text>
            <Text style={{ fontSize: 10, fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', marginTop: 2 }}>
              {t('estadoRevisado')}
            </Text>
          </View>
        </View>

        {/* 5. GUÍA TÉCNICA: PUNTA MORADA */}
        <Text style={{ fontSize: 11, fontWeight: '800', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginLeft: 4 }}>
          {t('guiaPmpTitulo')}
        </Text>

        <View style={{ backgroundColor: theme.card, borderRadius: 16, borderWidth: 1, borderColor: theme.cardBorder, marginBottom: 10, overflow: 'hidden' }}>
          <TouchableOpacity
            onPress={() => toggleSeccion('que-es')}
            style={{ padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.card }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 16, marginRight: 10 }}>🥔</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>
                {t('guiaPmpQueEs')}
              </Text>
            </View>
            <Ionicons
              name={seccionGuiaAbierta === 'que-es' ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={theme.textMuted}
            />
          </TouchableOpacity>
          {seccionGuiaAbierta === 'que-es' && (
            <View style={{ padding: 14, borderTopWidth: 1, borderTopColor: theme.cardBorderSubtle }}>
              <Text style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 18 }}>
                {t('guiaPmpQueEsDesc')}
              </Text>
            </View>
          )}
        </View>

        <View style={{ backgroundColor: theme.card, borderRadius: 16, borderWidth: 1, borderColor: theme.cardBorder, marginBottom: 20, overflow: 'hidden' }}>
          <TouchableOpacity
            onPress={() => toggleSeccion('sintomas')}
            style={{ padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.card }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 16, marginRight: 10 }}>🔍</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>
                {t('guiaPmpSintomas')}
              </Text>
            </View>
            <Ionicons
              name={seccionGuiaAbierta === 'sintomas' ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={theme.textMuted}
            />
          </TouchableOpacity>
          {seccionGuiaAbierta === 'sintomas' && (
            <View style={{ padding: 14, borderTopWidth: 1, borderTopColor: theme.cardBorderSubtle }}>
              <Text style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 18 }}>
                {t('guiaPmpSintomasDesc')}
              </Text>
            </View>
          )}
        </View>

        {/* 6. GESTIÓN DE DATOS */}
        <Text style={{ fontSize: 11, fontWeight: '800', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginLeft: 4 }}>
          {language === 'en' ? 'LOCAL DATA MANAGEMENT' : 'ADMINISTRACIÓN DE DATOS LOCALES'}
        </Text>

        <View style={{ backgroundColor: theme.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: theme.cardBorder, marginBottom: 20, gap: 10 }}>
          <TouchableOpacity
            onPress={handleCargarDemo}
            activeOpacity={0.8}
            style={{ padding: 14, borderRadius: 14, backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.cardBorderSubtle, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="cloud-download-outline" size={18} color={rolActivo === 'tecnico' ? (isDarkMode ? '#60A5FA' : '#2563EB') : theme.primary} style={{ marginRight: 10 }} />
              <View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>{t('cargarDemo')}</Text>
                <Text style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>
                  {language === 'en' ? 'Populate test plots and diagnostic history' : 'Agrega parcelas y análisis de ejemplo para probar'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={14} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLimpiarDatos}
            activeOpacity={0.8}
            style={{ padding: 14, borderRadius: 14, backgroundColor: theme.dangerBg, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="trash-outline" size={18} color={theme.danger} style={{ marginRight: 10 }} />
              <View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.danger }}>{t('restablecerDatos')}</Text>
                <Text style={{ fontSize: 11, color: theme.danger, opacity: 0.8, marginTop: 2 }}>
                  {language === 'en' ? 'Deletes all stored crops and analysis records' : 'Borra todos los lotes y análisis guardados'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={14} color={theme.danger} />
          </TouchableOpacity>
        </View>

        {/* 7. BOTÓN CERRAR SESIÓN */}
        <TouchableOpacity
          onPress={handleCerrarSesion}
          activeOpacity={0.85}
          style={{
            marginBottom: 20,
            paddingVertical: 14,
            borderRadius: 16,
            backgroundColor: theme.danger,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="log-out-outline" size={18} color="white" />
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 14, marginLeft: 8 }}>
              {t('cerrarSesion')}
            </Text>
          </View>
        </TouchableOpacity>

        <Text style={{ textAlign: 'center', fontSize: 11, color: theme.textMuted, marginBottom: 20 }}>
          PMP Smart · Potato Phytosanitary Intelligence
        </Text>
      </ScrollView>

      {/* Editar agricultor */}
      <Sheet
        visible={modalEditAgr}
        onClose={() => setModalEditAgr(false)}
        title={language === 'en' ? 'Edit profile' : 'Editar perfil'}
        subtitle={t('rolAgricultor')}
        footer={
          <>
            <Button label={t('cancelar')} variant="secondary" onPress={() => setModalEditAgr(false)} flex />
            <Button label={t('guardar')} onPress={handleGuardarPerfilAgr} flex />
          </>
        }>
        <Field label={language === 'en' ? 'Full name' : 'Nombre completo'} required icon="person-outline" value={nombreAgr} onChangeText={setNombreAgr} placeholder={language === 'en' ? 'Your real name' : 'Tu nombre real'} />
        <Field label={language === 'en' ? 'Main farm' : 'Finca principal'} icon="home-outline" value={fincaAgr} onChangeText={setFincaAgr} placeholder={language === 'en' ? 'Farm name' : 'Nombre de tu finca'} />
        <Field label={language === 'en' ? 'Location' : 'Municipio / ubicación'} icon="location-outline" value={ubicacionAgr} onChangeText={setUbicacionAgr} placeholder="Pasto, Nariño" />
        <Field label={language === 'en' ? 'Phone' : 'Teléfono'} icon="call-outline" value={telefonoAgr} onChangeText={setTelefonoAgr} placeholder="+57..." keyboardType="phone-pad" />
        <Field label={language === 'en' ? 'Email' : 'Correo electrónico'} icon="mail-outline" value={emailAgr} onChangeText={setEmailAgr} placeholder="correo@ejemplo.com" keyboardType="email-address" autoCapitalize="none" />
      </Sheet>

      {/* Editar técnico */}
      <Sheet
        visible={modalEditTec}
        onClose={() => setModalEditTec(false)}
        title={language === 'en' ? 'Edit profile' : 'Editar perfil'}
        subtitle={t('rolTecnico')}
        footer={
          <>
            <Button label={t('cancelar')} variant="secondary" onPress={() => setModalEditTec(false)} flex />
            <Button label={t('guardar')} onPress={handleGuardarPerfilTec} flex />
          </>
        }>
        <Field label={language === 'en' ? 'Full name' : 'Nombre completo'} required icon="person-outline" value={nombreTec} onChangeText={setNombreTec} placeholder={language === 'en' ? 'Your real name' : 'Tu nombre real'} />
        <Field label={language === 'en' ? 'Professional registration' : 'Registro profesional'} icon="ribbon-outline" value={regTec} onChangeText={setRegTec} placeholder="ICA-04821" autoCapitalize="characters" />
        <Field label={language === 'en' ? 'Specialty' : 'Especialidad'} icon="flask-outline" value={espTec} onChangeText={setEspTec} placeholder={language === 'en' ? 'Plant Pathology' : 'Sanidad Vegetal'} />
        <Field label={language === 'en' ? 'Organization' : 'Entidad'} icon="business-outline" value={entidadTec} onChangeText={setEntidadTec} placeholder={language === 'en' ? 'Technical Advisory' : 'Asistencia Técnica'} />
        <Field label={language === 'en' ? 'Phone' : 'Teléfono'} icon="call-outline" value={telefonoTec} onChangeText={setTelefonoTec} placeholder="+57..." keyboardType="phone-pad" />
        <Field label={language === 'en' ? 'Email' : 'Correo electrónico'} icon="mail-outline" value={emailTec} onChangeText={setEmailTec} placeholder="correo@ejemplo.com" keyboardType="email-address" autoCapitalize="none" />
      </Sheet>
    </SafeAreaView>
  );
}
