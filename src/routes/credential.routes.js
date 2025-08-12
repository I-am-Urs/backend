import express from 'express';
import {
  createCredential,
  listCredentials,
  revealPassword,
  updateCredential,
  deleteCredential,
  revealLimiter
} from '../controllers/credential.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createCredential);
router.get('/', listCredentials);
router.get('/:id/reveal', revealLimiter, revealPassword);
router.put('/:id', updateCredential);
router.delete('/:id', deleteCredential);

export default router;

