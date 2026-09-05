import type { Edge, Node } from '@xyflow/react';

/** Las tres herramientas de diagnóstico que ofrece la plataforma. */
export type ToolKind = 'genograma' | 'familiograma' | 'ecomapa';

/**
 * Forma con la que se dibuja una entidad en el lienzo. El lenguaje gráfico del
 * Trabajo Social usa cuadrado para hombre, círculo para mujer, rombo cuando el
 * sexo no se conoce y triángulo para embarazos.
 */
export type EntityShape =
  | 'male'
  | 'female'
  | 'unknown'
  | 'pregnancy'
  | 'resource'
  | 'patient_male'
  | 'patient_female'
  | 'stillborn'
  | 'induced_abortion'
  | 'spontaneous_abortion'
  | 'disorder_untreated'
  | 'disorder_treated'
  | 'substance_use'
  | 'substance_recovery'
  | 'household';

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
  /** Colores personalizados (hex). Vacío = convención del diagrama. */
  strokeColor: string;
  fillColor: string;
  textColor: string;
  /** Qué datos se muestran dentro del símbolo. */
  showAge: boolean;
  showBirthDate: boolean;
  /** Si es true, el nombre va dentro del símbolo en lugar de debajo. */
  showNameInside: boolean;
};

export type RelationId =
  | 'union'
  | 'cohabitation'
  | 'separation'
  | 'divorce'
  | 'child'
  | 'adoption'
  | 'twins_identical'
  | 'twins_fraternal'
  | 'strong'
  | 'weak'
  | 'conflictive'
  | 'stressful'
  | 'none';

export type SymbolCategory =
  | 'integrantes'
  | 'eventos'
  | 'salud'
  | 'entorno'
  | 'hogar';

export type RelationCategory = 'estructura' | 'calidad';

export type RelationData = {
  relation: RelationId;
  note: string;
  /** Color personalizado de la línea (hex). Vacío = convención del tipo de vínculo. */
  strokeColor: string;
  /** Grosor relativo de la línea (1 = convención del tipo de vínculo). */
  lineScale: number;
};

export const EMPTY_RELATION: RelationData = {
  relation: 'union',
  note: '',
  strokeColor: '',
  lineScale: 1,
};

export type EntityNode = Node<EntityData, 'entity'>;
export type AnchorNode = Node<Record<string, never>, 'anchor'> & {
  nodeOrigin?: [number, number];
};
export type DiagramNode = EntityNode | AnchorNode;

export type RelationEdge = Edge<RelationData, 'relation'>;

export type Diagram = {
  nodes: DiagramNode[];
  edges: RelationEdge[];
};

/** Elemento arrastrable del panel izquierdo. */
export type SymbolDef = {
  id: string;
  label: string;
  hint: string;
  shape: EntityShape;
  category: SymbolCategory;
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
  category: RelationCategory;
  /** Barras que cruzan la línea: una para separación, dos para divorcio. */
  slashes?: 1 | 2;
  /** Flecha en el extremo, usada para señalar dirección del desgaste. */
  arrow?: boolean;
  /** Conector especial entre gemelos. */
  twinBar?: 'identical' | 'fraternal';
};

export type ToolCatalog = {
  kind: ToolKind;
  name: string;
  tagline: string;
  description: string;
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
  strokeColor: '',
  fillColor: '',
  textColor: '',
  showAge: true,
  showBirthDate: false,
  showNameInside: false,
};
