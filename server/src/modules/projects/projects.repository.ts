import type { PoolClient } from 'pg';
import { pool } from '../../config/db';
import type { EntityRow, PreparedDiagram, RelationRow } from '../../shared/mappers';
import { rowsToDiagram } from '../../shared/mappers';
import type { Diagram, PlanId, ToolKind } from '../../shared/types';

export type ProjectRow = {
  id: string;
  owner_id: string;
  name: string;
  kind: ToolKind;
  description: string;
  created_at: Date;
  updated_at: Date;
};

type SummaryRow = ProjectRow & { entity_count: string; relation_count: string };

export type ProjectMeta = {
  id: string;
  ownerId: string;
  name: string;
  kind: ToolKind;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectSummary = ProjectMeta & { entityCount: number; relationCount: number };

export function toProjectMeta(row: ProjectRow): ProjectMeta {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    kind: row.kind,
    description: row.description,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function listSummaries(ownerId: string): Promise<ProjectSummary[]> {
  const { rows } = await pool.query<SummaryRow>(
    `SELECT p.*,
            (SELECT count(*) FROM diagram_entities  e WHERE e.project_id = p.id) AS entity_count,
            (SELECT count(*) FROM diagram_relations r WHERE r.project_id = p.id) AS relation_count
       FROM projects p
      WHERE p.owner_id = $1
      ORDER BY p.updated_at DESC`,
    [ownerId],
  );

  return rows.map((row) => ({
    ...toProjectMeta(row),
    // Los conteos llegan como texto porque count() devuelve bigint.
    entityCount: Number(row.entity_count),
    relationCount: Number(row.relation_count),
  }));
}

export async function countByOwner(client: PoolClient, ownerId: string): Promise<number> {
  const { rows } = await client.query<{ total: string }>(
    'SELECT count(*) AS total FROM projects WHERE owner_id = $1',
    [ownerId],
  );
  return Number(rows[0].total);
}

export async function findById(id: string): Promise<ProjectRow | null> {
  const { rows } = await pool.query<ProjectRow>('SELECT * FROM projects WHERE id = $1', [id]);
  return rows[0] ?? null;
}

/**
 * Bloquea la fila del usuario mientras dura la transacción, de modo que dos
 * peticiones simultáneas no puedan sobrepasar juntas el cupo del plan.
 */
export async function lockOwnerPlan(client: PoolClient, ownerId: string): Promise<PlanId | null> {
  const { rows } = await client.query<{ plan: PlanId }>(
    'SELECT plan FROM users WHERE id = $1 FOR UPDATE',
    [ownerId],
  );
  return rows[0]?.plan ?? null;
}

export async function loadDiagram(projectId: string): Promise<Diagram> {
  const [entities, relations] = await Promise.all([
    pool.query<EntityRow>(
      `SELECT id, shape, name, age, sex,
              to_char(birth_date, 'YYYY-MM-DD') AS birth_date,
              occupation, kinship, cohabits, deceased, is_index, notes,
              stroke_color, fill_color, text_color,
              show_age, show_birth_date, show_name_inside,
              position_x, position_y
         FROM diagram_entities
        WHERE project_id = $1`,
      [projectId],
    ),
    pool.query<RelationRow>(
      `SELECT id, source_id, target_id, source_handle, target_handle, relation, note, stroke_color
         FROM diagram_relations
        WHERE project_id = $1`,
      [projectId],
    ),
  ]);

  return rowsToDiagram(entities.rows, relations.rows);
}

export async function insertProject(
  client: PoolClient,
  input: { ownerId: string; name: string; kind: ToolKind; description: string },
): Promise<ProjectRow> {
  const { rows } = await client.query<ProjectRow>(
    `INSERT INTO projects (owner_id, name, kind, description)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [input.ownerId, input.name, input.kind, input.description],
  );
  return rows[0];
}

export async function updateMeta(
  client: PoolClient,
  id: string,
  patch: { name?: string; description?: string },
): Promise<ProjectRow> {
  const assignments: string[] = [];
  const values: unknown[] = [];

  if (patch.name !== undefined) {
    values.push(patch.name);
    assignments.push(`name = $${values.length}`);
  }
  if (patch.description !== undefined) {
    values.push(patch.description);
    assignments.push(`description = $${values.length}`);
  }

  values.push(id);
  const { rows } = await client.query<ProjectRow>(
    `UPDATE projects
        SET ${[...assignments, 'updated_at = now()'].join(', ')}
      WHERE id = $${values.length}
      RETURNING *`,
    values,
  );
  return rows[0];
}

/**
 * Sustituye el diagrama completo. Borrar y reinsertar dentro de una transacción
 * es más simple y más seguro que intentar deducir qué cambió figura por figura,
 * y como todo ocurre en un solo paso, el proyecto nunca queda a medias.
 */
export async function replaceDiagram(
  client: PoolClient,
  projectId: string,
  diagram: PreparedDiagram,
): Promise<void> {
  await client.query('DELETE FROM diagram_relations WHERE project_id = $1', [projectId]);
  await client.query('DELETE FROM diagram_entities WHERE project_id = $1', [projectId]);

  if (diagram.entities.length > 0) {
    const values: unknown[] = [];
    const tuples = diagram.entities.map((entity) => {
      const start = values.length;
      values.push(
        entity.id,
        projectId,
        entity.shape,
        entity.name,
        entity.age,
        entity.sex,
        entity.birthDate,
        entity.occupation,
        entity.kinship,
        entity.cohabits,
        entity.deceased,
        entity.isIndex,
        entity.notes,
        entity.strokeColor,
        entity.fillColor,
        entity.textColor,
        entity.showAge,
        entity.showBirthDate,
        entity.showNameInside,
        entity.positionX,
        entity.positionY,
      );
      return `(${Array.from({ length: 21 }, (_, i) => `$${start + i + 1}`).join(', ')})`;
    });

    await client.query(
      `INSERT INTO diagram_entities
         (id, project_id, shape, name, age, sex, birth_date, occupation, kinship,
          cohabits, deceased, is_index, notes,
          stroke_color, fill_color, text_color,
          show_age, show_birth_date, show_name_inside,
          position_x, position_y)
       VALUES ${tuples.join(', ')}`,
      values,
    );
  }

  if (diagram.relations.length > 0) {
    const values: unknown[] = [];
    const tuples = diagram.relations.map((relation) => {
      const start = values.length;
      values.push(
        relation.id,
        projectId,
        relation.sourceId,
        relation.targetId,
        relation.sourceHandle,
        relation.targetHandle,
        relation.relation,
        relation.note,
        relation.strokeColor,
      );
      return `(${Array.from({ length: 9 }, (_, i) => `$${start + i + 1}`).join(', ')})`;
    });

    await client.query(
      `INSERT INTO diagram_relations
         (id, project_id, source_id, target_id, source_handle, target_handle, relation, note, stroke_color)
       VALUES ${tuples.join(', ')}`,
      values,
    );
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM projects WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
