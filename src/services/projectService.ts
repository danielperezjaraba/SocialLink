import { getCatalog } from '@/features/editor/catalogs';
import type { Diagram, ToolKind } from '@/features/editor/types';
import * as projectsApi from '@/services/api/projectsApi';
import { PlanLimitError } from '@/services/errors';
import * as local from '@/services/local/localProjectService';
import { isGuestSession } from '@/services/session';
import type { Project, ProjectSummary, User } from '@/services/types';

export { PlanLimitError };

/**
 * Las pantallas llaman siempre a estas funciones. Con cuenta, cada operación
 * viaja a la API y queda en PostgreSQL; en modo exploración se resuelve contra
 * el almacén del navegador.
 */

export type CreateProjectInput = {
  name: string;
  kind: ToolKind;
  description?: string;
  diagram?: Diagram;
};

export async function listProjects(ownerId: string): Promise<ProjectSummary[]> {
  return isGuestSession() ? local.listProjects(ownerId) : projectsApi.listProjects();
}

export async function countProjects(ownerId: string): Promise<number> {
  if (isGuestSession()) return local.countProjects(ownerId);
  return (await projectsApi.listProjects()).length;
}

export async function getProject(id: string): Promise<Project | null> {
  return isGuestSession() ? local.getProject(id) : projectsApi.getProject(id);
}

export async function createProject(user: User, input: CreateProjectInput): Promise<Project> {
  if (isGuestSession()) return local.createProject(user, input);

  const catalog = getCatalog(input.kind);

  return projectsApi.createProject({
    name: input.name.trim() || `${catalog.name} sin título`,
    kind: input.kind,
    description: input.description?.trim() ?? '',
    // Un proyecto nuevo nunca nace vacío: si no llega plantilla, se usa el
    // diagrama inicial de la herramienta elegida.
    diagram: input.diagram ?? catalog.seed(),
  });
}

export async function updateProject(
  id: string,
  patch: Partial<Pick<Project, 'name' | 'description' | 'diagram'>>,
): Promise<Project> {
  return isGuestSession() ? local.updateProject(id, patch) : projectsApi.updateProject(id, patch);
}

export async function deleteProject(id: string): Promise<void> {
  return isGuestSession() ? local.deleteProject(id) : projectsApi.deleteProject(id);
}

export async function duplicateProject(user: User, id: string): Promise<Project> {
  return isGuestSession() ? local.duplicateProject(user, id) : projectsApi.duplicateProject(id);
}
