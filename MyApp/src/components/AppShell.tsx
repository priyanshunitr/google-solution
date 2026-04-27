import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, radii, spacing, typography } from '../theme/tokens';
import { SegmentControl } from './Primitives';

export function AppShell({
  name,
  role,
  mode,
  onModeChange,
  children,
  onLogout,
  realtimeCount,
}: {
  name: string;
  role: string;
  mode: 'overview' | 'control';
  onModeChange: (mode: 'overview' | 'control') => void;
  children: React.ReactNode;
  onLogout: () => void;
  realtimeCount: number;
}) {
  return (
    <View style={styles.backdrop}>
      <View style={styles.frame}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.hello}>Hello, {name}</Text>
            <Text style={styles.role}>{role.toUpperCase()} Console</Text>
          </View>

          <Pressable onPress={onLogout} style={styles.notificationDotWrap}>
            <View style={styles.notificationDot} />
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTitleRow}>
            <Text style={styles.heroSeverity}>Live</Text>
            <View style={styles.heroCloud} />
          </View>

          <Text style={styles.heroState}>Emergency Coordination</Text>
          <Text style={styles.heroDate}>Realtime events: {realtimeCount}</Text>

          <View style={styles.heroStats}>
            <View>
              <Text style={styles.heroStatLabel}>Signal</Text>
              <Text style={styles.heroStatValue}>Stable</Text>
            </View>
            <View>
              <Text style={styles.heroStatLabel}>Pipeline</Text>
              <Text style={styles.heroStatValue}>Active</Text>
            </View>
            <View>
              <Text style={styles.heroStatLabel}>Sync</Text>
              <Text style={styles.heroStatValue}>Good</Text>
            </View>
          </View>
        </View>

        <SegmentControl
          value={mode}
          onChange={next => onModeChange(next as 'overview' | 'control')}
          options={[
            { label: 'Overview', value: 'overview' },
            { label: 'Control', value: 'control' },
          ]}
        />

        <View style={styles.contentWrap}>{children}</View>

        <View style={styles.bottomNav}>
          <View style={[styles.navIcon, styles.navIconActive]} />
          <View style={styles.navIcon} />
          <View style={styles.navIcon} />
          <View style={styles.navIcon} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: palette.backdrop,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  frame: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hello: {
    fontSize: typography.heading,
    color: palette.ink,
    fontWeight: '700',
  },
  role: {
    color: palette.inkMuted,
    fontSize: typography.caption,
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  notificationDotWrap: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    backgroundColor: palette.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: palette.accent,
  },
  heroCard: {
    backgroundColor: palette.panelDark,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  heroTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroSeverity: {
    color: palette.inkInverse,
    fontSize: 38,
    fontWeight: '800',
  },
  heroCloud: {
    width: 36,
    height: 20,
    borderRadius: 12,
    backgroundColor: palette.accent,
  },
  heroState: {
    color: palette.inkInverse,
    fontSize: typography.heading,
    fontWeight: '700',
  },
  heroDate: {
    color: '#c7c9cf',
    fontSize: typography.caption,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  heroStatLabel: {
    color: '#adb1bb',
    fontSize: typography.tiny,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroStatValue: {
    color: palette.inkInverse,
    fontSize: typography.body,
    fontWeight: '700',
  },
  contentWrap: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: palette.panelDark,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
  },
  navIcon: {
    width: 18,
    height: 18,
    borderRadius: 5,
    backgroundColor: '#858995',
  },
  navIconActive: {
    backgroundColor: palette.accent,
  },
});
