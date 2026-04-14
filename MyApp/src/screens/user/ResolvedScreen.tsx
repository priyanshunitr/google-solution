import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import { Colors, Radii, Spacing } from '../../theme/colors';

export default function ResolvedScreen() {
  const { state, dispatch } = useAppContext();
  const { t } = useTranslation();

  return (
    <View style={styles.screen}>
      {/* Icon with rings */}
      <View style={styles.iconWrap}>
        <View style={styles.ring} />
        <View style={styles.ring2} />
        <Text style={styles.icon}>✅</Text>
      </View>

      <Text style={styles.title}>{t('resolved.allClear')}</Text>
      <Text style={styles.subtitle}>{t('resolved.emergencyResolved')}</Text>

      <Text style={styles.message}>{t('resolved.message')}</Text>

      {/* Meta info */}
      <View style={styles.meta}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{t('resolved.resolvedAt')}</Text>
          <Text style={styles.metaValue}>{new Date().toLocaleTimeString()}</Text>
        </View>
        <View style={[styles.metaRow, styles.metaRowBorder]}>
          <Text style={styles.metaLabel}>{t('resolved.session')}</Text>
          <Text style={styles.metaValue}>{state.guestSession.sessionId}</Text>
        </View>
        <View style={[styles.metaRow, styles.metaRowBorder]}>
          <Text style={styles.metaLabel}>{t('resolved.sosSent')}</Text>
          <Text style={styles.metaValue}>{state.sosActive ? 1 : 0}</Text>
        </View>
      </View>

      <Pressable
        style={styles.btn}
        onPress={() => dispatch({ type: 'RETURN_TO_NORMAL' })}
      >
        <Text style={styles.btnText}>🏠 {t('resolved.returnHome')}</Text>
      </Pressable>

      <Text style={styles.note}>{t('resolved.locationStopped')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    paddingHorizontal: 24,
    backgroundColor: Colors.bg,
  },
  iconWrap: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  ring: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Colors.safe,
    opacity: 0.3,
  },
  ring2: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    borderRadius: 48,
    borderWidth: 2,
    borderColor: Colors.safe,
    opacity: 0.15,
  },
  icon: { fontSize: 64 },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.safe,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 20,
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    maxWidth: 320,
    marginBottom: 28,
    textAlign: 'center',
  },
  meta: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
    padding: 16,
    marginBottom: 28,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  metaRowBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  metaLabel: { fontSize: 13, color: Colors.textMuted },
  metaValue: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  btn: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: Radii.lg,
    backgroundColor: Colors.safe,
    marginBottom: 16,
    shadowColor: Colors.safe,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  note: { fontSize: 12, color: Colors.textMuted, textAlign: 'center' },
});
