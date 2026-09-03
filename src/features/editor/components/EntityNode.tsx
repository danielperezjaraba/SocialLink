import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { EntityNode as EntityNodeType } from '@/features/editor/types';
import { cn } from '@/lib/utils';

const SIZE = 96;

const HANDLE_POSITIONS = [
  { id: 'top', position: Position.Top },
  { id: 'right', position: Position.Right },
  { id: 'bottom', position: Position.Bottom },
  { id: 'left', position: Position.Left },
];

/**
 * Dibuja el símbolo según el lenguaje gráfico del Trabajo Social: cuadrado para
 * hombre, círculo para mujer, rombo cuando el sexo es desconocido, triángulo
 * para embarazo y una cápsula para las redes del entorno en el ecomapa.
 */
function Shape({ node }: { node: EntityNodeType['data'] }) {
  const isResource = node.shape === 'resource';
  const stroke = isResource ? '#d16a1f' : node.isIndex ? '#178578' : '#334155';
  const fill = isResource ? '#fdeedd' : node.isIndex ? '#eefbf8' : '#ffffff';
  const strokeWidth = node.isIndex || isResource ? 3 : 2.5;

  const common = { fill, stroke, strokeWidth };

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} className="overflow-visible">
      {node.shape === 'male' && <rect x={10} y={10} width={76} height={76} rx={4} {...common} />}
      {node.shape === 'female' && <circle cx={48} cy={48} r={38} {...common} />}
      {node.shape === 'unknown' && <polygon points="48,8 88,48 48,88 8,48" {...common} />}
      {node.shape === 'pregnancy' && <polygon points="48,12 86,84 10,84" {...common} />}
      {isResource && <rect x={2} y={24} width={92} height={48} rx={24} {...common} />}

      {node.age && !isResource && (
        <text
          x={48}
          y={48}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-slate-600 text-[20px] font-semibold"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {node.age}
        </text>
      )}

      {node.deceased && (
        <g stroke={stroke} strokeWidth={2.5} strokeLinecap="round">
          <line x1={14} y1={14} x2={82} y2={82} />
          <line x1={82} y1={14} x2={14} y2={82} />
        </g>
      )}
    </svg>
  );
}

function EntityNodeComponent({ data, selected }: NodeProps<EntityNodeType>) {
  const subtitle = data.kinship || data.occupation;

  return (
    <div
      className={cn(
        'group flex w-32 flex-col items-center rounded-xl px-1 py-1 transition-shadow',
        selected && 'ring-2 ring-brand-500 ring-offset-2 ring-offset-slate-50',
      )}
    >
      {HANDLE_POSITIONS.map(({ id, position }) => (
        <Handle
          key={id}
          id={id}
          type="source"
          position={position}
          className="opacity-0! transition-opacity group-hover:opacity-100!"
        />
      ))}

      <Shape node={data} />

      <p className="mt-1 max-w-full truncate text-center text-[13px] font-semibold text-slate-800">
        {data.name || 'Sin nombre'}
      </p>
      {subtitle && (
        <p className="max-w-full truncate text-center text-[11px] text-slate-500">{subtitle}</p>
      )}
      {data.shape !== 'resource' && !data.cohabits && (
        <p className="text-[10px] font-medium text-accent-600">No convive</p>
      )}
    </div>
  );
}

export const EntityNodeView = memo(EntityNodeComponent);
