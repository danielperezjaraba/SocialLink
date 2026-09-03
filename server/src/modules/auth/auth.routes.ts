import { Router } from 'express';
import { authenticate, requireUserId } from '../../middleware/authenticate';
import { validateBody } from '../../middleware/validate';
import { asyncHandler } from '../../shared/asyncHandler';
import { loginSchema, registerSchema } from './auth.schema';
import * as authService from './auth.service';

export const authRouter = Router();

authRouter.post(
  '/register',
  validateBody(registerSchema),
  asyncHandler(async (req, res) => {
    const session = await authService.register(req.body);
    res.status(201).json(session);
  }),
);

authRouter.post(
  '/login',
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const session = await authService.login(req.body);
    res.json(session);
  }),
);

authRouter.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await authService.getCurrentUser(requireUserId(req));
    res.json({ user });
  }),
);
