import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { palette, radii, spacing, typography } from '../theme/tokens';

export function LiveFeed({ events }: { events: string[] }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Realtime Feed</Text>
      {events.length === 0 ? (
        <Text style={styles.empty}>No events yet</Text>
      ) : (
        events.slice(0, 4).map((event, index) => (
          <Text key={`${event}-${index}`} style={styles.event}>
            {event}
          </Text>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: palette.surfaceRaised,
    borderRadius: radii.md,
    borderColor: palette.border,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    color: palette.ink,
    fontSize: typography.body,
    fontWeight: '800',
  },
  empty: {
    color: palette.inkMuted,
    fontSize: typography.caption,
  },
  event: {
    color: palette.ink,
    fontSize: typography.caption,
  },
});
