-- 002_dummy_seed.sql
-- Demo seed data for every table in the emergency response schema.

BEGIN;

TRUNCATE TABLE
    audit_log,
    notification_deliveries,
    device_push_tokens,
    private_messages,
    broadcast_message_reads,
    broadcast_messages,
    incident_status_history,
    incidents,
    sos_requests,
    alerts,
    emergency_sessions,
    users
RESTART IDENTITY CASCADE;

-- Users across all supported roles.
INSERT INTO users (
    id,
    full_name,
    email,
    phone,
    password_hash,
    role,
    is_active,
    last_login_at,
    created_at,
    updated_at
)
VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        'Guest One',
        'guest.one@example.com',
        '+15550000001',
        'hashed-password-guest',
        'guest',
        TRUE,
        '2026-04-16T08:00:00Z',
        '2026-04-16T07:30:00Z',
        '2026-04-16T08:00:00Z'
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'Staff One',
        'staff.one@example.com',
        '+15550000002',
        'hashed-password-staff',
        'staff',
        TRUE,
        '2026-04-16T08:05:00Z',
        '2026-04-16T07:30:00Z',
        '2026-04-16T08:05:00Z'
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'Responder One',
        'responder.one@example.com',
        '+15550000003',
        'hashed-password-responder',
        'responder',
        TRUE,
        '2026-04-16T08:10:00Z',
        '2026-04-16T07:30:00Z',
        '2026-04-16T08:10:00Z'
    ),
    (
        '44444444-4444-4444-4444-444444444444',
        'Admin One',
        'admin.one@example.com',
        '+15550000004',
        'hashed-password-admin',
        'admin',
        TRUE,
        '2026-04-16T08:15:00Z',
        '2026-04-16T07:30:00Z',
        '2026-04-16T08:15:00Z'
    );

-- Emergency sessions with different lifecycle states.
INSERT INTO emergency_sessions (
    id,
    status,
    severity,
    title,
    message,
    instructions,
    activated_by,
    activated_at,
    resolved_by,
    resolved_at,
    created_at,
    updated_at
)
VALUES
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'active',
        'critical',
        'Fire in West Wing',
        'Smoke detected in the west wing evacuation zone.',
        'Evacuate via the nearest stairwell and meet at assembly point B.',
        '22222222-2222-2222-2222-222222222222',
        '2026-04-16T09:00:00Z',
        NULL,
        NULL,
        '2026-04-16T09:00:00Z',
        '2026-04-16T09:00:00Z'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'resolved',
        'high',
        'Power Outage - Lobby',
        'Main lobby power interruption resolved.',
        'Use the secondary entrance until power stabilizes.',
        '22222222-2222-2222-2222-222222222222',
        '2026-04-16T06:30:00Z',
        '44444444-4444-4444-4444-444444444444',
        '2026-04-16T07:15:00Z',
        '2026-04-16T06:30:00Z',
        '2026-04-16T07:15:00Z'
    );

-- Alerts linked to the emergency sessions.
INSERT INTO alerts (
    id,
    emergency_session_id,
    created_by,
    severity,
    title,
    description,
    location_text,
    is_broadcast,
    created_at
)
VALUES
    (
        '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '22222222-2222-2222-2222-222222222222',
        'critical',
        'Smoke detected',
        'Smoke sensor triggered in the west wing corridor.',
        'West Wing - Corridor 3',
        TRUE,
        '2026-04-16T09:02:00Z'
    ),
    (
        '22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '22222222-2222-2222-2222-222222222222',
        'high',
        'Lobby outage alert',
        'Report from staff about power interruption in the lobby.',
        'Main Lobby',
        FALSE,
        '2026-04-16T06:35:00Z'
    );

-- SOS requests submitted by guests.
INSERT INTO sos_requests (
    id,
    emergency_session_id,
    guest_user_id,
    message,
    latitude,
    longitude,
    location_accuracy_m,
    location_captured_at,
    created_at,
    updated_at
)
VALUES
    (
        '33333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '11111111-1111-1111-1111-111111111111',
        'Need assistance near the west stairwell.',
        37.774929,
        -122.419416,
        6.5,
        '2026-04-16T09:03:00Z',
        '2026-04-16T09:03:00Z',
        '2026-04-16T09:03:00Z'
    ),
    (
        '44444444-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '11111111-1111-1111-1111-111111111111',
        'Lost signal near lobby during outage.',
        37.775100,
        -122.419300,
        8.2,
        '2026-04-16T06:40:00Z',
        '2026-04-16T06:40:00Z',
        '2026-04-16T06:40:00Z'
    );

-- Incidents derived from alerts/SOS requests.
INSERT INTO incidents (
    id,
    emergency_session_id,
    incident_type,
    status,
    priority,
    alert_id,
    sos_request_id,
    assigned_staff_user_id,
    assigned_responder_user_id,
    acknowledged_at,
    responding_at,
    escalated_at,
    resolved_at,
    created_at,
    updated_at
)
VALUES
    (
        '55555555-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'alert',
        'acknowledged',
        'critical',
        '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        NULL,
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        '2026-04-16T09:04:00Z',
        '2026-04-16T09:06:00Z',
        NULL,
        NULL,
        '2026-04-16T09:02:00Z',
        '2026-04-16T09:06:00Z'
    ),
    (
        '66666666-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'sos',
        'escalated',
        'high',
        NULL,
        '33333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        '2026-04-16T09:05:00Z',
        '2026-04-16T09:07:00Z',
        '2026-04-16T09:08:00Z',
        NULL,
        '2026-04-16T09:03:00Z',
        '2026-04-16T09:08:00Z'
    );

-- Status history for the incidents.
INSERT INTO incident_status_history (
    id,
    incident_id,
    from_status,
    to_status,
    changed_by,
    reason,
    changed_at
)
VALUES
    (
        1,
        '55555555-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        NULL,
        'active',
        '22222222-2222-2222-2222-222222222222',
        'Initial alert created from sensor trigger',
        '2026-04-16T09:02:00Z'
    ),
    (
        2,
        '55555555-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'active',
        'acknowledged',
        '22222222-2222-2222-2222-222222222222',
        'Staff acknowledged the alert',
        '2026-04-16T09:04:00Z'
    ),
    (
        3,
        '66666666-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        NULL,
        'active',
        '22222222-2222-2222-2222-222222222222',
        'SOS request created',
        '2026-04-16T09:03:00Z'
    ),
    (
        4,
        '66666666-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'active',
        'escalated',
        '33333333-3333-3333-3333-333333333333',
        'Escalated to responder',
        '2026-04-16T09:08:00Z'
    );

-- Broadcast announcements sent during the active emergency.
INSERT INTO broadcast_messages (
    id,
    emergency_session_id,
    sender_user_id,
    sender_kind,
    body,
    created_at
)
VALUES
    (
        '77777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '22222222-2222-2222-2222-222222222222',
        'staff',
        'Evacuate the west wing immediately and follow staff guidance.',
        '2026-04-16T09:05:00Z'
    ),
    (
        '88888888-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '33333333-3333-3333-3333-333333333333',
        'responder',
        'Responder team is en route to the west wing.',
        '2026-04-16T09:09:00Z'
    );

-- Read receipts for broadcast messages.
INSERT INTO broadcast_message_reads (
    message_id,
    user_id,
    seen_at
)
VALUES
    (
        '77777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '11111111-1111-1111-1111-111111111111',
        '2026-04-16T09:05:30Z'
    ),
    (
        '77777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '44444444-4444-4444-4444-444444444444',
        '2026-04-16T09:05:45Z'
    );

-- Private messages for staff-responder coordination and direct chat.
INSERT INTO private_messages (
    id,
    emergency_session_id,
    sender_user_id,
    recipient_user_id,
    channel,
    body,
    created_at
)
VALUES
    (
        '99999999-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        'staff_responder',
        'Please confirm west stairwell clearance.',
        '2026-04-16T09:06:30Z'
    ),
    (
        'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        'direct',
        'I am near the west stairwell and safe.',
        '2026-04-16T09:07:00Z'
    );

-- Device push tokens for guests and staff devices.
INSERT INTO device_push_tokens (
    id,
    user_id,
    platform,
    push_token,
    device_label,
    app_version,
    is_active,
    last_seen_at,
    created_at,
    updated_at
)
VALUES
    (
        'bbbbbbbb-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '11111111-1111-1111-1111-111111111111',
        'android',
        'fcm-token-guest-001',
        'Guest Phone',
        '1.0.0',
        TRUE,
        '2026-04-16T09:00:00Z',
        '2026-04-16T08:59:00Z',
        '2026-04-16T09:00:00Z'
    ),
    (
        'cccccccc-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '22222222-2222-2222-2222-222222222222',
        'ios',
        'fcm-token-staff-001',
        'Staff iPhone',
        '1.0.0',
        TRUE,
        '2026-04-16T09:01:00Z',
        '2026-04-16T08:58:00Z',
        '2026-04-16T09:01:00Z'
    );

-- Notification delivery records across websocket and fcm channels.
INSERT INTO notification_deliveries (
    id,
    user_id,
    emergency_session_id,
    incident_id,
    broadcast_message_id,
    private_message_id,
    channel,
    status,
    title,
    body,
    data,
    provider_message_id,
    error_message,
    queued_at,
    sent_at,
    delivered_at,
    seen_at,
    created_at,
    updated_at
)
VALUES
    (
        'dddddddd-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '11111111-1111-1111-1111-111111111111',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '55555555-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        NULL,
        NULL,
        'websocket',
        'seen',
        'Alert updated',
        'A new alert status update is available.',
        '{"type":"incident_update","status":"acknowledged"}'::jsonb,
        NULL,
        NULL,
        '2026-04-16T09:04:00Z',
        '2026-04-16T09:04:01Z',
        '2026-04-16T09:04:02Z',
        '2026-04-16T09:04:10Z',
        '2026-04-16T09:04:00Z',
        '2026-04-16T09:04:10Z'
    ),
    (
        'eeeeeeee-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '11111111-1111-1111-1111-111111111111',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        NULL,
        '77777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        NULL,
        'fcm',
        'delivered',
        'Evacuation notice',
        'Staff broadcast: evacuate immediately.',
        '{"type":"broadcast"}'::jsonb,
        'fcm-message-001',
        NULL,
        '2026-04-16T09:05:00Z',
        '2026-04-16T09:05:01Z',
        '2026-04-16T09:05:04Z',
        NULL,
        '2026-04-16T09:05:00Z',
        '2026-04-16T09:05:04Z'
    ),
    (
        'ffffffff-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '33333333-3333-3333-3333-333333333333',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        NULL,
        NULL,
        '99999999-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'websocket',
        'sent',
        'Private coordination',
        'New private message from staff.',
        '{"type":"private_message"}'::jsonb,
        NULL,
        NULL,
        '2026-04-16T09:06:30Z',
        '2026-04-16T09:06:31Z',
        NULL,
        NULL,
        '2026-04-16T09:06:30Z',
        '2026-04-16T09:06:31Z'
    );

-- Audit trail for major operations.
INSERT INTO audit_log (
    id,
    actor_user_id,
    action,
    entity_type,
    entity_id,
    meta,
    created_at
)
VALUES
    (
        1,
        '22222222-2222-2222-2222-222222222222',
        'create_emergency_session',
        'emergency_sessions',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '{"severity":"critical","source":"staff_dashboard"}'::jsonb,
        '2026-04-16T09:00:00Z'
    ),
    (
        2,
        '22222222-2222-2222-2222-222222222222',
        'acknowledge_alert',
        'incidents',
        '55555555-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '{"status":"acknowledged"}'::jsonb,
        '2026-04-16T09:04:00Z'
    ),
    (
        3,
        '33333333-3333-3333-3333-333333333333',
        'send_broadcast',
        'broadcast_messages',
        '77777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '{"channel":"fcm"}'::jsonb,
        '2026-04-16T09:05:00Z'
    );

COMMIT;
