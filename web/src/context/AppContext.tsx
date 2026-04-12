import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { EmergencyEvent, GuestSession, GuestStatus, LocationSnapshot, IssueCategory, DistressSignal } from '../data/mockEmergencies';

// ─── State ──────────────────────────────────────────────
type AppMode = 'normal' | 'emergency' | 'resolved';

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
  | { type: 'TRIGGER_SOS_ONLY' };

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
      };

    case 'TRIGGER_SOS_ONLY':
      return {
        ...state,
        mode: 'emergency',
        emergencySubScreen: 'sos',
        guestStatus: null,
        sosActive: false,
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
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const triggerEmergency = useCallback((event: EmergencyEvent) => {
    dispatch({ type: 'TRIGGER_EMERGENCY', payload: event });
    // Vibrate if available
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }
  }, []);

  const resolveEmergency = useCallback(() => {
    dispatch({ type: 'RESOLVE_EMERGENCY' });
  }, []);

  const sendSOS = useCallback((category: IssueCategory, status: GuestStatus) => {
    dispatch({ type: 'SEND_SOS', payload: { category, status } });
    if (navigator.vibrate) {
      navigator.vibrate([300, 100, 300]);
    }
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

  // Watch device location
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        dispatch({
          type: 'UPDATE_LOCATION',
          payload: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
          },
        });
      },
      () => {
        // Silently handle — location unavailable
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
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
