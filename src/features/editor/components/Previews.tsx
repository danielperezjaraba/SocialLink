import type { EntityShape, RelationDef } from '@/features/editor/types';

export function SymbolPreview({
  shape,
  deceased = false,
  className,
}: {
  shape: EntityShape;
  deceased?: boolean;
  className?: string;
}) {
  const isResource = shape === 'resource';
  const stroke = isResource ? '#d16a1f' : '#334155';
  const fill = isResource ? '#fdeedd' : '#ffffff';
  const common = { fill, stroke, strokeWidth: 4 };

  return (
    <svg viewBox="0 0 96 96" className={className} aria-hidden>
      {shape === 'male' && <rect x={12} y={12} width={72} height={72} rx={4} {...common} />}
      {shape === 'female' && <circle cx={48} cy={48} r={36} {...common} />}
      {shape === 'unknown' && <polygon points="48,10 86,48 48,86 10,48" {...common} />}
      {shape === 'pregnancy' && <polygon points="48,14 84,82 12,82" {...common} />}
      {isResource && <rect x={4} y={26} width={88} height={44} rx={22} {...common} />}
      {deceased && (
        <g stroke={stroke} strokeWidth={4} strokeLinecap="round">
          <line x1={16} y1={16} x2={80} y2={80} />
          <line x1={80} y1={16} x2={16} y2={80} />
        </g>
      )}
    </svg>
  );
}

/** Muestra en miniatura el trazo exacto con el que se dibujará el vínculo. */
export function RelationPreview({ relation }: { relation: RelationDef }) {
  const { color, stroke, width, slashes, arrow } = relation;
  const markerId = `preview-arrow-${relation.id}`;
  const dash = stroke === 'dashed' ? '7 5' : stroke === 'dotted' ? '1 5' : undefined;

  const zigzagPoints = Array.from({ length: 9 }, (_, index) => {
    const x = 4 + index * 6;
    const y = index % 2 === 0 ? 8 : 16;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 60 24" className="h-5 w-14 shrink-0" aria-hidden>
      {arrow && (
        <defs>
          <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M 0 0 L 8 4 L 0 8 z" fill={color} />
          </marker>
        </defs>
      )}

      {stroke === 'zigzag' ? (
        <polyline points={zigzagPoints} fill="none" stroke={color} strokeWidth={width} />
      ) : stroke === 'double' ? (
        <>
          <line x1={4} y1={9} x2={56} y2={9} stroke={color} strokeWidth={2} />
          <line x1={4} y1={15} x2={56} y2={15} stroke={color} strokeWidth={2} />
        </>
      ) : (
        <line
          x1={4}
          y1={12}
          x2={arrow ? 50 : 56}
          y2={12}
          stroke={color}
          strokeWidth={width}
          strokeDasharray={dash}
          strokeLinecap={stroke === 'dotted' ? 'round' : 'butt'}
          markerEnd={arrow ? `url(#${markerId})` : undefined}
        />
      )}

      {slashes === 1 && <line x1={26} y1={4} x2={34} y2={20} stroke={color} strokeWidth={width} />}
      {slashes === 2 && (
        <>
          <line x1={22} y1={4} x2={30} y2={20} stroke={color} strokeWidth={width} />
          <line x1={30} y1={4} x2={38} y2={20} stroke={color} strokeWidth={width} />
        </>
      )}
    </svg>
  );
}
