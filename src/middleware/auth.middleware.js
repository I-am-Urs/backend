import jwt from 'jsonwebtoken';

/**
 * Auth middleware to validate JWT Bearer tokens.
 * Attaches req.user = { _id, email, username } on success.
 * Responds with 401 JSON error on failure.
 */
export const authMiddleware = (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const parts = header.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: true, message: 'Unauthorized' });
    }
    const token = parts[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { _id: payload._id, email: payload.email, username: payload.username };
    next();
  } catch (err) {
    return res.status(401).json({ error: true, message: 'Unauthorized' });
  }
};

