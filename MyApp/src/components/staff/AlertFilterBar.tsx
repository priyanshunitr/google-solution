import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { Colors, Radii, FontSizes } from '../../theme/colors';
import type { AlertFilter, AlertType, AlertSeverity, AlertStatus } from '../../types/communication';

const TYPE_OPTIONS: { key: AlertType | 'all'; icon: string; label: string }[] = [
  { key: 'all', icon: '📋', label: 'All' },
  { key: 'fire', icon: '🔥', label: 'Fire' },
  { key: 'medical', icon: '🏥', label: 'Medical' },
  { key: 'safety', icon: '⚠️', label: 'Safety' },
  { key: 'assistance', icon: '🙋', label: 'Assist' },
  { key: 'sos', icon: '🆘', label: 'SOS' },
];

const SEVERITY_OPTIONS: { key: AlertSeverity | 'all'; label: string; color: string }[] = [
  { key: 'all', label: 'All', color: Colors.textSecondary },
  { key: 'critical', label: 'Critical', color: '#E74C3C' },
  { key: 'warning', label: 'Warning', color: '#F39C12' },
  { key: 'info', label: 'Info', color: '#3498DB' },
];

const STATUS_OPTIONS: { key: AlertStatus | 'all'; label: string; color: string }[] = [
  { key: 'all', label: 'All', color: Colors.textSecondary },
  { key: 'pending', label: 'Pending', color: '#F39C12' },
  { key: 'acknowledged', label: 'Ack', color: '#3498DB' },
  { key: 'escalated', label: 'Escalated', color: '#E74C3C' },
  { key: 'resolved', label: 'Resolved', color: '#00B894' },
];

interface AlertFilterBarProps {
  filter: AlertFilter;
  onFilterChange: (filter: AlertFilter) => void;
}

export default function AlertFilterBar({ filter, onFilterChange }: AlertFilterBarProps) {
  return (
    <View style={styles.container}>
      {/* Type Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {TYPE_OPTIONS.map(opt => {
          const isActive = (filter.type || 'all') === opt.key;
          return (
            <Pressable
              key={opt.key}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onFilterChange({ ...filter, type: opt.key })}
            >
              <Text style={styles.chipIcon}>{opt.icon}</Text>
              <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Room Search Row */}
      <View style={styles.searchRow}>
        <Text style={styles.searchIcon}>🏢</Text>
        <TextInput
          style={styles.searchInput}
          value={filter.roomNumber || ''}
          onChangeText={(val) => onFilterChange({ ...filter, roomNumber: val })}
          placeholder="Filter by Room # (e.g. 104)"
          placeholderTextColor={Colors.textMuted}
          keyboardType="numeric"
          maxLength={10}
        />
        {filter.roomNumber ? (
          <Pressable 
            style={styles.clearBtn} 
            onPress={() => onFilterChange({ ...filter, roomNumber: '' })}
          >
            <Text style={styles.clearText}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Severity + Status Row */}
      <View style={styles.secondRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          <Text style={styles.filterLabel}>Severity:</Text>
          {SEVERITY_OPTIONS.map(opt => {
            const isActive = (filter.severity || 'all') === opt.key;
            return (
              <Pressable
                key={`sev-${opt.key}`}
                style={[
                  styles.miniChip,
                  isActive && { backgroundColor: opt.color + '25', borderColor: opt.color },
                ]}
                onPress={() => onFilterChange({ ...filter, severity: opt.key })}
              >
                <Text
                  style={[
                    styles.miniChipLabel,
                    isActive && { color: opt.color },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}

          <View style={styles.divider} />
          <Text style={styles.filterLabel}>Status:</Text>
          {STATUS_OPTIONS.map(opt => {
            const isActive = (filter.status || 'all') === opt.key;
            return (
              <Pressable
                key={`st-${opt.key}`}
                style={[
                  styles.miniChip,
                  isActive && { backgroundColor: opt.color + '25', borderColor: opt.color },
                ]}
                onPress={() => onFilterChange({ ...filter, status: opt.key })}
              >
                <Text
                  style={[
                    styles.miniChipLabel,
                    isActive && { color: opt.color },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.surface,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  chipIcon: {
    fontSize: 13,
  },
  chipLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  chipLabelActive: {
    color: Colors.primaryLight,
  },
  secondRow: {
    marginTop: 6,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    marginVertical: 4,
    height: 40,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 12,
    padding: 0, // Remove default padding for better vertical alignment
  },
  clearBtn: {
    padding: 4,
  },
  clearText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    marginRight: 4,
    alignSelf: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  miniChip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  miniChipLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.border,
    marginHorizontal: 6,
  },
});
