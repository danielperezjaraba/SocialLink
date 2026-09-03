export type PlanId = 'free' | 'premium' | 'institucional';

export type PlanDefinition = {
  id: PlanId;
  name: string;
  price: string;
  priceHint: string;
  summary: string;
  audience: string;
  features: string[];
  limits: {
    /** null significa sin límite. */
    maxProjects: number | null;
    allTemplates: boolean;
    exportPdf: boolean;
    exportImage: boolean;
    customization: boolean;
  };
};

export const PLANS: PlanDefinition[] = [
  {
    id: 'free',
    name: 'Plan gratuito',
    price: '$0',
    priceHint: 'para siempre',
    summary: 'Para conocer la plataforma y resolver un primer caso académico.',
    audience: 'Estudiantes que están empezando',
    features: [
      '2 proyectos guardados',
      'Plantillas básicas',
      'Genograma básico',
      'Ecomapa básico',
      'Exportación limitada a imagen',
    ],
    limits: {
      maxProjects: 2,
      allTemplates: false,
      exportPdf: false,
      exportImage: true,
      customization: false,
    },
  },
  {
    id: 'premium',
    name: 'Plan Premium',
    price: '$19.900',
    priceHint: 'por mes',
    summary: 'Para quien elabora diagnósticos de forma continua.',
    audience: 'Profesionales y docentes',
    features: [
      'Proyectos ilimitados',
      'Todas las plantillas',
      'Personalización de símbolos y colores',
      'Exportación en PDF e imagen',
      'Almacenamiento en la nube',
      'Herramientas avanzadas de análisis',
    ],
    limits: {
      maxProjects: null,
      allTemplates: true,
      exportPdf: true,
      exportImage: true,
      customization: true,
    },
  },
  {
    id: 'institucional',
    name: 'Plan Institucional',
    price: 'A convenir',
    priceHint: 'licencia anual',
    summary: 'Licencias por grupos, con acompañamiento y material docente.',
    audience: 'Universidades, entidades sociales y organizaciones',
    features: [
      'Todo lo del plan Premium',
      'Licencias por grupo o programa académico',
      'Espacios de trabajo compartidos entre docente y estudiantes',
      'Material de apoyo para asignaturas',
      'Soporte prioritario',
    ],
    limits: {
      maxProjects: null,
      allTemplates: true,
      exportPdf: true,
      exportImage: true,
      customization: true,
    },
  },
];

export function getPlan(id: PlanId): PlanDefinition {
  return PLANS.find((plan) => plan.id === id) ?? PLANS[0];
}
