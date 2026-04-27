import { Router } from "express";
import { z } from "zod";
import { authMiddleware, AuthRequest } from "../middleware/middleware.js";
import {
  broadcastMsgQuerySchema,
  createBroadcastMsgSchema,
} from "../schemas/broadcastMsgSchema.js";
import {
  createPrivateMsgSchema,
  privateMsgQuerySchema,
} from "../schemas/privateMsgSchema.js";
import { userRoleSchema } from "../schemas/sharedEnumsSchema.js";
import {
  createBroadcastMessage,
  createPrivateMessage,
  listBroadcastMessages,
  listPrivateMessages,
  markBroadcastMessageRead,
} from "../services/communications.js";

const router = Router();
const messageIdSchema = z.string().uuid();

const createBroadcastRequestSchema = createBroadcastMsgSchema.extend({
  target_roles: z
    .array(userRoleSchema)
    .optional()
    .default(["guest", "staff", "responder"]),
});

function canSendBroadcast(role: string | undefined) {
  return role === "staff" || role === "responder" || role === "admin";
}

router.get("/broadcast", authMiddleware, async (req: AuthRequest, res) => {
  const parsed = broadcastMsgQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid broadcast query params",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const messages = await listBroadcastMessages(parsed.data);
    return res.status(200).json({ messages });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/broadcast", authMiddleware, async (req: AuthRequest, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!canSendBroadcast(req.user.role)) {
    return res
      .status(403)
      .json({ message: "Only staff/responder/admin can send broadcasts" });
  }

  const inferredSenderKind =
    req.user.role === "responder" ? "responder" : "staff";

  const parsed = createBroadcastRequestSchema.safeParse({
    ...req.body,
    sender_user_id: req.user.id,
    sender_kind: req.body?.sender_kind ?? inferredSenderKind,
  });

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid broadcast payload",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const message = await createBroadcastMessage({
      actorUserId: req.user.id,
      actorRole: req.user.role,
      payload: {
        emergency_session_id: parsed.data.emergency_session_id,
        sender_user_id: req.user.id,
        sender_kind: parsed.data.sender_kind,
        body: parsed.data.body,
      },
      targetRoles: parsed.data.target_roles,
    });

    return res.status(201).json({ message });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post(
  "/broadcast/:id/read",
  authMiddleware,
  async (req: AuthRequest, res) => {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const parsedId = messageIdSchema.safeParse(req.params.id);

    if (!parsedId.success) {
      return res.status(400).json({ message: "Invalid broadcast message id" });
    }

    try {
      const read = await markBroadcastMessageRead(parsedId.data, req.user.id);
      return res.status(200).json({ read });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },
);

router.get("/private", authMiddleware, async (req: AuthRequest, res) => {
  if (!req.user?.id || !req.user.role) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const parsed = privateMsgQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid private-message query params",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const messages = await listPrivateMessages({
      userId: req.user.id,
      userRole: req.user.role,
      query: parsed.data,
    });

    return res.status(200).json({ messages });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/private", authMiddleware, async (req: AuthRequest, res) => {
  if (!req.user?.id || !req.user.role) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const parsed = createPrivateMsgSchema.safeParse({
    ...req.body,
    sender_user_id: req.user.id,
  });

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid private message payload",
      errors: parsed.error.flatten(),
    });
  }

  if (parsed.data.channel === "staff_responder" && req.user.role === "guest") {
    return res.status(403).json({
      message: "Guest users cannot send messages to staff_responder channel",
    });
  }

  try {
    const message = await createPrivateMessage({
      actorUserId: req.user.id,
      actorRole: req.user.role,
      payload: {
        emergency_session_id: parsed.data.emergency_session_id,
        recipient_user_id: parsed.data.recipient_user_id,
        channel: parsed.data.channel,
        body: parsed.data.body,
      },
    });

    return res.status(201).json({ message });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
