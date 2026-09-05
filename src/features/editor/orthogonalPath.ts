import { GRID_GAP, snapToGrid, type FlowPoint } from '@/features/editor/edgeGeometry';

/** Tres puntos del trazo ortogonal: origen → esquina → destino. */
export function orthogonalPoints(from: FlowPoint, to: FlowPoint): [FlowPoint, FlowPoint, FlowPoint] {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  if (dx >= dy) {
    return [from, { x: to.x, y: from.y }, to];
  }
  return [from, { x: from.x, y: to.y }, to];
}

export function orthogonalPath(from: FlowPoint, to: FlowPoint): string {
  const [start, corner, end] = orthogonalPoints(from, to);
  return `M ${start.x} ${start.y} L ${corner.x} ${corner.y} L ${end.x} ${end.y}`;
}

/** Ajusta el extremo al grid y, si casi alinea un eje, fuerza línea recta horizontal o vertical. */
export function orthogonalAlignEnd(from: FlowPoint, to: FlowPoint, gap = GRID_GAP): FlowPoint {
  let end = snapToGrid(to);
  const fromSnapped = snapToGrid(from);
  const dx = Math.abs(end.x - from.x);
  const dy = Math.abs(end.y - from.y);

  if (dy <= gap * 0.55) {
    end = { x: end.x, y: fromSnapped.y };
  } else if (dx <= gap * 0.55) {
    end = { x: fromSnapped.x, y: end.y };
  }

  return end;
}

function distToSegment(point: FlowPoint, start: FlowPoint, end: FlowPoint): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(point.x - start.x, point.y - start.y);

  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / len2));
  const px = start.x + t * dx;
  const py = start.y + t * dy;
  return Math.hypot(point.x - px, point.y - py);
}

/** Punto más cercano sobre el trazo ortogonal entre dos extremos. */
export function projectPointOnOrthogonal(point: FlowPoint, from: FlowPoint, to: FlowPoint): FlowPoint {
  const [start, corner, end] = orthogonalPoints(from, to);
  const d1 = distToSegment(point, start, corner);
  const d2 = distToSegment(point, corner, end);

  if (d1 <= d2) {
    const dx = corner.x - start.x;
    const dy = corner.y - start.y;
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) return start;
    const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / len2));
    return { x: start.x + t * dx, y: start.y + t * dy };
  }

  const dx = end.x - corner.x;
  const dy = end.y - corner.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return corner;
  const t = Math.max(0, Math.min(1, ((point.x - corner.x) * dx + (point.y - corner.y) * dy) / len2));
  return { x: corner.x + t * dx, y: corner.y + t * dy };
}

/** Punto medio del trazo ortogonal (para etiquetas). */
export function orthogonalMidpoint(from: FlowPoint, to: FlowPoint): FlowPoint {
  const [start, corner, end] = orthogonalPoints(from, to);
  const leg1 = Math.hypot(corner.x - start.x, corner.y - start.y);
  const leg2 = Math.hypot(end.x - corner.x, end.y - corner.y);
  if (leg1 >= leg2) {
    return { x: (start.x + corner.x) / 2, y: (start.y + corner.y) / 2 };
  }
  return { x: (corner.x + end.x) / 2, y: (corner.y + end.y) / 2 };
}

function offsetPoint(refA: FlowPoint, refB: FlowPoint, point: FlowPoint, distance: number): FlowPoint {
  const dx = refB.x - refA.x;
  const dy = refB.y - refA.y;
  const len = Math.hypot(dx, dy) || 1;
  const perp = { x: -dy / len, y: dx / len };
  return { x: point.x + perp.x * distance, y: point.y + perp.y * distance };
}

/** Dos trazos ortogonales paralelos (relación estrecha). */
export function doubleOrthogonalPath(from: FlowPoint, to: FlowPoint, gap = 3): [string, string] {
  const [start, corner, end] = orthogonalPoints(from, to);
  const a1 = offsetPoint(start, corner, start, -gap);
  const c1 = offsetPoint(start, corner, corner, -gap);
  const b1 = offsetPoint(corner, end, end, -gap);
  const a2 = offsetPoint(start, corner, start, gap);
  const c2 = offsetPoint(start, corner, corner, gap);
  const b2 = offsetPoint(corner, end, end, gap);
  return [
    `M ${a1.x} ${a1.y} L ${c1.x} ${c1.y} L ${b1.x} ${b1.y}`,
    `M ${a2.x} ${a2.y} L ${c2.x} ${c2.y} L ${b2.x} ${b2.y}`,
  ];
}
