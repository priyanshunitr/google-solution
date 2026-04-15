import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
} from 'react';
import { Vibration, PermissionsAndroid, Platform } from 'react-native';
import type {
  EmergencyEvent,
  GuestSession,
  GuestStatus,
  LocationSnapshot,
  IssueCategory,
  DistressSignal,
} from '../data/mockEmergencies';
import type {
  Alert,
  SOSRequest,
  BroadcastMessage,
  PrivateMessage,
} from '../types/communication';

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
  emergencySubScreen: 'alert' | 'sos' | 'guidance' | 'channel';
  guidanceStepsCompleted: number[];
  /** Where the SOS flow was triggered from — needed for correct back-navigation */
  sosTriggerSource: SOSTriggerSource;
  /** Whether the device location permission has been granted */
  locationPermissionGranted: boolean;
  role: UserRole;

  // ── Communication system state ──────────────────────────
  /** All incoming alerts (staff view) */
  incomingAlerts: Alert[];
  /** Active SOS requests (staff view) */
  sosRequests: SOSRequest[];
  /** Broadcast messages (all roles see) */
  broadcastMessages: BroadcastMessage[];
  /** Private messages between staff ↔ responder */
  privateMessages: PrivateMessage[];
  /** Whether the system is in emergency mode (set by staff) */
  isEmergencyMode: boolean;
  /** Alerts escalated to responders */
  escalatedAlerts: Alert[];
  /** Timestamp of last user visit to emergency announcement channel */
  userLastSeenBroadcastAt: number;
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

  // Communication system mock data
  incomingAlerts: [
    {
      id: 'mock-alert-1',
      type: 'fire',
      severity: 'critical',
      message: 'Smoke reported in Kitchen (Level 1)',
      location: { latitude: 40.7128, longitude: -74.006 },
      status: 'pending',
      reportedBy: 'SYSTEM-SENSE',
      roomNumber: 'KITCHEN-01',
      createdAt: Date.now() - 600000,
      updatedAt: Date.now() - 600000,
    },
    {
      id: 'mock-alert-2',
      type: 'safety',
      severity: 'warning',
      message: 'Unattended luggage near main entrance',
      location: { latitude: 40.713, longitude: -74.0058 },
      status: 'acknowledged',
      reportedBy: 'STAFF-12',
      roomNumber: 'LOBBY',
      createdAt: Date.now() - 1200000,
      updatedAt: Date.now() - 300000,
    },
  ],
  sosRequests: [
    {
      id: 'mock-sos-1',
      sessionId: 'GUEST-99',
      category: 'medical',
      guestStatus: 'emergency',
      location: { latitude: 40.7135, longitude: -74.0055 },
      roomNumber: '304',
      status: 'active',
      createdAt: Date.now() - 300000,
      updatedAt: Date.now() - 300000,
    },
  ],
  broadcastMessages: [
    {
      id: 'mock-bc-1',
      senderRole: 'staff',
      senderName: 'Property Admin',
      message:
        'Welcome to The Grand Azure Resort. Please notify staff immediately during emergencies.',
      timestamp: Date.now() - 3600000,
    },
  ],
  privateMessages: [],
  isEmergencyMode: false,
  escalatedAlerts: [],
  userLastSeenBroadcastAt: Date.now(),
};

// ─── Actions ─────────────────────────────────────────────
type AppAction =
  | { type: 'TRIGGER_EMERGENCY'; payload: EmergencyEvent }
  | { type: 'RESOLVE_EMERGENCY' }
  | {
      type: 'SEND_SOS';
      payload: { category: IssueCategory; status: GuestStatus };
    }
  | { type: 'CANCEL_SOS' }
  | { type: 'UPDATE_STATUS'; payload: GuestStatus }
  | { type: 'UPDATE_LOCATION'; payload: Partial<LocationSnapshot> }
  | { type: 'START_LOCATION_SHARING' }
  | { type: 'STOP_LOCATION_SHARING' }
  | { type: 'SET_ROOM_NUMBER'; payload: string }
  | { type: 'SET_LANGUAGE'; payload: string }
  | {
      type: 'SET_EMERGENCY_SUB_SCREEN';
      payload: 'alert' | 'sos' | 'guidance' | 'channel';
    }
  | { type: 'TOGGLE_GUIDANCE_STEP'; payload: number }
  | { type: 'RETURN_TO_NORMAL' }
  | { type: 'SUBMIT_REPORT'; payload: { category: IssueCategory } }
  | { type: 'TRIGGER_SOS_ONLY' }
  | { type: 'SET_LOCATION_PERMISSION'; payload: boolean }
  | { type: 'SET_ROLE'; payload: UserRole }
  // Communication system actions
  | {
      type: 'INIT_SOCKET_DATA';
      payload: {
        alerts: Alert[];
        sosRequests: SOSRequest[];
        broadcastMessages: BroadcastMessage[];
        privateMessages: PrivateMessage[];
        isEmergencyMode: boolean;
      };
    }
  | { type: 'ADD_INCOMING_ALERT'; payload: Alert }
  | { type: 'UPDATE_ALERT'; payload: Alert }
  | { type: 'ADD_SOS_REQUEST'; payload: SOSRequest }
  | { type: 'UPDATE_SOS_REQUEST'; payload: SOSRequest }
  | { type: 'ADD_BROADCAST_MESSAGE'; payload: BroadcastMessage }
  | { type: 'ADD_PRIVATE_MESSAGE'; payload: PrivateMessage }
  | { type: 'SET_EMERGENCY_MODE'; payload: boolean }
  | { type: 'ADD_ESCALATED_ALERT'; payload: Alert }
  | { type: 'MARK_USER_BROADCASTS_SEEN'; payload?: number };

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
        ? current.filter(i => i !== index)
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

    // ── Communication system reducers ─────────────────────

    case 'INIT_SOCKET_DATA':
      return {
        ...state,
        incomingAlerts: action.payload.alerts || [],
        sosRequests: action.payload.sosRequests || [],
        broadcastMessages: action.payload.broadcastMessages || [],
        privateMessages: action.payload.privateMessages || [],
        isEmergencyMode: action.payload.isEmergencyMode || false,
      };

    case 'ADD_INCOMING_ALERT':
      return {
        ...state,
        incomingAlerts: [action.payload, ...state.incomingAlerts],
      };

    case 'UPDATE_ALERT':
      return {
        ...state,
        incomingAlerts: state.incomingAlerts.map(a =>
          a.id === action.payload.id ? action.payload : a,
        ),
        escalatedAlerts: state.escalatedAlerts.map(a =>
          a.id === action.payload.id ? action.payload : a,
        ),
      };

    case 'ADD_SOS_REQUEST':
      return {
        ...state,
        sosRequests: [action.payload, ...state.sosRequests],
      };

    case 'UPDATE_SOS_REQUEST':
      return {
        ...state,
        sosRequests: state.sosRequests.map(s =>
          s.id === action.payload.id ? action.payload : s,
        ),
      };

    case 'ADD_BROADCAST_MESSAGE':
      return {
        ...state,
        broadcastMessages: [...state.broadcastMessages, action.payload],
      };

    case 'ADD_PRIVATE_MESSAGE':
      return {
        ...state,
        privateMessages: [...state.privateMessages, action.payload],
      };

    case 'SET_EMERGENCY_MODE':
      return { ...state, isEmergencyMode: action.payload };

    case 'ADD_ESCALATED_ALERT':
      return {
        ...state,
        escalatedAlerts: [action.payload, ...state.escalatedAlerts],
      };

    case 'MARK_USER_BROADCASTS_SEEN':
      return {
        ...state,
        userLastSeenBroadcastAt: action.payload ?? Date.now(),
      };

    default:
      return state;
  }
}
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  triggerEmergency: (event: EmergencyEvent) => void;
  setRole: (role: UserRole) => void;
  navigateToReportRef: React.MutableRefObject<(() => void) | null>;
  requestLocationPermission: () => Promise<boolean>;
  fetchLocation: () => Promise<void>;

  resolveEmergency: () => void;
  sendSOS: (category: IssueCategory, status: GuestStatus) => void;
  cancelSOS: () => void;
  updateStatus: (status: GuestStatus) => void;
  returnToNormal: () => void;
  submitReport: (category: IssueCategory) => void;

  // Communication system simulation
  mockSendSOS: (data: any) => void;
  mockSendReport: (data: any) => void;
  mockRespondToAlert: (
    alertId: string,
    response: string,
    newStatus: string,
  ) => void;
  mockEscalateAlert: (alertId: string, notes: string) => void;
  mockTriggerEmergencyMode: (data: any) => void;
  mockDeactivateEmergency: () => void;
  mockSendAnnouncement: (message: string) => void;
  mockRespondToSOS: (
    sosId: string,
    response: string,
    newStatus: string,
  ) => void;
  mockResponderUpdateAlert: (
    alertId: string,
    newStatus: string,
    notes?: string,
  ) => void;
  mockSendPrivateMessage: (message: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const navigateToReportRef = useRef<(() => void) | null>(null);

  const triggerEmergency = useCallback((event: EmergencyEvent) => {
    dispatch({
      type: 'TRIGGER_EMERGENCY',
      payload: {
        ...event,
        issuedAt: Date.now(),
        isActive: true,
      },
    });
    safeVibrate([200, 100, 200, 100, 400]);
  }, []);

  const setRole = useCallback((role: UserRole) => {
    dispatch({ type: 'SET_ROLE', payload: role });
  }, []);

  const resolveEmergency = useCallback(() => {
    dispatch({ type: 'RESOLVE_EMERGENCY' });
  }, []);

  const sendSOS = useCallback(
    (category: IssueCategory, status: GuestStatus) => {
      dispatch({ type: 'SEND_SOS', payload: { category, status } });
      safeVibrate([300, 100, 300]);
    },
    [],
  );

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
        console.log(
          '[Location] Android permission:',
          isGranted ? 'GRANTED' : 'DENIED',
        );
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
          console.log(
            '[Location] Got position:',
            latitude,
            longitude,
            '±',
            accuracy,
            'm',
          );
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
          console.warn(
            '[Location] getCurrentPosition failed:',
            error?.message || error,
          );
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    } catch (err) {
      console.error('[Location] fetchLocation error:', err);
    }
  }, []);

  // ─── Simulation Helpers ──────────────────────────────────

  const mockSendSOS = useCallback(
    (data: any) => {
      // Keep user SOS UI in sync even when backend wiring is mocked.
      dispatch({
        type: 'SEND_SOS',
        payload: {
          category: data.category,
          status: data.guestStatus,
        },
      });

      const sos: SOSRequest = {
        id: `mock-sos-${Date.now()}`,
        sessionId: state.guestSession.sessionId,
        category: data.category,
        guestStatus: data.guestStatus,
        location: data.location,
        roomNumber: data.roomNumber,
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      dispatch({ type: 'ADD_SOS_REQUEST', payload: sos });

      // Auto-create an alert for the staff too
      const alert: Alert = {
        id: `mock-alert-sos-${Date.now()}`,
        type: 'sos',
        severity: 'critical',
        message: `SOS Signal: ${data.category}`,
        location: data.location,
        status: 'pending',
        reportedBy: state.guestSession.sessionId,
        roomNumber: data.roomNumber,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      dispatch({ type: 'ADD_INCOMING_ALERT', payload: alert });
      safeVibrate([300, 100, 300]);
    },
    [state.guestSession.sessionId],
  );

  const mockSendReport = useCallback(
    (data: any) => {
      const alert: Alert = {
        id: `mock-rpt-${Date.now()}`,
        type: data.category,
        severity: 'warning',
        message: data.message,
        location: data.location,
        status: 'pending',
        reportedBy: state.guestSession.sessionId,
        roomNumber: data.roomNumber,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      dispatch({ type: 'ADD_INCOMING_ALERT', payload: alert });
    },
    [state.guestSession.sessionId],
  );

  const mockRespondToAlert = useCallback(
    (alertId: string, response: string, newStatus: string) => {
      const alert = state.incomingAlerts.find(a => a.id === alertId);
      if (alert) {
        dispatch({
          type: 'UPDATE_ALERT',
          payload: {
            ...alert,
            status: newStatus as any,
            staffNotes: response,
            updatedAt: Date.now(),
          },
        });
      }
    },
    [state.incomingAlerts],
  );

  const mockEscalateAlert = useCallback(
    (alertId: string, notes: string) => {
      const alert = state.incomingAlerts.find(a => a.id === alertId);
      if (alert) {
        const updated = {
          ...alert,
          status: 'escalated' as any,
          staffNotes: notes,
          updatedAt: Date.now(),
        };
        dispatch({ type: 'UPDATE_ALERT', payload: updated });
        dispatch({ type: 'ADD_ESCALATED_ALERT', payload: updated });
      }
    },
    [state.incomingAlerts],
  );

  const mockTriggerEmergencyMode = useCallback((data: any) => {
    dispatch({ type: 'SET_EMERGENCY_MODE', payload: true });
    dispatch({
      type: 'TRIGGER_EMERGENCY',
      payload: {
        id: `emg-${Date.now()}`,
        ...data,
        issuedAt: Date.now(),
        isActive: true,
      },
    });
    dispatch({ type: 'SET_EMERGENCY_SUB_SCREEN', payload: 'channel' });
  }, []);

  const mockDeactivateEmergency = useCallback(() => {
    dispatch({ type: 'SET_EMERGENCY_MODE', payload: false });
    dispatch({ type: 'RETURN_TO_NORMAL' });
  }, []);

  const mockSendAnnouncement = useCallback((message: string) => {
    const msg: BroadcastMessage = {
      id: `bc-${Date.now()}`,
      senderRole: 'staff',
      senderName: 'Security Admin',
      message,
      timestamp: Date.now(),
    };
    dispatch({ type: 'ADD_BROADCAST_MESSAGE', payload: msg });
  }, []);

  const mockRespondToSOS = useCallback(
    (sosId: string, response: string, newStatus: string) => {
      const sos = state.sosRequests.find(s => s.id === sosId);
      if (sos) {
        dispatch({
          type: 'UPDATE_SOS_REQUEST',
          payload: { ...sos, status: newStatus as any, updatedAt: Date.now() },
        });
        // If mock user, update their status pill too
        if (sos.sessionId === state.guestSession.sessionId) {
          dispatch({ type: 'UPDATE_STATUS', payload: 'acknowledged' as any });
        }
      }
    },
    [state.sosRequests, state.guestSession.sessionId],
  );

  const mockResponderUpdateAlert = useCallback(
    (alertId: string, newStatus: string, notes?: string) => {
      const alert =
        state.incomingAlerts.find(a => a.id === alertId) ||
        state.escalatedAlerts.find(a => a.id === alertId);
      if (alert) {
        dispatch({
          type: 'UPDATE_ALERT',
          payload: {
            ...alert,
            status: newStatus as any,
            staffNotes: notes || alert.staffNotes,
            updatedAt: Date.now(),
          },
        });
      }
    },
    [state.incomingAlerts, state.escalatedAlerts],
  );

  const mockSendPrivateMessage = useCallback(
    (message: string) => {
      const pm: PrivateMessage = {
        id: `pm-${Date.now()}`,
        senderRole: state.role === 'responder' ? 'responder' : 'staff',
        senderName: state.role === 'responder' ? 'Responder' : 'Staff',
        message,
        timestamp: Date.now(),
      };
      dispatch({ type: 'ADD_PRIVATE_MESSAGE', payload: pm });
    },
    [state.role],
  );

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
        mockSendSOS,
        mockSendReport,
        mockRespondToAlert,
        mockEscalateAlert,
        mockTriggerEmergencyMode,
        mockDeactivateEmergency,
        mockSendAnnouncement,
        mockRespondToSOS,
        mockResponderUpdateAlert,
        mockSendPrivateMessage,
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
