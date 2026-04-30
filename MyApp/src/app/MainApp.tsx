import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { AuthScreen } from './AuthScreen';
import { DashboardScreen } from './DashboardScreen';
import { palette } from '../theme/tokens';

function RootRouter() {
  const { user } = useAuth();

  if (!user) {
    return <AuthScreen />;
  }

  return <DashboardScreen />;
}

export function MainApp() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={palette.backdrop} />
      <AuthProvider>
        <RootRouter />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
