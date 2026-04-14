import { Router } from "express";
import { signup, login } from "../services/auth.js";

const router = Router();

router.post("/signup", async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const user = await signup(name, email, password, role, res);
        res.json(user);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const { user, token } = await login(email, password);
        res.cookie('auth_token', token, {
            httpOnly: true,  // CRITICAL: JavaScript cannot touch this cookie
            secure: true,    // ONLY sent over HTTPS (use false for localhost development)
            sameSite: 'lax', // Protects against most CSRF attacks
            maxAge: 24 * 60 * 60 * 1000 // Match the JWT expiration (1 day)
        });
        res.json({ user });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});
export default router;