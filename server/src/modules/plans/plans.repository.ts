import { pool } from '../../config/db';
import { NotFoundError } from '../../shared/errors';
import type { PlanId, PlanLimits } from '../../shared/types';

type PlanRow = {
  id: PlanId;
  name: string;
  price_cop: number | null;
  max_projects: number | null;
  all_templates: boolean;
  export_pdf: boolean;
  export_image: boolean;
  customization: boolean;
};

const ORDER = `CASE id WHEN 'free' THEN 1 WHEN 'premium' THEN 2 ELSE 3 END`;

function toPlanLimits(row: PlanRow): PlanLimits {
  return {
    id: row.id,
    name: row.name,
    priceCop: row.price_cop,
    maxProjects: row.max_projects,
    allTemplates: row.all_templates,
    exportPdf: row.export_pdf,
    exportImage: row.export_image,
    customization: row.customization,
  };
}

export async function listPlans(): Promise<PlanLimits[]> {
  const { rows } = await pool.query<PlanRow>(`SELECT * FROM plans ORDER BY ${ORDER}`);
  return rows.map(toPlanLimits);
}

/**
 * Los límites que se aplican salen siempre de la base, no de la aplicación:
 * cambiar el cupo de un plan no obliga a volver a desplegar nada.
 */
export async function findPlan(id: PlanId): Promise<PlanLimits> {
  const { rows } = await pool.query<PlanRow>('SELECT * FROM plans WHERE id = $1', [id]);
  if (!rows[0]) throw new NotFoundError(`El plan "${id}" no está configurado.`);
  return toPlanLimits(rows[0]);
}
