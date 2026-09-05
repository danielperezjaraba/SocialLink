import { Position } from '@xyflow/react';

/**
 * Punto de agarre sobre el contorno de una figura. Las coordenadas van en
 * porcentaje de la caja del símbolo, de modo que sirven igual para un cuadrado
 * de 96 px que para el óvalo del hogar.
 */
export type Anchor = {
  id: string;
  x: number;
  y: number;
  position: Position;
};

/**
 * Dieciséis anclajes repartidos por todo el borde: las cuatro esquinas, los
 * puntos medios y dos intermedios por lado. Los ids `top`, `right`, `bottom` y
 * `left` se conservan para que los diagramas guardados antes sigan abriendo.
 */
export const SHAPE_ANCHORS: Anchor[] = [
  { id: 'c-tl', x: 0, y: 0, position: Position.Top },
  { id: 't-25', x: 25, y: 0, position: Position.Top },
  { id: 'top', x: 50, y: 0, position: Position.Top },
  { id: 't-75', x: 75, y: 0, position: Position.Top },
  { id: 'c-tr', x: 100, y: 0, position: Position.Top },
  { id: 'r-25', x: 100, y: 25, position: Position.Right },
  { id: 'right', x: 100, y: 50, position: Position.Right },
  { id: 'r-75', x: 100, y: 75, position: Position.Right },
  { id: 'c-br', x: 100, y: 100, position: Position.Bottom },
  { id: 'b-75', x: 75, y: 100, position: Position.Bottom },
  { id: 'bottom', x: 50, y: 100, position: Position.Bottom },
  { id: 'b-25', x: 25, y: 100, position: Position.Bottom },
  { id: 'c-bl', x: 0, y: 100, position: Position.Bottom },
  { id: 'l-75', x: 0, y: 75, position: Position.Left },
  { id: 'left', x: 0, y: 50, position: Position.Left },
  { id: 'l-25', x: 0, y: 25, position: Position.Left },
];
