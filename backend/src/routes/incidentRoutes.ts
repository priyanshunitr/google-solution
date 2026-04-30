import { Router } from "express";
import { z } from "zod";
import { authMiddleware, AuthRequest } from "../middleware/middleware.js";
import { incidentQuerySchema } from "../schemas/incidentSchema.js";
import { incidentStatusSchema } from "../schemas/sharedEnumsSchema.js";
import {
  getIncidentById,
  listIncidents,
  updateIncidentStatus,
} from "../services/incidents.js";

const router = Router();
const incidentIdSchema = z.string().uuid();

const statusUpdateSchema = z.object({
  to_status: incidentStatusSchema,
  reason: z.string().max(2000).optional(),
});

router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  if (!req.user?.id || !req.user.role) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role === "guest") {
    return res
      .status(403)
      .json({ message: "Guests cannot access incident list" });
  }

  const parsed = incidentQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid incident query params",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const incidents = await listIncidents(
      parsed.data,
      req.user.role,
      req.user.id,
    );
    return res.status(200).json({ incidents });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/:id", authMiddleware, async (req: AuthRequest, res) => {
  if (!req.user?.id || !req.user.role) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role === "guest") {
    return res.status(403).json({ message: "Guests cannot access incidents" });
  }

  const parsedId = incidentIdSchema.safeParse(req.params.id);

  if (!parsedId.success) {
    return res.status(400).json({ message: "Invalid incident id" });
  }

  try {
    const incident = await getIncidentById(parsedId.data);

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    return res.status(200).json({ incident });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/status", authMiddleware, async (req: AuthRequest, res) => {
  if (!req.user?.id || !req.user.role) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role === "guest") {
    return res.status(403).json({ message: "Guests cannot update incidents" });
  }

  const parsedId = incidentIdSchema.safeParse(req.params.id);
  const parsedBody = statusUpdateSchema.safeParse(req.body);

  if (!parsedId.success) {
    return res.status(400).json({ message: "Invalid incident id" });
  }

  if (!parsedBody.success) {
    return res.status(400).json({
      message: "Invalid incident status payload",
      errors: parsedBody.error.flatten(),
    });
  }

  if (
    req.user.role === "responder" &&
    parsedBody.data.to_status === "escalated"
  ) {
    return res
      .status(403)
      .json({ message: "Responder cannot set escalated status directly" });
  }

  try {
    const incident = await updateIncidentStatus({
      incidentId: parsedId.data,
      actorUserId: req.user.id,
      actorRole: req.user.role,
      toStatus: parsedBody.data.to_status,
      reason: parsedBody.data.reason,
    });

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    return res.status(200).json({ incident });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
