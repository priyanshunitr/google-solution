import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { Colors, Radii } from '../theme/colors';

interface NavBarProps {
  activeTab: 'home' | 'report' | 'settings';
  onNavigate: (tab: 'home' | 'report' | 'settings') => void;
}

const tabs: { key: 'home' | 'report' | 'settings'; icon: string; labelKey: string }[] = [
  { key: 'home', icon: '🏠', labelKey: 'nav.home' },
  { key: 'report', icon: '📋', labelKey: 'nav.report' },
  { key: 'settings', icon: '⚙️', labelKey: 'nav.settings' },
];

export default function NavBar({ activeTab, onNavigate }: NavBarProps) {
  const { state } = useAppContext();
  const { t } = useTranslation();

  if (state.mode === 'emergency') return null;

  return (
    <View style={styles.navbar}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            style={[styles.navItem, isActive && styles.navItemActive]}
            onPress={() => onNavigate(tab.key)}
            accessibilityLabel={t(tab.labelKey)}
          >
            <Text style={styles.navIcon}>{tab.icon}</Text>
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {t(tab.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingBottom: 12,
    backgroundColor: Colors.glass,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  navItem: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: Radii.md,
    minWidth: 64,
  },
  navItemActive: {
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
  },
  navIcon: {
    fontSize: 22,
    lineHeight: 26,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  navLabelActive: {
    color: Colors.primaryLight,
  },
});
