import type { EntityShape } from '@/features/editor/types';
import { cn } from '@/lib/utils';

export const SHAPE_SIZE = 96;
export const HOUSEHOLD_WIDTH = 220;
export const HOUSEHOLD_HEIGHT = 130;

type ShapeStyle = {
  stroke: string;
  fill: string;
  strokeWidth: number;
  dash?: string;
};

/** Figuras que no muestran edad/nombre dentro por convención clínica. */
export function isAnnotationShape(shape: EntityShape): boolean {
  return (
    shape === 'household' ||
    shape === 'induced_abortion' ||
    shape === 'spontaneous_abortion' ||
    shape === 'stillborn'
  );
}

export function isPersonShape(shape: EntityShape): boolean {
  return !isAnnotationShape(shape) && shape !== 'resource';
}

export function EntityShapeSvg({
  shape,
  style,
  deceased = false,
  size = SHAPE_SIZE,
  className,
}: {
  shape: EntityShape;
  style: ShapeStyle;
  deceased?: boolean;
  /** Unidad lógica del viewBox (no píxeles en pantalla). */
  size?: number;
  className?: string;
}) {
  const { stroke, fill, strokeWidth, dash } = style;
  const common = { fill, stroke, strokeWidth, strokeDasharray: dash };
  const w = shape === 'household' ? HOUSEHOLD_WIDTH : size;
  const h = shape === 'household' ? HOUSEHOLD_HEIGHT : size;
  const cx = w / 2;
  const cy = h / 2;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid meet"
      className={cn('block h-full w-full max-h-full max-w-full', className)}
      aria-hidden
    >
      {shape === 'male' && <rect x={w * 0.1} y={h * 0.1} width={w * 0.8} height={h * 0.8} rx={4} {...common} />}
      {shape === 'female' && <circle cx={cx} cy={cy} r={w * 0.4} {...common} />}
      {shape === 'unknown' && (
        <polygon
          points={`${cx},${h * 0.08} ${w * 0.92},${cy} ${cx},${h * 0.92} ${w * 0.08},${cy}`}
          {...common}
        />
      )}
      {shape === 'pregnancy' && (
        <polygon points={`${cx},${h * 0.12} ${w * 0.9},${h * 0.88} ${w * 0.1},${h * 0.88}`} {...common} />
      )}
      {shape === 'resource' && (
        <rect x={w * 0.02} y={h * 0.25} width={w * 0.96} height={h * 0.5} rx={h * 0.25} {...common} />
      )}

      {shape === 'patient_male' && (
        <>
          <rect x={w * 0.08} y={h * 0.08} width={w * 0.84} height={h * 0.84} rx={4} {...common} />
          <rect
            x={w * 0.22}
            y={h * 0.22}
            width={w * 0.56}
            height={h * 0.56}
            rx={2}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </>
      )}

      {shape === 'patient_female' && (
        <>
          <circle cx={cx} cy={cy} r={w * 0.4} {...common} />
          <circle cx={cx} cy={cy} r={w * 0.22} fill="none" stroke={stroke} strokeWidth={strokeWidth} />
        </>
      )}

      {shape === 'stillborn' && (
        <>
          <rect x={w * 0.28} y={h * 0.28} width={w * 0.44} height={h * 0.44} rx={2} {...common} />
          <g stroke={stroke} strokeWidth={strokeWidth * 0.9} strokeLinecap="round">
            <line x1={w * 0.34} y1={h * 0.34} x2={w * 0.66} y2={h * 0.66} />
            <line x1={w * 0.66} y1={h * 0.34} x2={w * 0.34} y2={h * 0.66} />
          </g>
        </>
      )}

      {shape === 'induced_abortion' && (
        <>
          <line x1={cx} y1={h * 0.12} x2={cx} y2={h * 0.62} stroke={stroke} strokeWidth={strokeWidth} />
          <g stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round">
            <line x1={w * 0.35} y1={h * 0.62} x2={w * 0.65} y2={h * 0.88} />
            <line x1={w * 0.65} y1={h * 0.62} x2={w * 0.35} y2={h * 0.88} />
          </g>
        </>
      )}

      {shape === 'spontaneous_abortion' && (
        <circle cx={cx} cy={h * 0.55} r={w * 0.1} fill={stroke} stroke={stroke} strokeWidth={1} />
      )}

      {shape === 'disorder_untreated' && (
        <>
          <rect
            x={w * 0.15}
            y={h * 0.15}
            width={w * 0.7}
            height={h * 0.7}
            rx={3}
            fill="#ffffff"
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <rect x={w * 0.15} y={h * 0.15} width={w * 0.35} height={h * 0.7} fill={stroke} stroke="none" />
        </>
      )}

      {shape === 'disorder_treated' && (
        <>
          <rect x={w * 0.15} y={h * 0.15} width={w * 0.7} height={h * 0.7} rx={3} {...common} />
          <rect x={w * 0.58} y={h * 0.58} width={w * 0.22} height={h * 0.22} fill={stroke} stroke="none" />
        </>
      )}

      {shape === 'substance_use' && (
        <>
          <rect
            x={w * 0.15}
            y={h * 0.15}
            width={w * 0.7}
            height={h * 0.7}
            rx={3}
            fill="#ffffff"
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <rect x={w * 0.15} y={h * 0.15} width={w * 0.7} height={h * 0.35} fill={stroke} stroke="none" />
        </>
      )}

      {shape === 'substance_recovery' && (
        <>
          <rect x={w * 0.15} y={h * 0.15} width={w * 0.7} height={h * 0.7} rx={3} {...common} />
          <rect x={w * 0.58} y={h * 0.58} width={w * 0.22} height={h * 0.22} fill={stroke} stroke="none" />
        </>
      )}

      {shape === 'household' && (
        <ellipse
          cx={cx}
          cy={cy}
          rx={w * 0.46}
          ry={h * 0.42}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray="8 6"
        />
      )}

      {deceased && isPersonShape(shape) && (
        <g stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round">
          <line x1={w * 0.15} y1={h * 0.15} x2={w * 0.85} y2={h * 0.85} />
          <line x1={w * 0.85} y1={h * 0.15} x2={w * 0.15} y2={h * 0.85} />
        </g>
      )}
    </svg>
  );
}

export function shapeLabel(shape: EntityShape): string {
  const labels: Record<EntityShape, string> = {
    male: 'Cuadrado (hombre)',
    female: 'Círculo (mujer)',
    unknown: 'Rombo (sin dato)',
    pregnancy: 'Triángulo (embarazo)',
    resource: 'Red / recurso',
    patient_male: 'Paciente masculino',
    patient_female: 'Paciente femenino',
    stillborn: 'Nacido muerto',
    induced_abortion: 'Aborto inducido',
    spontaneous_abortion: 'Aborto espontáneo',
    disorder_untreated: 'Trastorno sin tratamiento',
    disorder_treated: 'Trastorno en tratamiento',
    substance_use: 'Consumo alcohol/drogas',
    substance_recovery: 'Recuperación consumo',
    household: 'Hogar conviviente',
  };
  return labels[shape];
}
