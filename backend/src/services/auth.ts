import pool from "../lib/dbConnect.js";
import bcrypt from "bcryptjs";
import { Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export async function signup(
  name: string,
  phone: string,
  email: string | undefined,
  password: string,
  role: string,
  res: Response,
) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `
                INSERT INTO users (
                    full_name,
                    phone,
                    email,
                    password_hash,
                    role
                )
                VALUES ($1, $2, $3, $4, $5)
                RETURNING
                    id,
                    full_name,
                    email,
                    phone,
                    role,
                    is_active,
                    last_login_at,
                    created_at,
                    updated_at
            `,
      [name, phone, email ?? null, hashedPassword, role],
    );
    return result.rows[0];
  } catch (err) {
    console.error("Error creating user:", err);
    throw err;
  }
}

export async function login(phone: string, password: string) {
  try {
    const result = await pool.query("SELECT * FROM users WHERE phone = $1", [
      phone,
    ]);
    if (result.rows.length === 0) {
      throw new Error("User not found");
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error("Invalid password");
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });
    const { password_hash, ...safeUser } = user;
    return { user: safeUser, token };
  } catch (err) {
    console.error("Error logging in user:", err);
    throw err;
  }
}
