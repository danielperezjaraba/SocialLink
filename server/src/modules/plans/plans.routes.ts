import { Router } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import * as plansRepository from './plans.repository';

export const plansRouter = Router();

/** Catálogo público: cualquiera puede consultarlo antes de crear una cuenta. */
plansRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json({ plans: await plansRepository.listPlans() });
  }),
);
