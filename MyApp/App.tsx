/**
 * Emergency Safety App — React Native
 * Converted from web React application
 */

import React, { useState, useCallback, useEffect, Suspense } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import './src/i18n';
import { AppProvider, useAppContext } from './src/context/AppContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import NavBar from './src/components/NavBar';

// User (Guest) Screens
import HomeScreen from './src/screens/user/HomeScreen';
import ReportScreen from './src/screens/user/ReportScreen';
import SettingsScreen from './src/screens/user/SettingsScreen';
import AlertScreen from './src/screens/user/AlertScreen';
import SOSScreen from './src/screens/user/SOSScreen';
import GuidanceScreen from './src/screens/user/GuidanceScreen';
import ResolvedScreen from './src/screens/user/ResolvedScreen';

// Core Role & Dashboard Screens
import RoleSelectionScreen from './src/screens/RoleSelectionScreen';
import StaffDashboardScreen from './src/screens/staff/StaffDashboardScreen';
import ResponderDashboardScreen from './src/screens/responder/ResponderDashboardScreen';

type NormalTab = 'home' | 'report' | 'settings';

/** Loading splash — shown while i18n / Suspense resolves */
function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#6C5CE7" />
      <Text style={styles.loadingText}>Loading…</Text>
    </View>
  );
}

function UserRouter() {
  const { state, dispatch, navigateToReportRef } = useAppContext();
  const [activeTab, setActiveTab] = useState<NormalTab>('home');
  const insets = useSafeAreaInsets();

  // Register the navigate-to-report callback
  const navigateToReport = useCallback(() => {
    setActiveTab('report');
  }, []);
  navigateToReportRef.current = navigateToReport;

  // ─── Android hardware Back button handling ─────────────────
  useEffect(() => {
    const onBackPress = (): boolean => {
      // Emergency mode
      if (state.mode === 'emergency') {
        if (state.emergencySubScreen === 'sos') {
          // SOS screen → go back based on trigger source
          if (state.sosTriggerSource === 'home' || !state.activeEmergency) {
            dispatch({ type: 'RETURN_TO_NORMAL' });
          } else {
            dispatch({ type: 'SET_EMERGENCY_SUB_SCREEN', payload: 'alert' });
          }
          return true; // consume the back press
        }
        if (state.emergencySubScreen === 'guidance') {
          // Guidance screen → go back to alert
          if (state.activeEmergency) {
            dispatch({ type: 'SET_EMERGENCY_SUB_SCREEN', payload: 'alert' });
          } else {
            dispatch({ type: 'RETURN_TO_NORMAL' });
          }
          return true;
        }
        // On alert sub-screen during an active emergency: prevent accidental exit
        return true;
      }

      // Resolved mode → return to normal
      if (state.mode === 'resolved') {
        dispatch({ type: 'RETURN_TO_NORMAL' });
        return true;
      }

      // Normal mode — non-home tab → go to home
      if (activeTab !== 'home') {
        setActiveTab('home');
        return true;
      }

      // Normal mode, home tab → let the system handle it (exit/minimize)
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [state.mode, state.emergencySubScreen, state.sosTriggerSource, state.activeEmergency, activeTab, dispatch]);

  // Emergency mode — full takeover
  if (state.mode === 'emergency') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {state.emergencySubScreen === 'alert' && <AlertScreen />}
        {state.emergencySubScreen === 'sos' && <SOSScreen />}
        {state.emergencySubScreen === 'guidance' && <GuidanceScreen />}
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

function AppRouter() {
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

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0F1117" />
      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <AppProvider>
            <AppRouter />
          </AppProvider>
        </Suspense>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1117',
  },
  main: {
    flex: 1,
  },
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

export default App;
