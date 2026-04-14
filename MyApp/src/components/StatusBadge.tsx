import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { GuestStatus } from '../data/mockEmergencies';
import { GUEST_STATUS_OPTIONS } from '../data/mockEmergencies';
import { Radii } from '../theme/colors';

interface StatusBadgeProps {
  status: GuestStatus | null;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const { t } = useTranslation();
  if (!status) return null;

  const option = GUEST_STATUS_OPTIONS.find(o => o.key === status);
  if (!option) return null;

  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        isSm ? styles.badgeSm : styles.badgeMd,
        {
          backgroundColor: option.color + '26', // ~15% opacity
          borderColor: option.color + '4D', // ~30% opacity
        },
      ]}
    >
      <Text style={[styles.icon, isSm && { fontSize: 12 }]}>{option.icon}</Text>
      <Text style={[styles.label, { color: option.color }]}>{t(`status.${status}`)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  badgeSm: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeMd: {
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  icon: {
    fontSize: 14,
  },
  label: {
    fontWeight: '600',
    fontSize: 13,
  },
});
