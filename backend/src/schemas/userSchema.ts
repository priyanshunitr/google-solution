import { z } from "zod";
import { userRoleSchema } from "./sharedEnumsSchema.js";

// Database row shape for the users table.
export const userSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(1).max(120),
  email: z.string().email().nullable(),
  phone: z.string().min(7).max(30),
  password_hash: z.string().min(1),
  role: userRoleSchema,
  is_active: z.boolean(),
  last_login_at: z.string().datetime({ offset: true }).nullable(),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});

// Public-safe user response shape (without password hash).
export const publicUserSchema = userSchema.omit({ password_hash: true });

// Payload expected when creating a user from internal services.
export const createUserSchema = z.object({
  full_name: z.string().min(1).max(120),
  email: z.string().email().optional(),
  phone: z.string().min(7).max(30),
  password_hash: z.string().min(1),
  role: userRoleSchema,
  is_active: z.boolean().optional().default(true),
});

// Allowed patch fields for user profile/admin updates.
export const updateUserSchema = z
  .object({
    full_name: z.string().min(1).max(120).optional(),
    email: z.string().email().nullable().optional(),
    phone: z.string().min(7).max(30).optional(),
    role: userRoleSchema.optional(),
    is_active: z.boolean().optional(),
    last_login_at: z.string().datetime({ offset: true }).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided for update",
  });

// Signup request shape used by the current auth route.
export const signupRequestSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(120),
  email: z.string().email({ message: "Invalid email address" }).optional(),
  phone: z.string().min(7, { message: "Phone number must be at least 7 characters" }).max(30),
  password: z.string().min(8, { message: "password must be of 8 characters" }).max(128),
  role: userRoleSchema,
});

// Login request shape used by the current auth route.
export const loginRequestSchema = z.object({
  phone: z.string().min(7, { message: "Phone number must be at least 7 characters" }).max(30),
  password: z.string().min(8, { message: "password must be of 8 characters" }).max(128),
});

export type User = z.infer<typeof userSchema>;
export type PublicUser = z.infer<typeof publicUserSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type SignupRequest = z.infer<typeof signupRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
