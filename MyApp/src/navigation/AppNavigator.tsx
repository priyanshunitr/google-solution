import React, { useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../context/AppContext';
import { useHardwareBackPress } from '../hooks/useHardwareBackPress';

// Components
import { NavBar } from '../components';

// User (Guest) Screens
import HomeScreen from '../screens/user/HomeScreen';
import ReportScreen from '../screens/user/ReportScreen';
import SettingsScreen from '../screens/user/SettingsScreen';
import AlertScreen from '../screens/user/AlertScreen';
import SOSScreen from '../screens/user/SOSScreen';
import GuidanceScreen from '../screens/user/GuidanceScreen';
import ResolvedScreen from '../screens/user/ResolvedScreen';
import EmergencyChannelScreen from '../screens/user/EmergencyChannelScreen';

// Core Role & Dashboard Screens
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import StaffDashboardScreen from '../screens/staff/StaffDashboardScreen';
import ResponderDashboardScreen from '../screens/responder/ResponderDashboardScreen';

type NormalTab = 'home' | 'report' | 'settings';

function UserRouter() {
  const { state, dispatch, navigateToReportRef } = useAppContext();
  const [activeTab, setActiveTab] = useState<NormalTab>('home');
  const insets = useSafeAreaInsets();

  // Register the navigate-to-report callback
  const navigateToReport = useCallback(() => {
    setActiveTab('report');
  }, []);
  navigateToReportRef.current = navigateToReport;

  // Use the custom hook for back press
  useHardwareBackPress(activeTab, setActiveTab);

  // Emergency mode — full takeover
  if (state.mode === 'emergency') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {state.emergencySubScreen === 'alert' && <AlertScreen />}
        {state.emergencySubScreen === 'sos' && <SOSScreen />}
        {state.emergencySubScreen === 'guidance' && <GuidanceScreen />}
        {state.emergencySubScreen === 'channel' && <EmergencyChannelScreen />}
      </View>
    );
  }

  // Resolved mode
  if (state.mode === 'resolved') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ResolvedScreen />
      </View>
    );
  }

  // Normal mode — tabbed navigation
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.main}>
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'report' && <ReportScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </View>
      <NavBar activeTab={activeTab} onNavigate={setActiveTab} />
    </View>
  );
}

export default function AppNavigator() {
  const { state } = useAppContext();
  const insets = useSafeAreaInsets();

  if (state.role === null) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <RoleSelectionScreen />
      </View>
    );
  }

  if (state.role === 'staff') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StaffDashboardScreen />
      </View>
    );
  }

  if (state.role === 'responder') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ResponderDashboardScreen />
      </View>
    );
  }

  return <UserRouter />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1117',
  },
  main: {
    flex: 1,
  },
});
