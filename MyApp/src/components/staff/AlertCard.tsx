import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors, Radii, FontSizes } from '../../theme/colors';
import type { Alert } from '../../types/communication';

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  fire: { icon: '🔥', color: '#E74C3C', label: 'Fire' },
  medical: { icon: '🏥', color: '#3498DB', label: 'Medical' },
  safety: { icon: '⚠️', color: '#F39C12', label: 'Safety' },
  assistance: { icon: '🙋', color: '#6C5CE7', label: 'Assistance' },
  sos: { icon: '🆘', color: '#E74C3C', label: 'SOS' },
};

const SEVERITY_CONFIG: Record<string, { color: string; bg: string }> = {
  critical: { color: '#E74C3C', bg: 'rgba(231, 76, 60, 0.15)' },
  warning: { color: '#F39C12', bg: 'rgba(243, 156, 18, 0.15)' },
  info: { color: '#3498DB', bg: 'rgba(52, 152, 219, 0.15)' },
};

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  pending: { color: '#F39C12', label: 'Pending' },
  acknowledged: { color: '#3498DB', label: 'Acknowledged' },
  escalated: { color: '#E74C3C', label: 'Escalated' },
  resolved: { color: '#00B894', label: 'Resolved' },
};

interface AlertCardProps {
  alert: Alert;
  onRespond?: (alertId: string) => void;
  onEscalate?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
  showActions?: boolean;
}

export default function AlertCard({
  alert,
  onRespond,
  onEscalate,
  onResolve,
  showActions = true,
}: AlertCardProps) {
  const typeInfo = TYPE_CONFIG[alert.type] || TYPE_CONFIG.safety;
  const severityInfo = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
  const statusInfo = STATUS_CONFIG[alert.status] || STATUS_CONFIG.pending;

  const timeAgo = getTimeAgo(alert.createdAt);

  return (
    <View style={[styles.card, { borderLeftColor: typeInfo.color }]}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.typeRow}>
          <Text style={styles.typeIcon}>{typeInfo.icon}</Text>
          <Text style={[styles.typeLabel, { color: typeInfo.color }]}>{typeInfo.label}</Text>
        </View>
        <View style={styles.badges}>
          <View style={[styles.severityBadge, { backgroundColor: severityInfo.bg }]}>
            <Text style={[styles.severityText, { color: severityInfo.color }]}>
              {alert.severity.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.statusBadge, { borderColor: statusInfo.color }]}>
            <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Message */}
      <Text style={styles.message} numberOfLines={3}>{alert.message}</Text>

      {/* Meta row */}
      <View style={styles.metaRow}>
        {alert.roomNumber && (
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>🚪</Text>
            <Text style={styles.metaText}>Room {alert.roomNumber}</Text>
          </View>
        )}
        {alert.location?.latitude && (
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>📍</Text>
            <Text style={styles.metaText}>
              {alert.location.latitude.toFixed(4)}, {alert.location.longitude?.toFixed(4)}
            </Text>
          </View>
        )}
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>🕐</Text>
          <Text style={styles.metaText}>{timeAgo}</Text>
        </View>
      </View>

      {/* Staff notes */}
      {alert.staffNotes && (
        <View style={styles.notesBox}>
          <Text style={styles.notesLabel}>Staff Notes:</Text>
          <Text style={styles.notesText}>{alert.staffNotes}</Text>
        </View>
      )}

      {/* Actions */}
      {showActions && alert.status === 'pending' && (
        <View style={styles.actions}>
          {onRespond && (
            <Pressable
              style={[styles.actionBtn, styles.respondBtn]}
              onPress={() => onRespond(alert.id)}
            >
              <Text style={styles.actionText}>✓ Respond</Text>
            </Pressable>
          )}
          {onEscalate && (
            <Pressable
              style={[styles.actionBtn, styles.escalateBtn]}
              onPress={() => onEscalate(alert.id)}
            >
              <Text style={styles.actionText}>⬆ Escalate</Text>
            </Pressable>
          )}
          {onResolve && (
            <Pressable
              style={[styles.actionBtn, styles.resolveBtn]}
              onPress={() => onResolve(alert.id)}
            >
              <Text style={styles.actionText}>✕ Resolve</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
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
    padding: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeIcon: {
    fontSize: 20,
  },
  typeLabel: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  severityBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: Radii.full,
  },
  severityText: {
    fontSize: 9,
    fontWeight: '800',
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
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  message: {
    color: Colors.text,
    fontSize: FontSizes.sm,
    lineHeight: 18,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaIcon: {
    fontSize: 11,
  },
  metaText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: 'monospace',
  },
  notesBox: {
    marginTop: 8,
    padding: 10,
    backgroundColor: Colors.surface2,
    borderRadius: Radii.sm,
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  notesText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radii.sm,
    alignItems: 'center',
  },
  respondBtn: {
    backgroundColor: 'rgba(52, 152, 219, 0.15)',
  },
  escalateBtn: {
    backgroundColor: 'rgba(243, 156, 18, 0.15)',
  },
  resolveBtn: {
    backgroundColor: 'rgba(0, 184, 148, 0.15)',
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
  },
});
