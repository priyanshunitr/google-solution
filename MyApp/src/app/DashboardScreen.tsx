import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { io } from 'socket.io-client';
import { AppShell } from '../components/AppShell';
import { FeatureGrid } from '../components/FeatureGrid';
import { LiveFeed } from '../components/LiveFeed';
import { Card, SmallChip } from '../components/Primitives';
import { useAuth } from '../context/AuthContext';
import { palette, radii, spacing, typography } from '../theme/tokens';
import { FeatureKey, FeatureTile, UserRole } from '../types/app';
import { API_BASE_URL } from '../api/http';
import { GuestPanel } from './panels/GuestPanel';
import { StaffNotificationsPanel } from './panels/StaffNotificationsPanel';
import { EmergencySessionsPanel } from './panels/EmergencySessionsPanel';
import { IncidentsPanel } from './panels/IncidentsPanel';
import { ResponderPanel } from './panels/ResponderPanel';
import { CommunicationsPanel } from './panels/CommunicationsPanel';
import { DeviceTokensPanel } from './panels/DeviceTokensPanel';

const featuresByRole: Record<UserRole, FeatureTile[]> = {
  guest: [
    {
      key: 'guestOps',
      title: 'Guest SOS',
      subtitle: 'Create alerts and SOS requests',
    },
    {
      key: 'communications',
      title: 'Comms',
      subtitle: 'Read broadcasts and send direct messages',
    },
    {
      key: 'deviceTokens',
      title: 'My Device',
      subtitle: 'Register push delivery channel',
    },
  ],
  staff: [
    {
      key: 'staffNotifications',
      title: 'Staff Alerts',
      subtitle: 'Verify and escalate notifications',
    },
    {
      key: 'emergencySessions',
      title: 'Sessions',
      subtitle: 'Control emergency lifecycle',
    },
    {
      key: 'incidents',
      title: 'Incidents',
      subtitle: 'Update field response state',
    },
    {
      key: 'communications',
      title: 'Comms',
      subtitle: 'Broadcast and private channels',
    },
    {
      key: 'deviceTokens',
      title: 'Devices',
      subtitle: 'Push token controls',
    },
  ],
  responder: [
    {
      key: 'responderOps',
      title: 'Responder Ops',
      subtitle: 'Escalation and incident ownership',
    },
    {
      key: 'incidents',
      title: 'Incidents',
      subtitle: 'Shared incident board',
    },
    {
      key: 'communications',
      title: 'Comms',
      subtitle: 'Broadcast and channel messages',
    },
    {
      key: 'deviceTokens',
      title: 'Devices',
      subtitle: 'Push token controls',
    },
  ],
  admin: [
    {
      key: 'emergencySessions',
      title: 'Sessions',
      subtitle: 'Activate and resolve emergencies',
    },
    {
      key: 'incidents',
      title: 'Incidents',
      subtitle: 'Global incident board',
    },
    {
      key: 'communications',
      title: 'Comms',
      subtitle: 'Cross-role emergency messaging',
    },
    {
      key: 'deviceTokens',
      title: 'Devices',
      subtitle: 'Token management and diagnostics',
    },
    {
      key: 'staffNotifications',
      title: 'Staff Alerts',
      subtitle: 'Monitor team escalations',
    },
  ],
};

const feedEvents = [
  'staff:new-notification',
  'emergency:new-broadcast',
  'emergency:new-private-message',
  'incident:updated',
];

export function DashboardScreen() {
  const { user, logout } = useAuth();
  const [mode, setMode] = useState<'overview' | 'control'>('overview');
  const [activeFeature, setActiveFeature] = useState<FeatureKey>('guestOps');
  const [realtimeEvents, setRealtimeEvents] = useState<string[]>([]);

  const role = user?.role || 'guest';
  const roleFeatures = featuresByRole[role];

  useEffect(() => {
    setActiveFeature(roleFeatures[0].key);
  }, [role, roleFeatures]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const socket = io(API_BASE_URL, {
      transports: ['websocket'],
      query: {
        role: user.role,
        userId: user.id,
      },
      withCredentials: true,
    });

    const pushEvent = (name: string) => {
      setRealtimeEvents(prev =>
        [`${name} at ${new Date().toLocaleTimeString()}`, ...prev].slice(0, 16),
      );
    };

    feedEvents.forEach(eventName => {
      socket.on(eventName, () => pushEvent(eventName));
    });

    socket.on('connect', () => {
      pushEvent('socket:connected');
    });

    socket.on('disconnect', () => {
      pushEvent('socket:disconnected');
    });

    return () => {
      feedEvents.forEach(eventName => socket.off(eventName));
      socket.disconnect();
    };
  }, [user]);

  const activeTitle = useMemo(() => {
    const found = roleFeatures.find(tile => tile.key === activeFeature);
    return found?.title || 'Module';
  }, [activeFeature, roleFeatures]);

  const panel = useMemo(() => {
    switch (activeFeature) {
      case 'guestOps':
        return <GuestPanel />;
      case 'staffNotifications':
        return <StaffNotificationsPanel />;
      case 'emergencySessions':
        return <EmergencySessionsPanel />;
      case 'incidents':
        return <IncidentsPanel />;
      case 'responderOps':
        return <ResponderPanel />;
      case 'communications':
        return <CommunicationsPanel role={role} />;
      case 'deviceTokens':
        return <DeviceTokensPanel />;
      default:
        return <GuestPanel />;
    }
  }, [activeFeature, role]);

  if (!user) {
    return null;
  }

  return (
    <AppShell
      name={user.full_name?.split(' ')[0] || 'Operator'}
      role={role}
      mode={mode}
      onModeChange={setMode}
      onLogout={logout}
      realtimeCount={realtimeEvents.length}
    >
      {mode === 'overview' ? (
        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <FeatureGrid
            tiles={roleFeatures}
            active={activeFeature}
            onSelect={next => {
              setActiveFeature(next as FeatureKey);
              setMode('control');
            }}
          />

          <Card dark>
            <Text style={styles.controlTitle}>Control Signal</Text>

            <View style={styles.dialWrap}>
              <View style={styles.dialOuter}>
                <View style={styles.dialInner}>
                  <Text style={styles.dialValue}>80%</Text>
                  <Text style={styles.dialLabel}>readiness</Text>
                </View>
              </View>
            </View>

            <View style={styles.dialBottomRow}>
              <SmallChip text="Min" />
              <SmallChip text="Max" accent />
            </View>
          </Card>

          <LiveFeed events={realtimeEvents} />
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <Card>
            <Text style={styles.panelHeadline}>{activeTitle}</Text>
            <Text style={styles.panelSubline}>
              Bound to backend routes and role permissions in current session
            </Text>
          </Card>

          {panel}
        </ScrollView>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  controlTitle: {
    color: '#f1f2f3',
    fontSize: typography.body,
    fontWeight: '700',
  },
  dialWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  dialOuter: {
    width: 190,
    height: 190,
    borderRadius: radii.pill,
    borderWidth: 8,
    borderColor: palette.accent,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#202227',
  },
  dialInner: {
    width: 145,
    height: 145,
    borderRadius: radii.pill,
    borderWidth: 4,
    borderColor: '#3f434b',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2d33',
  },
  dialValue: {
    color: '#f9fafb',
    fontSize: 34,
    fontWeight: '800',
  },
  dialLabel: {
    color: '#c7ccd4',
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dialBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  panelHeadline: {
    color: palette.ink,
    fontSize: typography.heading,
    fontWeight: '800',
  },
  panelSubline: {
    color: palette.inkMuted,
    fontSize: typography.caption,
  },
});
