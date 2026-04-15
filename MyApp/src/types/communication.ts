/**
 * Shared types for the real-time communication system.
 * Used by both Staff Dashboard, Responder Dashboard, and User screens.
 */

// ─── Alert Types ─────────────────────────────────────────────

export type AlertType = 'fire' | 'medical' | 'safety' | 'assistance' | 'sos';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertStatus = 'pending' | 'acknowledged' | 'escalated' | 'resolved';

export interface AlertLocation {
  latitude: number | null;
  longitude: number | null;
  floor?: number;
  area?: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  location: AlertLocation;
  status: AlertStatus;
  reportedBy: string; // session ID
  reporterName?: string;
  roomNumber?: string;
  assignedTo?: string;
  staffNotes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AlertFilter {
  type?: AlertType | 'all';
  severity?: AlertSeverity | 'all';
  status?: AlertStatus | 'all';
  roomNumber?: string;
}

// ─── SOS Types ───────────────────────────────────────────────

export type SOSStatus = 'active' | 'acknowledged' | 'responding' | 'resolved';

export interface SOSRequest {
  id: string;
  sessionId: string;
  category: string;
  guestStatus: string;
  location: AlertLocation;
  roomNumber?: string;
  status: SOSStatus;
  respondedBy?: string;
  createdAt: number;
  updatedAt: number;
}

// ─── Message Types ───────────────────────────────────────────

export type MessageChannel = 'broadcast' | 'staff-responder' | 'user-staff';

export interface BroadcastMessage {
  id: string;
  senderRole: 'staff' | 'responder';
  senderName: string;
  message: string;
  timestamp: number;
}

export interface PrivateMessage {
  id: string;
  senderRole: 'staff' | 'responder';
  senderName: string;
  message: string;
  timestamp: number;
}

// ─── Socket Event Payloads ───────────────────────────────────

export interface UserSOSPayload {
  sessionId: string;
  category: string;
  guestStatus: string;
  location: AlertLocation;
  roomNumber?: string;
  message?: string;
}

export interface UserReportPayload {
  sessionId: string;
  category: string;
  message: string;
  location: AlertLocation;
  roomNumber?: string;
}

export interface StaffEscalatePayload {
  alertId: string;
  notes: string;
}

export interface StaffEmergencyPayload {
  type: string;
  severity: string;
  message: string;
  instructions: string[];
}

export interface StaffRespondPayload {
  alertId: string;
  response: string;
  newStatus: AlertStatus;
}

export interface AnnouncePayload {
  message: string;
  senderRole: 'staff' | 'responder';
  senderName: string;
}

export interface PrivateMessagePayload {
  message: string;
  senderRole: 'staff' | 'responder';
  senderName: string;
}

// ─── Socket Event Names ─────────────────────────────────────

export const SocketEvents = {
  // User → Staff
  USER_SOS: 'user:sos',
  USER_REPORT: 'user:report',

  // Staff actions
  STAFF_ESCALATE: 'staff:escalate',
  STAFF_EMERGENCY: 'staff:emergency',
  STAFF_ANNOUNCE: 'staff:announce',
  STAFF_RESPOND: 'staff:respond',
  STAFF_MSG_RESPONDER: 'staff:message-responder',

  // Responder actions
  RESPONDER_MSG_STAFF: 'responder:message-staff',
  RESPONDER_ANNOUNCE: 'responder:announce',
  RESPONDER_UPDATE: 'responder:update-alert',

  // Server → Client events
  NEW_ALERT: 'server:new-alert',
  ALERT_UPDATED: 'server:alert-updated',
  NEW_SOS: 'server:new-sos',
  SOS_UPDATED: 'server:sos-updated',
  BROADCAST: 'server:broadcast',
  PRIVATE_MSG: 'server:private-message',
  EMERGENCY_ACTIVATED: 'server:emergency-activated',
  EMERGENCY_DEACTIVATED: 'server:emergency-deactivated',
  ESCALATED_ALERT: 'server:escalated-alert',
} as const;
