import { Router, type Request } from 'express';
import { authenticate, requireUserId } from '../../middleware/authenticate';
import { validateBody } from '../../middleware/validate';
import { asyncHandler } from '../../shared/asyncHandler';
import { NotFoundError } from '../../shared/errors';
import { createProjectSchema, updateProjectSchema } from './projects.schema';
import * as projectsService from './projects.service';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * PostgreSQL rechaza con error de sintaxis cualquier texto que no sea un uuid,
 * así que el formato se revisa antes de llegar a la consulta.
 */
function projectId(req: Request): string {
  const id = String(req.params.id ?? '');
  if (!UUID_PATTERN.test(id)) {
    throw new NotFoundError('El proyecto no existe o no está en tu cuenta.');
  }
  return id;
}

export const projectsRouter = Router();

projectsRouter.use(authenticate);

projectsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ projects: await projectsService.listProjects(requireUserId(req)) });
  }),
);

projectsRouter.post(
  '/',
  validateBody(createProjectSchema),
  asyncHandler(async (req, res) => {
    const project = await projectsService.createProject(requireUserId(req), req.body);
    res.status(201).json({ project });
  }),
);

projectsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const project = await projectsService.getProject(requireUserId(req), projectId(req));
    res.json({ project });
  }),
);

projectsRouter.patch(
  '/:id',
  validateBody(updateProjectSchema),
  asyncHandler(async (req, res) => {
    const project = await projectsService.updateProject(
      requireUserId(req),
      projectId(req),
      req.body,
    );
    res.json({ project });
  }),
);

projectsRouter.post(
  '/:id/duplicate',
  asyncHandler(async (req, res) => {
    const project = await projectsService.duplicateProject(requireUserId(req), projectId(req));
    res.status(201).json({ project });
  }),
);

projectsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await projectsService.deleteProject(requireUserId(req), projectId(req));
    res.status(204).end();
  }),
);
