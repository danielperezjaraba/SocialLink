import type { SymbolCategory, SymbolDef } from '@/features/editor/types';

export const SYMBOL_CATEGORIES: { id: SymbolCategory; label: string }[] = [
  { id: 'integrantes', label: 'Integrantes' },
  { id: 'eventos', label: 'Eventos' },
  { id: 'salud', label: 'Salud y consumo' },
  { id: 'entorno', label: 'Entorno' },
  { id: 'hogar', label: 'Hogar' },
];

/** Catálogo completo disponible en genograma, familiograma y ecomapa. */
export const ALL_SYMBOLS: SymbolDef[] = [
  // Integrantes
  { id: 'male', label: 'Hombre', hint: 'Cuadrado.', shape: 'male', category: 'integrantes', defaults: { sex: 'M' } },
  { id: 'female', label: 'Mujer', hint: 'Círculo.', shape: 'female', category: 'integrantes', defaults: { sex: 'F' } },
  {
    id: 'unknown',
    label: 'Sexo desconocido',
    hint: 'Rombo.',
    shape: 'unknown',
    category: 'integrantes',
    defaults: { sex: 'X' },
  },
  {
    id: 'patient-male',
    label: 'Paciente masculino',
    hint: 'Cuadrado dentro de otro cuadrado (persona índice).',
    shape: 'patient_male',
    category: 'integrantes',
    defaults: { sex: 'M', isIndex: true, showAge: true },
  },
  {
    id: 'patient-female',
    label: 'Paciente femenino',
    hint: 'Círculo dentro de otro círculo (persona índice).',
    shape: 'patient_female',
    category: 'integrantes',
    defaults: { sex: 'F', isIndex: true, showAge: true },
  },
  {
    id: 'deceased-male',
    label: 'Hombre fallecido',
    hint: 'Cuadrado con aspa.',
    shape: 'male',
    category: 'integrantes',
    defaults: { sex: 'M', deceased: true },
  },
  {
    id: 'deceased-female',
    label: 'Mujer fallecida',
    hint: 'Círculo con aspa.',
    shape: 'female',
    category: 'integrantes',
    defaults: { sex: 'F', deceased: true },
  },
  {
    id: 'pregnancy',
    label: 'Embarazo',
    hint: 'Triángulo.',
    shape: 'pregnancy',
    category: 'integrantes',
    defaults: { name: 'Embarazo' },
  },

  // Eventos reproductivos
  {
    id: 'stillborn',
    label: 'Nacido muerto',
    hint: 'Cuadrado pequeño con X, debajo de la pareja.',
    shape: 'stillborn',
    category: 'eventos',
    defaults: { name: 'Nacido muerto', showAge: false },
  },
  {
    id: 'induced-abortion',
    label: 'Aborto inducido',
    hint: 'Línea vertical con X al final.',
    shape: 'induced_abortion',
    category: 'eventos',
    defaults: { name: 'Aborto inducido', showAge: false },
  },
  {
    id: 'spontaneous-abortion',
    label: 'Aborto espontáneo',
    hint: 'Círculo pequeño relleno.',
    shape: 'spontaneous_abortion',
    category: 'eventos',
    defaults: { name: 'Aborto espontáneo', showAge: false },
  },

  // Salud y consumo
  {
    id: 'disorder-untreated',
    label: 'Trastorno sin tratamiento',
    hint: 'Cuadrado mitad negro / mitad blanco.',
    shape: 'disorder_untreated',
    category: 'salud',
    defaults: { name: 'Trastorno' },
  },
  {
    id: 'disorder-treated',
    label: 'Trastorno en tratamiento',
    hint: 'Cuadrado blanco con esquina negra.',
    shape: 'disorder_treated',
    category: 'salud',
    defaults: { name: 'Trastorno (tx)' },
  },
  {
    id: 'substance-use',
    label: 'Consumo',
    hint: 'Mitad superior negra (alcohol o drogas).',
    shape: 'substance_use',
    category: 'salud',
    defaults: { name: 'Consumo' },
  },
  {
    id: 'substance-recovery',
    label: 'Recuperación',
    hint: 'Cuadrado blanco con esquina negra.',
    shape: 'substance_recovery',
    category: 'salud',
    defaults: { name: 'Recuperación' },
  },

  // Entorno (ecomapa y contexto)
  {
    id: 'center',
    label: 'Persona o familia',
    hint: 'Núcleo del ecomapa.',
    shape: 'unknown',
    category: 'entorno',
    defaults: { name: 'Familia', isIndex: true },
  },
  { id: 'salud', label: 'Salud', hint: 'EPS, hospital.', shape: 'resource', category: 'entorno', defaults: { name: 'Salud' } },
  { id: 'educacion', label: 'Educación', hint: 'Colegio, universidad.', shape: 'resource', category: 'entorno', defaults: { name: 'Educación' } },
  { id: 'trabajo', label: 'Trabajo', hint: 'Empleo.', shape: 'resource', category: 'entorno', defaults: { name: 'Trabajo' } },
  {
    id: 'familia-extensa',
    label: 'Familia extensa',
    hint: 'Parientes fuera del hogar.',
    shape: 'resource',
    category: 'entorno',
    defaults: { name: 'Familia extensa' },
  },
  { id: 'amigos', label: 'Amigos', hint: 'Red social.', shape: 'resource', category: 'entorno', defaults: { name: 'Amigos' } },
  { id: 'religion', label: 'Religión', hint: 'Comunidad de fe.', shape: 'resource', category: 'entorno', defaults: { name: 'Religión' } },
  { id: 'recreacion', label: 'Recreación', hint: 'Deporte, cultura.', shape: 'resource', category: 'entorno', defaults: { name: 'Recreación' } },
  {
    id: 'instituciones',
    label: 'Instituciones',
    hint: 'ICBF, comisaría, programas.',
    shape: 'resource',
    category: 'entorno',
    defaults: { name: 'Instituciones' },
  },
  { id: 'otro', label: 'Otra red', hint: 'Otro apoyo.', shape: 'resource', category: 'entorno', defaults: { name: 'Otra red' } },

  // Hogar
  {
    id: 'household',
    label: 'Hogar conviviente',
    hint: 'Óvalo punteado: rodea a quienes viven en casa del paciente.',
    shape: 'household',
    category: 'hogar',
    defaults: { name: 'Hogar', showAge: false, showBirthDate: false, showNameInside: false, cohabits: true },
  },
];

export function symbolsByCategory(category: SymbolCategory): SymbolDef[] {
  return ALL_SYMBOLS.filter((symbol) => symbol.category === category);
}
