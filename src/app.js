import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import credentialRoutes from './routes/credential.routes.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

dotenv.config();

const app = express();

// Security headers
app.use(helmet());

// JSON body parser
app.use(express.json({ limit: '1mb' }));

// Logger (avoid logging sensitive data)
app.use(morgan('combined', {
  skip: (req, res) => req.path.includes('/password') && req.method === 'POST'
}));

// CORS configuration
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:8080';
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/password', credentialRoutes);

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

