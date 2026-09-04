import type { EntityData } from '@/features/editor/types';

export const MAX_AGE = 110;

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/** Valida y normaliza un color hex; cadena vacía significa «usar convención». */
export function normalizeColor(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return HEX_COLOR.test(trimmed) ? trimmed.toLowerCase() : '';
}

export function getEntityColors(data: EntityData) {
  const isResource = data.shape === 'resource';
  const isHousehold = data.shape === 'household';
  const isIndex =
    data.isIndex || data.shape === 'patient_male' || data.shape === 'patient_female';
  const defaultStroke = isHousehold
    ? '#64748b'
    : isResource
      ? '#d16a1f'
      : isIndex
        ? '#178578'
        : '#334155';
  const defaultFill = isHousehold
    ? 'transparent'
    : isResource
      ? '#fdeedd'
      : isIndex
        ? '#eefbf8'
        : '#ffffff';
  const defaultText = '#475569';

  return {
    stroke: normalizeColor(data.strokeColor) || defaultStroke,
    fill: normalizeColor(data.fillColor) || defaultFill,
    text: normalizeColor(data.textColor) || defaultText,
    strokeWidth: isIndex || isResource ? 3 : isHousehold ? 2 : 2.5,
    dash: isHousehold ? '8 6' : undefined,
  };
}

export function getRelationColor(strokeColor: string | undefined, defaultColor: string): string {
  return normalizeColor(strokeColor ?? '') || defaultColor;
}

/** Convierte YYYY-MM-DD a DD/MM/YYYY para mostrar en el lienzo. */
export function formatBirthDate(iso: string): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

/** Edad plausible extraída del texto libre del editor (0–110). */
export function parseAgeYears(value: string): number | null {
  const digits = value.replace(/[^\d]/g, '');
  if (!digits) return null;

  const age = Number.parseInt(digits, 10);
  return Number.isFinite(age) && age >= 0 && age <= MAX_AGE ? age : null;
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Edad en años completos a partir de una fecha ISO y la fecha de referencia. */
export function ageFromBirthDate(iso: string, today = new Date()): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;

  const [year, month, day] = iso.split('-').map(Number);
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

export function isValidBirthDate(iso: string, today = new Date()): boolean {
  if (!iso) return true;
  return ageFromBirthDate(iso, today) !== null;
}

/** Límite inferior del selector de fecha (hace MAX_AGE años). */
export function minBirthDateIso(today = new Date()): string {
  const min = new Date(today.getFullYear() - MAX_AGE, today.getMonth(), today.getDate());
  return toIsoDate(min);
}

/** Límite superior del selector de fecha (hoy). */
export function maxBirthDateIso(today = new Date()): string {
  return toIsoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
}

/**
 * Estima la fecha de nacimiento restando la edad a la fecha de hoy.
 * Se usa la misma mes/día que hoy, desplazada `age` años hacia atrás.
 */
export function birthDateFromAge(age: string, today = new Date()): string {
  const years = parseAgeYears(age);
  if (years === null) return '';

  const birth = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  birth.setFullYear(birth.getFullYear() - years);

  const y = birth.getFullYear();
  const m = String(birth.getMonth() + 1).padStart(2, '0');
  const d = String(birth.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Al cambiar la edad se actualiza la fecha de nacimiento estimada.
 * La edad nunca se recalcula desde la fecha (solo en este sentido).
 */
export function patchFromAgeInput(age: string): Partial<EntityData> & { age: string } {
  const trimmed = age;
  const digits = trimmed.replace(/[^\d]/g, '');

  if (!digits) {
    return { age: trimmed, birthDate: '' };
  }

  const years = parseAgeYears(trimmed);
  if (years === null) {
    const parsed = Number.parseInt(digits, 10);
    if (Number.isFinite(parsed) && parsed > MAX_AGE) {
      return { age: String(MAX_AGE), birthDate: birthDateFromAge(String(MAX_AGE)) };
    }
    return { age: trimmed };
  }

  return { age: trimmed, birthDate: birthDateFromAge(trimmed) };
}
