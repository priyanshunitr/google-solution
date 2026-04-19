import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert as RNAlert,
  Platform,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { io, type Socket } from 'socket.io-client';
import { useAppContext, getBackendBaseUrl } from '../../context/AppContext';
import { Colors, Radii, FontSizes } from '../../theme/colors';
import AlertCard from '../../components/staff/AlertCard';
import AlertFilterBar from '../../components/staff/AlertFilterBar';
import BroadcastComposer from '../../components/staff/BroadcastComposer';
import SOSRequestList from '../../components/staff/SOSRequestList';
import PrivateChat from '../../components/shared/PrivateChat';
import MapView from '../../components/shared/MapView';
import type { AlertFilter } from '../../types/communication';

type StaffTab = 'alerts' | 'map' | 'comms';

type StaffNotification = {
  notificationId: string;
  title: string | null;
  body: string;
  createdAt?: string;
  data?: Record<string, unknown>;
};


export default function StaffDashboardScreen() {
  const {
    state,
    setRole,
    mockRespondToAlert,
    mockEscalateAlert,
    mockTriggerEmergencyMode,
    mockDeactivateEmergency,
    mockSendAnnouncement,
    mockRespondToSOS,
    mockSendPrivateMessage,
  } = useAppContext();
  const [activeTab, setActiveTab] = useState<StaffTab>('alerts');
  const [filter, setFilter] = useState<AlertFilter>({
    type: 'all',
    severity: 'all',
    status: 'all',
    roomNumber: '',
  });
  const shownNotificationIdsRef = useRef<Set<string>>(new Set());
  const popupQueueRef = useRef<StaffNotification[]>([]);
  const popupOpenRef = useRef(false);
  const socketRef = useRef<Socket | null>(null);
  const [issueModalVisible, setIssueModalVisible] = useState(false);
  const [issueText, setIssueText] = useState('');
  const [selectedNotification, setSelectedNotification] =
    useState<StaffNotification | null>(null);
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);

  const markNotificationSeen = useCallback(async (notificationId: string) => {
    try {
      await fetch(
        `${getBackendBaseUrl()}/api/staffs/notifications/${notificationId}/seen`,
        {
          method: 'PATCH',
          credentials: 'include',
        },
      );
    } catch (error) {
      console.warn('[StaffNotifications] mark seen failed', error);
    }
  }, []);

  const markNotificationFalse = useCallback(async (notificationId: string) => {
    try {
      await fetch(
        `${getBackendBaseUrl()}/api/staffs/notifications/${notificationId}/false`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        },
      );
    } catch (error) {
      console.warn('[StaffNotifications] false action failed', error);
    }
  }, []);

  const showNextNotificationPopup = useCallback(() => {
    if (popupOpenRef.current) {
      return;
    }

    const next = popupQueueRef.current.shift();
    if (!next) {
      return;
    }

    popupOpenRef.current = true;

    RNAlert.alert(
      next.title || 'New Alert',
      next.body,
      [
        {
          text: 'False',
          style: 'destructive',
          onPress: () => {
            void markNotificationFalse(next.notificationId);
            void markNotificationSeen(next.notificationId);
            popupOpenRef.current = false;
            showNextNotificationPopup();
          },
        },
        {
          text: 'Verify',
          onPress: () => {
            const guestMessageRaw = next.data?.guest_message;
            const guestMessage =
              typeof guestMessageRaw === 'string' && guestMessageRaw.length > 0
                ? guestMessageRaw
                : next.body;

            setSelectedNotification(next);
            setIssueText(guestMessage);
            setIssueModalVisible(true);
          },
        },
      ],
      {
        cancelable: false,
      },
    );
  }, [markNotificationFalse, markNotificationSeen]);

  const sendToEmergencyServices = useCallback(async () => {
    if (!selectedNotification || !issueText.trim()) {
      return;
    }

    setIsSubmittingIssue(true);

    try {
      const response = await fetch(
        `${getBackendBaseUrl()}/api/staffs/notifications/${
          selectedNotification.notificationId
        }/send-emergency`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ issueText: issueText.trim() }),
        },
      );

      if (!response.ok) {
        throw new Error('Escalation request failed');
      }

      setIssueModalVisible(false);
      setIssueText('');
      setSelectedNotification(null);
    } catch (error) {
      console.warn('[StaffNotifications] send emergency failed', error);
      RNAlert.alert(
        'Failed',
        'Unable to send to emergency services right now.',
      );
    } finally {
      setIsSubmittingIssue(false);
      popupOpenRef.current = false;
      showNextNotificationPopup();
    }
  }, [issueText, selectedNotification, showNextNotificationPopup]);

  useEffect(() => {
    const socket = io(getBackendBaseUrl(), {
      transports: ['websocket'],
      query: { role: 'staff' },
    });

    socketRef.current = socket;

    socket.on('staff:new-notification', (incoming: StaffNotification) => {
      const notificationId = incoming.notificationId;

      if (
        !notificationId ||
        shownNotificationIdsRef.current.has(notificationId)
      ) {
        return;
      }

      shownNotificationIdsRef.current.add(notificationId);
      popupQueueRef.current.push(incoming);
      showNextNotificationPopup();
    });

    return () => {
      socket.off('staff:new-notification');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [showNextNotificationPopup]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    let result = [...state.incomingAlerts];

    if (filter.type && filter.type !== 'all') {
      result = result.filter(a => a.type === filter.type);
    }
    if (filter.severity && filter.severity !== 'all') {
      result = result.filter(a => a.severity === filter.severity);
    }
    if (filter.status && filter.status !== 'all') {
      result = result.filter(a => a.status === filter.status);
    }
    if (filter.roomNumber) {
      const q = filter.roomNumber.toLowerCase();
      result = result.filter(a => a.roomNumber?.toLowerCase().includes(q));
    }

    return result.sort((a, b) => b.createdAt - a.createdAt);
  }, [state.incomingAlerts, filter]);

  const filteredSOS = useMemo(() => {
    let result = [...state.sosRequests];
    if (filter.roomNumber) {
      const q = filter.roomNumber.toLowerCase();
      result = result.filter(s => s.roomNumber?.toLowerCase().includes(q));
    }
    return result;
  }, [state.sosRequests, filter.roomNumber]);

  // Stats
  const pendingCount = state.incomingAlerts.filter(
    a => a.status === 'pending',
  ).length;
  const activeSOSCount = state.sosRequests.filter(
    s => s.status === 'active',
  ).length;
  const escalatedCount = state.incomingAlerts.filter(
    a => a.status === 'escalated',
  ).length;

  // ── Handlers ──────────────────────────────────────────────

  const handleRespond = (alertId: string) => {
    mockRespondToAlert(alertId, 'Acknowledged by staff', 'acknowledged');
  };

  const handleEscalate = (alertId: string) => {
    RNAlert.alert(
      'Escalate Alert',
      'This will forward the alert to Emergency Services. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Escalate',
          style: 'destructive',
          onPress: () =>
            mockEscalateAlert(
              alertId,
              'Escalated by staff - requires emergency response',
            ),
        },
      ],
    );
  };

  const handleResolve = (alertId: string) => {
    mockRespondToAlert(alertId, 'Resolved by staff', 'resolved');
  };

  const handleTriggerEmergency = () => {
    RNAlert.alert(
      '🚨 Activate Emergency Mode',
      'This will broadcast an emergency alert to ALL users and Emergency Services. This action cannot be undone easily.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'ACTIVATE',
          style: 'destructive',
          onPress: () => {
            mockTriggerEmergencyMode({
              type: 'evacuation',
              severity: 'critical',
              message:
                'Emergency alert issued by staff. Please follow all instructions immediately.',
              instructions: [
                'Stay calm and alert others nearby',
                'Follow staff instructions',
                'Proceed to the nearest emergency exit',
                'Gather at the assembly point',
              ],
            });
          },
        },
      ],
    );
  };

  const handleDeactivateEmergency = () => {
    RNAlert.alert(
      'Deactivate Emergency Mode',
      'Are you sure you want to end the emergency? All users will be notified.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Deactivate', onPress: () => mockDeactivateEmergency() },
      ],
    );
  };

  const handleSOSRespond = (sosId: string) => {
    mockRespondToSOS(sosId, 'Help is on the way', 'responding');
  };

  const handleSOSAcknowledge = (sosId: string) => {
    mockRespondToSOS(sosId, 'SOS acknowledged', 'acknowledged');
  };

  // ── Tabs ──────────────────────────────────────────────────

  const TABS: { key: StaffTab; icon: string; label: string }[] = [
    { key: 'alerts', icon: '🔔', label: 'Alerts' },
    { key: 'map', icon: '🗺️', label: 'Map' },
    { key: 'comms', icon: '💬', label: 'Comms' },
  ];

  return (
    <>
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Staff Dashboard</Text>
            <View style={styles.headerMeta}>
              <Text style={styles.headerSubtitle}>The Grand Azure Resort</Text>
              <View style={[styles.connDot, styles.connDotOn]} />
            </View>
          </View>
          <Pressable style={styles.switchBtn} onPress={() => setRole(null)}>
            <Text style={styles.switchText}>Switch Role</Text>
          </Pressable>
        </View>

        {/* Emergency Mode Banner */}
        {state.isEmergencyMode && (
          <View style={styles.emergencyBanner}>
            <Text style={styles.emergencyBannerIcon}>🚨</Text>
            <View style={styles.emergencyBannerInfo}>
              <Text style={styles.emergencyBannerTitle}>
                EMERGENCY MODE ACTIVE
              </Text>
              <Text style={styles.emergencyBannerDesc}>
                All users have been notified
              </Text>
            </View>
            <Pressable
              style={styles.deactivateBtn}
              onPress={handleDeactivateEmergency}
            >
              <Text style={styles.deactivateText}>END</Text>
            </Pressable>
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text
              style={[
                styles.statValue,
                pendingCount > 0 && styles.statValueWarning,
              ]}
            >
              {pendingCount}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statBox}>
            <Text
              style={[
                styles.statValue,
                activeSOSCount > 0 && styles.statValueDanger,
              ]}
            >
              {activeSOSCount}
            </Text>
            <Text style={styles.statLabel}>SOS</Text>
          </View>
          <View style={styles.statBox}>
            <Text
              style={[
                styles.statValue,
                escalatedCount > 0 && styles.statValueDanger,
              ]}
            >
              {escalatedCount}
            </Text>
            <Text style={styles.statLabel}>Escalated</Text>
          </View>
          <Pressable
            style={[styles.statBox, styles.emergencyBox]}
            onPress={
              state.isEmergencyMode
                ? handleDeactivateEmergency
                : handleTriggerEmergency
            }
          >
            <Text style={styles.emergencyIcon}>🚨</Text>
            <Text style={styles.emergencyLabel}>
              {state.isEmergencyMode ? 'End' : 'Emergency'}
            </Text>
          </Pressable>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          {TABS.map(tab => (
            <Pressable
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab.key && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Tab Content */}
        <ScrollView contentContainerStyle={styles.content}>
          {activeTab === 'alerts' && (
            <>
              <AlertFilterBar filter={filter} onFilterChange={setFilter} />

              {/* SOS Section */}
              {activeSOSCount > 0 && (
                <>
                  <Text style={styles.sectionTitle}>
                    🆘 Active SOS Requests
                  </Text>
                  <SOSRequestList
                    requests={filteredSOS}
                    onRespond={handleSOSRespond}
                    onAcknowledge={handleSOSAcknowledge}
                  />
                </>
              )}

              {/* Alert Feed */}
              <Text style={styles.sectionTitle}>
                📋 Alerts ({filteredAlerts.length})
              </Text>
              {filteredAlerts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>✅</Text>
                  <Text style={styles.emptyText}>
                    No alerts match your filters
                  </Text>
                </View>
              ) : (
                filteredAlerts.map(alert => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onRespond={handleRespond}
                    onEscalate={handleEscalate}
                    onResolve={handleResolve}
                  />
                ))
              )}
            </>
          )}

          {activeTab === 'map' && (
            <MapView
              alerts={filteredAlerts.filter(a => a.status !== 'resolved')}
              sosRequests={filteredSOS.filter(s => s.status !== 'resolved')}
              title="Property Alert Map (Filtered)"
            />
          )}

          {activeTab === 'comms' && (
            <>
              {/* Broadcast Composer */}
              <BroadcastComposer
                onSend={mockSendAnnouncement}
                label="Broadcast to All Users"
              />

              {/* Recent Broadcasts */}
              {state.broadcastMessages.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>📢 Recent Broadcasts</Text>
                  {state.broadcastMessages
                    .slice(-5)
                    .reverse()
                    .map(msg => (
                      <View key={msg.id} style={styles.broadcastItem}>
                        <View style={styles.broadcastHeader}>
                          <Text style={styles.broadcastSender}>
                            {msg.senderRole === 'staff'
                              ? '👤 Staff'
                              : '🚨 Responder'}
                          </Text>
                          <Text style={styles.broadcastTime}>
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                        <Text style={styles.broadcastText}>{msg.message}</Text>
                      </View>
                    ))}
                </>
              )}

              {/* Private Channel */}
              <Text style={styles.sectionTitle}>
                🔒 Emergency Services Channel
              </Text>
              <PrivateChat
                messages={state.privateMessages}
                onSend={mockSendPrivateMessage}
                currentRole="staff"
                otherRoleLabel="Emergency Services"
              />
            </>
          )}
        </ScrollView>
      </View>

      <Modal
        visible={issueModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          if (isSubmittingIssue) {
            return;
          }

          setIssueModalVisible(false);
          setSelectedNotification(null);
          setIssueText('');
          popupOpenRef.current = false;
          showNextNotificationPopup();
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Issue</Text>
            <Text style={styles.modalSubtitle}>
              Edit guest text if needed, then send to emergency services.
            </Text>

            <TextInput
              value={issueText}
              onChangeText={setIssueText}
              placeholder="Describe the verified issue"
              placeholderTextColor={Colors.textMuted}
              style={styles.issueInput}
              multiline
              textAlignVertical="top"
              editable={!isSubmittingIssue}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnSecondary]}
                disabled={isSubmittingIssue}
                onPress={() => {
                  setIssueModalVisible(false);
                  setSelectedNotification(null);
                  setIssueText('');
                  popupOpenRef.current = false;
                  showNextNotificationPopup();
                }}
              >
                <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                disabled={isSubmittingIssue || !issueText.trim()}
                onPress={() => {
                  void sendToEmergencyServices();
                }}
              >
                {isSubmittingIssue ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalBtnPrimaryText}>
                    Send to Emergency Services
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 56,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: Colors.text,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  connDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connDotOn: {
    backgroundColor: '#00B894',
  },
  connDotOff: {
    backgroundColor: '#E74C3C',
  },
  switchBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.surface2,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  switchText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(231, 76, 60, 0.3)',
    gap: 10,
  },
  emergencyBannerIcon: {
    fontSize: 24,
  },
  emergencyBannerInfo: {
    flex: 1,
  },
  emergencyBannerTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.danger,
    letterSpacing: 1,
  },
  emergencyBannerDesc: {
    fontSize: 10,
    color: Colors.danger,
    opacity: 0.8,
  },
  deactivateBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: Colors.danger,
    borderRadius: Radii.sm,
  },
  deactivateText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.text,
  },
  statValueWarning: {
    color: Colors.warning,
  },
  statValueDanger: {
    color: Colors.danger,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  emergencyBox: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  emergencyIcon: {
    fontSize: 18,
  },
  emergencyLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.danger,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabIcon: {
    fontSize: 14,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabLabelActive: {
    color: Colors.primaryLight,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 12,
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyIcon: {
    fontSize: 28,
    marginBottom: 8,
    opacity: 0.5,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  issueInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    backgroundColor: Colors.surface2,
    color: Colors.text,
    padding: 12,
    fontSize: FontSizes.sm,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  modalBtn: {
    flex: 1,
    borderRadius: Radii.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnPrimary: {
    backgroundColor: Colors.danger,
  },
  modalBtnPrimaryText: {
    color: '#fff',
    fontSize: FontSizes.xs,
    fontWeight: '800',
  },
  modalBtnSecondary: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalBtnSecondaryText: {
    color: Colors.textMuted,
    fontSize: FontSizes.xs,
    fontWeight: '700',
  },
  broadcastItem: {
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
