import { Router } from "express";
import { z } from "zod";
import { authMiddleware, AuthRequest } from "../middleware/middleware.js";
import { incidentQuerySchema } from "../schemas/incidentSchema.js";
import { incidentStatusSchema } from "../schemas/sharedEnumsSchema.js";
import {
  listIncidents,
  listUserNotifications,
  markUserNotificationSeen,
  updateIncidentStatus,
} from "../services/incidents.js";

const router = Router();
const incidentIdSchema = z.string().uuid();
const notificationIdSchema = z.string().uuid();

const listNotificationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
  unseen_only: z.coerce.boolean().optional().default(false),
});

const updateStatusBodySchema = z.object({
  to_status: incidentStatusSchema,
  reason: z.string().max(2000).optional(),
});

router.get("/incidents", authMiddleware, async (req: AuthRequest, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "responder") {
    return res
      .status(403)
      .json({ message: "Only responders can access incidents" });
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
      "responder",
      req.user.id,
    );
    return res.status(200).json({ incidents });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.patch(
  "/incidents/:id/status",
  authMiddleware,
  async (req: AuthRequest, res) => {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "responder") {
      return res
        .status(403)
        .json({ message: "Only responders can update incidents" });
    }

    const parsedId = incidentIdSchema.safeParse(req.params.id);
    const parsedBody = updateStatusBodySchema.safeParse(req.body);

    if (!parsedId.success) {
      return res.status(400).json({ message: "Invalid incident id" });
    }

    if (!parsedBody.success) {
      return res.status(400).json({
        message: "Invalid incident status payload",
        errors: parsedBody.error.flatten(),
      });
    }

    if (parsedBody.data.to_status === "escalated") {
      return res
        .status(400)
        .json({ message: "Responder cannot set escalated status directly" });
    }

    try {
      const incident = await updateIncidentStatus({
        incidentId: parsedId.data,
        actorUserId: req.user.id,
        actorRole: "responder",
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
  },
);

router.get("/notifications", authMiddleware, async (req: AuthRequest, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "responder") {
    return res
      .status(403)
      .json({ message: "Only responders can access notifications" });
  }

  const parsed = listNotificationsQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid query params",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const notifications = await listUserNotifications(req.user.id, {
      limit: parsed.data.limit,
      offset: parsed.data.offset,
      unseenOnly: parsed.data.unseen_only,
    });

    return res.status(200).json({ notifications });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.patch(
  "/notifications/:id/seen",
  authMiddleware,
  async (req: AuthRequest, res) => {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "responder") {
      return res
        .status(403)
        .json({ message: "Only responders can update notifications" });
    }

    const parsedId = notificationIdSchema.safeParse(req.params.id);

    if (!parsedId.success) {
      return res.status(400).json({ message: "Invalid notification id" });
    }

    try {
      const notification = await markUserNotificationSeen(
        parsedId.data,
        req.user.id,
      );

      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      return res.status(200).json({ notification });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },
);

export default router;
