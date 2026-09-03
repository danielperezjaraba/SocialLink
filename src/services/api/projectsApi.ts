import type { Diagram, ToolKind } from '@/features/editor/types';
import { PlanLimitError } from '@/services/errors';
import { ApiError, request } from '@/services/httpClient';
import type { Project, ProjectSummary } from '@/services/types';

/**
 * El cupo del plan lo decide el servidor con los datos de la base. Aquí solo se
 * traduce esa respuesta al error que la interfaz ya sabe presentar.
 */
function translate(error: unknown): never {
  if (error instanceof ApiError && error.code === 'PLAN_LIMIT') {
    throw new PlanLimitError(error.message);
  }
  throw error;
}

export async function listProjects(): Promise<ProjectSummary[]> {
  const { projects } = await request<{ projects: ProjectSummary[] }>('/projects');
  return projects;
}

export async function getProject(id: string): Promise<Project | null> {
  try {
    const { project } = await request<{ project: Project }>(`/projects/${id}`);
    return project;
  } catch (error) {
    // Un proyecto borrado desde otra pestaña no es un fallo: simplemente ya no está.
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export type CreateProjectPayload = {
  name: string;
  kind: ToolKind;
  description: string;
  diagram: Diagram;
};

export async function createProject(payload: CreateProjectPayload): Promise<Project> {
  try {
    const { project } = await request<{ project: Project }>('/projects', {
      method: 'POST',
      body: payload,
    });
    return project;
  } catch (error) {
    return translate(error);
  }
}

export async function updateProject(
  id: string,
  patch: { name?: string; description?: string; diagram?: Diagram },
): Promise<Project> {
  const { project } = await request<{ project: Project }>(`/projects/${id}`, {
    method: 'PATCH',
    body: patch,
  });
  return project;
}

export async function duplicateProject(id: string): Promise<Project> {
  try {
    const { project } = await request<{ project: Project }>(`/projects/${id}/duplicate`, {
      method: 'POST',
    });
    return project;
  } catch (error) {
    return translate(error);
  }
}

export async function deleteProject(id: string): Promise<void> {
  await request<void>(`/projects/${id}`, { method: 'DELETE' });
}
