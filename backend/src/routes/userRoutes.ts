import { Router } from "express";
import { signup, login } from "../services/auth.js";
import {
  loginRequestSchema,
  signupRequestSchema,
} from "../schemas/userSchema.js";

const router = Router();

router.post("/signup", async (req, res) => {
  const parsed = signupRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid signup payload",
      errors: parsed.error.flatten(),
    });
  }

  const { name, email, phone, password, role } = parsed.data;

  try {
    const user = await signup(name, phone, email, password, role, res);
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const parsed = loginRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid login payload",
      errors: parsed.error.flatten(),
    });
  }

  const { phone, password } = parsed.data;

  try {
    const { user : safeUser, token } = await login(phone, password);
    res.cookie("auth_token", token, {
      httpOnly: true, // CRITICAL: JavaScript cannot touch this cookie
      secure: true, // ONLY sent over HTTPS (use false for localhost development)
      sameSite: "lax", // Protects against most CSRF attacks
      maxAge: 24 * 60 * 60 * 1000 * 7, // Match the JWT expiration (1 week)
    });
    res.json({ user: safeUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
export default router;
