/**
 * Emergency Safety App — React Native
 * Converted from web React application
 */

import React, { Suspense } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './src/i18n';
import { AppProvider } from './src/context/AppContext';
import { ErrorBoundary, LoadingScreen } from './src/components';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0F1117" />
      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <AppProvider>
            <AppNavigator />
          </AppProvider>
        </Suspense>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

export default App;
