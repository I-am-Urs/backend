import Joi from 'joi';

// Accept both accountUsername/passwordPlain and username/password from the frontend
export const credentialCreateSchema = Joi.object({
  accountName: Joi.string().min(1).max(200).required(),
  accountUsername: Joi.string().min(1).max(200).required(),
  passwordPlain: Joi.string().min(1).max(1000).required()
})
  .rename('username', 'accountUsername', { ignoreUndefined: true, override: true })
  .rename('password', 'passwordPlain', { ignoreUndefined: true, override: true });

export const credentialUpdateSchema = Joi.object({
  accountName: Joi.string().min(1).max(200).optional(),
  accountUsername: Joi.string().min(1).max(200).optional(),
  passwordPlain: Joi.string().min(1).max(1000).optional()
})
  .rename('username', 'accountUsername', { ignoreUndefined: true, override: true })
  .rename('password', 'passwordPlain', { ignoreUndefined: true, override: true })
  .min(1);

