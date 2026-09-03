import type { PlanId } from '@/configs/plans';
import type { User } from '@/services/types';

const GUEST_KEY = 'sociallink.guest';

/** Identificador fijo: la exploración siempre reutiliza la misma sesión local. */
export const GUEST_ID = 'guest-local';

function createGuest(): User {
  return {
    id: GUEST_ID,
    name: 'Sesión de exploración',
    email: 'invitado@sociallink.local',
    profile: 'estudiante',
    institution: '',
    plan: 'free',
    isGuest: true,
    createdAt: new Date().toISOString(),
  };
}

/**
 * El invitado vive solo en este navegador: no tiene contraseña ni fila en la
 * base, así que basta con guardar sus datos tal cual.
 */
export function getGuest(): User | null {
  const raw = localStorage.getItem(GUEST_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as User;
  } catch {
    localStorage.removeItem(GUEST_KEY);
    return null;
  }
}

export function startGuest(): User {
  const guest = getGuest() ?? createGuest();
  localStorage.setItem(GUEST_KEY, JSON.stringify(guest));
  return guest;
}

export function updateGuest(
  patch: Partial<Pick<User, 'name' | 'profile' | 'institution' | 'plan'>>,
): User {
  const updated: User = { ...(getGuest() ?? createGuest()), ...patch };
  localStorage.setItem(GUEST_KEY, JSON.stringify(updated));
  return updated;
}

export function changeGuestPlan(plan: PlanId): User {
  return updateGuest({ plan });
}

export function endGuest(): void {
  localStorage.removeItem(GUEST_KEY);
}
