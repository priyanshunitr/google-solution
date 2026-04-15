import React, { useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import { type IssueCategory } from '../../data/mockEmergencies';
import { Colors, Radii, Spacing } from '../../theme/colors';

export default function SOSScreen() {
  const {
    state,
    dispatch,
    sendSOS,
    mockSendSOS,
    fetchLocation,
    requestLocationPermission,
  } = useAppContext();
  const { t } = useTranslation();

  const toIssueCategory = (type?: string): IssueCategory => {
    if (
      type === 'fire' ||
      type === 'medical' ||
      type === 'safety' ||
      type === 'assistance'
    ) {
      return type;
    }
    if (type === 'evacuation' || type === 'lockdown' || type === 'weather') {
      return 'safety';
    }
    return 'safety';
  };

  // Attempt to grab a fresh location when the SOS screen mounts
  useEffect(() => {
    (async () => {
      try {
        const granted = await requestLocationPermission();
        if (granted) {
          await fetchLocation();
        }
      } catch (err) {
        console.warn('[SOSScreen] Location fetch on mount failed:', err);
      }
    })();
  }, [requestLocationPermission, fetchLocation]);

  /**
   * Navigate "back" from SOS screen.
   * - If SOS was triggered from Home (no active emergency), return to normal mode.
   * - If SOS was triggered from an alert, go back to the alert sub-screen.
   */
  const handleGoBack = () => {
    if (state.isEmergencyMode) {
      dispatch({ type: 'SET_EMERGENCY_SUB_SCREEN', payload: 'channel' });
      return;
    }

    if (state.sosTriggerSource === 'home' || !state.activeEmergency) {
      dispatch({ type: 'RETURN_TO_NORMAL' });
    } else {
      dispatch({ type: 'SET_EMERGENCY_SUB_SCREEN', payload: 'alert' });
    }
  };

  /** Send the SOS signal — fetches location first if possible */
  const handleSendSOS = async () => {
    try {
      // Try to get latest position before sending
      await fetchLocation();
    } catch {
      console.warn('[SOSScreen] Could not get location before SOS');
    }

    const category = toIssueCategory(state.activeEmergency?.type);
    const guestStatus = state.guestStatus || 'need_help';

    // Update local SOS state for immediate UI feedback.
    sendSOS(category, guestStatus);

    mockSendSOS({
      category,
      guestStatus,
      location: state.location,
      roomNumber: state.guestSession.roomNumber,
    });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable style={styles.back} onPress={handleGoBack}>
        <Text style={styles.backText}>← {t('back')}</Text>
      </Pressable>

      {state.activeEmergency && (
        <Text style={styles.tag}>
          🔥 {t(`emergency.${state.activeEmergency.type}`)}
        </Text>
      )}

      <Text style={styles.title}>{t('sos.title')}</Text>

      {!state.sosActive ? (
        <View style={styles.btnWrap}>
          {/* Decorative rings */}
          <View style={styles.ring} />
          <View style={styles.ring2} />
          <Pressable style={styles.sosBtn} onPress={handleSendSOS}>
            <Text style={styles.sosText}>SOS</Text>
            <Text style={styles.sosSub}>{t('sos.tapToSend')}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.sent}>
          <Text style={styles.sentIcon}>✅</Text>
          <Text style={styles.sentTitle}>{t('sos.helpRequested')}</Text>
          <Text style={styles.sentDesc}>{t('sos.helpDesc')}</Text>

          {/* Show location info if available */}
          {state.location.latitude !== null && (
            <View style={styles.locationBadge}>
              <Text style={styles.locationBadgeText}>
                📍 {state.location.latitude.toFixed(4)},{' '}
                {state.location.longitude?.toFixed(4)}
                {state.location.accuracy > 0
                  ? ` (±${Math.round(state.location.accuracy)}m)`
                  : ''}
              </Text>
            </View>
          )}

          <View style={styles.sentActions}>
            <Pressable
              style={[styles.btn, styles.btnSafe]}
              onPress={() => dispatch({ type: 'RESOLVE_EMERGENCY' })}
            >
              <Text style={styles.btnSafeText}>✅ {t('sos.imSafeNow')}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {!state.sosActive && (
        <Pressable
          style={[styles.btn, styles.btnCancel]}
          onPress={handleGoBack}
        >
          <Text style={styles.btnCancelText}>{t('sos.cancelSOS')}</Text>
        </Pressable>
      )}

      <View style={styles.locationInfo}>
        {state.location.latitude === null && (
          <Text style={styles.locationWarn}>⚠️ {t('sos.locationWarn')}</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  content: {
    padding: 20,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
    alignItems: 'center',
  },
  back: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Radii.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  backText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tag: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.danger,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 28,
  },
  btnWrap: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  ring: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 90,
    borderWidth: 2,
    borderColor: Colors.danger,
    opacity: 0.3,
  },
  ring2: {
    position: 'absolute',
    width: '85%',
    height: '85%',
    borderRadius: 77,
    borderWidth: 2,
    borderColor: Colors.danger,
    opacity: 0.15,
  },
  sosBtn: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  sosText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 4,
  },
  sosSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  sent: {
    alignItems: 'center',
    paddingVertical: 28,
    width: '100%',
  },
  sentIcon: { fontSize: 64, marginBottom: 16 },
  sentTitle: {
    fontSize: 24,
    color: Colors.safe,
    fontWeight: '800',
    marginBottom: 8,
  },
  sentDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  sentActions: { width: '100%', gap: 10, marginTop: 24 },
  locationBadge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(0, 184, 148, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 184, 148, 0.25)',
    borderRadius: Radii.full,
    marginBottom: 8,
  },
  locationBadgeText: {
    fontSize: 11,
    color: Colors.safe,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  btn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: Radii.md,
    alignItems: 'center',
  },
  btnSafe: { backgroundColor: Colors.safe },
  btnSafeText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnCancelText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '700',
  },
  locationInfo: { width: '100%' },
  locationWarn: {
    fontSize: 12,
    color: Colors.warning,
    textAlign: 'center',
    marginTop: 8,
  },
});
