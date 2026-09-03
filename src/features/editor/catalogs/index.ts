import { createId } from '@/lib/utils';
import { pickRelations } from '@/features/editor/catalogs/relations';
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
  return {
    id: createId(),
    type: 'entity',
    position,
    data: { ...EMPTY_ENTITY, ...data },
  };
}

const genograma: ToolCatalog = {
  kind: 'genograma',
  name: 'Genograma',
  tagline: 'Representar estructura y relaciones familiares',
  description:
    'Mapea la estructura familiar a lo largo de las generaciones y hace visibles los patrones que se repiten.',
  symbolsTitle: 'Personas',
  symbols: [
    { id: 'male', label: 'Hombre', hint: 'Se representa con un cuadrado.', shape: 'male', defaults: { sex: 'M' } },
    { id: 'female', label: 'Mujer', hint: 'Se representa con un círculo.', shape: 'female', defaults: { sex: 'F' } },
    {
      id: 'unknown',
      label: 'Sexo desconocido',
      hint: 'Se representa con un rombo cuando no se cuenta con el dato.',
      shape: 'unknown',
      defaults: { sex: 'X' },
    },
    {
      id: 'deceased-male',
      label: 'Hombre fallecido',
      hint: 'Cuadrado cruzado por un aspa.',
      shape: 'male',
      defaults: { sex: 'M', deceased: true },
    },
    {
      id: 'deceased-female',
      label: 'Mujer fallecida',
      hint: 'Círculo cruzado por un aspa.',
      shape: 'female',
      defaults: { sex: 'F', deceased: true },
    },
    {
      id: 'pregnancy',
      label: 'Embarazo',
      hint: 'Triángulo, para gestaciones en curso.',
      shape: 'pregnancy',
      defaults: { name: 'Embarazo' },
    },
  ],
  relations: pickRelations(
    'union',
    'cohabitation',
    'separation',
    'divorce',
    'child',
    'adoption',
    'strong',
    'weak',
    'conflictive',
    'stressful',
    'none',
  ),
  seed: () => ({
    nodes: [
      makeEntity({ x: 320, y: 220 }, { shape: 'female', sex: 'F', name: 'Persona índice', isIndex: true }),
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
  symbolsTitle: 'Integrantes',
  symbols: [
    { id: 'male', label: 'Hombre', hint: 'Se representa con un cuadrado.', shape: 'male', defaults: { sex: 'M' } },
    { id: 'female', label: 'Mujer', hint: 'Se representa con un círculo.', shape: 'female', defaults: { sex: 'F' } },
    {
      id: 'unknown',
      label: 'Sexo desconocido',
      hint: 'Se representa con un rombo.',
      shape: 'unknown',
      defaults: { sex: 'X' },
    },
    {
      id: 'deceased',
      label: 'Integrante fallecido',
      hint: 'Figura cruzada por un aspa.',
      shape: 'male',
      defaults: { deceased: true },
    },
  ],
  relations: pickRelations(
    'union',
    'cohabitation',
    'separation',
    'divorce',
    'child',
    'adoption',
    'strong',
    'conflictive',
  ),
  seed: () => ({
    nodes: [
      makeEntity({ x: 320, y: 220 }, { shape: 'female', sex: 'F', name: 'Persona índice', kinship: 'Jefa de hogar', isIndex: true }),
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
  symbolsTitle: 'Entorno',
  symbols: [
    {
      id: 'center',
      label: 'Persona o familia',
      hint: 'Núcleo del ecomapa. Va en el centro del lienzo.',
      shape: 'unknown',
      defaults: { name: 'Familia', isIndex: true },
    },
    { id: 'salud', label: 'Salud', hint: 'EPS, hospital, centro de salud.', shape: 'resource', defaults: { name: 'Salud' } },
    { id: 'educacion', label: 'Educación', hint: 'Colegio, universidad, formación.', shape: 'resource', defaults: { name: 'Educación' } },
    { id: 'trabajo', label: 'Trabajo', hint: 'Empleo o fuente de ingresos.', shape: 'resource', defaults: { name: 'Trabajo' } },
    { id: 'familia-extensa', label: 'Familia extensa', hint: 'Parientes fuera del hogar.', shape: 'resource', defaults: { name: 'Familia extensa' } },
    { id: 'amigos', label: 'Amigos', hint: 'Red de amistades y vecindario.', shape: 'resource', defaults: { name: 'Amigos' } },
    { id: 'religion', label: 'Religión', hint: 'Comunidad de fe o espiritualidad.', shape: 'resource', defaults: { name: 'Religión' } },
    { id: 'recreacion', label: 'Recreación', hint: 'Deporte, cultura, tiempo libre.', shape: 'resource', defaults: { name: 'Recreación' } },
    { id: 'instituciones', label: 'Instituciones', hint: 'ICBF, comisaría, programas del Estado.', shape: 'resource', defaults: { name: 'Instituciones' } },
    { id: 'otro', label: 'Otra red', hint: 'Cualquier apoyo que no encaje en las anteriores.', shape: 'resource', defaults: { name: 'Otra red' } },
  ],
  relations: pickRelations('strong', 'weak', 'conflictive', 'stressful', 'none'),
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
