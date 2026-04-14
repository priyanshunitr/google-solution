import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "secret";
// This helps TypeScript understand that 'req' now has a 'user' property
interface AuthRequest extends Request {
  user?: any;
}
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  // 1. Get the token from cookies
  const token = req.cookies.auth_token;
  // 2. If no token, return 401 Unauthorized
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }
  try {
    // 3. Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 4. Attach the decoded payload (user id, role, etc.) to the request
    req.user = decoded;
    
    // 5. Move to the next function (the actual route)
    next();
  } catch (err) {
    // 6. If token is expired or fake, return error
    res.status(401).json({ message: "Invalid or expired token" });
  }
};