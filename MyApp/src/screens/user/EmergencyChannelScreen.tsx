import React, { useEffect, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useAppContext } from '../../context/AppContext';
import { Colors, Radii, FontSizes } from '../../theme/colors';

const SOS_STEPS = [
  { status: 'active', label: 'Request received' },
  { status: 'acknowledged', label: 'Staff acknowledged' },
  { status: 'responding', label: 'Response team en route' },
  { status: 'resolved', label: 'Marked resolved' },
] as const;

const SOS_STATUS_LABEL: Record<(typeof SOS_STEPS)[number]['status'], string> = {
  active: 'Active',
  acknowledged: 'Acknowledged',
  responding: 'Responding',
  resolved: 'Resolved',
};

export default function EmergencyChannelScreen() {
  const { state, dispatch } = useAppContext();
  const announcements = useMemo(
    () =>
      [...state.broadcastMessages].sort((a, b) => a.timestamp - b.timestamp),
    [state.broadcastMessages],
  );

  const unreadAnnouncements = useMemo(
    () =>
      announcements.filter(msg => msg.timestamp > state.userLastSeenBroadcastAt)
        .length,
    [announcements, state.userLastSeenBroadcastAt],
  );

  const latestUserSOS = useMemo(
    () =>
      [...state.sosRequests]
        .filter(sos => sos.sessionId === state.guestSession.sessionId)
        .sort((a, b) => b.updatedAt - a.updatedAt)[0] ?? null,
    [state.sosRequests, state.guestSession.sessionId],
  );

  const activeSOSStepIndex = latestUserSOS
    ? SOS_STEPS.findIndex(step => step.status === latestUserSOS.status)
    : -1;

  useEffect(() => {
    if (state.mode === 'emergency' && state.emergencySubScreen === 'channel') {
      dispatch({ type: 'MARK_USER_BROADCASTS_SEEN' });
    }
  }, [state.mode, state.emergencySubScreen, announcements.length, dispatch]);

  const quickGuidance = state.activeEmergency?.instructions?.slice(0, 3) ?? [];

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🚨</Text>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Emergency Announcement Channel</Text>
          <Text style={styles.headerDesc}>
            Staff and Emergency Services can post announcements here.
          </Text>
          {unreadAnnouncements > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {unreadAnnouncements} new announcement
                {unreadAnnouncements > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.feed}
        contentContainerStyle={styles.feedContent}
      >
        {state.activeEmergency && (
          <View style={[styles.messageCard, styles.systemCard]}>
            <Text style={styles.messageSender}>System Alert</Text>
            <Text style={styles.messageText}>
              {state.activeEmergency.message}
            </Text>
            <Text style={styles.messageTime}>Now</Text>
          </View>
        )}

        {state.activeEmergency && quickGuidance.length > 0 && (
          <View style={styles.botCard}>
            <View style={styles.botHeader}>
              <Text style={styles.botTitle}>🤖 Emergency Bot Guidance</Text>
              <Text style={styles.botMeta}>Live</Text>
            </View>

            {quickGuidance.map((step, index) => (
              <View
                key={`${state.activeEmergency?.id}-step-${index}`}
                style={styles.botStepRow}
              >
                <View style={styles.botStepBadge}>
                  <Text style={styles.botStepBadgeText}>{index + 1}</Text>
                </View>
                <Text style={styles.botStepText}>{step}</Text>
              </View>
            ))}

            {(state.activeEmergency.instructions?.length ?? 0) >
              quickGuidance.length && (
              <Text style={styles.botHint}>
                +
                {(state.activeEmergency.instructions?.length ?? 0) -
                  quickGuidance.length}{' '}
                more steps available in full guidance.
              </Text>
            )}
          </View>
        )}

        <View style={styles.sosTimelineCard}>
          <View style={styles.sosTimelineHeader}>
            <Text style={styles.sosTimelineTitle}>🧭 SOS Status Timeline</Text>
            <Text style={styles.sosStatusChip}>
              {latestUserSOS
                ? SOS_STATUS_LABEL[latestUserSOS.status]
                : 'No active SOS'}
            </Text>
          </View>

          {!latestUserSOS ? (
            <Text style={styles.sosEmptyText}>
              Raise an SOS to start your response timeline. You will see staff
              acknowledgment and responder progress here.
            </Text>
          ) : (
            <>
              <View style={styles.timelineList}>
                {SOS_STEPS.map((step, index) => {
                  const isCompleted = index < activeSOSStepIndex;
                  const isCurrent = index === activeSOSStepIndex;

                  return (
                    <View key={step.status} style={styles.timelineItem}>
                      <View
                        style={[
                          styles.timelineDot,
                          isCompleted && styles.timelineDotDone,
                          isCurrent && styles.timelineDotCurrent,
                        ]}
                      />
                      <Text
                        style={[
                          styles.timelineLabel,
                          isCompleted && styles.timelineLabelDone,
                          isCurrent && styles.timelineLabelCurrent,
                        ]}
                      >
                        {step.label}
                      </Text>
                      {isCurrent && <Text style={styles.timelineNow}>Now</Text>}
                    </View>
                  );
                })}
              </View>

              <Text style={styles.sosMetaText}>
                Last update:{' '}
                {new Date(latestUserSOS.updatedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {latestUserSOS.roomNumber
                  ? ` • Room ${latestUserSOS.roomNumber}`
                  : ''}
              </Text>
            </>
          )}
        </View>

        {announcements.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>Waiting for announcements</Text>
            <Text style={styles.emptyDesc}>
              You will receive live instructions from staff and responders here.
            </Text>
          </View>
        ) : (
          announcements.map(msg => (
            <View key={msg.id} style={styles.messageCard}>
              <View style={styles.messageHead}>
                <Text style={styles.messageSender}>
                  {msg.senderRole === 'staff'
                    ? '👤 Staff'
                    : '🚨 Emergency Services'}
                </Text>
                <Text style={styles.messageTime}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <Text style={styles.messageText}>{msg.message}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerNote}>
          Need immediate help? Send SOS now. Your request goes to staff.
        </Text>
        <View style={styles.footerActions}>
          <Pressable
            style={[styles.actionBtn, styles.sosBtn]}
            onPress={() =>
              dispatch({ type: 'SET_EMERGENCY_SUB_SCREEN', payload: 'sos' })
            }
          >
            <Text style={styles.sosBtnText}>🆘 Raise SOS</Text>
          </Pressable>

          {state.activeEmergency && (
            <Pressable
              style={[styles.actionBtn, styles.guidanceBtn]}
              onPress={() =>
                dispatch({
                  type: 'SET_EMERGENCY_SUB_SCREEN',
                  payload: 'guidance',
                })
              }
            >
              <Text style={styles.guidanceBtnText}>📋 View Guidance</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: 'rgba(231, 76, 60, 0.12)',
  },
  headerIcon: {
    fontSize: 24,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSizes.md,
    fontWeight: '800',
    color: Colors.text,
  },
  headerDesc: {
    marginTop: 2,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  unreadBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(243, 156, 18, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(243, 156, 18, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  unreadBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.warning,
  },
  feed: {
    flex: 1,
  },
  feedContent: {
    padding: 16,
    gap: 10,
    paddingBottom: 28,
  },
  messageCard: {
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: 12,
  },
  systemCard: {
    borderColor: 'rgba(231, 76, 60, 0.3)',
    backgroundColor: 'rgba(231, 76, 60, 0.08)',
  },
  messageHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  messageSender: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryLight,
  },
  messageTime: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  messageText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
  },
  botCard: {
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.35)',
    backgroundColor: 'rgba(52, 152, 219, 0.08)',
    padding: 12,
    gap: 8,
  },
  botHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  botTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryLight,
  },
  botMeta: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primaryLight,
    opacity: 0.85,
  },
  botStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  botStepBadge: {
    marginTop: 1,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(52, 152, 219, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botStepBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryLight,
  },
  botStepText: {
    flex: 1,
    fontSize: 12,
    color: Colors.text,
    lineHeight: 18,
  },
  botHint: {
    marginTop: 2,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  sosTimelineCard: {
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 184, 148, 0.35)',
    backgroundColor: 'rgba(0, 184, 148, 0.08)',
    padding: 12,
    gap: 10,
  },
  sosTimelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  sosTimelineTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    color: Colors.safe,
  },
  sosStatusChip: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.safe,
    backgroundColor: 'rgba(0, 184, 148, 0.22)',
    borderColor: 'rgba(0, 184, 148, 0.45)',
    borderWidth: 1,
    borderRadius: Radii.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sosEmptyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  timelineList: {
    gap: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.textMuted,
    backgroundColor: 'transparent',
  },
  timelineDotDone: {
    borderColor: Colors.safe,
    backgroundColor: Colors.safe,
  },
  timelineDotCurrent: {
    borderColor: Colors.warning,
    backgroundColor: Colors.warning,
  },
  timelineLabel: {
    flex: 1,
    fontSize: 12,
    color: Colors.textMuted,
  },
  timelineLabelDone: {
    color: Colors.textSecondary,
  },
  timelineLabelCurrent: {
    color: Colors.text,
    fontWeight: '700',
  },
  timelineNow: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.warning,
  },
  sosMetaText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface2,
  },
  footerNote: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosBtn: {
    backgroundColor: Colors.danger,
  },
  sosBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  guidanceBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guidanceBtnText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
