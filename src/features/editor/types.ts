import type { Edge, Node } from '@xyflow/react';

/** Las tres herramientas de diagnóstico que ofrece la plataforma. */
export type ToolKind = 'genograma' | 'familiograma' | 'ecomapa';

/**
 * Forma con la que se dibuja una entidad en el lienzo. El lenguaje gráfico del
 * Trabajo Social usa cuadrado para hombre, círculo para mujer, rombo cuando el
 * sexo no se conoce y triángulo para embarazos.
 */
export type EntityShape = 'male' | 'female' | 'unknown' | 'pregnancy' | 'resource';

export type Sex = '' | 'M' | 'F' | 'X';

export type EntityData = {
  shape: EntityShape;
  name: string;
  age: string;
  sex: Sex;
  birthDate: string;
  occupation: string;
  /** Parentesco respecto a la persona índice. Se usa sobre todo en familiograma. */
  kinship: string;
  /** Marca si el integrante convive en el hogar. */
  cohabits: boolean;
  deceased: boolean;
  /** Persona índice: el sujeto sobre el que gira el diagnóstico. */
  isIndex: boolean;
  notes: string;
};

export type RelationId =
  // Vínculos estructurales del genograma y el familiograma
  | 'union'
  | 'cohabitation'
  | 'separation'
  | 'divorce'
  | 'child'
  | 'adoption'
  // Vínculos de calidad, compartidos con el ecomapa
  | 'strong'
  | 'weak'
  | 'conflictive'
  | 'stressful'
  | 'none';

export type RelationData = {
  relation: RelationId;
  note: string;
};

export type EntityNode = Node<EntityData, 'entity'>;
export type RelationEdge = Edge<RelationData, 'relation'>;

export type Diagram = {
  nodes: EntityNode[];
  edges: RelationEdge[];
};

/** Elemento arrastrable del panel izquierdo. */
export type SymbolDef = {
  id: string;
  label: string;
  hint: string;
  shape: EntityShape;
  defaults?: Partial<EntityData>;
};

/** Trazo con el que se dibuja cada tipo de vínculo. */
export type RelationStroke = 'solid' | 'dashed' | 'dotted' | 'zigzag' | 'double';

export type RelationDef = {
  id: RelationId;
  label: string;
  hint: string;
  color: string;
  stroke: RelationStroke;
  width: number;
  /** Barras que cruzan la línea: una para separación, dos para divorcio. */
  slashes?: 1 | 2;
  /** Flecha en el extremo, usada para señalar dirección del desgaste. */
  arrow?: boolean;
};

export type ToolCatalog = {
  kind: ToolKind;
  name: string;
  tagline: string;
  description: string;
  symbolsTitle: string;
  symbols: SymbolDef[];
  relations: RelationDef[];
  /** Diagrama inicial cuando se crea un proyecto en blanco. */
  seed: () => Diagram;
};

export const EMPTY_ENTITY: EntityData = {
  shape: 'male',
  name: '',
  age: '',
  sex: '',
  birthDate: '',
  occupation: '',
  kinship: '',
  cohabits: true,
  deceased: false,
  isIndex: false,
  notes: '',
};
