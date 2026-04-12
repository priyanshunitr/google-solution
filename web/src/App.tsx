import { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import NavBar from './components/NavBar';
import HomeScreen from './screens/HomeScreen';
import ReportScreen from './screens/ReportScreen';
import SettingsScreen from './screens/SettingsScreen';
import AlertScreen from './screens/AlertScreen';
import SOSScreen from './screens/SOSScreen';
import GuidanceScreen from './screens/GuidanceScreen';
import ResolvedScreen from './screens/ResolvedScreen';
import './App.css';

type NormalTab = 'home' | 'report' | 'settings';

function AppRouter() {
  const { state } = useAppContext();
  const [activeTab, setActiveTab] = useState<NormalTab>('home');

  // Listen for navigation events from HomeScreen quick-report button
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail === 'report') {
        setActiveTab('report');
      }
    };
    window.addEventListener('navigate', handler);
    return () => window.removeEventListener('navigate', handler);
  }, []);

  // Emergency mode — full takeover
  if (state.mode === 'emergency') {
    return (
      <div className="app-emergency">
        {state.emergencySubScreen === 'alert' && <AlertScreen />}
        {state.emergencySubScreen === 'sos' && <SOSScreen />}
        {state.emergencySubScreen === 'guidance' && <GuidanceScreen />}
      </div>
    );
  }

  // Resolved mode
  if (state.mode === 'resolved') {
    return <ResolvedScreen />;
  }

  // Normal mode — tabbed navigation
  return (
    <div className="app-normal">
      <main className="app-main">
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'report' && <ReportScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </main>
      <NavBar activeTab={activeTab} onNavigate={setActiveTab} />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}

export default App;
