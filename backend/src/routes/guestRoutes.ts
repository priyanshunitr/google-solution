import { Request } from "express";
import { Router } from "express";
import { createSosRequestSchema } from "../schemas/sosRequestSchema.js";
import { createAlertSchema } from "../schemas/alertsSchema.js";
import { authMiddleware } from "../middleware/middleware.js";
import pool from "../lib/dbConnect.js";
import { createAlert } from "../services/alert.js";
import { createSosRequest } from "../services/sos.js";

const router = Router();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: "guest" | "staff" | "responder" | "admin";
  };
}

router.post("/alerts", authMiddleware, async (req: AuthenticatedRequest, res) => {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "guest") {
      return res
        .status(403)
        .json({ message: "Only guest users can raise alerts" });
    }

    const parsed = createAlertSchema.safeParse({
      ...req.body,
      created_by: req.user.id,
      is_broadcast: false,
    });

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid alert payload",
        errors: parsed.error.flatten(),
      });
    }

    try {
      const alert = await createAlert(req.user.id, {
        emergency_session_id: parsed.data.emergency_session_id,
        severity: parsed.data.severity,
        title: parsed.data.title,
        description: parsed.data.description,
        location_text: parsed.data.location_text,
      });

      return res.status(201).json({ alert });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },
);


router.post("/sos", authMiddleware, async (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "guest") {
    return res
      .status(403)
      .json({ message: "Only guest users can raise SOS requests" });
  }

  const parsed = createSosRequestSchema.safeParse({
    ...req.body,
    guest_user_id: req.user.id,
  });

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid SOS payload",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const sos = await createSosRequest(req.user.id, {
      emergency_session_id: parsed.data.emergency_session_id,
      message: parsed.data.message,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      location_accuracy_m: parsed.data.location_accuracy_m,
      location_captured_at: parsed.data.location_captured_at,
    });


    return res.status(201).json({ sos_request: sos });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
