import { Router } from "express";
import { z } from "zod";
import { authMiddleware, AuthRequest } from "../middleware/middleware.js";
import {
  createEmergencySessionSchema,
  emergencySessionQuerySchema,
  updateEmergencySessionSchema,
} from "../schemas/emergencySessionsSchema.js";
import {
  activateEmergencySession,
  createEmergencySession,
  getEmergencySessionById,
  listEmergencySessions,
  resolveEmergencySession,
  updateEmergencySession,
} from "../services/emergencySessions.js";

const router = Router();
const sessionIdSchema = z.string().uuid();

function canManageEmergencies(role: string | undefined) {
  return role === "staff" || role === "admin";
}

router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  const parsed = emergencySessionQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid emergency-session query params",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const sessions = await listEmergencySessions(parsed.data);
    return res.status(200).json({ sessions });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/:id", authMiddleware, async (req: AuthRequest, res) => {
  const parsedId = sessionIdSchema.safeParse(req.params.id);

  if (!parsedId.success) {
    return res.status(400).json({ message: "Invalid emergency session id" });
  }

  try {
    const session = await getEmergencySessionById(parsedId.data);

    if (!session) {
      return res.status(404).json({ message: "Emergency session not found" });
    }

    return res.status(200).json({ session });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!canManageEmergencies(req.user.role)) {
    return res
      .status(403)
      .json({ message: "Only staff/admin can create emergency sessions" });
  }

  const parsed = createEmergencySessionSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid emergency-session payload",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const session = await createEmergencySession(req.user.id, parsed.data);
    return res.status(201).json({ session });
  } catch (err: any) {
    if (
      String(err?.message ?? "").includes("ux_emergency_sessions_one_active")
    ) {
      return res
        .status(409)
        .json({ message: "Another emergency session is already active" });
    }

    return res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", authMiddleware, async (req: AuthRequest, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!canManageEmergencies(req.user.role)) {
    return res
      .status(403)
      .json({ message: "Only staff/admin can update emergency sessions" });
  }

  const parsedId = sessionIdSchema.safeParse(req.params.id);
  const parsedBody = updateEmergencySessionSchema.safeParse(req.body);

  if (!parsedId.success) {
    return res.status(400).json({ message: "Invalid emergency session id" });
  }

  if (!parsedBody.success) {
    return res.status(400).json({
      message: "Invalid emergency-session update payload",
      errors: parsedBody.error.flatten(),
    });
  }

  try {
    const session = await updateEmergencySession(
      parsedId.data,
      parsedBody.data,
      req.user.id,
    );

    if (!session) {
      return res.status(404).json({ message: "Emergency session not found" });
    }

    return res.status(200).json({ session });
  } catch (err: any) {
    if (
      String(err?.message ?? "").includes("ux_emergency_sessions_one_active")
    ) {
      return res
        .status(409)
        .json({ message: "Another emergency session is already active" });
    }

    return res.status(500).json({ error: err.message });
  }
});

router.post("/:id/activate", authMiddleware, async (req: AuthRequest, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!canManageEmergencies(req.user.role)) {
    return res
      .status(403)
      .json({ message: "Only staff/admin can activate emergency sessions" });
  }

  const parsedId = sessionIdSchema.safeParse(req.params.id);

  if (!parsedId.success) {
    return res.status(400).json({ message: "Invalid emergency session id" });
  }

  try {
    const session = await activateEmergencySession(parsedId.data, req.user.id);

    if (!session) {
      return res.status(404).json({ message: "Emergency session not found" });
    }

    return res.status(200).json({ session });
  } catch (err: any) {
    if (
      String(err?.message ?? "").includes("ux_emergency_sessions_one_active")
    ) {
      return res
        .status(409)
        .json({ message: "Another emergency session is already active" });
    }

    return res.status(500).json({ error: err.message });
  }
});

router.post("/:id/resolve", authMiddleware, async (req: AuthRequest, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!canManageEmergencies(req.user.role)) {
    return res
      .status(403)
      .json({ message: "Only staff/admin can resolve emergency sessions" });
  }

  const parsedId = sessionIdSchema.safeParse(req.params.id);

  if (!parsedId.success) {
    return res.status(400).json({ message: "Invalid emergency session id" });
  }

  try {
    const session = await resolveEmergencySession(parsedId.data, req.user.id);

    if (!session) {
      return res.status(404).json({ message: "Emergency session not found" });
    }

    return res.status(200).json({ session });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
