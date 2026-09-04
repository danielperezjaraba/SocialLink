import { makeEntity } from '@/features/editor/catalogs';
import { birthDateFromAge } from '@/features/editor/entityStyle';
import type { Diagram, EntityNode, RelationEdge, Sex } from '@/features/editor/types';
import { EMPTY_RELATION } from '@/features/editor/types';
import { createId } from '@/lib/utils';

export type FamilyGeneration = 1 | 2 | 3;

export type FamilyMember = {
  id: string;
  name: string;
  kinship: string;
  age: string;
  sex: Sex;
  generation: FamilyGeneration;
  cohabits: boolean;
};

export function emptyMember(): FamilyMember {
  return {
    id: createId(),
    name: '',
    kinship: '',
    age: '',
    sex: 'F',
    generation: 2,
    cohabits: true,
  };
}

export const GENERATION_LABELS: Record<FamilyGeneration, string> = {
  1: 'Generación mayor (abuelos)',
  2: 'Generación intermedia (padres o cuidadores)',
  3: 'Generación menor (hijos)',
};

const ROW_HEIGHT = 230;
const COLUMN_WIDTH = 190;

function shapeFor(sex: Sex) {
  if (sex === 'M') return 'male' as const;
  if (sex === 'F') return 'female' as const;
  return 'unknown' as const;
}

function link(source: string, target: string, relation: RelationEdge['data']): RelationEdge {
  return { id: createId(), type: 'relation', source, target, data: relation };
}

/**
 * Convierte la lista de integrantes en un esquema ya ordenado: cada generación
 * ocupa una fila, la pareja de cada fila queda unida y los descendientes se
 * enlazan con la generación inmediatamente superior.
 */
export function buildFamilyDiagram(members: FamilyMember[]): Diagram {
  const named = members.filter((member) => member.name.trim().length > 0);
  if (named.length === 0) {
    return { nodes: [], edges: [] };
  }

  const byGeneration = new Map<FamilyGeneration, FamilyMember[]>();
  for (const member of named) {
    const bucket = byGeneration.get(member.generation) ?? [];
    bucket.push(member);
    byGeneration.set(member.generation, bucket);
  }

  const nodesByMember = new Map<string, EntityNode>();
  const nodes: EntityNode[] = [];

  for (const [generation, bucket] of byGeneration) {
    const rowWidth = (bucket.length - 1) * COLUMN_WIDTH;
    bucket.forEach((member, index) => {
      const trimmedAge = member.age.trim();
      const node = makeEntity(
        {
          x: 420 - rowWidth / 2 + index * COLUMN_WIDTH,
          y: 80 + (generation - 1) * ROW_HEIGHT,
        },
        {
          shape: shapeFor(member.sex),
          sex: member.sex,
          name: member.name.trim(),
          kinship: member.kinship.trim(),
          age: trimmedAge,
          birthDate: birthDateFromAge(trimmedAge),
          cohabits: member.cohabits,
        },
      );
      nodes.push(node);
      nodesByMember.set(member.id, node);
    });
  }

  const edges: RelationEdge[] = [];

  for (const generation of [1, 2] as FamilyGeneration[]) {
    const parents = byGeneration.get(generation) ?? [];
    const children = byGeneration.get((generation + 1) as FamilyGeneration) ?? [];

    if (parents.length >= 2) {
      const first = nodesByMember.get(parents[0].id);
      const second = nodesByMember.get(parents[1].id);
      if (first && second) {
        edges.push(link(first.id, second.id, { ...EMPTY_RELATION, relation: 'union' }));
      }
    }

    for (const child of children) {
      const childNode = nodesByMember.get(child.id);
      if (!childNode) continue;

      for (const parent of parents.slice(0, 2)) {
        const parentNode = nodesByMember.get(parent.id);
        if (parentNode) {
          edges.push(link(parentNode.id, childNode.id, { ...EMPTY_RELATION, relation: 'child' }));
        }
      }
    }
  }

  return { nodes, edges };
}
