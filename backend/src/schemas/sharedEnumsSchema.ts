import { z } from "zod";

// Role values used for authorization and dashboard routing.
export const userRoleSchema = z.enum(["guest", "staff", "responder", "admin"]);

// Lifecycle states of a global emergency session.
export const emergencyStatusSchema = z.enum([
  "draft",
  "active",
  "resolved",
  "cancelled",
]);

// Workflow states for incident triage and resolution.
export const incidentStatusSchema = z.enum([
  "active",
  "acknowledged",
  "responding",
  "escalated",
  "resolved",
  "cancelled",
]);

// Incident origin type, either staff alert or guest SOS.
export const incidentTypeSchema = z.enum(["alert", "sos"]);

// Severity scale used to prioritize incidents and alerts.
export const severityLevelSchema = z.enum([
  "low",
  "medium",
  "high",
  "critical",
]);

// Sender category for public broadcast messages.
export const messageKindSchema = z.enum(["system", "staff", "responder"]);

// Private message route: direct user chat or staff-responder channel.
export const privateChannelKindSchema = z.enum(["staff_responder", "direct"]);

// Device platform for push token registration.
export const pushPlatformSchema = z.enum(["android", "ios", "web"]);

// Transport medium used for notification delivery.
export const notificationChannelSchema = z.enum(["fcm", "websocket"]);

// Delivery progression state for sent notifications.
export const notificationStatusSchema = z.enum([
  "queued",
  "sent",
  "delivered",
  "seen",
  "failed",
  "invalidated",
]);

// Aggregate object containing all shared enums for convenience.
export const sharedEnumsSchema = z.object({
  userRole: userRoleSchema,
  emergencyStatus: emergencyStatusSchema,
  incidentStatus: incidentStatusSchema,
  incidentType: incidentTypeSchema,
  severityLevel: severityLevelSchema,
  messageKind: messageKindSchema,
  privateChannelKind: privateChannelKindSchema,
  pushPlatform: pushPlatformSchema,
  notificationChannel: notificationChannelSchema,
  notificationStatus: notificationStatusSchema,
});

export type UserRole = z.infer<typeof userRoleSchema>;
export type EmergencyStatus = z.infer<typeof emergencyStatusSchema>;
export type IncidentStatus = z.infer<typeof incidentStatusSchema>;
export type IncidentType = z.infer<typeof incidentTypeSchema>;
export type SeverityLevel = z.infer<typeof severityLevelSchema>;
export type MessageKind = z.infer<typeof messageKindSchema>;
export type PrivateChannelKind = z.infer<typeof privateChannelKindSchema>;
export type PushPlatform = z.infer<typeof pushPlatformSchema>;
export type NotificationChannel = z.infer<typeof notificationChannelSchema>;
export type NotificationStatus = z.infer<typeof notificationStatusSchema>;
