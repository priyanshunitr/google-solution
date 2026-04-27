import { httpRequest } from './http';
import { AuthUser } from '../types/app';

export type NotificationItem = {
  id: string;
  title?: string | null;
  body: string;
  status: string;
  data?: Record<string, unknown>;
  created_at?: string;
};

export const backend = {
  signup(payload: {
    name: string;
    phone: string;
    email?: string;
    password: string;
    role: 'guest' | 'staff' | 'responder' | 'admin';
  }) {
    return httpRequest<AuthUser>('/api/users/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  login(payload: { phone: string; password: string }) {
    return httpRequest<{ user: AuthUser }>('/api/users/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  createGuestAlert(payload: {
    emergency_session_id?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    location_text?: string;
  }) {
    return httpRequest<{ alert: unknown }>('/api/guests/alerts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  createSos(payload: {
    emergency_session_id?: string;
    message?: string;
    latitude?: number;
    longitude?: number;
    location_accuracy_m?: number;
    location_captured_at?: string;
  }) {
    return httpRequest<{ sos_request: unknown }>('/api/guests/sos', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getMyAlerts() {
    return httpRequest<{ alerts: unknown[] }>('/api/guests/myalerts');
  },

  getStaffNotifications() {
    return httpRequest<{ notifications: NotificationItem[] }>(
      '/api/staffs/notifications',
    );
  },

  markStaffNotificationSeen(id: string) {
    return httpRequest<{ notification: unknown }>(
      `/api/staffs/notifications/${id}/seen`,
      {
        method: 'PATCH',
      },
    );
  },

  markStaffNotificationFalse(id: string) {
    return httpRequest<{ notification: unknown }>(
      `/api/staffs/notifications/${id}/false`,
      {
        method: 'POST',
      },
    );
  },

  escalateStaffNotification(id: string, issueText: string) {
    return httpRequest<{ incident_id: string }>(
      `/api/staffs/notifications/${id}/send-emergency`,
      {
        method: 'POST',
        body: JSON.stringify({ issueText }),
      },
    );
  },

  getEmergencies() {
    return httpRequest<{ sessions: unknown[] }>('/api/emergencies');
  },

  createEmergency(payload: {
    status?: 'draft' | 'active' | 'resolved' | 'cancelled';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    instructions?: string;
  }) {
    return httpRequest<{ session: unknown }>('/api/emergencies', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  activateEmergency(id: string) {
    return httpRequest<{ session: unknown }>(
      `/api/emergencies/${id}/activate`,
      {
        method: 'POST',
      },
    );
  },

  resolveEmergency(id: string) {
    return httpRequest<{ session: unknown }>(`/api/emergencies/${id}/resolve`, {
      method: 'POST',
    });
  },

  getDeviceTokens() {
    return httpRequest<{ tokens: unknown[] }>('/api/devices/tokens');
  },

  registerDeviceToken(payload: {
    platform: 'android' | 'ios' | 'web';
    push_token: string;
    device_label?: string;
    app_version?: string;
    is_active?: boolean;
    last_seen_at?: string;
  }) {
    return httpRequest<{ token: unknown }>('/api/devices/tokens', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateDeviceToken(id: string, payload: Record<string, unknown>) {
    return httpRequest<{ token: unknown }>(`/api/devices/tokens/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deactivateDeviceToken(id: string) {
    return httpRequest<{ token: unknown }>(`/api/devices/tokens/${id}`, {
      method: 'DELETE',
    });
  },

  getBroadcasts() {
    return httpRequest<{ messages: unknown[] }>('/api/comms/broadcast');
  },

  sendBroadcast(payload: {
    emergency_session_id?: string;
    sender_kind?: 'staff' | 'responder' | 'system';
    body: string;
    target_roles?: Array<'guest' | 'staff' | 'responder' | 'admin'>;
  }) {
    return httpRequest<{ message: unknown }>('/api/comms/broadcast', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  markBroadcastRead(id: string) {
    return httpRequest<{ read: unknown }>(`/api/comms/broadcast/${id}/read`, {
      method: 'POST',
    });
  },

  getPrivateMessages() {
    return httpRequest<{ messages: unknown[] }>('/api/comms/private');
  },

  sendPrivateMessage(payload: {
    emergency_session_id?: string;
    recipient_user_id?: string;
    channel?: 'staff_responder' | 'direct';
    body: string;
  }) {
    return httpRequest<{ message: unknown }>('/api/comms/private', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getIncidents() {
    return httpRequest<{ incidents: unknown[] }>('/api/incidents');
  },

  updateIncidentStatus(
    id: string,
    payload: { to_status: string; reason?: string },
  ) {
    return httpRequest<{ incident: unknown }>(`/api/incidents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  getResponderIncidents() {
    return httpRequest<{ incidents: unknown[] }>('/api/responders/incidents');
  },

  updateResponderIncidentStatus(
    id: string,
    payload: { to_status: string; reason?: string },
  ) {
    return httpRequest<{ incident: unknown }>(
      `/api/responders/incidents/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
    );
  },

  getResponderNotifications() {
    return httpRequest<{ notifications: NotificationItem[] }>(
      '/api/responders/notifications',
    );
  },

  markResponderNotificationSeen(id: string) {
    return httpRequest<{ notification: unknown }>(
      `/api/responders/notifications/${id}/seen`,
      {
        method: 'PATCH',
      },
    );
  },
};
