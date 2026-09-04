import type { RelationCategory, RelationDef, RelationId } from '@/features/editor/types';

export const RELATION_CATEGORIES: { id: RelationCategory; label: string }[] = [
  { id: 'estructura', label: 'Pareja y familia' },
  { id: 'calidad', label: 'Calidad del vínculo' },
];

export const RELATIONS: Record<RelationId, RelationDef> = {
  union: {
    id: 'union',
    label: 'Matrimonio',
    hint: 'Cuadrado y círculo unidos por línea horizontal continua.',
    color: '#334155',
    stroke: 'solid',
    width: 2,
    category: 'estructura',
  },
  cohabitation: {
    id: 'cohabitation',
    label: 'Unión libre',
    hint: 'Línea horizontal discontinua (convivencia sin matrimonio).',
    color: '#475569',
    stroke: 'dashed',
    width: 2,
    category: 'estructura',
  },
  separation: {
    id: 'separation',
    label: 'Separación',
    hint: 'Ruptura de la convivencia sin disolución legal.',
    color: '#334155',
    stroke: 'solid',
    width: 2,
    slashes: 1,
    category: 'estructura',
  },
  divorce: {
    id: 'divorce',
    label: 'Divorcio',
    hint: 'Disolución legal del vínculo.',
    color: '#334155',
    stroke: 'solid',
    width: 2,
    slashes: 2,
    category: 'estructura',
  },
  child: {
    id: 'child',
    label: 'Hijo / hija',
    hint: 'Descendencia. Línea vertical desde la pareja.',
    color: '#64748b',
    stroke: 'solid',
    width: 1.5,
    category: 'estructura',
  },
  adoption: {
    id: 'adoption',
    label: 'Adopción',
    hint: 'Filiación adoptiva o de crianza.',
    color: '#64748b',
    stroke: 'dashed',
    width: 1.5,
    category: 'estructura',
  },
  twins_identical: {
    id: 'twins_identical',
    label: 'Gemelos idénticos',
    hint: 'Dos líneas desde la pareja unidas por barra horizontal (triángulo).',
    color: '#64748b',
    stroke: 'solid',
    width: 1.5,
    category: 'estructura',
    twinBar: 'identical',
  },
  twins_fraternal: {
    id: 'twins_fraternal',
    label: 'Gemelos no idénticos',
    hint: 'Dos líneas desde la pareja en forma de V abierta.',
    color: '#64748b',
    stroke: 'solid',
    width: 1.5,
    category: 'estructura',
    twinBar: 'fraternal',
  },
  strong: {
    id: 'strong',
    label: 'Relación estrecha',
    hint: 'Línea doble (vínculo cercano y sostenido).',
    color: '#178578',
    stroke: 'double',
    width: 3,
    category: 'calidad',
  },
  weak: {
    id: 'weak',
    label: 'Relación distante',
    hint: 'Línea discontinua (contacto esporádico o distante).',
    color: '#94a3b8',
    stroke: 'dashed',
    width: 1.5,
    category: 'calidad',
  },
  conflictive: {
    id: 'conflictive',
    label: 'Relación conflictiva',
    hint: 'Tensión o desacuerdo recurrente.',
    color: '#dc2626',
    stroke: 'zigzag',
    width: 2,
    category: 'calidad',
  },
  stressful: {
    id: 'stressful',
    label: 'Relación estresante',
    hint: 'Desgaste; la flecha indica la dirección.',
    color: '#ea580c',
    stroke: 'solid',
    width: 2,
    arrow: true,
    category: 'calidad',
  },
  none: {
    id: 'none',
    label: 'Sin relación',
    hint: 'Vínculo inexistente o interrumpido.',
    color: '#cbd5e1',
    stroke: 'dotted',
    width: 1.5,
    category: 'calidad',
  },
};

export const ALL_RELATIONS: RelationDef[] = Object.values(RELATIONS);

export function pickRelations(...ids: RelationId[]): RelationDef[] {
  return ids.map((id) => RELATIONS[id]);
}

export function getRelation(id: RelationId): RelationDef {
  return RELATIONS[id] ?? RELATIONS.union;
}

export function relationsByCategory(category: RelationCategory): RelationDef[] {
  return ALL_RELATIONS.filter((relation) => relation.category === category);
}
