import express from 'express';
import { login, register, authLimiter } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

export default router;

