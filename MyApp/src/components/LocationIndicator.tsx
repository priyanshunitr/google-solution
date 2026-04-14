import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { Colors, Radii } from '../theme/colors';

export default function LocationIndicator() {
  const { state } = useAppContext();
  const { t } = useTranslation();

  if (!state.isLocationSharing) return null;

  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <Text style={styles.text}>
        📍 {t('locationIndicator.sharing')}
      </Text>
      {state.location.latitude !== null && (
        <Text style={styles.coords}>
          {state.location.latitude.toFixed(4)}, {state.location.longitude?.toFixed(4)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 184, 148, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 184, 148, 0.25)',
    borderRadius: Radii.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.safe,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.safe,
  },
  coords: {
    fontSize: 10,
    color: Colors.textMuted,
    marginLeft: 'auto',
    fontFamily: 'monospace',
  },
});
