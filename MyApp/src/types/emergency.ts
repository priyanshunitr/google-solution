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
