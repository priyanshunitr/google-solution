import React, { useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import { MOCK_EMERGENCIES } from '../../data/mockEmergencies';
import LocationIndicator from '../../components/LocationIndicator';
import { Colors, Radii, Spacing, FontSizes } from '../../theme/colors';

export default function HomeScreen() {
  const { state, dispatch, triggerEmergency, navigateToReportRef, requestLocationPermission, fetchLocation } = useAppContext();
  const { t } = useTranslation();

  // Request location permission and fetch GPS on mount
  useEffect(() => {
    (async () => {
      try {
        const granted = await requestLocationPermission();
        if (granted) {
          await fetchLocation();
        }
      } catch (err) {
        console.warn('[HomeScreen] Location setup failed:', err);
      }
    })();
  }, [requestLocationPermission, fetchLocation]);

  const hasActiveAlert = state.mode === 'emergency' && state.activeEmergency;

  const TIPS = [
    { icon: '🚪', title: t('home.tipExits'), desc: t('home.tipExitsDesc') },
    { icon: '🔑', title: t('home.tipKey'), desc: t('home.tipKeyDesc') },
    { icon: '📱', title: t('home.tipApp'), desc: t('home.tipAppDesc') },
    { icon: '🚫', title: t('home.tipElevator'), desc: t('home.tipElevatorDesc') },
  ];

  const EMERGENCY_ICONS: Record<string, string> = {
    fire: '🔥',
    evacuation: '🚨',
    medical: '🏥',
    lockdown: '🔒',
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Text style={styles.wave}>👋</Text>
          <View>
            <Text style={styles.welcome}>{t('home.welcome')}</Text>
            <Text style={styles.property}>{state.guestSession.propertyName}</Text>
          </View>
        </View>
        <View style={styles.sessionBadge}>
          <Text style={styles.sessionId}>ID: {state.guestSession.sessionId}</Text>
        </View>
      </View>

      {/* Status Card */}
      <View style={[styles.statusCard, hasActiveAlert && styles.statusCardAlert]}>
        <View style={styles.statusIconWrap}>
          <Text style={styles.statusIcon}>{hasActiveAlert ? '⚠️' : '🛡️'}</Text>
        </View>
        <View style={styles.statusInfo}>
          <Text style={styles.statusTitle}>
            {hasActiveAlert ? t('home.alertActive') : t('home.allClear')}
          </Text>
          <Text style={styles.statusDesc}>
            {hasActiveAlert ? t('home.alertActiveDesc') : t('home.allClearDesc')}
          </Text>
        </View>
        <View
          style={[
            styles.statusDot,
            hasActiveAlert ? styles.statusDotDanger : styles.statusDotSafe,
          ]}
        />
      </View>

      <LocationIndicator />

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionCard, styles.actionCardSos]}
            onPress={() => dispatch({ type: 'TRIGGER_SOS_ONLY' })}
          >
            <Text style={styles.actionIcon}>🆘</Text>
            <Text style={styles.actionLabel}>{t('home.emergencySOS')}</Text>
            <Text style={styles.actionDesc}>{t('home.sosDesc')}</Text>
          </Pressable>
          <Pressable
            style={styles.actionCard}
            onPress={() => navigateToReportRef.current?.()}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionLabel}>{t('home.reportIssue')}</Text>
            <Text style={styles.actionDesc}>{t('home.reportDesc')}</Text>
          </Pressable>
        </View>
      </View>

      {/* Safety Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.safetyTips')}</Text>
        <View style={styles.tips}>
          {TIPS.map((tip, i) => (
            <View key={i} style={styles.tip}>
              <Text style={styles.tipIcon}>{tip.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDesc}>{tip.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Simulate Alerts */}
      <View style={styles.fabGroup}>
        <Text style={styles.fabLabel}>⚡ {t('home.simulateAlert')}</Text>
        <View style={styles.fabButtons}>
          {MOCK_EMERGENCIES.slice(0, 4).map((emg) => (
            <Pressable
              key={emg.id}
              style={styles.fabBtn}
              onPress={() => triggerEmergency(emg)}
            >
              <Text style={styles.fabBtnText}>{EMERGENCY_ICONS[emg.type] || '⚠️'}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: 20,
    paddingTop: Spacing.lg,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  greeting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  wave: { fontSize: 32 },
  welcome: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  property: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: Colors.primaryLight,
  },
  sessionBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: Colors.surface,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sessionId: {
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: 'monospace',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    backgroundColor: 'rgba(0, 184, 148, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 184, 148, 0.2)',
    borderRadius: Radii.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  statusCardAlert: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  statusIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface2,
  },
  statusIcon: { fontSize: 24 },
  statusInfo: { flex: 1 },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  statusDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusDotSafe: {
    backgroundColor: Colors.safe,
  },
  statusDotDanger: {
    backgroundColor: Colors.danger,
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
    paddingHorizontal: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
  },
  actionCardSos: {
    backgroundColor: 'rgba(231, 76, 60, 0.12)',
    borderColor: 'rgba(231, 76, 60, 0.25)',
  },
  actionIcon: { fontSize: 32 },
  actionLabel: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  actionDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  tips: {
    gap: 12,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipIcon: {
    fontSize: 22,
    marginTop: 2,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  tipDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
  },
  fabGroup: {
    marginTop: 32,
    alignItems: 'center',
    gap: 8,
  },
  fabLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    backgroundColor: Colors.surface2,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  fabButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  fabBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabBtnText: {
    fontSize: 18,
  },
});
