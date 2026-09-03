import { getPlan } from '@/configs/plans';
import { getCatalog } from '@/features/editor/catalogs';
import type { Diagram, ToolKind } from '@/features/editor/types';
import { createId } from '@/lib/utils';
import { getDb } from '@/services/db';
import { PlanLimitError } from '@/services/errors';
import type { Project, ProjectSummary, User } from '@/services/types';

/**
 * Proyectos de la sesión de exploración. Se quedan en IndexedDB para que quien
 * prueba la herramienta no pierda su trabajo al recargar, pero nunca salen del
 * equipo: por eso esta modalidad no debe usarse con datos reales de familias.
 */

function toSummary(project: Project): ProjectSummary {
  const { diagram, ...rest } = project;
  return {
    ...rest,
    entityCount: diagram.nodes.length,
    relationCount: diagram.edges.length,
  };
}

export async function listProjects(ownerId: string): Promise<ProjectSummary[]> {
  const db = await getDb();
  const projects = await db.getAllFromIndex('projects', 'by-owner', ownerId);
  return projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(toSummary);
}

export async function countProjects(ownerId: string): Promise<number> {
  const db = await getDb();
  return db.countFromIndex('projects', 'by-owner', ownerId);
}

export async function getProject(id: string): Promise<Project | null> {
  const db = await getDb();
  return (await db.get('projects', id)) ?? null;
}

export type CreateProjectInput = {
  name: string;
  kind: ToolKind;
  description?: string;
  diagram?: Diagram;
};

export async function createProject(user: User, input: CreateProjectInput): Promise<Project> {
  const { maxProjects } = getPlan(user.plan).limits;

  if (maxProjects !== null) {
    const current = await countProjects(user.id);
    if (current >= maxProjects) {
      throw new PlanLimitError(
        `Tu plan permite guardar ${maxProjects} proyectos y ya tienes ${current}. Elimina uno o cambia de plan para seguir creando.`,
      );
    }
  }

  const now = new Date().toISOString();
  const project: Project = {
    id: createId(),
    ownerId: user.id,
    name: input.name.trim() || `${getCatalog(input.kind).name} sin título`,
    kind: input.kind,
    description: input.description?.trim() ?? '',
    diagram: input.diagram ?? getCatalog(input.kind).seed(),
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDb();
  await db.put('projects', project);
  return project;
}

export async function updateProject(
  id: string,
  patch: Partial<Pick<Project, 'name' | 'description' | 'diagram'>>,
): Promise<Project> {
  const db = await getDb();
  const current = await db.get('projects', id);
  if (!current) {
    throw new Error('El proyecto ya no existe.');
  }

  const updated: Project = { ...current, ...patch, updatedAt: new Date().toISOString() };
  await db.put('projects', updated);
  return updated;
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('projects', id);
}

export async function duplicateProject(user: User, id: string): Promise<Project> {
  const source = await getProject(id);
  if (!source) {
    throw new Error('El proyecto ya no existe.');
  }

  return createProject(user, {
    name: `${source.name} (copia)`,
    kind: source.kind,
    description: source.description,
    diagram: source.diagram,
  });
}
