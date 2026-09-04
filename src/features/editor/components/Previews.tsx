import type { EntityShape, RelationDef } from '@/features/editor/types';
import { EntityShapeSvg } from '@/features/editor/shapes';
import { cn } from '@/lib/utils';

const PREVIEW_BOX = 'h-8 w-8';
const PREVIEW_HOUSEHOLD = 'h-9 w-full max-w-[4.5rem]';

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
  const isHousehold = shape === 'household';
  const stroke = isHousehold ? '#64748b' : isResource ? '#d16a1f' : '#334155';
  const fill = isHousehold ? 'transparent' : isResource ? '#fdeedd' : '#ffffff';

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden',
        isHousehold ? PREVIEW_HOUSEHOLD : PREVIEW_BOX,
        className,
      )}
    >
      <EntityShapeSvg
        shape={shape}
        deceased={deceased}
        style={{
          stroke,
          fill,
          strokeWidth: isHousehold ? 2.5 : 3,
          dash: isHousehold ? '6 4' : undefined,
        }}
      />
    </div>
  );
}

/** Muestra en miniatura el trazo exacto con el que se dibujará el vínculo. */
export function RelationPreview({ relation }: { relation: RelationDef }) {
  const { color, stroke, width, slashes, arrow, twinBar } = relation;
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

      {twinBar === 'identical' ? (
        <>
          <line x1={18} y1={18} x2={18} y2={8} stroke={color} strokeWidth={width} />
          <line x1={42} y1={18} x2={42} y2={8} stroke={color} strokeWidth={width} />
          <line x1={18} y1={8} x2={42} y2={8} stroke={color} strokeWidth={width} />
        </>
      ) : twinBar === 'fraternal' ? (
        <>
          <line x1={30} y1={6} x2={18} y2={18} stroke={color} strokeWidth={width} />
          <line x1={30} y1={6} x2={42} y2={18} stroke={color} strokeWidth={width} />
        </>
      ) : stroke === 'zigzag' ? (
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
