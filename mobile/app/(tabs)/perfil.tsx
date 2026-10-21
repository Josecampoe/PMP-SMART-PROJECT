import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader
        title={language === 'en' ? 'Profile' : 'Perfil'}
        subtitle={t('perfilSubtitulo')}
        right={<IconButton icon="create-outline" size={44} onPress={abrirEditor} accessibilityLabel={t('editarPerfil')} />}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Tarjeta de usuario */}
        <Card padding={0} style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: theme.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: theme.onPrimary }}>{iniciales || '?'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text, letterSpacing: -0.3 }} numberOfLines={2}>
                {nombreMostrado}
              </Text>
              <View style={{ marginTop: 6 }}>
                <Badge label={esTecnico ? t('rolTecnico') : t('rolAgricultor')} tone="primary" icon={esTecnico ? 'shield-checkmark' : 'leaf'} />
              </View>
            </View>
          </View>

          <Divider />
          <View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 10 }}>
            {contacto.map((c, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name={c.icon} size={16} color={theme.textMuted} />
                <Text style={{ fontSize: 14, color: c.muted ? theme.textMuted : theme.textSecondary, marginLeft: 10, flex: 1 }} numberOfLines={1}>
                  {c.text}
                </Text>
              </View>
            ))}
          </View>

          <Divider />
          <View style={{ flexDirection: 'row', paddingVertical: 14 }}>
            {[
              { value: (cultivos || []).length, label: language === 'en' ? 'Plots' : 'Parcelas' },
              { value: (analisisHistorial || []).length, label: language === 'en' ? 'Scans' : 'Escaneos' },
              { value: (analisisHistorial || []).filter((a) => a?.estadoRevision === 'revisado').length, label: t('estadoRevisado') },
            ].map((s, i) => (
              <View key={s.label} style={{ flex: 1, alignItems: 'center', borderLeftWidth: i > 0 ? 1 : 0, borderLeftColor: theme.cardBorderSubtle }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: theme.text }}>{s.value}</Text>
                <Text style={{ fontSize: 12, color: theme.textMuted, marginTop: 1 }}>{s.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Apariencia */}
        <GroupLabel>{t('seccionApariencia')}</GroupLabel>
        <Card padding={0} style={{ marginBottom: 24 }}>
          <SettingsRow
            icon={isDarkMode ? 'moon' : 'sunny'}
            tone="warning"
            title={t('modoOscuro')}
            desc={t('modoOscuroDesc')}
            right={
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: theme.inputBorder, true: theme.primary }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={theme.inputBorder}
              />
            }
          />
          <Divider inset={64} />
          <SettingsRow
            icon="language"
            title={t('idioma')}
            desc={t('idiomaDesc')}
            right={
              <View style={{ flexDirection: 'row', backgroundColor: theme.surfaceAlt, borderRadius: 10, padding: 3, borderWidth: 1, borderColor: theme.cardBorder }}>
                {(['es', 'en'] as const).map((lng) => (
                  <TouchableOpacity
                    key={lng}
                    onPress={() => setLanguage(lng)}
                    activeOpacity={0.8}
                    style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: language === lng ? theme.card : 'transparent' }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: language === lng ? theme.text : theme.textMuted }}>{lng.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            }
          />
        </Card>

        {/* Guía PMP */}
        <GroupLabel>{t('guiaPmpTitulo')}</GroupLabel>
        <Card padding={0} style={{ marginBottom: 24 }}>
          {guia.map((g, i) => {
            const abierta = seccionGuiaAbierta === g.id;
            return (
              <View key={g.id}>
                {i > 0 && <Divider inset={64} />}
                <SettingsRow
                  icon={g.icon}
                  tone="info"
                  title={g.title}
                  onPress={() => toggleSeccion(g.id)}
                  right={<Ionicons name={abierta ? 'chevron-up' : 'chevron-down'} size={18} color={theme.textMuted} />}
                />
                {abierta && (
                  <Text style={{ fontSize: 14, color: theme.textSecondary, lineHeight: 21, paddingHorizontal: 16, paddingBottom: 16, paddingLeft: 64 }}>
                    {g.body}
                  </Text>
                )}
              </View>
            );
          })}
        </Card>

        {/* Datos */}
        <GroupLabel>{language === 'en' ? 'Local data' : 'Datos locales'}</GroupLabel>
        <Card padding={0} style={{ marginBottom: 24 }}>
          <SettingsRow
            icon="cloud-download-outline"
            title={t('cargarDemo')}
            desc={language === 'en' ? 'Populate test plots and diagnostic history' : 'Agrega parcelas y análisis de ejemplo'}
            onPress={handleCargarDemo}
          />
          <Divider inset={64} />
          <SettingsRow
            icon="trash-outline"
            tone="danger"
            danger
            title={t('restablecerDatos')}
            desc={language === 'en' ? 'Deletes all stored crops and analysis records' : 'Borra todos los lotes y análisis guardados'}
            onPress={handleLimpiarDatos}
          />
        </Card>

        <Button label={t('cerrarSesion')} icon="log-out-outline" variant="dangerSoft" onPress={handleCerrarSesion} />

        <Text style={{ textAlign: 'center', fontSize: 12, color: theme.textMuted, marginTop: 20 }}>PMP Smart · v1.0.0</Text>
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
