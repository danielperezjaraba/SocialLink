import { randomUUID } from 'node:crypto';
import type {
  Diagram,
  DiagramEdge,
  DiagramNode,
  EntityShape,
  RelationId,
  Sex,
} from './types';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type EntityRow = {
  id: string;
  shape: EntityShape;
  name: string;
  age: number | null;
  sex: Sex | null;
  birth_date: string | null;
  occupation: string;
  kinship: string;
  cohabits: boolean;
  deceased: boolean;
  is_index: boolean;
  notes: string;
  stroke_color: string;
  fill_color: string;
  text_color: string;
  show_age: boolean;
  show_birth_date: boolean;
  show_name_inside: boolean;
  position_x: number;
  position_y: number;
};

export type RelationRow = {
  id: string;
  source_id: string;
  target_id: string;
  source_handle: string | null;
  target_handle: string | null;
  relation: RelationId;
  note: string;
  stroke_color: string;
};

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

function parseColor(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return HEX_COLOR.test(trimmed) ? trimmed.toLowerCase() : '';
}

const MAX_AGE = 110;

/**
 * La edad se captura como texto libre en el editor pero se almacena como número
 * para poder consultarla. Todo lo que no sea una edad plausible se descarta en
 * lugar de hacer fallar el guardado completo.
 */
export function parseAge(value: string): number | null {
  const digits = value.replace(/[^\d]/g, '');
  if (!digits) return null;

  const age = Number.parseInt(digits, 10);
  return Number.isFinite(age) && age >= 0 && age <= MAX_AGE ? age : null;
}

function parseSex(value: Sex): Sex | null {
  return value === 'M' || value === 'F' || value === 'X' ? value : null;
}

function ageFromBirthDate(iso: string, today = new Date()): number | null {
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return null;

  const birth = new Date(year, month - 1, day);
  if (
    birth.getFullYear() !== year ||
    birth.getMonth() !== month - 1 ||
    birth.getDate() !== day
  ) {
    return null;
  }

  const reference = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (birth > reference) return null;

  let age = reference.getFullYear() - birth.getFullYear();
  const monthDiff = reference.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age >= 0 && age <= MAX_AGE ? age : null;
}

function parseDate(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return ageFromBirthDate(value) === null ? null : value;
}

/**
 * Conserva el identificador que trae el navegador siempre que sea un UUID
 * válido; así el lienzo abierto sigue coincidiendo con lo guardado.
 */
function normalizeId(candidate: string): string {
  return UUID_PATTERN.test(candidate) ? candidate : randomUUID();
}

export function rowsToDiagram(entities: EntityRow[], relations: RelationRow[]): Diagram {
  return {
    nodes: entities.map<DiagramNode>((row) => ({
      id: row.id,
      type: 'entity',
      position: { x: row.position_x, y: row.position_y },
      data: {
        shape: row.shape,
        name: row.name,
        age: row.age === null ? '' : String(row.age),
        sex: row.sex ?? '',
        birthDate: row.birth_date ?? '',
        occupation: row.occupation,
        kinship: row.kinship,
        cohabits: row.cohabits,
        deceased: row.deceased,
        isIndex: row.is_index,
        notes: row.notes,
        strokeColor: row.stroke_color ?? '',
        fillColor: row.fill_color ?? '',
        textColor: row.text_color ?? '',
        showAge: row.show_age ?? true,
        showBirthDate: row.show_birth_date ?? false,
        showNameInside: row.show_name_inside ?? false,
      },
    })),
    edges: relations.map<DiagramEdge>((row) => ({
      id: row.id,
      type: 'relation',
      source: row.source_id,
      target: row.target_id,
      sourceHandle: row.source_handle,
      targetHandle: row.target_handle,
      data: { relation: row.relation, note: row.note, strokeColor: row.stroke_color ?? '' },
    })),
  };
}

export type PreparedDiagram = {
  entities: Array<{
    id: string;
    shape: EntityShape;
    name: string;
    age: number | null;
    sex: Sex | null;
    birthDate: string | null;
    occupation: string;
    kinship: string;
    cohabits: boolean;
    deceased: boolean;
    isIndex: boolean;
    notes: string;
    strokeColor: string;
    fillColor: string;
    textColor: string;
    showAge: boolean;
    showBirthDate: boolean;
    showNameInside: boolean;
    positionX: number;
    positionY: number;
  }>;
  relations: Array<{
    id: string;
    sourceId: string;
    targetId: string;
    sourceHandle: string | null;
    targetHandle: string | null;
    relation: RelationId;
    note: string;
    strokeColor: string;
  }>;
};

/**
 * Traduce el diagrama del editor a filas listas para insertar, descartando los
 * vínculos que apunten a figuras inexistentes.
 */
export function prepareDiagram(diagram: Diagram): PreparedDiagram {
  const idMap = new Map<string, string>();

  const entities = diagram.nodes.map((node) => {
    const id = normalizeId(node.id);
    idMap.set(node.id, id);

    return {
      id,
      shape: node.data.shape,
      name: node.data.name,
      age: parseAge(node.data.age),
      sex: parseSex(node.data.sex),
      birthDate: parseDate(node.data.birthDate),
      occupation: node.data.occupation,
      kinship: node.data.kinship,
      cohabits: node.data.cohabits,
      deceased: node.data.deceased,
      isIndex: node.data.isIndex,
      notes: node.data.notes,
      strokeColor: parseColor(node.data.strokeColor ?? ''),
      fillColor: parseColor(node.data.fillColor ?? ''),
      textColor: parseColor(node.data.textColor ?? ''),
      showAge: node.data.showAge !== false,
      showBirthDate: Boolean(node.data.showBirthDate),
      showNameInside: Boolean(node.data.showNameInside),
      positionX: node.position.x,
      positionY: node.position.y,
    };
  });

  const relations = diagram.edges.flatMap((edge) => {
    const sourceId = idMap.get(edge.source);
    const targetId = idMap.get(edge.target);
    if (!sourceId || !targetId || sourceId === targetId) return [];

    return [
      {
        id: normalizeId(edge.id),
        sourceId,
        targetId,
        sourceHandle: edge.sourceHandle ?? null,
        targetHandle: edge.targetHandle ?? null,
        relation: edge.data.relation,
        note: edge.data.note,
        strokeColor: parseColor(edge.data.strokeColor ?? ''),
      },
    ];
  });

  return { entities, relations };
}
