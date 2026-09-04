import { makeEntity } from '@/features/editor/catalogs';
import type { Diagram, EntityNode, RelationEdge, RelationId, ToolKind } from '@/features/editor/types';
import { EMPTY_RELATION } from '@/features/editor/types';
import { createId } from '@/lib/utils';

export type Template = {
  id: string;
  name: string;
  kind: ToolKind;
  description: string;
  isPremium: boolean;
  build: () => Diagram;
};

function link(source: EntityNode, target: EntityNode, relation: RelationId, note = ''): RelationEdge {
  return {
    id: createId(),
    type: 'relation',
    source: source.id,
    target: target.id,
    data: { ...EMPTY_RELATION, relation, note },
  };
}

const TEMPLATES: Template[] = [
  {
    id: 'nuclear',
    name: 'Familia nuclear',
    kind: 'genograma',
    description: 'Pareja con dos hijos convivientes. El punto de partida más frecuente en clase.',
    isPremium: false,
    build: () => {
      const padre = makeEntity({ x: 240, y: 120 }, { shape: 'male', sex: 'M', name: 'Padre', age: '46', occupation: 'Conductor' });
      const madre = makeEntity({ x: 480, y: 120 }, { shape: 'female', sex: 'F', name: 'Madre', age: '43', occupation: 'Docente' });
      const hijo = makeEntity({ x: 200, y: 340 }, { shape: 'male', sex: 'M', name: 'Hijo', age: '17', occupation: 'Estudiante' });
      const hija = makeEntity({ x: 420, y: 340 }, { shape: 'female', sex: 'F', name: 'Hija', age: '12', occupation: 'Estudiante', isIndex: true });

      return {
        nodes: [padre, madre, hijo, hija],
        edges: [
          link(padre, madre, 'union'),
          link(padre, hijo, 'child'),
          link(madre, hijo, 'child'),
          link(padre, hija, 'child'),
          link(madre, hija, 'child'),
        ],
      };
    },
  },
  {
    id: 'monoparental',
    name: 'Hogar monoparental',
    kind: 'genograma',
    description: 'Jefatura femenina con dos hijos y un padre separado con contacto esporádico.',
    isPremium: false,
    build: () => {
      const madre = makeEntity({ x: 300, y: 130 }, { shape: 'female', sex: 'F', name: 'Madre', age: '38', occupation: 'Comerciante', isIndex: true });
      const padre = makeEntity({ x: 560, y: 130 }, { shape: 'male', sex: 'M', name: 'Padre', age: '41' });
      const hijo = makeEntity({ x: 240, y: 350 }, { shape: 'male', sex: 'M', name: 'Hijo mayor', age: '15' });
      const hija = makeEntity({ x: 440, y: 350 }, { shape: 'female', sex: 'F', name: 'Hija menor', age: '8' });

      return {
        nodes: [madre, padre, hijo, hija],
        edges: [
          link(madre, padre, 'separation'),
          link(madre, hijo, 'child'),
          link(madre, hija, 'child'),
          link(padre, hijo, 'weak', 'Contacto esporádico'),
          link(padre, hija, 'weak'),
        ],
      };
    },
  },
  {
    id: 'tres-generaciones',
    name: 'Tres generaciones',
    kind: 'genograma',
    description: 'Abuelos, padres e hijos en el mismo diagrama, con un vínculo conflictivo señalado.',
    isPremium: true,
    build: () => {
      const abuelo = makeEntity({ x: 240, y: 60 }, { shape: 'male', sex: 'M', name: 'Abuelo', age: '74', deceased: true });
      const abuela = makeEntity({ x: 460, y: 60 }, { shape: 'female', sex: 'F', name: 'Abuela', age: '71' });
      const padre = makeEntity({ x: 240, y: 270 }, { shape: 'male', sex: 'M', name: 'Padre', age: '48' });
      const madre = makeEntity({ x: 480, y: 270 }, { shape: 'female', sex: 'F', name: 'Madre', age: '45' });
      const hija = makeEntity({ x: 360, y: 470 }, { shape: 'female', sex: 'F', name: 'Hija', age: '19', isIndex: true });

      return {
        nodes: [abuelo, abuela, padre, madre, hija],
        edges: [
          link(abuelo, abuela, 'union'),
          link(abuelo, padre, 'child'),
          link(abuela, padre, 'child'),
          link(padre, madre, 'union'),
          link(padre, hija, 'child'),
          link(madre, hija, 'child'),
          link(abuela, hija, 'strong', 'Figura de cuidado principal'),
          link(padre, hija, 'conflictive', 'Tensión por la autonomía'),
        ],
      };
    },
  },
  {
    id: 'hogar-recompuesto',
    name: 'Hogar recompuesto',
    kind: 'familiograma',
    description: 'Composición con hijos de uniones anteriores y registro de quiénes conviven.',
    isPremium: false,
    build: () => {
      const madre = makeEntity({ x: 300, y: 140 }, { shape: 'female', sex: 'F', name: 'Madre', age: '39', kinship: 'Jefa de hogar', isIndex: true });
      const pareja = makeEntity({ x: 540, y: 140 }, { shape: 'male', sex: 'M', name: 'Compañero', age: '44', kinship: 'Compañero permanente' });
      const hijaA = makeEntity({ x: 220, y: 360 }, { shape: 'female', sex: 'F', name: 'Hija', age: '14', kinship: 'Hija de la madre' });
      const hijoB = makeEntity({ x: 460, y: 360 }, { shape: 'male', sex: 'M', name: 'Hijo', age: '9', kinship: 'Hijo del compañero', cohabits: false });

      return {
        nodes: [madre, pareja, hijaA, hijoB],
        edges: [
          link(madre, pareja, 'cohabitation'),
          link(madre, hijaA, 'child'),
          link(pareja, hijoB, 'child'),
          link(pareja, hijaA, 'weak'),
        ],
      };
    },
  },
  {
    id: 'red-basica',
    name: 'Red de apoyo básica',
    kind: 'ecomapa',
    description: 'Núcleo familiar con las cuatro redes que aparecen en casi todos los casos.',
    isPremium: false,
    build: () => {
      const centro = makeEntity({ x: 420, y: 280 }, { shape: 'unknown', name: 'Familia', isIndex: true });
      const salud = makeEntity({ x: 420, y: 40 }, { shape: 'resource', name: 'Salud' });
      const educacion = makeEntity({ x: 720, y: 180 }, { shape: 'resource', name: 'Educación' });
      const trabajo = makeEntity({ x: 700, y: 450 }, { shape: 'resource', name: 'Trabajo' });
      const extensa = makeEntity({ x: 160, y: 420 }, { shape: 'resource', name: 'Familia extensa' });

      return {
        nodes: [centro, salud, educacion, trabajo, extensa],
        edges: [
          link(centro, salud, 'weak', 'Acceso intermitente'),
          link(centro, educacion, 'strong'),
          link(centro, trabajo, 'stressful', 'Jornadas extensas'),
          link(centro, extensa, 'strong', 'Apoyo en el cuidado'),
        ],
      };
    },
  },
  {
    id: 'red-institucional',
    name: 'Red institucional ampliada',
    kind: 'ecomapa',
    description: 'Ecomapa completo con entorno comunitario e institucional para casos de intervención.',
    isPremium: true,
    build: () => {
      const centro = makeEntity({ x: 440, y: 300 }, { shape: 'unknown', name: 'Familia', isIndex: true });
      const salud = makeEntity({ x: 440, y: 40 }, { shape: 'resource', name: 'Salud' });
      const educacion = makeEntity({ x: 760, y: 150 }, { shape: 'resource', name: 'Educación' });
      const trabajo = makeEntity({ x: 800, y: 400 }, { shape: 'resource', name: 'Trabajo' });
      const instituciones = makeEntity({ x: 560, y: 570 }, { shape: 'resource', name: 'Instituciones' });
      const religion = makeEntity({ x: 250, y: 560 }, { shape: 'resource', name: 'Religión' });
      const amigos = makeEntity({ x: 90, y: 340 }, { shape: 'resource', name: 'Amigos' });
      const extensa = makeEntity({ x: 130, y: 110 }, { shape: 'resource', name: 'Familia extensa' });

      return {
        nodes: [centro, salud, educacion, trabajo, instituciones, religion, amigos, extensa],
        edges: [
          link(centro, salud, 'weak'),
          link(centro, educacion, 'strong'),
          link(centro, trabajo, 'stressful'),
          link(centro, instituciones, 'conflictive', 'Trámites sin resolver'),
          link(centro, religion, 'strong'),
          link(centro, amigos, 'weak'),
          link(centro, extensa, 'none', 'Sin contacto desde el traslado'),
        ],
      };
    },
  },
];

export function listTemplates(): Template[] {
  return TEMPLATES;
}

export function listTemplatesByKind(kind: ToolKind): Template[] {
  return TEMPLATES.filter((template) => template.kind === kind);
}

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((template) => template.id === id);
}
