import { createId } from '@/lib/utils';
import { ALL_RELATIONS } from '@/features/editor/catalogs/relations';
import { ALL_SYMBOLS } from '@/features/editor/catalogs/symbols';
import {
  EMPTY_ENTITY,
  type Diagram,
  type EntityData,
  type EntityNode,
  type ToolCatalog,
  type ToolKind,
} from '@/features/editor/types';

export function makeEntity(
  position: { x: number; y: number },
  data: Partial<EntityData>,
): EntityNode {
  const zIndex = data.shape === 'household' ? -1 : undefined;
  return {
    id: createId(),
    type: 'entity',
    position,
    ...(zIndex !== undefined ? { zIndex } : {}),
    data: { ...EMPTY_ENTITY, ...data },
  };
}

const genograma: ToolCatalog = {
  kind: 'genograma',
  name: 'Genograma',
  tagline: 'Representar estructura y relaciones familiares',
  description:
    'Mapea la estructura familiar a lo largo de las generaciones y hace visibles los patrones que se repiten.',
  symbols: ALL_SYMBOLS,
  relations: ALL_RELATIONS,
  seed: () => ({
    nodes: [
      makeEntity(
        { x: 320, y: 220 },
        { shape: 'patient_female', sex: 'F', name: 'Persona índice', isIndex: true },
      ),
    ],
    edges: [],
  }),
};

const familiograma: ToolCatalog = {
  kind: 'familiograma',
  name: 'Familiograma',
  tagline: 'Representar composición y dinámica familiar',
  description:
    'Registra quiénes integran la familia, su parentesco y quiénes conviven bajo el mismo techo.',
  symbols: ALL_SYMBOLS,
  relations: ALL_RELATIONS,
  seed: () => ({
    nodes: [
      makeEntity(
        { x: 320, y: 220 },
        {
          shape: 'patient_female',
          sex: 'F',
          name: 'Persona índice',
          kinship: 'Jefa de hogar',
          isIndex: true,
        },
      ),
    ],
    edges: [],
  }),
};

const ecomapa: ToolCatalog = {
  kind: 'ecomapa',
  name: 'Ecomapa',
  tagline: 'Representar redes de apoyo y relaciones con el entorno',
  description:
    'Sitúa a la persona o familia en el centro y describe la calidad de su vínculo con cada red del entorno.',
  symbols: ALL_SYMBOLS,
  relations: ALL_RELATIONS,
  seed: () => ({
    nodes: [makeEntity({ x: 360, y: 240 }, { shape: 'unknown', name: 'Familia', isIndex: true })],
    edges: [],
  }),
};

const CATALOGS: Record<ToolKind, ToolCatalog> = { genograma, familiograma, ecomapa };

export const TOOL_KINDS: ToolKind[] = ['genograma', 'familiograma', 'ecomapa'];

export function getCatalog(kind: ToolKind): ToolCatalog {
  return CATALOGS[kind] ?? genograma;
}

export function emptyDiagram(): Diagram {
  return { nodes: [], edges: [] };
}

export { ALL_SYMBOLS, ALL_RELATIONS };
