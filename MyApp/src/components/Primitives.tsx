import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { palette, radii, spacing, typography } from '../theme/tokens';

export function Card({
  children,
  dark,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <View style={[styles.card, dark ? styles.cardDark : styles.cardLight]}>
      {children}
    </View>
  );
}

export function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.sectionTitleWrap}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {!!subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );
}

export function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  multiline,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={palette.inkMuted}
      multiline={multiline}
      style={[styles.input, multiline ? styles.textarea : null]}
    />
  );
}

export function PillButton({
  title,
  onPress,
  variant = 'primary',
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pillButton,
        variant === 'primary' ? styles.buttonPrimary : null,
        variant === 'ghost' ? styles.buttonGhost : null,
        variant === 'danger' ? styles.buttonDanger : null,
      ]}
    >
      <Text
        style={[
          styles.pillButtonText,
          variant === 'ghost' ? styles.buttonGhostText : null,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function SegmentControl({
  options,
  value,
  onChange,
}: {
  options: Array<{ label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.segmentWrap}>
      {options.map(option => (
        <Pressable
          key={option.value}
          onPress={() => onChange(option.value)}
          style={[
            styles.segment,
            option.value === value ? styles.segmentActive : null,
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              option.value === value ? styles.segmentTextActive : null,
            ]}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function CodeBlock({ text }: { text: string }) {
  return (
    <ScrollView horizontal style={styles.codeWrap}>
      <Text style={styles.codeText}>{text}</Text>
    </ScrollView>
  );
}

export function SmallChip({
  text,
  accent,
}: {
  text: string;
  accent?: boolean;
}) {
  return (
    <View style={[styles.smallChip, accent ? styles.smallChipAccent : null]}>
      <Text
        style={[
          styles.smallChipText,
          accent ? styles.smallChipTextAccent : null,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardLight: {
    backgroundColor: palette.surfaceRaised,
  },
  cardDark: {
    backgroundColor: palette.panelDark,
  },
  sectionTitleWrap: {
    gap: 2,
  },
  sectionTitle: {
    fontSize: typography.heading,
    color: palette.ink,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: typography.caption,
    color: palette.inkMuted,
    fontWeight: '500',
  },
  label: {
    color: palette.inkMuted,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  input: {
    backgroundColor: palette.surface,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    color: palette.ink,
    fontSize: typography.body,
  },
  textarea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  pillButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: palette.ink,
  },
  buttonGhost: {
    backgroundColor: palette.surfaceMuted,
  },
  buttonDanger: {
    backgroundColor: palette.danger,
  },
  pillButtonText: {
    color: palette.inkInverse,
    fontWeight: '700',
    fontSize: typography.body,
  },
  buttonGhostText: {
    color: palette.ink,
  },
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: palette.surfaceMuted,
    borderRadius: radii.md,
    padding: 4,
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radii.sm,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: palette.panelDark,
  },
  segmentText: {
    color: palette.inkMuted,
    fontSize: typography.body,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: palette.inkInverse,
  },
  codeWrap: {
    backgroundColor: '#121318',
    borderRadius: radii.sm,
    maxHeight: 220,
  },
  codeText: {
    color: '#e2e6f2',
    fontSize: 11,
    padding: spacing.sm,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  smallChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: palette.surfaceMuted,
    alignSelf: 'flex-start',
  },
  smallChipAccent: {
    backgroundColor: '#d8f2ff',
  },
  smallChipText: {
    fontSize: typography.tiny,
    color: palette.inkMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  smallChipTextAccent: {
    color: '#0a74a8',
  },
});
