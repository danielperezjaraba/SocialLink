import type { RelationDef, RelationId } from '@/features/editor/types';

/**
 * Catálogo único de vínculos. Cada herramienta escoge el subconjunto que le
 * corresponde, pero el trazo de un vínculo conflictivo es el mismo en un
 * genograma que en un ecomapa, así que la definición vive en un solo lugar.
 */
export const RELATIONS: Record<RelationId, RelationDef> = {
  union: {
    id: 'union',
    label: 'Unión / pareja',
    hint: 'Vínculo conyugal o de pareja vigente.',
    color: '#334155',
    stroke: 'solid',
    width: 2,
  },
  cohabitation: {
    id: 'cohabitation',
    label: 'Convivencia',
    hint: 'Comparten hogar sin vínculo conyugal formal.',
    color: '#475569',
    stroke: 'dashed',
    width: 2,
  },
  separation: {
    id: 'separation',
    label: 'Separación',
    hint: 'Ruptura de la convivencia sin disolución legal.',
    color: '#334155',
    stroke: 'solid',
    width: 2,
    slashes: 1,
  },
  divorce: {
    id: 'divorce',
    label: 'Divorcio',
    hint: 'Disolución legal del vínculo.',
    color: '#334155',
    stroke: 'solid',
    width: 2,
    slashes: 2,
  },
  child: {
    id: 'child',
    label: 'Hijos',
    hint: 'Descendencia biológica. Se traza de la pareja hacia abajo.',
    color: '#64748b',
    stroke: 'solid',
    width: 1.5,
  },
  adoption: {
    id: 'adoption',
    label: 'Adopción',
    hint: 'Filiación adoptiva o de crianza.',
    color: '#64748b',
    stroke: 'dashed',
    width: 1.5,
  },
  strong: {
    id: 'strong',
    label: 'Relación fuerte',
    hint: 'Vínculo cercano y sostenido, con apoyo efectivo.',
    color: '#178578',
    stroke: 'double',
    width: 3,
  },
  weak: {
    id: 'weak',
    label: 'Relación débil',
    hint: 'Contacto esporádico o de baja intensidad.',
    color: '#94a3b8',
    stroke: 'dashed',
    width: 1.5,
  },
  conflictive: {
    id: 'conflictive',
    label: 'Relación conflictiva',
    hint: 'Tensión o desacuerdo recurrente entre las partes.',
    color: '#dc2626',
    stroke: 'zigzag',
    width: 2,
  },
  stressful: {
    id: 'stressful',
    label: 'Relación estresante',
    hint: 'El vínculo demanda energía. La flecha indica hacia dónde va el desgaste.',
    color: '#ea580c',
    stroke: 'solid',
    width: 2,
    arrow: true,
  },
  none: {
    id: 'none',
    label: 'Sin relación',
    hint: 'Vínculo inexistente o interrumpido.',
    color: '#cbd5e1',
    stroke: 'dotted',
    width: 1.5,
  },
};

export function pickRelations(...ids: RelationId[]): RelationDef[] {
  return ids.map((id) => RELATIONS[id]);
}

export function getRelation(id: RelationId): RelationDef {
  return RELATIONS[id] ?? RELATIONS.union;
}
