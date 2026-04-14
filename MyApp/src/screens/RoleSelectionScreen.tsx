import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppContext, type UserRole } from '../context/AppContext';
import { Colors, Radii, Spacing, FontSizes } from '../theme/colors';

export default function RoleSelectionScreen() {
  const { setRole } = useAppContext();
  const { t } = useTranslation();

  const handleSelectRole = (role: UserRole) => {
    setRole(role);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.icon}>🛡️</Text>
        <Text style={styles.title}>SecureStay</Text>
        <Text style={styles.subtitle}>Select Your Dashboard</Text>
      </View>

      <View style={styles.rolesContainer}>
        {/* Guest Role */}
        <Pressable
          style={styles.roleCard}
          onPress={() => handleSelectRole('guest')}
        >
          <View style={styles.roleIconContainer}>
            <Text style={styles.roleIcon}>👤</Text>
          </View>
          <View style={styles.roleInfo}>
            <Text style={styles.roleName}>Hotel Guest</Text>
            <Text style={styles.roleDesc}>Access safety tips, location sharing, and emergency SOS features.</Text>
          </View>
        </Pressable>

        {/* Staff Role */}
        <Pressable
          style={styles.roleCard}
          onPress={() => handleSelectRole('staff')}
        >
          <View style={styles.roleIconContainer}>
            <Text style={styles.roleIcon}>👔</Text>
          </View>
          <View style={styles.roleInfo}>
            <Text style={styles.roleName}>Property Staff</Text>
            <Text style={styles.roleDesc}>Manage alerts, broadcast instructions, and view property status.</Text>
          </View>
        </Pressable>

        {/* Responder Role */}
        <Pressable
          style={[styles.roleCard, styles.roleCardResponder]}
          onPress={() => handleSelectRole('responder')}
        >
          <View style={[styles.roleIconContainer, styles.roleIconContainerResponder]}>
            <Text style={styles.roleIcon}>🚨</Text>
          </View>
          <View style={styles.roleInfo}>
            <Text style={styles.roleName}>Emergency Services</Text>
            <Text style={styles.roleDesc}>View real-time distress signals, casualty heatmaps, and priority logs.</Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: 24,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: FontSizes.hero,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  rolesContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleCardResponder: {
    borderColor: 'rgba(231, 76, 60, 0.3)',
    backgroundColor: 'rgba(231, 76, 60, 0.05)',
  },
  roleIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  roleIconContainerResponder: {
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
  },
  roleIcon: {
    fontSize: 28,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  roleDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
