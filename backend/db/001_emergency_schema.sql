-- 001_emergency_schema.sql
-- Core schema for multi-role emergency response backend

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('guest', 'staff', 'responder', 'admin');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'emergency_status') THEN
        CREATE TYPE emergency_status AS ENUM ('draft', 'active', 'resolved', 'cancelled');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'incident_status') THEN
        CREATE TYPE incident_status AS ENUM (
            'active',
            'acknowledged',
            'responding',
            'escalated',
            'resolved',
            'cancelled'
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'incident_type') THEN
        CREATE TYPE incident_type AS ENUM ('alert', 'sos');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'severity_level') THEN
        CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_kind') THEN
        CREATE TYPE message_kind AS ENUM ('system', 'staff', 'responder');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'private_channel_kind') THEN
        CREATE TYPE private_channel_kind AS ENUM ('staff_responder', 'direct');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'push_platform') THEN
        CREATE TYPE push_platform AS ENUM ('android', 'ios', 'web');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_channel') THEN
        CREATE TYPE notification_channel AS ENUM ('fcm', 'websocket');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_status') THEN
        CREATE TYPE notification_status AS ENUM ('queued', 'sent', 'delivered', 'seen', 'failed', 'invalidated');
    END IF;
END
$$;

-- Registered users across guest, staff, responder, and admin roles.
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(30) UNIQUE,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (phone IS NOT NULL)
);

-- Global emergency lifecycle records controlled by staff/admin.
CREATE TABLE IF NOT EXISTS emergency_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status emergency_status NOT NULL DEFAULT 'draft',
    severity severity_level NOT NULL,
    title VARCHAR(180) NOT NULL,
    message TEXT NOT NULL,
    instructions TEXT,
    activated_by UUID REFERENCES users(id),
    activated_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- At most one active emergency at a time.
CREATE UNIQUE INDEX IF NOT EXISTS ux_emergency_sessions_one_active
    ON emergency_sessions ((status))
    WHERE status = 'active';

-- Alert events created by users/staff and linked to an emergency session.
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emergency_session_id UUID REFERENCES emergency_sessions(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id),
    severity severity_level NOT NULL,
    title VARCHAR(180) NOT NULL,
    description TEXT NOT NULL,
    location_text VARCHAR(240),
    is_broadcast BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Guest-initiated SOS requests with optional geo-location details.
CREATE TABLE IF NOT EXISTS sos_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emergency_session_id UUID REFERENCES emergency_sessions(id) ON DELETE SET NULL,
    guest_user_id UUID NOT NULL REFERENCES users(id),
    message TEXT,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    location_accuracy_m NUMERIC(10, 2),
    location_captured_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (
        (latitude IS NULL AND longitude IS NULL)
        OR (latitude IS NOT NULL AND longitude IS NOT NULL)
    )
);

-- Unified incident queue derived from either alerts or SOS requests.
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emergency_session_id UUID REFERENCES emergency_sessions(id) ON DELETE SET NULL,
    incident_type incident_type NOT NULL,
    status incident_status NOT NULL DEFAULT 'active',
    priority severity_level NOT NULL DEFAULT 'medium',
    alert_id UUID UNIQUE REFERENCES alerts(id) ON DELETE CASCADE,
    sos_request_id UUID UNIQUE REFERENCES sos_requests(id) ON DELETE CASCADE,
    assigned_staff_user_id UUID REFERENCES users(id),
    assigned_responder_user_id UUID REFERENCES users(id),
    acknowledged_at TIMESTAMPTZ,
    responding_at TIMESTAMPTZ,
    escalated_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (
        (alert_id IS NOT NULL AND sos_request_id IS NULL AND incident_type = 'alert')
        OR (alert_id IS NULL AND sos_request_id IS NOT NULL AND incident_type = 'sos')
    )
);

-- Immutable audit trail of all incident status transitions.
CREATE TABLE IF NOT EXISTS incident_status_history (
    id BIGSERIAL PRIMARY KEY,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    from_status incident_status,
    to_status incident_status NOT NULL,
    changed_by UUID REFERENCES users(id),
    reason TEXT,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Public announcements sent to all relevant app users.
CREATE TABLE IF NOT EXISTS broadcast_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emergency_session_id UUID REFERENCES emergency_sessions(id) ON DELETE SET NULL,
    sender_user_id UUID REFERENCES users(id),
    sender_kind message_kind NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Per-user read receipts for broadcast announcements.
CREATE TABLE IF NOT EXISTS broadcast_message_reads (
    message_id UUID NOT NULL REFERENCES broadcast_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (message_id, user_id)
);

-- Direct or role-channel private communication records.
CREATE TABLE IF NOT EXISTS private_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emergency_session_id UUID REFERENCES emergency_sessions(id) ON DELETE SET NULL,
    sender_user_id UUID NOT NULL REFERENCES users(id),
    recipient_user_id UUID REFERENCES users(id),
    channel private_channel_kind,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (recipient_user_id IS NOT NULL OR channel IS NOT NULL)
);

-- Active device tokens used for FCM push notification fan-out.
CREATE TABLE IF NOT EXISTS device_push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform push_platform NOT NULL,
    push_token TEXT NOT NULL,
    device_label VARCHAR(120),
    app_version VARCHAR(40),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (push_token)
);

-- Delivery log for websocket and FCM notification attempts/states.
CREATE TABLE IF NOT EXISTS notification_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emergency_session_id UUID REFERENCES emergency_sessions(id) ON DELETE SET NULL,
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    broadcast_message_id UUID REFERENCES broadcast_messages(id) ON DELETE SET NULL,
    private_message_id UUID REFERENCES private_messages(id) ON DELETE SET NULL,
    channel notification_channel NOT NULL,
    status notification_status NOT NULL DEFAULT 'queued',
    title VARCHAR(180),
    body TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    provider_message_id VARCHAR(255),
    error_message TEXT,
    queued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (
        incident_id IS NOT NULL
        OR broadcast_message_id IS NOT NULL
        OR private_message_id IS NOT NULL
        OR emergency_session_id IS NOT NULL
    )
);

-- Generic backend action log for traceability and investigations.
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    actor_user_id UUID REFERENCES users(id),
    action VARCHAR(80) NOT NULL,
    entity_type VARCHAR(80) NOT NULL,
    entity_id UUID,
    meta JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_users_role ON users(role);
CREATE INDEX IF NOT EXISTS ix_users_active ON users(is_active);

CREATE INDEX IF NOT EXISTS ix_alerts_session_created_at ON alerts(emergency_session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_sos_guest_created_at ON sos_requests(guest_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_sos_session_created_at ON sos_requests(emergency_session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_incidents_session_status ON incidents(emergency_session_id, status);
CREATE INDEX IF NOT EXISTS ix_incidents_staff_status ON incidents(assigned_staff_user_id, status);
CREATE INDEX IF NOT EXISTS ix_incidents_responder_status ON incidents(assigned_responder_user_id, status);
CREATE INDEX IF NOT EXISTS ix_incidents_created_at ON incidents(created_at DESC);

CREATE INDEX IF NOT EXISTS ix_incident_history_incident_time
    ON incident_status_history(incident_id, changed_at DESC);

CREATE INDEX IF NOT EXISTS ix_broadcast_created_at ON broadcast_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS ix_private_messages_created_at ON private_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS ix_private_messages_sender ON private_messages(sender_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_private_messages_recipient ON private_messages(recipient_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_device_push_tokens_user_active ON device_push_tokens(user_id, is_active);
CREATE INDEX IF NOT EXISTS ix_device_push_tokens_platform ON device_push_tokens(platform, is_active);

CREATE INDEX IF NOT EXISTS ix_notification_deliveries_user_status ON notification_deliveries(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_notification_deliveries_channel_status ON notification_deliveries(channel, status, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_notification_deliveries_incident ON notification_deliveries(incident_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_notification_deliveries_broadcast ON notification_deliveries(broadcast_message_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_notification_deliveries_private_message ON notification_deliveries(private_message_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS ix_audit_actor_time ON audit_log(actor_user_id, created_at DESC);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_set_updated_at ON users;
CREATE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_emergency_sessions_set_updated_at ON emergency_sessions;
CREATE TRIGGER trg_emergency_sessions_set_updated_at
BEFORE UPDATE ON emergency_sessions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_sos_requests_set_updated_at ON sos_requests;
CREATE TRIGGER trg_sos_requests_set_updated_at
BEFORE UPDATE ON sos_requests
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_incidents_set_updated_at ON incidents;
CREATE TRIGGER trg_incidents_set_updated_at
BEFORE UPDATE ON incidents
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_device_push_tokens_set_updated_at ON device_push_tokens;
CREATE TRIGGER trg_device_push_tokens_set_updated_at
BEFORE UPDATE ON device_push_tokens
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_notification_deliveries_set_updated_at ON notification_deliveries;
CREATE TRIGGER trg_notification_deliveries_set_updated_at
BEFORE UPDATE ON notification_deliveries
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

COMMIT;
