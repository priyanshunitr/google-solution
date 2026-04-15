import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

/** Loading splash — shown while i18n / Suspense resolves */
export default function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#6C5CE7" />
      <Text style={styles.loadingText}>Loading…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F1117',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#9BA0B5',
    fontWeight: '600',
  },
});
