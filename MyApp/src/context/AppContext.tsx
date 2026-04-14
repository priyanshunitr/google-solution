import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import { Vibration, PermissionsAndroid, Platform } from 'react-native';
import type { EmergencyEvent, GuestSession, GuestStatus, LocationSnapshot, IssueCategory, DistressSignal } from '../data/mockEmergencies';

// ─── Helpers ─────────────────────────────────────────────

/** Safe vibration wrapper — some emulators / devices throw on vibrate */
function safeVibrate(pattern: number[]) {
  try {
    Vibration.vibrate(pattern);
  } catch (err) {
    console.warn('[Vibration] Failed:', err);
  }
}

// ─── State ──────────────────────────────────────────────
type AppMode = 'normal' | 'emergency' | 'resolved';

export type UserRole = 'guest' | 'staff' | 'responder' | null;

/** Tracks *how* the emergency/SOS was entered so we can navigate back correctly */
type SOSTriggerSource = 'home' | 'alert';

interface AppState {
  mode: AppMode;
  activeEmergency: EmergencyEvent | null;
  guestSession: GuestSession;
  guestStatus: GuestStatus | null;
  location: LocationSnapshot;
  isLocationSharing: boolean;
  distressSignals: DistressSignal[];
  sosActive: boolean;
  emergencySubScreen: 'alert' | 'sos' | 'guidance';
  guidanceStepsCompleted: number[];
  /** Where the SOS flow was triggered from — needed for correct back-navigation */
  sosTriggerSource: SOSTriggerSource;
  /** Whether the device location permission has been granted */
  locationPermissionGranted: boolean;
  role: UserRole;
}

const initialLocation: LocationSnapshot = {
  latitude: null,
  longitude: null,
  accuracy: 0,
  timestamp: Date.now(),
  isSharing: false,
};

function generateSessionId(): string {
  return 'GS-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

const initialState: AppState = {
  mode: 'normal',
  activeEmergency: null,
  guestSession: {
    sessionId: generateSessionId(),
    propertyId: 'PROP-GRAND-001',
    propertyName: 'The Grand Azure Resort',
    roomNumber: '',
    language: 'en',
  },
  guestStatus: null,
  location: initialLocation,
  isLocationSharing: false,
  distressSignals: [],
  sosActive: false,
  emergencySubScreen: 'alert',
  guidanceStepsCompleted: [],
  sosTriggerSource: 'alert',
  locationPermissionGranted: false,
  role: null,
};

// ─── Actions ─────────────────────────────────────────────
type AppAction =
  | { type: 'TRIGGER_EMERGENCY'; payload: EmergencyEvent }
  | { type: 'RESOLVE_EMERGENCY' }
  | { type: 'SEND_SOS'; payload: { category: IssueCategory; status: GuestStatus } }
  | { type: 'CANCEL_SOS' }
  | { type: 'UPDATE_STATUS'; payload: GuestStatus }
  | { type: 'UPDATE_LOCATION'; payload: Partial<LocationSnapshot> }
  | { type: 'START_LOCATION_SHARING' }
  | { type: 'STOP_LOCATION_SHARING' }
  | { type: 'SET_ROOM_NUMBER'; payload: string }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'SET_EMERGENCY_SUB_SCREEN'; payload: 'alert' | 'sos' | 'guidance' }
  | { type: 'TOGGLE_GUIDANCE_STEP'; payload: number }
  | { type: 'RETURN_TO_NORMAL' }
  | { type: 'SUBMIT_REPORT'; payload: { category: IssueCategory } }
  | { type: 'TRIGGER_SOS_ONLY' }
  | { type: 'SET_LOCATION_PERMISSION'; payload: boolean }
  | { type: 'SET_ROLE'; payload: UserRole };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'TRIGGER_EMERGENCY':
      return {
        ...state,
        mode: 'emergency',
        activeEmergency: action.payload,
        emergencySubScreen: 'alert',
        guestStatus: null,
        sosActive: false,
        sosTriggerSource: 'alert',
      };

    case 'TRIGGER_SOS_ONLY':
      return {
        ...state,
        mode: 'emergency',
        emergencySubScreen: 'sos',
        guestStatus: null,
        sosActive: false,
        sosTriggerSource: 'home', // ← track that this came from the Home screen
      };

    case 'RESOLVE_EMERGENCY':
      return {
        ...state,
        mode: 'resolved',
        sosActive: false,
        isLocationSharing: false,
        location: { ...state.location, isSharing: false },
      };

    case 'SEND_SOS': {
      const signal: DistressSignal = {
        sessionId: state.guestSession.sessionId,
        location: { ...state.location, isSharing: true },
        issueCategory: action.payload.category,
        statusCode: action.payload.status,
        sentAt: Date.now(),
      };
      return {
        ...state,
        sosActive: true,
        guestStatus: action.payload.status,
        isLocationSharing: true,
        location: { ...state.location, isSharing: true },
        distressSignals: [...state.distressSignals, signal],
      };
    }

    case 'CANCEL_SOS':
      return {
        ...state,
        sosActive: false,
        isLocationSharing: false,
        location: { ...state.location, isSharing: false },
      };

    case 'UPDATE_STATUS':
      return { ...state, guestStatus: action.payload };

    case 'UPDATE_LOCATION':
      return { ...state, location: { ...state.location, ...action.payload } };

    case 'START_LOCATION_SHARING':
      return {
        ...state,
        isLocationSharing: true,
        location: { ...state.location, isSharing: true },
      };

    case 'STOP_LOCATION_SHARING':
      return {
        ...state,
        isLocationSharing: false,
        location: { ...state.location, isSharing: false },
      };

    case 'SET_ROOM_NUMBER':
      return {
        ...state,
        guestSession: { ...state.guestSession, roomNumber: action.payload },
      };

    case 'SET_LANGUAGE':
      return {
        ...state,
        guestSession: { ...state.guestSession, language: action.payload },
      };

    case 'SET_EMERGENCY_SUB_SCREEN':
      return { ...state, emergencySubScreen: action.payload };

    case 'TOGGLE_GUIDANCE_STEP': {
      const current = state.guidanceStepsCompleted;
      const index = action.payload;
      const next = current.includes(index)
        ? current.filter((i) => i !== index)
        : [...current, index];
      return { ...state, guidanceStepsCompleted: next };
    }

    case 'RETURN_TO_NORMAL':
      return {
        ...state,
        mode: 'normal',
        activeEmergency: null,
        guestStatus: null,
        sosActive: false,
        isLocationSharing: false,
        location: { ...state.location, isSharing: false },
        emergencySubScreen: 'alert',
        guidanceStepsCompleted: [],
        sosTriggerSource: 'alert',
      };

    case 'SUBMIT_REPORT': {
      const signal: DistressSignal = {
        sessionId: state.guestSession.sessionId,
        location: state.location,
        issueCategory: action.payload.category,
        statusCode: 'need_help',
        sentAt: Date.now(),
      };
      return {
        ...state,
        distressSignals: [...state.distressSignals, signal],
      };
    }

    case 'SET_LOCATION_PERMISSION':
      return { ...state, locationPermissionGranted: action.payload };

    case 'SET_ROLE':
      return { ...state, role: action.payload };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  triggerEmergency: (event: EmergencyEvent) => void;
  resolveEmergency: () => void;
  sendSOS: (category: IssueCategory, status: GuestStatus) => void;
  cancelSOS: () => void;
  updateStatus: (status: GuestStatus) => void;
  returnToNormal: () => void;
  submitReport: (category: IssueCategory) => void;
  navigateToReportRef: React.MutableRefObject<(() => void) | null>;
  requestLocationPermission: () => Promise<boolean>;
  fetchLocation: () => Promise<void>;
  setRole: (role: UserRole) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const navigateToReportRef = useRef<(() => void) | null>(null);

  const triggerEmergency = useCallback((event: EmergencyEvent) => {
    dispatch({ type: 'TRIGGER_EMERGENCY', payload: event });
    safeVibrate([200, 100, 200, 100, 400]);
  }, []);

  const setRole = useCallback((role: UserRole) => {
    dispatch({ type: 'SET_ROLE', payload: role });
  }, []);

  const resolveEmergency = useCallback(() => {
    dispatch({ type: 'RESOLVE_EMERGENCY' });
  }, []);

  const sendSOS = useCallback((category: IssueCategory, status: GuestStatus) => {
    dispatch({ type: 'SEND_SOS', payload: { category, status } });
    safeVibrate([300, 100, 300]);
  }, []);

  const cancelSOS = useCallback(() => {
    dispatch({ type: 'CANCEL_SOS' });
  }, []);

  const updateStatus = useCallback((status: GuestStatus) => {
    dispatch({ type: 'UPDATE_STATUS', payload: status });
  }, []);

  const returnToNormal = useCallback(() => {
    dispatch({ type: 'RETURN_TO_NORMAL' });
  }, []);

  const submitReport = useCallback((category: IssueCategory) => {
    dispatch({ type: 'SUBMIT_REPORT', payload: { category } });
  }, []);

  /** Request location permission (Android runtime, iOS built-in) */
  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'This app needs access to your location to share your position during emergencies and help responders find you.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
            buttonNeutral: 'Ask Later',
          },
        );
        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        dispatch({ type: 'SET_LOCATION_PERMISSION', payload: isGranted });
        console.log('[Location] Android permission:', isGranted ? 'GRANTED' : 'DENIED');
        return isGranted;
      }
      // iOS — permission is requested implicitly when getCurrentPosition is called
      dispatch({ type: 'SET_LOCATION_PERMISSION', payload: true });
      return true;
    } catch (err) {
      console.error('[Location] Permission request failed:', err);
      dispatch({ type: 'SET_LOCATION_PERMISSION', payload: false });
      return false;
    }
  }, []);

  /** Fetch current GPS position and dispatch UPDATE_LOCATION */
  const fetchLocation = useCallback(async (): Promise<void> => {
    try {
      // Use the global navigator.geolocation (provided by React Native)
      const geo = (globalThis as any).navigator?.geolocation;
      if (!geo) {
        console.warn('[Location] Geolocation API not available');
        return;
      }
      geo.getCurrentPosition(
        (position: any) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log('[Location] Got position:', latitude, longitude, '±', accuracy, 'm');
          dispatch({
            type: 'UPDATE_LOCATION',
            payload: {
              latitude,
              longitude,
              accuracy: accuracy || 0,
              timestamp: position.timestamp || Date.now(),
            },
          });
        },
        (error: any) => {
          console.warn('[Location] getCurrentPosition failed:', error?.message || error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    } catch (err) {
      console.error('[Location] fetchLocation error:', err);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        triggerEmergency,
        resolveEmergency,
        sendSOS,
        cancelSOS,
        updateStatus,
        returnToNormal,
        submitReport,
        navigateToReportRef,
        requestLocationPermission,
        fetchLocation,
        setRole,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
