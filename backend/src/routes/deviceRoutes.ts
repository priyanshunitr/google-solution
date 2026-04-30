import { Router } from "express";
import { z } from "zod";
import { authMiddleware, AuthRequest } from "../middleware/middleware.js";
import {
  devicePushTokenQuerySchema,
  registerDevicePushTokenSchema,
  updateDevicePushTokenSchema,
} from "../schemas/devicePushTokenSchema.js";
import {
  deactivateDevicePushToken,
  listDevicePushTokens,
  registerDevicePushToken,
  updateDevicePushToken,
} from "../services/devicePushTokens.js";

const router = Router();
const tokenIdSchema = z.string().uuid();

router.get("/tokens", authMiddleware, async (req: AuthRequest, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const parsedQuery = devicePushTokenQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    return res.status(400).json({
      message: "Invalid device-token query params",
      errors: parsedQuery.error.flatten(),
    });
  }

  const isPrivileged = req.user.role === "admin" || req.user.role === "staff";
  const scopedQuery = {
    ...parsedQuery.data,
    user_id: isPrivileged ? parsedQuery.data.user_id : req.user.id,
  };

  try {
    const tokens = await listDevicePushTokens(scopedQuery);
    return res.status(200).json({ tokens });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/tokens", authMiddleware, async (req: AuthRequest, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const parsed = registerDevicePushTokenSchema.safeParse({
    ...req.body,
    user_id: req.user.id,
  });

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid device token payload",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const token = await registerDevicePushToken(req.user.id, {
      platform: parsed.data.platform,
      push_token: parsed.data.push_token,
      device_label: parsed.data.device_label,
      app_version: parsed.data.app_version,
      is_active: parsed.data.is_active,
      last_seen_at: parsed.data.last_seen_at,
    });

    return res.status(201).json({ token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.patch("/tokens/:id", authMiddleware, async (req: AuthRequest, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const parsedId = tokenIdSchema.safeParse(req.params.id);
  const parsedBody = updateDevicePushTokenSchema.safeParse(req.body);

  if (!parsedId.success) {
    return res.status(400).json({ message: "Invalid token id" });
  }

  if (!parsedBody.success) {
    return res.status(400).json({
      message: "Invalid token update payload",
      errors: parsedBody.error.flatten(),
    });
  }

  try {
    const token = await updateDevicePushToken(
      parsedId.data,
      req.user.id,
      req.user.role === "admin",
      parsedBody.data,
    );

    if (!token) {
      return res.status(404).json({ message: "Token not found" });
    }

    return res.status(200).json({ token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/tokens/:id", authMiddleware, async (req: AuthRequest, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const parsedId = tokenIdSchema.safeParse(req.params.id);

  if (!parsedId.success) {
    return res.status(400).json({ message: "Invalid token id" });
  }

  try {
    const token = await deactivateDevicePushToken(
      parsedId.data,
      req.user.id,
      req.user.role === "admin",
    );

    if (!token) {
      return res.status(404).json({ message: "Token not found" });
    }

    return res.status(200).json({ token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
