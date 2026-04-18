import { Request } from "express";
import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/middleware.js";
import {
  listStaffNotifications,
  markStaffNotificationFalse,
  markStaffNotificationSeen,
  sendStaffNotificationToEmergencyServices,
} from "../services/staffNotifications.js";

const router = Router();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: "guest" | "staff" | "responder" | "admin";
  };
}

const listNotificationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
  unseen_only: z.coerce.boolean().optional().default(false),
});

const issuePayloadSchema = z.object({
  issueText: z.string().min(1).max(2000),
});

router.get("/", (_req, res) => {
  res.send("Staff route is running");
});

router.get(
  "/notifications",
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "staff") {
      return res
        .status(403)
        .json({ message: "Only staff users can access notifications" });
    }

    const parsed = listNotificationsQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid query params",
        errors: parsed.error.flatten(),
      });
    }

    const { limit, offset, unseen_only } = parsed.data;

    try {
      const notifications = await listStaffNotifications(req.user.id, {
        limit,
        offset,
        unseenOnly: unseen_only,
      });

      return res.status(200).json({ notifications });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },
);

router.patch(
  "/notifications/:id/seen",
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "staff") {
      return res
        .status(403)
        .json({ message: "Only staff users can update notifications" });
    }

    const idSchema = z.string().uuid();
    const parsedId = idSchema.safeParse(req.params.id);

    if (!parsedId.success) {
      return res.status(400).json({ message: "Invalid notification id" });
    }

    try {
      const notification = await markStaffNotificationSeen(
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

router.post(
  "/notifications/:id/false",
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "staff") {
      return res
        .status(403)
        .json({ message: "Only staff users can update notifications" });
    }

    const idSchema = z.string().uuid();
    const parsedId = idSchema.safeParse(req.params.id);

    if (!parsedId.success) {
      return res.status(400).json({ message: "Invalid notification id" });
    }

    try {
      const notification = await markStaffNotificationFalse(
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

router.post(
  "/notifications/:id/send-emergency",
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "staff") {
      return res
        .status(403)
        .json({ message: "Only staff users can escalate notifications" });
    }

    const idSchema = z.string().uuid();
    const parsedId = idSchema.safeParse(req.params.id);
    const parsedBody = issuePayloadSchema.safeParse(req.body);

    if (!parsedId.success) {
      return res.status(400).json({ message: "Invalid notification id" });
    }

    if (!parsedBody.success) {
      return res.status(400).json({
        message: "Invalid escalation payload",
        errors: parsedBody.error.flatten(),
      });
    }

    const { issueText } = parsedBody.data;

    try {
      const result = await sendStaffNotificationToEmergencyServices(
        parsedId.data,
        req.user.id,
        issueText,
      );

      if (result.kind === "not_found") {
        return res.status(404).json({ message: "Notification not found" });
      }

      if (result.kind === "invalid_source") {
        return res
          .status(400)
          .json({ message: "Notification missing source id for escalation" });
      }

      if (result.kind === "source_not_found") {
        const message =
          result.sourceType === "sos"
            ? "SOS request not found for escalation"
            : "Alert not found for escalation";
        return res.status(404).json({ message });
      }

      return res.status(200).json({
        message: "Escalated to emergency services",
        incident_id: result.incidentId,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },
);

export default router;
