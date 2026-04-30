export type UserRole = 'guest' | 'staff' | 'responder' | 'admin';

export type AuthUser = {
  id: string;
  full_name: string;
  email?: string | null;
  phone: string;
  role: UserRole;
};

export type ApiError = {
  message: string;
  status?: number;
};

export type FeatureKey =
  | 'guestOps'
  | 'staffNotifications'
  | 'emergencySessions'
  | 'incidents'
  | 'responderOps'
  | 'communications'
  | 'deviceTokens';

export type FeatureTile = {
  key: FeatureKey;
  title: string;
  subtitle: string;
  enabledByDefault?: boolean;
};
