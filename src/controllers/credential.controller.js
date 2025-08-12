import Credential from '../models/Credential.js';
import AuditLog from '../models/AuditLog.js';
import { encrypt, decrypt } from '../utils/crypto.js';
import { credentialCreateSchema, credentialUpdateSchema } from '../validation/credential.validation.js';
import rateLimit from 'express-rate-limit';

export const revealLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: true, message: 'Too many reveal attempts. Please try again later.' }
});

export const createCredential = async (req, res, next) => {
  try {
    const { value, error } = credentialCreateSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: true, message: error.details.map(d => d.message).join(', ') });

    const { accountName, accountUsername, passwordPlain } = value;

    const encrypted = encrypt(passwordPlain);

    const created = await Credential.create({
      accountName,
      accountUsername,
      password: encrypted,
      createdBy: req.user._id
    });

    return res.status(201).json({
      _id: created._id,
      accountName: created.accountName,
      accountUsername: created.accountUsername,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      encrypted: true
    });
  } catch (err) {
    next(err);
  }
};

export const listCredentials = async (req, res, next) => {
  try {
    const docs = await Credential.find({ createdBy: req.user._id })
      .sort({ updatedAt: -1 })
      .select('_id accountName accountUsername createdAt updatedAt');

    const list = docs.map(d => ({
      _id: d._id,
      accountName: d.accountName,
      accountUsername: d.accountUsername,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      encrypted: true
    }));

    return res.json(list);
  } catch (err) {
    next(err);
  }
};

export const revealPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cred = await Credential.findById(id);
    if (!cred) return res.status(404).json({ error: true, message: 'Not found' });
    if (String(cred.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ error: true, message: 'Forbidden' });
    }

    const passwordPlain = decrypt(cred.password);

    // audit log
    try {
      await AuditLog.create({ credentialId: cred._id, userId: req.user._id, action: 'reveal', ip: req.ip });
    } catch (_) {
      // do not block response on audit errors
    }

    return res.json({ passwordPlain });
  } catch (err) {
    next(err);
  }
};

export const updateCredential = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { value, error } = credentialUpdateSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: true, message: error.details.map(d => d.message).join(', ') });

    const cred = await Credential.findById(id);
    if (!cred) return res.status(404).json({ error: true, message: 'Not found' });
    if (String(cred.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ error: true, message: 'Forbidden' });
    }

    const { accountName, accountUsername, passwordPlain } = value;

    if (accountName !== undefined) cred.accountName = accountName;
    if (accountUsername !== undefined) cred.accountUsername = accountUsername;
    if (passwordPlain !== undefined) cred.password = encrypt(passwordPlain);
    cred.updatedAt = new Date();

    await cred.save();

    return res.json({
      _id: cred._id,
      accountName: cred.accountName,
      accountUsername: cred.accountUsername,
      createdAt: cred.createdAt,
      updatedAt: cred.updatedAt,
      encrypted: true
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCredential = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cred = await Credential.findById(id);
    if (!cred) return res.status(404).json({ error: true, message: 'Not found' });
    if (String(cred.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ error: true, message: 'Forbidden' });
    }

    await cred.deleteOne();

    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

