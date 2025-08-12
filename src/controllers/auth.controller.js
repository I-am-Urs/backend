import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { registerSchema, loginSchema } from '../validation/auth.validation.js';
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: true, message: 'Too many auth attempts. Please try again later.' }
});

export const register = async (req, res, next) => {
  try {
    const { value, error } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: true, message: error.details.map(d => d.message).join(', ') });

    const { username, email, password } = value;

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({ error: true, message: 'User with that email or username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, passwordHash });

    return res.status(201).json({ _id: user._id, username: user.username, email: user.email, createdAt: user.createdAt });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { value, error } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: true, message: error.details.map(d => d.message).join(', ') });

    const { email, password } = value;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: true, message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: true, message: 'Invalid credentials' });

    const token = jwt.sign({ _id: user._id, email: user.email, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    return res.json({ token, user: { _id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    next(err);
  }
};

