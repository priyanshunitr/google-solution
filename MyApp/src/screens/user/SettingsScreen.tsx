import React from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../../i18n';
import { Colors, Radii, Spacing, FontSizes } from '../../theme/colors';

export default function SettingsScreen() {
  const { state, dispatch } = useAppContext();
  const { t, i18n } = useTranslation();

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    dispatch({ type: 'SET_LANGUAGE', payload: code });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings.title')}</Text>
        <Text style={styles.subtitle}>{t('settings.subtitle')}</Text>
      </View>

      {/* Session Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.sessionInfo')}</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t('settings.sessionId')}</Text>
            <Text style={[styles.rowValue, styles.mono]}>{state.guestSession.sessionId}</Text>
          </View>
          <View style={[styles.row, styles.rowBorder]}>
            <Text style={styles.rowLabel}>{t('settings.property')}</Text>
            <Text style={styles.rowValue}>{state.guestSession.propertyName}</Text>
          </View>
          <View style={[styles.row, styles.rowBorder]}>
            <Text style={styles.rowLabel}>{t('settings.propertyId')}</Text>
            <Text style={[styles.rowValue, styles.mono]}>{state.guestSession.propertyId}</Text>
          </View>
        </View>
      </View>

      {/* Room Number */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.roomNumber')}</Text>
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder={t('settings.roomPlaceholder')}
            placeholderTextColor={Colors.textMuted}
            value={state.guestSession.roomNumber || ''}
            onChangeText={(text) => dispatch({ type: 'SET_ROOM_NUMBER', payload: text })}
          />
          <Text style={styles.hint}>{t('settings.roomHint')}</Text>
        </View>
      </View>

      {/* Language */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <View style={[styles.card, styles.langGrid]}>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isActive = i18n.language === lang.code;
            return (
              <Pressable
                key={lang.code}
                style={[styles.langBtn, isActive && styles.langBtnActive]}
                onPress={() => changeLanguage(lang.code)}
              >
                <Text style={[styles.langNative, isActive && styles.langNativeActive]}>
                  {lang.nativeLabel}
                </Text>
                <Text style={[styles.langEng, isActive && styles.langEngActive]}>
                  {lang.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.location')}</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t('settings.gpsStatus')}</Text>
            <Text style={[styles.rowValue, { color: state.location.latitude !== null ? Colors.safe : Colors.warning }]}>
              {state.location.latitude !== null
                ? `✅ ${t('settings.gpsAvailable')}`
                : `⚠️ ${t('settings.gpsUnavailable')}`}
            </Text>
          </View>
          <View style={[styles.row, styles.rowBorder]}>
            <Text style={styles.rowLabel}>{t('settings.locationSharing')}</Text>
            <Text style={[styles.rowValue, { color: state.isLocationSharing ? Colors.safe : Colors.textMuted }]}>
              {state.isLocationSharing ? `🟢 ${t('settings.sharingActive')}` : `⚪ ${t('settings.sharingInactive')}`}
            </Text>
          </View>
          <Text style={styles.hint}>{t('settings.locationHint')}</Text>
        </View>
      </View>

      {/* Privacy */}
      <View style={styles.section}>
        <View style={styles.privacy}>
          <Text style={styles.privacyIcon}>🔒</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.privacyTitle}>{t('settings.privacyTitle')}</Text>
            <Text style={styles.privacyDesc}>{t('settings.privacyDesc')}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingTop: Spacing.lg, paddingBottom: 100 },
  header: { marginBottom: 28 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.textSecondary },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  rowLabel: { fontSize: 14, color: Colors.textSecondary },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'right',
    maxWidth: '60%',
  },
  mono: { fontFamily: 'monospace', fontSize: 12 },
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    color: Colors.text,
    fontSize: 14,
  },
  hint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 10,
    lineHeight: 17,
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
  },
  langBtn: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radii.md,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 90,
  },
  langBtnActive: {
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    borderColor: Colors.primary,
  },
  langNative: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  langNativeActive: { color: Colors.primaryLight },
  langEng: { fontSize: 10, color: Colors.textMuted, fontWeight: '500' },
  langEngActive: { color: Colors.primaryLight, opacity: 0.7 },
  privacy: {
    flexDirection: 'row',
    gap: 14,
    padding: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
  },
  privacyIcon: { fontSize: 24 },
  privacyTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  privacyDesc: { fontSize: 12, color: Colors.textMuted, lineHeight: 18 },
});
