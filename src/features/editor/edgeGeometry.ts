import type { InternalNode } from '@xyflow/react';
import { projectPointOnOrthogonal, orthogonalAlignEnd } from '@/features/editor/orthogonalPath';
import type { DiagramNode, RelationEdge } from '@/features/editor/types';

export type FlowPoint = { x: number; y: number };

/** Misma separación que el fondo de puntos del lienzo. */
export const GRID_GAP = 20;

/** Magnetismo a figuras: solo si el cursor está muy cerca del punto de agarre. */
export const HANDLE_SNAP_PX = 10;

/** Distancia en pantalla para “enganchar” otra línea al dibujar. */
export const EDGE_SNAP_PX = 14;

/** Distancia mínima en px antes de considerar que el usuario arrastra desde la línea. */
export const BRANCH_DRAG = 6;

export function snapToGrid(point: FlowPoint, gap = GRID_GAP): FlowPoint {
  return {
    x: Math.round(point.x / gap) * gap,
    y: Math.round(point.y / gap) * gap,
  };
}

/** Proyecta un punto sobre el segmento de la línea (clamp 0–1). */
export function projectPointOnSegment(point: FlowPoint, start: FlowPoint, end: FlowPoint): FlowPoint {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return start;

  const t = Math.max(
    0,
    Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / len2),
  );
  return { x: start.x + t * dx, y: start.y + t * dy };
}

export function getConnectionPoint(
  nodeId: string,
  handleId: string | null | undefined,
  nodeLookup: Map<string, InternalNode>,
): FlowPoint | null {
  const node = nodeLookup.get(nodeId);
  if (!node) return null;

  if (node.type === 'anchor') {
    return { x: node.position.x, y: node.position.y };
  }

  const bounds = [
    ...(node.internals.handleBounds?.source ?? []),
    ...(node.internals.handleBounds?.target ?? []),
  ];
  const handle = handleId ? bounds.find((item) => item.id === handleId) : bounds[0];

  if (!handle) {
    const width = node.measured.width ?? 0;
    const height = node.measured.height ?? 0;
    return {
      x: node.internals.positionAbsolute.x + width / 2,
      y: node.internals.positionAbsolute.y + height / 2,
    };
  }

  return {
    x: node.internals.positionAbsolute.x + handle.x + handle.width / 2,
    y: node.internals.positionAbsolute.y + handle.y + handle.height / 2,
  };
}

export function getEdgeEndpoints(
  edge: RelationEdge,
  nodeLookup: Map<string, InternalNode>,
): [FlowPoint, FlowPoint] | null {
  const start = getConnectionPoint(edge.source, edge.sourceHandle, nodeLookup);
  const end = getConnectionPoint(edge.target, edge.targetHandle, nodeLookup);
  if (!start || !end) return null;
  return [start, end];
}

export function pickEdgePointAt(
  flowPoint: FlowPoint,
  edges: RelationEdge[],
  nodeLookup: Map<string, InternalNode>,
  maxFlowDistance: number,
  excludeEdgeId?: string,
): { edgeId: string; point: FlowPoint } | null {
  let best: { edgeId: string; point: FlowPoint; dist: number } | null = null;

  for (const edge of edges) {
    if (edge.id === excludeEdgeId) continue;
    const segment = getEdgeEndpoints(edge, nodeLookup);
    if (!segment) continue;

    const [start, end] = segment;
    const projected = projectPointOnOrthogonal(flowPoint, start, end);
    const dist = Math.hypot(flowPoint.x - projected.x, flowPoint.y - projected.y);

    if (dist <= maxFlowDistance && (!best || dist < best.dist)) {
      best = { edgeId: edge.id, point: projected, dist };
    }
  }

  return best ? { edgeId: best.edgeId, point: best.point } : null;
}

export function pickEntityHandleAt(
  clientX: number,
  clientY: number,
  nodes: DiagramNode[],
  nodeLookup: Map<string, InternalNode>,
  flowToScreenPosition: (point: FlowPoint) => { x: number; y: number },
  maxScreenPx = HANDLE_SNAP_PX,
): { nodeId: string; handleId: string | null; point: FlowPoint } | null {
  let best: {
    nodeId: string;
    handleId: string | null;
    point: FlowPoint;
    dist: number;
  } | null = null;

  for (const node of nodes) {
    if (node.type !== 'entity') continue;

    const internal = nodeLookup.get(node.id);
    if (!internal) continue;

    const bounds = [
      ...(internal.internals.handleBounds?.source ?? []),
      ...(internal.internals.handleBounds?.target ?? []),
    ];

    for (const handle of bounds) {
      const point = {
        x: internal.internals.positionAbsolute.x + handle.x + handle.width / 2,
        y: internal.internals.positionAbsolute.y + handle.y + handle.height / 2,
      };
      const screen = flowToScreenPosition(point);
      const dist = Math.hypot(clientX - screen.x, clientY - screen.y);

      if (dist <= maxScreenPx && (!best || dist < best.dist)) {
        best = { nodeId: node.id, handleId: handle.id ?? null, point, dist };
      }
    }
  }

  return best ? { nodeId: best.nodeId, handleId: best.handleId, point: best.point } : null;
}

export type DropTarget =
  | { kind: 'grid'; point: FlowPoint }
  | { kind: 'edge'; point: FlowPoint; edgeId: string }
  | { kind: 'handle'; point: FlowPoint; nodeId: string; handleId: string | null };

export function resolveDropTarget(
  clientX: number,
  clientY: number,
  options: {
    nodes: DiagramNode[];
    edges: RelationEdge[];
    nodeLookup: Map<string, InternalNode>;
    screenToFlowPosition: (point: { x: number; y: number }) => FlowPoint;
    flowToScreenPosition: (point: FlowPoint) => { x: number; y: number };
    zoom: number;
    excludeEdgeId?: string;
    fromPoint?: FlowPoint;
  },
): DropTarget {
  const flow = options.screenToFlowPosition({ x: clientX, y: clientY });

  const edgeHit = pickEdgePointAt(
    flow,
    options.edges,
    options.nodeLookup,
    EDGE_SNAP_PX / options.zoom,
    options.excludeEdgeId,
  );
  if (edgeHit) {
    return { kind: 'edge', point: edgeHit.point, edgeId: edgeHit.edgeId };
  }

  const handle = pickEntityHandleAt(
    clientX,
    clientY,
    options.nodes,
    options.nodeLookup,
    options.flowToScreenPosition,
  );
  if (handle) {
    return {
      kind: 'handle',
      point: handle.point,
      nodeId: handle.nodeId,
      handleId: handle.handleId,
    };
  }

  const gridPoint = options.fromPoint
    ? orthogonalAlignEnd(options.fromPoint, flow)
    : snapToGrid(flow);

  return { kind: 'grid', point: gridPoint };
}
