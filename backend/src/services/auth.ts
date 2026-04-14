import pool from "../lib/dbConnect.js";
import bcrypt from "bcryptjs";
import { Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export async function signup(name: string, email: string, password: string, role: string, res: Response) {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query('INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)', [name, email, hashedPassword, role]);
        return result.rows[0];
    } catch (err) {
        console.error('Error creating user:', err);
        throw err;
    }
}

export async function login(email: string, password: string) {
    try {
        const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (res.rows.length === 0) {
            throw new Error('User not found');
        }
        const user = res.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid password');
        }
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        return { user, token };
    } catch (err) {
        console.error('Error logging in user:', err);
        throw err;
    }
}