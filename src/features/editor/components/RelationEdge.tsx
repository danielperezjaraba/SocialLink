import { memo, useRef } from 'react';
import { EdgeLabelRenderer, useReactFlow, type EdgeProps } from '@xyflow/react';
import { getRelation } from '@/features/editor/catalogs/relations';
import { clampScale, MAX_LINE_SCALE, MIN_LINE_SCALE } from '@/features/editor/entityDimensions';
import { BRANCH_DRAG } from '@/features/editor/edgeGeometry';
import { useEditorActions } from '@/features/editor/EditorActionsContext';
import { getRelationColor } from '@/features/editor/entityStyle';
import {
  doubleOrthogonalPath,
  orthogonalMidpoint,
  orthogonalPath,
  orthogonalPoints,
  projectPointOnOrthogonal,
} from '@/features/editor/orthogonalPath';
import type { RelationEdge as RelationEdgeType } from '@/features/editor/types';

type Point = { x: number; y: number };

function unitVectors(a: Point, b: Point) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  return {
    length,
    dir: { x: dx / length, y: dy / length },
    perp: { x: -dy / length, y: dx / length },
  };
}

function straight(a: Point, b: Point): string {
  return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
}

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

function slashesOnOrthogonal(from: Point, to: Point, count: 1 | 2): string[] {
  const [start, corner, end] = orthogonalPoints(from, to);
  const leg1 = Math.hypot(corner.x - start.x, corner.y - start.y);
  const leg2 = Math.hypot(end.x - corner.x, end.y - corner.y);
  const [a, b] = leg1 >= leg2 ? [start, corner] : [corner, end];
  const { dir, perp } = unitVectors(a, b);
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const half = 10;
  const offsets = count === 1 ? [0] : [-7, 7];

  return offsets.map((shift) => {
    const center = { x: mid.x + dir.x * shift, y: mid.y + dir.y * shift };
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
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  selected,
}: EdgeProps<RelationEdgeType>) {
  const { screenToFlowPosition, getNode } = useReactFlow();
  const { onBeginLineConnection } = useEditorActions();
  const relation = getRelation(data?.relation ?? 'union');
  const color = getRelationColor(data?.strokeColor, relation.color);
  const lineScale = clampScale(data?.lineScale ?? 1, MIN_LINE_SCALE, MAX_LINE_SCALE);

  const sourceNode = getNode(source);
  const targetNode = getNode(target);
  const sourcePoint =
    sourceNode?.type === 'anchor'
      ? { x: sourceNode.position.x, y: sourceNode.position.y }
      : { x: sourceX, y: sourceY };
  const targetPoint =
    targetNode?.type === 'anchor'
      ? { x: targetNode.position.x, y: targetNode.position.y }
      : { x: targetX, y: targetY };

  const labelPoint = orthogonalMidpoint(sourcePoint, targetPoint);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const branching = useRef(false);

  const width = (selected ? relation.width + 1.5 : relation.width) * lineScale;
  const markerId = `arrow-${id}`;
  const dash =
    relation.stroke === 'dashed' ? '9 6' : relation.stroke === 'dotted' ? '1 6' : undefined;

  const paths =
    relation.stroke === 'zigzag'
      ? [zigzag(sourcePoint, targetPoint)]
      : relation.stroke === 'double'
        ? doubleOrthogonalPath(sourcePoint, targetPoint)
        : [orthogonalPath(sourcePoint, targetPoint)];

  const hitPath = orthogonalPath(sourcePoint, targetPoint);

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
          strokeLinecap={relation.stroke === 'dotted' ? 'round' : 'square'}
          strokeLinejoin="round"
          markerEnd={relation.arrow && index === paths.length - 1 ? `url(#${markerId})` : undefined}
        />
      ))}

      {relation.twinBar &&
        twinConnector(sourcePoint, targetPoint, relation.twinBar).map((d, index) => (
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
        slashesOnOrthogonal(sourcePoint, targetPoint, relation.slashes).map((d, index) => (
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
          d={hitPath}
          fill="none"
          stroke={color}
          strokeWidth={width + 10}
          strokeOpacity={0.15}
          strokeLinecap="round"
        />
      )}

      <path
        d={hitPath}
        fill="none"
        stroke="transparent"
        strokeWidth={22}
        style={{ cursor: 'crosshair' }}
        onPointerDown={(event) => {
          dragStart.current = { x: event.clientX, y: event.clientY };
          branching.current = false;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const start = dragStart.current;
          if (!start || branching.current) return;

          const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y);
          if (moved < BRANCH_DRAG) return;

          branching.current = true;
          const flow = screenToFlowPosition({ x: event.clientX, y: event.clientY });
          const point = projectPointOnOrthogonal(flow, sourcePoint, targetPoint);
          onBeginLineConnection(point, id, event.clientX, event.clientY);
          dragStart.current = null;
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerUp={() => {
          dragStart.current = null;
          branching.current = false;
        }}
      />

      {data?.note && (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${labelPoint.x}px, ${labelPoint.y}px)`,
            }}
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
