import { useStore, type ConnectionLineComponentProps, type InternalNode } from '@xyflow/react';
import { resolveDropTarget, type FlowPoint } from '@/features/editor/edgeGeometry';
import { orthogonalPath } from '@/features/editor/orthogonalPath';
import type { DiagramNode, RelationEdge } from '@/features/editor/types';

function resolvePreviewEnd(
  clientX: number,
  clientY: number,
  from: FlowPoint,
  screenToFlowPosition: (point: { x: number; y: number }) => FlowPoint,
  flowToScreenPosition: (point: FlowPoint) => { x: number; y: number },
  nodes: DiagramNode[],
  edges: RelationEdge[],
  nodeLookup: Map<string, InternalNode>,
  zoom: number,
): FlowPoint {
  return resolveDropTarget(clientX, clientY, {
    nodes,
    edges,
    nodeLookup,
    screenToFlowPosition,
    flowToScreenPosition,
    zoom,
    fromPoint: from,
  }).point;
}

/** Vista previa ortogonal al tirar una línea desde una figura. */
export function SnappedConnectionLine({
  fromX,
  fromY,
  pointer,
  connectionLineStyle,
}: ConnectionLineComponentProps) {
  const nodes = useStore((state) => state.nodes) as DiagramNode[];
  const edges = useStore((state) => state.edges) as RelationEdge[];
  const nodeLookup = useStore((state) => state.nodeLookup);
  const transform = useStore((state) => state.transform);
  const zoom = transform[2];
  const from = { x: fromX, y: fromY };

  const screenToFlowPosition = (point: { x: number; y: number }) => ({
    x: (point.x - transform[0]) / zoom,
    y: (point.y - transform[1]) / zoom,
  });
  const flowToScreenPosition = (point: FlowPoint) => ({
    x: point.x * zoom + transform[0],
    y: point.y * zoom + transform[1],
  });

  const end = resolvePreviewEnd(
    pointer.x,
    pointer.y,
    from,
    screenToFlowPosition,
    flowToScreenPosition,
    nodes,
    edges,
    nodeLookup,
    zoom,
  );

  return (
    <g>
      <path
        d={orthogonalPath(from, end)}
        fill="none"
        stroke="#334155"
        strokeWidth={2}
        strokeDasharray="7 5"
        strokeLinecap="square"
        strokeLinejoin="round"
        style={connectionLineStyle}
      />
      <circle cx={end.x} cy={end.y} r={4} fill="#178578" stroke="#fff" strokeWidth={1.5} />
    </g>
  );
}
