import type { PlanId } from '@/configs/plans';
import type { Diagram, ToolKind } from '@/features/editor/types';

export type UserProfile = 'estudiante' | 'docente' | 'profesional';

export type User = {
  id: string;
  name: string;
  email: string;
  profile: UserProfile;
  institution: string;
  plan: PlanId;
  isGuest: boolean;
  createdAt: string;
};

export type Project = {
  id: string;
  ownerId: string;
  name: string;
  kind: ToolKind;
  description: string;
  diagram: Diagram;
  createdAt: string;
  updatedAt: string;
};

export type ProjectSummary = Omit<Project, 'diagram'> & {
  entityCount: number;
  relationCount: number;
};

export const PROFILE_LABELS: Record<UserProfile, string> = {
  estudiante: 'Estudiante',
  docente: 'Docente',
  profesional: 'Profesional',
};
