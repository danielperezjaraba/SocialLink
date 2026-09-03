import { Router } from 'express';
import { authenticate, requireUserId } from '../../middleware/authenticate';
import { validateBody } from '../../middleware/validate';
import { asyncHandler } from '../../shared/asyncHandler';
import { NotFoundError } from '../../shared/errors';
import * as usersRepository from './users.repository';
import { updateUserSchema } from './users.schema';

export const usersRouter = Router();

usersRouter.patch(
  '/me',
  authenticate,
  validateBody(updateUserSchema),
  asyncHandler(async (req, res) => {
    const row = await usersRepository.updateUser(requireUserId(req), req.body);
    if (!row) throw new NotFoundError('La cuenta ya no existe.');

    res.json({ user: usersRepository.toPublicUser(row) });
  }),
);
