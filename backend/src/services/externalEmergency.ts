import pool from "../lib/dbConnect.js";

export type ExternalEmergencyPayload = {
  incidentId: string;
  emergencySessionId: string | null;
  issueText: string;
  escalatedByUserId: string | null;
  sourceType: "alert" | "sos";
  sourceId: string;
  priority: "low" | "medium" | "high" | "critical";
};

export async function notifyExternalEmergencyServices(
  payload: ExternalEmergencyPayload,
) {
  const webhookUrl = process.env.EMERGENCY_SERVICES_WEBHOOK_URL;

  if (!webhookUrl) {
    await pool.query(
      `
        INSERT INTO audit_log (actor_user_id, action, entity_type, entity_id, meta)
        VALUES ($1, 'external_emergency_webhook_skipped', 'incident', $2, $3::jsonb)
      `,
      [
        payload.escalatedByUserId,
        payload.incidentId,
        JSON.stringify({ reason: "missing_webhook_url" }),
      ],
    );

    return { delivered: false, reason: "missing_webhook_url" as const };
  }

  const body = {
    incident_id: payload.incidentId,
    emergency_session_id: payload.emergencySessionId,
    issue_text: payload.issueText,
    escalated_by_user_id: payload.escalatedByUserId,
    source_type: payload.sourceType,
    source_id: payload.sourceId,
    priority: payload.priority,
    sent_at: new Date().toISOString(),
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.EMERGENCY_SERVICES_WEBHOOK_TOKEN
        ? {
            Authorization: `Bearer ${process.env.EMERGENCY_SERVICES_WEBHOOK_TOKEN}`,
          }
        : {}),
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();

  await pool.query(
    `
      INSERT INTO audit_log (actor_user_id, action, entity_type, entity_id, meta)
      VALUES ($1, $2, 'incident', $3, $4::jsonb)
    `,
    [
      payload.escalatedByUserId,
      response.ok
        ? "external_emergency_webhook_sent"
        : "external_emergency_webhook_failed",
      payload.incidentId,
      JSON.stringify({
        status: response.status,
        response: responseText.slice(0, 2000),
      }),
    ],
  );

  if (!response.ok) {
    throw new Error(
      `External emergency webhook failed with ${response.status}`,
    );
  }

  return { delivered: true as const };
}
