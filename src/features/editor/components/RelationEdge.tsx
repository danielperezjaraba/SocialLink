import { memo } from 'react';
import { EdgeLabelRenderer, getStraightPath, type EdgeProps } from '@xyflow/react';
import { getRelation } from '@/features/editor/catalogs/relations';
import { getRelationColor } from '@/features/editor/entityStyle';
import type { RelationEdge as RelationEdgeType } from '@/features/editor/types';

type Point = { x: number; y: number };

function unitVectors(a: Point, b: Point) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  return {
    length,
    dir: { x: dx / length, y: dy / length },
    // Perpendicular, para desplazar líneas paralelas y dibujar las barras
    perp: { x: -dy / length, y: dx / length },
  };
}

function straight(a: Point, b: Point): string {
  return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
}

function offsetLine(a: Point, b: Point, distance: number): string {
  const { perp } = unitVectors(a, b);
  return straight(
    { x: a.x + perp.x * distance, y: a.y + perp.y * distance },
    { x: b.x + perp.x * distance, y: b.y + perp.y * distance },
  );
}

/** Trazo en zigzag con el que se representa el vínculo conflictivo. */
function zigzag(a: Point, b: Point, amplitude = 6, segment = 14): string {
  const { length, dir, perp } = unitVectors(a, b);
  const steps = Math.max(4, Math.round(length / segment));
  let path = `M ${a.x} ${a.y}`;

  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    const side = i % 2 === 0 ? 1 : -1;
    const x = a.x + dir.x * length * t + perp.x * amplitude * side;
    const y = a.y + dir.y * length * t + perp.y * amplitude * side;
    path += ` L ${x} ${y}`;
  }

  return `${path} L ${b.x} ${b.y}`;
}

/** Barras que cruzan la línea: una para separación, dos para divorcio. */
function slashes(a: Point, b: Point, count: 1 | 2): string[] {
  const { dir, perp } = unitVectors(a, b);
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const half = 10;
  const offsets = count === 1 ? [0] : [-7, 7];

  return offsets.map((shift) => {
    const center = { x: mid.x + dir.x * shift, y: mid.y + dir.y * shift };
    // Dirección a 45 grados respecto de la línea principal
    const sx = (perp.x + dir.x) / Math.SQRT2;
    const sy = (perp.y + dir.y) / Math.SQRT2;
    return straight(
      { x: center.x - sx * half, y: center.y - sy * half },
      { x: center.x + sx * half, y: center.y + sy * half },
    );
  });
}

function twinConnector(a: Point, b: Point, kind: 'identical' | 'fraternal'): string[] {
  const barY = Math.min(a.y, b.y) - 28;
  const midX = (a.x + b.x) / 2;

  if (kind === 'identical') {
    return [
      straight({ x: a.x, y: barY }, { x: b.x, y: barY }),
      straight({ x: a.x, y: a.y }, { x: a.x, y: barY }),
      straight({ x: b.x, y: b.y }, { x: b.x, y: barY }),
    ];
  }

  return [straight({ x: midX, y: barY }, a), straight({ x: midX, y: barY }, b)];
}

function RelationEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  selected,
}: EdgeProps<RelationEdgeType>) {
  const relation = getRelation(data?.relation ?? 'union');
  const color = getRelationColor(data?.strokeColor, relation.color);
  const source = { x: sourceX, y: sourceY };
  const target = { x: targetX, y: targetY };
  const [, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });

  const width = selected ? relation.width + 1.5 : relation.width;
  const markerId = `arrow-${id}`;

  const dash =
    relation.stroke === 'dashed' ? '9 6' : relation.stroke === 'dotted' ? '1 6' : undefined;

  const paths =
    relation.stroke === 'zigzag'
      ? [zigzag(source, target)]
      : relation.stroke === 'double'
        ? [offsetLine(source, target, -3), offsetLine(source, target, 3)]
        : [straight(source, target)];

  return (
    <>
      {relation.arrow && (
        <defs>
          <marker
            id={markerId}
            markerWidth="12"
            markerHeight="12"
            refX="9"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
          </marker>
        </defs>
      )}

      {paths.map((d, index) => (
        <path
          key={index}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={width}
          strokeDasharray={dash}
          strokeLinecap={relation.stroke === 'dotted' ? 'round' : 'butt'}
          markerEnd={relation.arrow && index === paths.length - 1 ? `url(#${markerId})` : undefined}
        />
      ))}

      {relation.twinBar &&
        twinConnector(source, target, relation.twinBar).map((d, index) => (
          <path
            key={`twin-${index}`}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={width}
            strokeLinecap="round"
          />
        ))}

      {relation.slashes &&
        slashes(source, target, relation.slashes).map((d, index) => (
          <path
            key={`slash-${index}`}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={width}
            strokeLinecap="round"
          />
        ))}

      {selected && (
        <path
          d={paths[0]}
          fill="none"
          stroke={color}
          strokeWidth={width + 10}
          strokeOpacity={0.15}
          strokeLinecap="round"
        />
      )}

      {/* Franja transparente que amplía el área de clic sobre la línea */}
      <path d={paths[0]} fill="none" stroke="transparent" strokeWidth={22} />

      {data?.note && (
        <EdgeLabelRenderer>
          <div
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
            className="pointer-events-none absolute rounded-md border border-slate-200 bg-white/95 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 shadow-sm"
          >
            {data.note}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const RelationEdgeView = memo(RelationEdgeComponent);
