import React from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { Colors, Radii, FontSizes } from '../../theme/colors';
import type { SOSRequest } from '../../types/communication';

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  active: { color: '#E74C3C', label: 'Active', icon: '🔴' },
  acknowledged: { color: '#3498DB', label: 'Acknowledged', icon: '🔵' },
  responding: { color: '#F39C12', label: 'Responding', icon: '🟡' },
  resolved: { color: '#00B894', label: 'Resolved', icon: '🟢' },
};

const CATEGORY_ICONS: Record<string, string> = {
  fire: '🔥',
  medical: '🏥',
  safety: '⚠️',
  assistance: '🙋',
};

interface SOSRequestListProps {
  requests: SOSRequest[];
  onRespond: (sosId: string) => void;
  onAcknowledge?: (sosId: string) => void;
}

export default function SOSRequestList({
  requests,
  onRespond,
  onAcknowledge,
}: SOSRequestListProps) {
  const activeRequests = requests.filter(r => r.status !== 'resolved');

  if (activeRequests.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>✅</Text>
        <Text style={styles.emptyText}>No active SOS requests</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={activeRequests}
      keyExtractor={item => item.id}
      scrollEnabled={false}
      renderItem={({ item }) => {
        const statusInfo = STATUS_CONFIG[item.status] || STATUS_CONFIG.active;
        const categoryIcon = CATEGORY_ICONS[item.category] || '🆘';
        const timeAgo = getTimeAgo(item.createdAt);

        return (
          <View style={[styles.card, { borderLeftColor: statusInfo.color }]}>
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <Text style={styles.icon}>{categoryIcon}</Text>
                <Text style={styles.category}>
                  {item.category.toUpperCase()} — {item.guestStatus.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
              <View style={[styles.statusBadge, { borderColor: statusInfo.color }]}>
                <Text style={styles.statusIcon}>{statusInfo.icon}</Text>
                <Text style={[styles.statusLabel, { color: statusInfo.color }]}>
                  {statusInfo.label}
                </Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              {item.roomNumber && (
                <Text style={styles.meta}>🚪 Room {item.roomNumber}</Text>
              )}
              {item.location?.latitude && (
                <Text style={styles.meta}>
                  📍 {item.location.latitude.toFixed(4)}, {item.location.longitude?.toFixed(4)}
                </Text>
              )}
              <Text style={styles.meta}>🕐 {timeAgo}</Text>
            </View>

            {item.status === 'active' && (
              <View style={styles.actions}>
                {onAcknowledge && (
                  <Pressable
                    style={[styles.actionBtn, styles.ackBtn]}
                    onPress={() => onAcknowledge(item.id)}
                  >
                    <Text style={styles.actionText}>Acknowledge</Text>
                  </Pressable>
                )}
                <Pressable
                  style={[styles.actionBtn, styles.respondBtn]}
                  onPress={() => onRespond(item.id)}
                >
                  <Text style={styles.actionText}>Respond</Text>
                </Pressable>
              </View>
            )}
          </View>
        );
      }}
    />
  );
}

function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  icon: {
    fontSize: 18,
  },
  category: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  statusIcon: {
    fontSize: 8,
  },
  statusLabel: {
    fontSize: 9,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  meta: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radii.sm,
    alignItems: 'center',
  },
  ackBtn: {
    backgroundColor: 'rgba(52, 152, 219, 0.15)',
  },
  respondBtn: {
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
  },
});
