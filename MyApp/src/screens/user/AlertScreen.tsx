import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import { EMERGENCY_TYPE_INFO } from '../../data/mockEmergencies';
import { Colors, Radii, Spacing, FontSizes } from '../../theme/colors';

export default function AlertScreen() {
  const { state, dispatch } = useAppContext();
  const { t } = useTranslation();
  const emergency = state.activeEmergency;

  // Fallback: if we end up here without an active emergency (e.g. SOS triggered
  // from Home then user pressed Back), show a recovery screen instead of blank.
  if (!emergency) {
    return (
      <View style={styles.screen}>
        <Text style={styles.statusIcon}>🛡️</Text>
        <Text style={styles.title}>No Active Alert</Text>
        <Text style={styles.message}>
          There is no active emergency at this time. You can return to the home screen.
        </Text>
        <Pressable
          style={styles.safeBtn}
          onPress={() => dispatch({ type: 'RETURN_TO_NORMAL' })}
        >
          <Text style={styles.safeBtnText}>🏠 Return Home</Text>
        </Pressable>
      </View>
    );
  }

  const typeInfo = EMERGENCY_TYPE_INFO[emergency.type];

  const severityStyles = {
    critical: styles.severity_critical,
    warning: styles.severity_warning,
    info: styles.severity_info,
  };

  return (
    <View style={styles.screen}>
      {/* Severity Badge */}
      <View style={[styles.severity, severityStyles[emergency.severity] || severityStyles.critical]}>
        <Text style={[styles.severityText, { color: typeInfo.color }]}>
          {t(`emergency.${emergency.severity}`)}
        </Text>
      </View>

      {/* Icon */}
      <View style={styles.iconWrap}>
        <View style={[styles.ring, { borderColor: typeInfo.color }]} />
        <View style={[styles.ring2, { borderColor: typeInfo.color }]} />
        <Text style={styles.icon}>{typeInfo.icon}</Text>
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: typeInfo.color }]}>
        {t(`emergency.${emergency.type}`)}
      </Text>

      {/* Message */}
      <Text style={styles.message}>{emergency.message}</Text>
      <Text style={styles.time}>
        {t('alert.issuedAt')} {new Date(emergency.issuedAt).toLocaleTimeString()}
      </Text>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          style={styles.btnSos}
          onPress={() => dispatch({ type: 'SET_EMERGENCY_SUB_SCREEN', payload: 'sos' })}
        >
          <Text style={styles.btnSosIcon}>🆘</Text>
          <Text style={styles.btnSosText}>{t('alert.sendSOS')}</Text>
        </Pressable>

        <Pressable
          style={styles.btnGuidance}
          onPress={() => dispatch({ type: 'SET_EMERGENCY_SUB_SCREEN', payload: 'guidance' })}
        >
          <Text style={styles.btnGuidanceIcon}>📋</Text>
          <Text style={styles.btnGuidanceText}>{t('alert.seeInstructions')}</Text>
        </Pressable>

        <Pressable
          style={styles.safeBtn}
          onPress={() => dispatch({ type: 'RESOLVE_EMERGENCY' })}
        >
          <Text style={styles.safeBtnText}>{t('alert.iAmSafe')}</Text>
        </Pressable>
      </View>
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
  severity: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: Radii.full,
    marginBottom: 32,
    borderWidth: 1,
  },
  severity_critical: {
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    borderColor: 'rgba(231, 76, 60, 0.4)',
  },
  severity_warning: {
    backgroundColor: 'rgba(243, 156, 18, 0.2)',
    borderColor: 'rgba(243, 156, 18, 0.4)',
  },
  severity_info: {
    backgroundColor: 'rgba(9, 132, 227, 0.2)',
    borderColor: 'rgba(9, 132, 227, 0.4)',
  },
  severityText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  iconWrap: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  ring: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 60,
    borderWidth: 2,
    opacity: 0.3,
  },
  ring2: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    borderRadius: 48,
    borderWidth: 2,
    opacity: 0.15,
  },
  icon: { fontSize: 64 },
  statusIcon: { fontSize: 64, marginBottom: 20 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
    maxWidth: 340,
    marginBottom: 12,
    textAlign: 'center',
  },
  time: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 32,
  },
  actions: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  btnSos: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: Radii.lg,
    backgroundColor: Colors.danger,
  },
  btnSosIcon: { fontSize: 20 },
  btnSosText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  btnGuidance: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: Radii.lg,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnGuidanceIcon: { fontSize: 20 },
  btnGuidanceText: { color: Colors.text, fontSize: 16, fontWeight: '800' },
  safeBtn: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(0, 184, 148, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 184, 148, 0.3)',
    alignItems: 'center',
  },
  safeBtnText: { color: Colors.safe, fontSize: 14, fontWeight: '700' },
});
