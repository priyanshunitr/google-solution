import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FeatureTile } from '../types/app';
import { palette, radii, spacing, typography } from '../theme/tokens';

export function FeatureGrid({
  tiles,
  active,
  onSelect,
}: {
  tiles: FeatureTile[];
  active: string;
  onSelect: (key: string) => void;
}) {
  return (
    <View style={styles.grid}>
      {tiles.map(tile => {
        const selected = tile.key === active;
        return (
          <Pressable
            key={tile.key}
            onPress={() => onSelect(tile.key)}
            style={[styles.tile, selected ? styles.tileActive : null]}
          >
            <View style={styles.tileTopRow}>
              <View
                style={[
                  styles.tileIcon,
                  selected ? styles.tileIconActive : null,
                ]}
              />
              <View
                style={[
                  styles.tileStatus,
                  selected ? styles.tileStatusOn : null,
                ]}
              />
            </View>

            <Text
              style={[
                styles.tileTitle,
                selected ? styles.tileTitleActive : null,
              ]}
            >
              {tile.title}
            </Text>
            <Text
              style={[
                styles.tileSubtitle,
                selected ? styles.tileSubtitleActive : null,
              ]}
            >
              {tile.subtitle}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tile: {
    width: '48%',
    backgroundColor: palette.surfaceMuted,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  tileActive: {
    backgroundColor: palette.panelDark,
  },
  tileTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tileIcon: {
    width: 26,
    height: 26,
    borderRadius: radii.pill,
    backgroundColor: palette.surface,
  },
  tileIconActive: {
    backgroundColor: palette.accent,
  },
  tileStatus: {
    width: 14,
    height: 14,
    borderRadius: radii.pill,
    backgroundColor: '#a4a9b3',
  },
  tileStatusOn: {
    backgroundColor: palette.accent,
  },
  tileTitle: {
    fontSize: typography.body,
    color: palette.ink,
    fontWeight: '700',
  },
  tileTitleActive: {
    color: palette.inkInverse,
  },
  tileSubtitle: {
    fontSize: typography.caption,
    color: palette.inkMuted,
    fontWeight: '500',
  },
  tileSubtitleActive: {
    color: '#bec2cc',
  },
});
