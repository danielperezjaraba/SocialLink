import { pool } from '../../config/db';
import type { PlanId, PublicUser, UserProfile } from '../../shared/types';

export type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string | null;
  profile: UserProfile;
  institution: string;
  plan: PlanId;
  is_guest: boolean;
  created_at: Date;
};

const COLUMNS = `id, name, email, password_hash, profile, institution, plan, is_guest, created_at`;

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    profile: row.profile,
    institution: row.institution,
    plan: row.plan,
    isGuest: row.is_guest,
    createdAt: row.created_at.toISOString(),
  };
}

export async function findByEmail(email: string): Promise<UserRow | null> {
  const { rows } = await pool.query<UserRow>(
    `SELECT ${COLUMNS} FROM users WHERE email = $1`,
    [email],
  );
  return rows[0] ?? null;
}

export async function findById(id: string): Promise<UserRow | null> {
  const { rows } = await pool.query<UserRow>(`SELECT ${COLUMNS} FROM users WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

export async function insertUser(input: {
  name: string;
  email: string;
  passwordHash: string;
  profile: UserProfile;
  institution: string;
}): Promise<UserRow> {
  const { rows } = await pool.query<UserRow>(
    `INSERT INTO users (name, email, password_hash, profile, institution)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${COLUMNS}`,
    [input.name, input.email, input.passwordHash, input.profile, input.institution],
  );
  return rows[0];
}

type UserPatch = { name?: string; profile?: UserProfile; institution?: string; plan?: PlanId };

/** Las columnas actualizables se listan a mano: ninguna llega desde el cliente. */
const UPDATABLE: Array<[keyof UserPatch, string]> = [
  ['name', 'name'],
  ['profile', 'profile'],
  ['institution', 'institution'],
  ['plan', 'plan'],
];

export async function updateUser(id: string, patch: UserPatch): Promise<UserRow | null> {
  const assignments: string[] = [];
  const values: unknown[] = [];

  for (const [key, column] of UPDATABLE) {
    const value = patch[key];
    if (value === undefined) continue;
    values.push(value);
    assignments.push(`${column} = $${values.length}`);
  }

  if (assignments.length === 0) {
    return findById(id);
  }

  values.push(id);
  const { rows } = await pool.query<UserRow>(
    `UPDATE users SET ${assignments.join(', ')}, updated_at = now()
     WHERE id = $${values.length}
     RETURNING ${COLUMNS}`,
    values,
  );
  return rows[0] ?? null;
}
