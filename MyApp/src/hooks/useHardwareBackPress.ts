import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useAppContext } from '../context/AppContext';

export const useHardwareBackPress = (
  activeTab: string,
  setActiveTab: (tab: any) => void,
) => {
  const { state, dispatch } = useAppContext();

  useEffect(() => {
    const onBackPress = (): boolean => {
      // Emergency mode
      if (state.mode === 'emergency') {
        if (state.emergencySubScreen === 'sos') {
          if (state.isEmergencyMode) {
            dispatch({ type: 'SET_EMERGENCY_SUB_SCREEN', payload: 'channel' });
            return true;
          }

          // SOS screen → go back based on trigger source
          if (state.sosTriggerSource === 'home' || !state.activeEmergency) {
            dispatch({ type: 'RETURN_TO_NORMAL' });
          } else {
            dispatch({ type: 'SET_EMERGENCY_SUB_SCREEN', payload: 'alert' });
          }
          return true; // consume the back press
        }
        if (state.emergencySubScreen === 'guidance') {
          if (state.isEmergencyMode) {
            dispatch({ type: 'SET_EMERGENCY_SUB_SCREEN', payload: 'channel' });
            return true;
          }

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

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );
    return () => subscription.remove();
  }, [
    state.mode,
    state.emergencySubScreen,
    state.sosTriggerSource,
    state.activeEmergency,
    state.isEmergencyMode,
    activeTab,
    dispatch,
    setActiveTab,
  ]);
};
