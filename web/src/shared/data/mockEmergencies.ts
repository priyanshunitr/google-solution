export interface EmergencyEvent {
  id: string;
  type: 'fire' | 'evacuation' | 'medical' | 'lockdown' | 'weather';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  instructions: string[];
  issuedAt: number;
  isActive: boolean;
}

export type IssueCategory = 'fire' | 'medical' | 'safety' | 'assistance';
export type GuestStatus = 'safe' | 'need_help' | 'unable_to_move' | 'evacuating';

export interface LocationSnapshot {
  latitude: number | null;
  longitude: number | null;
  floor?: number;
  accuracy: number;
  timestamp: number;
  isSharing: boolean;
}

export interface GuestSession {
  sessionId: string;
  propertyId: string;
  propertyName: string;
  roomNumber?: string;
  language: string;
}

export interface DistressSignal {
  sessionId: string;
  location: LocationSnapshot;
  issueCategory: IssueCategory;
  statusCode: GuestStatus;
  sentAt: number;
}

export const MOCK_EMERGENCIES: EmergencyEvent[] = [
  {
    id: 'emg-fire-001',
    type: 'fire',
    severity: 'critical',
    message: 'Fire detected on Floor 3. Please evacuate immediately using the nearest stairway. Do NOT use elevators.',
    instructions: [
      'Stay calm and alert others nearby',
      'Do NOT use elevators — use stairways only',
      'Cover your nose and mouth with a damp cloth',
      'Stay low to the ground if smoke is present',
      'Proceed to the nearest emergency exit',
      'Gather at the assembly point in the parking area',
      'Report to hotel staff once outside',
    ],
    issuedAt: Date.now(),
    isActive: true,
  },
  {
    id: 'emg-evac-002',
    type: 'evacuation',
    severity: 'critical',
    message: 'Building evacuation ordered. All guests must leave immediately via the designated emergency exits.',
    instructions: [
      'Stop what you are doing and prepare to leave',
      'Take your phone, wallet, and room key only',
      'Do NOT return to your room for belongings',
      'Follow the illuminated exit signs',
      'Use stairways — avoid elevators',
      'Proceed to the outdoor assembly point',
      'Wait for further instructions from staff',
    ],
    issuedAt: Date.now(),
    isActive: true,
  },
  {
    id: 'emg-medical-003',
    type: 'medical',
    severity: 'warning',
    message: 'A medical emergency has been reported in the lobby area. Medical responders are on the way. Please keep pathways clear.',
    instructions: [
      'Keep lobby area and hallways clear',
      'Do not crowd around the affected area',
      'If you have medical training, inform hotel staff',
      'Stay in your room if you are not directly affected',
      'Follow instructions from emergency responders',
    ],
    issuedAt: Date.now(),
    isActive: true,
  },
  {
    id: 'emg-lockdown-004',
    type: 'lockdown',
    severity: 'critical',
    message: 'Security lockdown in effect. Remain in your room. Lock your door and stay away from windows. Do NOT open the door to anyone except identified security personnel.',
    instructions: [
      'Go to your room immediately',
      'Lock and deadbolt your door',
      'Stay away from windows and exterior walls',
      'Turn off lights and remain quiet',
      'Do NOT open the door unless identifying security',
      'Call the front desk only if you need urgent help',
      'Wait for the all-clear announcement',
    ],
    issuedAt: Date.now(),
    isActive: true,
  },
  {
    id: 'emg-weather-005',
    type: 'weather',
    severity: 'warning',
    message: 'Severe weather warning issued for the area. Strong winds and heavy rainfall expected. Stay indoors and away from windows.',
    instructions: [
      'Stay indoors and move to an interior room',
      'Stay away from windows and glass doors',
      'Keep your phone charged and available',
      'Monitor updates through this app',
      'Follow any additional staff instructions',
    ],
    issuedAt: Date.now(),
    isActive: true,
  },
];

export const EMERGENCY_TYPE_INFO: Record<EmergencyEvent['type'], { icon: string; label: string; color: string }> = {
  fire: { icon: '🔥', label: 'Fire Alert', color: '#E74C3C' },
  evacuation: { icon: '🚨', label: 'Evacuation', color: '#E67E22' },
  medical: { icon: '🏥', label: 'Medical Alert', color: '#3498DB' },
  lockdown: { icon: '🔒', label: 'Security Lockdown', color: '#9B59B6' },
  weather: { icon: '⛈️', label: 'Severe Weather', color: '#F39C12' },
};

export const ISSUE_CATEGORIES: { key: IssueCategory; icon: string; label: string; description: string }[] = [
  { key: 'fire', icon: '🔥', label: 'Fire / Smoke', description: 'I see fire or smell smoke' },
  { key: 'medical', icon: '🏥', label: 'Medical', description: 'Someone needs medical help' },
  { key: 'safety', icon: '⚠️', label: 'Safety Concern', description: 'I feel unsafe or see a threat' },
  { key: 'assistance', icon: '🙋', label: 'Assistance', description: 'I need help or support' },
];

export const GUEST_STATUS_OPTIONS: { key: GuestStatus; icon: string; label: string; color: string }[] = [
  { key: 'safe', icon: '✅', label: 'I am Safe', color: '#00B894' },
  { key: 'need_help', icon: '🆘', label: 'Need Help', color: '#E74C3C' },
  { key: 'unable_to_move', icon: '🛑', label: 'Cannot Move', color: '#D63031' },
  { key: 'evacuating', icon: '🚶', label: 'Evacuating', color: '#F39C12' },
];
