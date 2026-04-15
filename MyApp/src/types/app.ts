import { EmergencyEvent, GuestSession, GuestStatus, LocationSnapshot, IssueCategory, DistressSignal } from './emergency';

export type AppMode = 'normal' | 'emergency' | 'resolved';
export type UserRole = 'guest' | 'staff' | 'responder' | null;
export type SOSTriggerSource = 'home' | 'alert';

export interface AppState {
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
  sosTriggerSource: SOSTriggerSource;
  locationPermissionGranted: boolean;
  role: UserRole;
}

export type AppAction =
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
