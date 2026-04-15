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
      {/* Emergency Mode Banner */}
      {state.isEmergencyMode && (
        <View style={styles.emergencyBanner}>
          <Text style={styles.emergencyBannerIcon}>🚨</Text>
          <View style={styles.emergencyBannerInfo}>
            <Text style={styles.emergencyBannerTitle}>EMERGENCY MODE ACTIVE</Text>
            <Text style={styles.emergencyBannerDesc}>
              Follow all staff instructions. Check announcements below.
            </Text>
          </View>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Text style={styles.wave}>👋</Text>
          <View>
            <Text style={styles.welcome}>{t('home.welcome')}</Text>
            <Text style={styles.property}>{state.guestSession.propertyName}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {state.guestStatus && state.guestStatus !== 'need_help' && (
            <View style={[styles.statusPill, state.guestStatus === 'safe' ? styles.statusPillSafe : styles.statusPillActive]}>
              <Text style={styles.statusPillText}>
                {state.guestStatus.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.sessionBadge}>
            <Text style={styles.sessionId}>ID: {state.guestSession.sessionId}</Text>
          </View>
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

      {/* Broadcast Announcements */}
      {state.broadcastMessages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📢 Announcements</Text>
          {state.broadcastMessages.slice(-3).reverse().map(msg => (
            <View key={msg.id} style={styles.broadcastCard}>
              <View style={styles.broadcastHeader}>
                <Text style={styles.broadcastSender}>
                  {msg.senderRole === 'staff' ? '👤 Staff' : '🚨 Emergency Services'}
                </Text>
                <Text style={styles.broadcastTime}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Text style={styles.broadcastText}>{msg.message}</Text>
            </View>
          ))}
        </View>
      )}

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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  statusPillActive: {
    backgroundColor: 'rgba(243, 156, 18, 0.15)',
    borderColor: 'rgba(243, 156, 18, 0.4)',
  },
  statusPillSafe: {
    backgroundColor: 'rgba(0, 184, 148, 0.15)',
    borderColor: 'rgba(0, 184, 148, 0.4)',
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.5,
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
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: 'rgba(231, 76, 60, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.3)',
    borderRadius: Radii.lg,
    marginBottom: Spacing.md,
  },
  emergencyBannerIcon: {
    fontSize: 28,
  },
  emergencyBannerInfo: {
    flex: 1,
  },
  emergencyBannerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.danger,
    letterSpacing: 1,
  },
  emergencyBannerDesc: {
    fontSize: 11,
    color: Colors.danger,
    opacity: 0.8,
    marginTop: 2,
  },
  broadcastCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 8,
  },
  broadcastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  broadcastSender: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primaryLight,
  },
  broadcastTime: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  broadcastText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    lineHeight: 18,
  },
});
