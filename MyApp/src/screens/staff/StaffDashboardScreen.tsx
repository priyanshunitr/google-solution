import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useAppContext } from '../../context/AppContext';
import { Colors, Radii, Spacing, FontSizes } from '../../theme/colors';

export default function StaffDashboardScreen() {
  const { setRole } = useAppContext();

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Staff Dashboard</Text>
          <Text style={styles.headerSubtitle}>The Grand Azure Resort</Text>
        </View>
        <Pressable style={styles.logoutBtn} onPress={() => setRole(null)}>
          <Text style={styles.logoutText}>Switch Role</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusCard}>
          <Text style={styles.statusIcon}>🟢</Text>
          <View>
            <Text style={styles.statusTitle}>System Normal</Text>
            <Text style={styles.statusDesc}>No active alerts at this property.</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Active Issues</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No active issues reported by guests.</Text>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <Pressable style={styles.actionBtn}>
            <Text style={styles.actionIcon}>📢</Text>
            <Text style={styles.actionText}>Broadcast Alert</Text>
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <Text style={styles.actionIcon}>📱</Text>
            <Text style={styles.actionText}>Message Guests</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.surface2,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  content: {
    padding: 20,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 184, 148, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 184, 148, 0.3)',
    borderRadius: Radii.md,
    padding: 16,
    marginBottom: 32,
  },
  statusIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  statusTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.safe,
  },
  statusDesc: {
    fontSize: FontSizes.sm,
    color: Colors.safe,
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 32,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
    opacity: 0.5,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
  },
});
