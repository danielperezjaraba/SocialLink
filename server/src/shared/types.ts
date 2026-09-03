export type UserProfile = 'estudiante' | 'docente' | 'profesional';
export type PlanId = 'free' | 'premium' | 'institucional';
export type ToolKind = 'genograma' | 'familiograma' | 'ecomapa';

export type EntityShape = 'male' | 'female' | 'unknown' | 'pregnancy' | 'resource';
export type Sex = '' | 'M' | 'F' | 'X';

export type RelationId =
  | 'union'
  | 'cohabitation'
  | 'separation'
  | 'divorce'
  | 'child'
  | 'adoption'
  | 'strong'
  | 'weak'
  | 'conflictive'
  | 'stressful'
  | 'none';

/**
 * Estas formas replican lo que espera el editor del navegador. Se declaran aquí
 * en lugar de importarlas del frontend para que la API pueda desplegarse y
 * evolucionar por separado.
 */
export type EntityData = {
  shape: EntityShape;
  name: string;
  age: string;
  sex: Sex;
  birthDate: string;
  occupation: string;
  kinship: string;
  cohabits: boolean;
  deceased: boolean;
  isIndex: boolean;
  notes: string;
};

export type DiagramNode = {
  id: string;
  type: 'entity';
  position: { x: number; y: number };
  data: EntityData;
};

export type DiagramEdge = {
  id: string;
  type: 'relation';
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  data: { relation: RelationId; note: string };
};

export type Diagram = {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  profile: UserProfile;
  institution: string;
  plan: PlanId;
  isGuest: boolean;
  createdAt: string;
};

export type PlanLimits = {
  id: PlanId;
  name: string;
  priceCop: number | null;
  maxProjects: number | null;
  allTemplates: boolean;
  exportPdf: boolean;
  exportImage: boolean;
  customization: boolean;
};
