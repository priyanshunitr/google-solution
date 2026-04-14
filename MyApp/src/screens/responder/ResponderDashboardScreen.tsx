import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useAppContext } from '../../context/AppContext';
import { Colors, Radii, Spacing, FontSizes } from '../../theme/colors';

export default function ResponderDashboardScreen() {
  const { setRole } = useAppContext();

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerIcon}>🚨</Text>
          <View>
            <Text style={styles.headerTitle}>Emergency Command</Text>
            <Text style={styles.headerSubtitle}>Responder Unit - Active</Text>
          </View>
        </View>
        <Pressable style={styles.logoutBtn} onPress={() => setRole(null)}>
          <Text style={styles.logoutText}>Release Unit</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Active Fires</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Medical</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxDanger]}>
            <Text style={[styles.statValue, styles.statValueDanger]}>0</Text>
            <Text style={[styles.statLabel, styles.statLabelDanger]}>SOS Signals</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Priority SOS Signals</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No active SOS signals at this time.</Text>
        </View>

        <Text style={styles.sectionTitle}>Property Maps</Text>
        <Pressable style={styles.mapCard}>
          <Text style={styles.mapIcon}>🗺️</Text>
          <View style={styles.mapInfo}>
            <Text style={styles.mapTitle}>The Grand Azure Resort</Text>
            <Text style={styles.mapDesc}>View floor plans and live guest heatmaps.</Text>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000', // Darker background for responder dashboard
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(231, 76, 60, 0.3)',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.danger,
    marginTop: 2,
    fontWeight: '700',
  },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statBoxDanger: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 4,
  },
  statValueDanger: {
    color: Colors.danger,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  statLabelDanger: {
    color: Colors.danger,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyState: {
    padding: 24,
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 32,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },
  mapCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  mapInfo: {
    flex: 1,
  },
  mapTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  mapDesc: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
  },
});
