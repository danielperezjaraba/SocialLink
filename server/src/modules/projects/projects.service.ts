import { withTransaction } from '../../config/db';
import { NotFoundError, PlanLimitError } from '../../shared/errors';
import { prepareDiagram } from '../../shared/mappers';
import type { Diagram } from '../../shared/types';
import * as plansRepository from '../plans/plans.repository';
import * as repository from './projects.repository';
import type { ProjectMeta, ProjectSummary } from './projects.repository';
import type { CreateProjectInput, UpdateProjectInput } from './projects.schema';

export type Project = ProjectMeta & { diagram: Diagram };

export function listProjects(ownerId: string): Promise<ProjectSummary[]> {
  return repository.listSummaries(ownerId);
}

/**
 * Comprueba la pertenencia antes de devolver nada. Si el proyecto existe pero es
 * de otra persona se responde igual que si no existiera, para no confirmar
 * identificadores ajenos.
 */
async function requireOwnedProject(
  ownerId: string,
  projectId: string,
): Promise<repository.ProjectRow> {
  const row = await repository.findById(projectId);
  if (!row || row.owner_id !== ownerId) {
    throw new NotFoundError('El proyecto no existe o no está en tu cuenta.');
  }
  return row;
}

export async function getProject(ownerId: string, projectId: string): Promise<Project> {
  const row = await requireOwnedProject(ownerId, projectId);
  const diagram = await repository.loadDiagram(projectId);
  return { ...repository.toProjectMeta(row), diagram };
}

export async function createProject(
  ownerId: string,
  input: CreateProjectInput,
): Promise<Project> {
  const meta = await withTransaction(async (client) => {
    const plan = await repository.lockOwnerPlan(client, ownerId);
    if (!plan) throw new NotFoundError('La cuenta ya no existe.');

    // El cupo se decide con los datos de la base, no con lo que diga el navegador.
    const { maxProjects } = await plansRepository.findPlan(plan);
    if (maxProjects !== null) {
      const current = await repository.countByOwner(client, ownerId);
      if (current >= maxProjects) {
        throw new PlanLimitError(
          `Tu plan permite guardar ${maxProjects} proyectos y ya tienes ${current}. ` +
            'Elimina uno o cambia de plan para seguir creando.',
        );
      }
    }

    const row = await repository.insertProject(client, {
      ownerId,
      name: input.name,
      kind: input.kind,
      description: input.description,
    });

    await repository.replaceDiagram(client, row.id, prepareDiagram(input.diagram));
    return repository.toProjectMeta(row);
  });

  // Se relee lo guardado para que la respuesta refleje exactamente la base.
  return { ...meta, diagram: await repository.loadDiagram(meta.id) };
}

export async function updateProject(
  ownerId: string,
  projectId: string,
  patch: UpdateProjectInput,
): Promise<Project> {
  await requireOwnedProject(ownerId, projectId);

  const meta = await withTransaction(async (client) => {
    if (patch.diagram) {
      await repository.replaceDiagram(client, projectId, prepareDiagram(patch.diagram));
    }

    const row = await repository.updateMeta(client, projectId, {
      name: patch.name,
      description: patch.description,
    });
    return repository.toProjectMeta(row);
  });

  return { ...meta, diagram: await repository.loadDiagram(projectId) };
}

export async function duplicateProject(ownerId: string, projectId: string): Promise<Project> {
  const source = await getProject(ownerId, projectId);

  return createProject(ownerId, {
    name: `${source.name} (copia)`.slice(0, 160),
    kind: source.kind,
    description: source.description,
    diagram: source.diagram,
  });
}

export async function deleteProject(ownerId: string, projectId: string): Promise<void> {
  await requireOwnedProject(ownerId, projectId);
  await repository.deleteProject(projectId);
}
