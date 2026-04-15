import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useAppContext } from '../../context/AppContext';

import { Colors, Radii, FontSizes } from '../../theme/colors';
import AlertCard from '../../components/staff/AlertCard';
import BroadcastComposer from '../../components/staff/BroadcastComposer';
import PrivateChat from '../../components/shared/PrivateChat';
import MapView from '../../components/shared/MapView';

type ResponderTab = 'incidents' | 'map' | 'comms';

export default function ResponderDashboardScreen() {
  const { 
    state, 
    setRole, 
    mockResponderUpdateAlert, 
    mockSendAnnouncement, 
    mockSendPrivateMessage 
  } = useAppContext();
  const [activeTab, setActiveTab] = useState<ResponderTab>('incidents');

  // Stats
  const escalatedCount = state.escalatedAlerts.filter(a => a.status === 'escalated').length;
  const activeIncidents = state.escalatedAlerts.filter(a => a.status !== 'resolved').length;
  const sosCount = state.sosRequests.filter(s => s.status !== 'resolved').length;

  // Handlers
  const handleAcknowledge = (alertId: string) => {
    mockResponderUpdateAlert(alertId, 'acknowledged', 'Acknowledged by responder unit');
  };

  const handleResolve = (alertId: string) => {
    mockResponderUpdateAlert(alertId, 'resolved', 'Resolved by responder unit');
  };

  const TABS: { key: ResponderTab; icon: string; label: string }[] = [
    { key: 'incidents', icon: '🚨', label: 'Incidents' },
    { key: 'map', icon: '🗺️', label: 'Map' },
    { key: 'comms', icon: '💬', label: 'Comms' },
  ];

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerIcon}>🚨</Text>
            <View>
              <Text style={styles.headerTitle}>Emergency Command</Text>
              <View style={styles.headerMeta}>
                <Text style={styles.headerSubtitle}>Responder Unit — Active</Text>
                <View style={[styles.connDot, styles.connDotOn]} />
              </View>
            </View>
          </View>
        </View>
        <Pressable style={styles.switchBtn} onPress={() => setRole(null)}>
          <Text style={styles.switchText}>Release Unit</Text>
        </Pressable>
      </View>

      {/* Emergency Mode Banner */}
      {state.isEmergencyMode && (
        <View style={styles.emergencyBanner}>
          <Text style={styles.emergencyBannerIcon}>⚡</Text>
          <View style={styles.emergencyBannerInfo}>
            <Text style={styles.emergencyBannerTitle}>EMERGENCY MODE ACTIVE</Text>
            <Text style={styles.emergencyBannerDesc}>Staff has activated emergency protocols</Text>
          </View>
        </View>
      )}

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, escalatedCount > 0 && styles.statBoxDanger]}>
          <Text style={[styles.statValue, escalatedCount > 0 && styles.statValueDanger]}>
            {escalatedCount}
          </Text>
          <Text style={[styles.statLabel, escalatedCount > 0 && styles.statLabelDanger]}>
            Escalated
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{activeIncidents}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={[styles.statBox, sosCount > 0 && styles.statBoxDanger]}>
          <Text style={[styles.statValue, sosCount > 0 && styles.statValueDanger]}>
            {sosCount}
          </Text>
          <Text style={[styles.statLabel, sosCount > 0 && styles.statLabelDanger]}>
            SOS
          </Text>
        </View>
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
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'incidents' && (
          <>
            <Text style={styles.sectionTitle}>
              ⬆ Escalated Alerts ({state.escalatedAlerts.filter(a => a.status !== 'resolved').length})
            </Text>

            {state.escalatedAlerts.filter(a => a.status !== 'resolved').length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyText}>No escalated incidents</Text>
                <Text style={styles.emptyHint}>
                  Alerts escalated by Staff will appear here. Direct user alerts are NOT shown unless escalated.
                </Text>
              </View>
            ) : (
              state.escalatedAlerts
                .filter(a => a.status !== 'resolved')
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .map(alert => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onRespond={handleAcknowledge}
                    onResolve={handleResolve}
                    showActions={alert.status !== 'resolved'}
                  />
                ))
            )}

            {/* Resolved incidents */}
            {state.escalatedAlerts.filter(a => a.status === 'resolved').length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                  ✅ Resolved ({state.escalatedAlerts.filter(a => a.status === 'resolved').length})
                </Text>
                {state.escalatedAlerts
                  .filter(a => a.status === 'resolved')
                  .slice(0, 5)
                  .map(alert => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      showActions={false}
                    />
                  ))}
              </>
            )}
          </>
        )}

        {activeTab === 'map' && (
          <MapView
            alerts={state.escalatedAlerts.filter(a => a.status !== 'resolved')}
            title="Incident Map — Escalated Alerts"
          />
        )}

        {activeTab === 'comms' && (
          <>
            {/* Broadcast to users */}
            <BroadcastComposer
              onSend={mockSendAnnouncement}
              label="Public Announcement"
              placeholder="Announce to all users..."
            />

            {/* Recent Broadcasts */}
            {state.broadcastMessages.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>📢 Recent Broadcasts</Text>
                {state.broadcastMessages.slice(-5).reverse().map(msg => (
                  <View key={msg.id} style={styles.broadcastItem}>
                    <View style={styles.broadcastHeader}>
                      <Text style={styles.broadcastSender}>
                        {msg.senderRole === 'staff' ? '👤 Staff' : '🚨 Responder'}
                      </Text>
                      <Text style={styles.broadcastTime}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <Text style={styles.broadcastText}>{msg.message}</Text>
                  </View>
                ))}
              </>
            )}

            {/* Private Channel with Staff */}
            <Text style={styles.sectionTitle}>🔒 Staff Communication</Text>
            <PrivateChat
              messages={state.privateMessages}
              onSend={mockSendPrivateMessage}
              currentRole="responder"
              otherRoleLabel="Staff Admin"
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 56,
    backgroundColor: 'rgba(231, 76, 60, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(231, 76, 60, 0.2)',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    fontSize: 26,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.danger,
    fontWeight: '700',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  switchText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(231, 76, 60, 0.4)',
    gap: 10,
  },
  emergencyBannerIcon: {
    fontSize: 22,
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
    fontSize: 10,
    color: Colors.danger,
    opacity: 0.8,
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
    paddingVertical: 14,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statBoxDanger: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 2,
  },
  statValueDanger: {
    color: Colors.danger,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  statLabelDanger: {
    color: Colors.danger,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: 'rgba(26, 29, 39, 0.8)',
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
    borderBottomColor: Colors.danger,
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
    color: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    fontWeight: '600',
  },
  emptyHint: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 15,
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
