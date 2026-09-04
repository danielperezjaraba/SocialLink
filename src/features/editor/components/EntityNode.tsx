import { memo, useCallback, useState, type KeyboardEvent } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useEditorActions } from '@/features/editor/EditorActionsContext';
import { formatBirthDate, getEntityColors, patchFromAgeInput } from '@/features/editor/entityStyle';
import {
  EntityShapeSvg,
  isAnnotationShape,
  isPersonShape,
  SHAPE_SIZE,
} from '@/features/editor/shapes';
import type { EntityNode as EntityNodeType } from '@/features/editor/types';
import { cn } from '@/lib/utils';

const HANDLE_POSITIONS = [
  { id: 'top', position: Position.Top },
  { id: 'right', position: Position.Right },
  { id: 'bottom', position: Position.Bottom },
  { id: 'left', position: Position.Left },
];

type InsideLabel = { text: string; size: number; y: number };

function buildInsideLabels(node: EntityNodeType['data']): InsideLabel[] {
  if (!isPersonShape(node.shape) || isAnnotationShape(node.shape)) return [];

  const labels: InsideLabel[] = [];
  const hasAge = node.showAge !== false && Boolean(node.age);
  const hasDate = node.showBirthDate && Boolean(node.birthDate);
  const hasName = node.showNameInside && Boolean(node.name);

  if (hasAge) labels.push({ text: node.age, size: 20, y: 0 });
  if (hasDate) labels.push({ text: formatBirthDate(node.birthDate), size: 11, y: 0 });
  if (hasName) labels.push({ text: node.name, size: hasAge || hasDate ? 10 : 14, y: 0 });

  const count = labels.length;
  if (count === 0) return [];

  const mid = SHAPE_SIZE / 2;
  if (count === 1) {
    labels[0].y = mid;
    return labels;
  }

  const startY = count === 2 ? mid - 8 : mid - 14;
  const gap = count === 2 ? 18 : 14;
  labels.forEach((label, index) => {
    label.y = startY + index * gap;
  });

  return labels;
}

function Shape({
  node,
  onDoubleClick,
}: {
  node: EntityNodeType['data'];
  onDoubleClick: () => void;
}) {
  const colors = getEntityColors(node);
  const insideLabels = buildInsideLabels(node);
  const isHousehold = node.shape === 'household';

  return (
    <div
      className={cn(
        'relative cursor-text',
        isHousehold ? 'h-[130px] w-[220px]' : 'h-24 w-24',
      )}
      onDoubleClick={(event) => {
        event.stopPropagation();
        onDoubleClick();
      }}
    >
      <EntityShapeSvg
        shape={node.shape}
        deceased={node.deceased}
        style={{
          stroke: colors.stroke,
          fill: colors.fill,
          strokeWidth: colors.strokeWidth,
          dash: colors.dash,
        }}
      />
      {insideLabels.length > 0 && !isHousehold && (
        <svg
          viewBox={`0 0 ${SHAPE_SIZE} ${SHAPE_SIZE}`}
          className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden"
          aria-hidden
        >
          {insideLabels.map((label, index) => (
            <text
              key={index}
              x={SHAPE_SIZE / 2}
              y={label.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={colors.text}
              style={{ fontFamily: 'Inter, sans-serif', fontSize: label.size, fontWeight: 600 }}
            >
              {label.text.length > 12 ? `${label.text.slice(0, 11)}…` : label.text}
            </text>
          ))}
        </svg>
      )}
      {isHousehold && node.name && (
        <p className="pointer-events-none absolute inset-x-0 top-2 text-center text-[11px] font-semibold text-slate-600">
          {node.name}
        </p>
      )}
    </div>
  );
}

function InlineEditOverlay({
  data,
  nodeId,
  onClose,
}: {
  data: EntityNodeType['data'];
  nodeId: string;
  onClose: () => void;
}) {
  const { onNodeChange } = useEditorActions();
  const [name, setName] = useState(data.name);
  const [age, setAge] = useState(data.age);
  const canEditAge = isPersonShape(data.shape) && !isAnnotationShape(data.shape);

  const commit = useCallback(() => {
    const trimmedAge = age.trim();
    onNodeChange(nodeId, {
      name: name.trim(),
      ...(canEditAge ? patchFromAgeInput(trimmedAge) : {}),
    });
    onClose();
  }, [age, canEditAge, name, nodeId, onClose, onNodeChange]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="absolute -top-1 left-1/2 z-10 w-36 -translate-x-1/2 rounded-xl border border-brand-300 bg-white p-2 shadow-lg"
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
    >
      <p className="mb-1.5 text-[10px] font-semibold text-slate-500 uppercase">Edición rápida</p>
      <input
        autoFocus
        value={name}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Nombre"
        className="mb-1.5 w-full rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-brand-400 focus:outline-none"
      />
      {canEditAge && (
        <input
          value={age}
          onChange={(event) => setAge(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Edad"
          inputMode="numeric"
          className="mb-1.5 w-full rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-brand-400 focus:outline-none"
        />
      )}
      <div className="flex gap-1">
        <button
          type="button"
          onClick={commit}
          className="flex-1 rounded-lg bg-brand-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-brand-700"
        >
          Aplicar
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-100"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

function EntityNodeComponent({ id, data, selected }: NodeProps<EntityNodeType>) {
  const [editing, setEditing] = useState(false);
  const subtitle = data.kinship || data.occupation;
  const showNameBelow = !data.showNameInside && data.shape !== 'household';
  const isHousehold = data.shape === 'household';

  return (
    <div
      className={cn(
        'group relative flex flex-col items-center rounded-xl px-1 py-1 transition-shadow',
        isHousehold ? 'w-56' : 'w-32',
        selected && 'ring-2 ring-brand-500 ring-offset-2 ring-offset-slate-50',
      )}
    >
      {HANDLE_POSITIONS.map(({ id: handleId, position }) => (
        <Handle
          key={handleId}
          id={handleId}
          type="source"
          position={position}
          className="opacity-0! transition-opacity group-hover:opacity-100!"
        />
      ))}

      <Shape node={data} onDoubleClick={() => setEditing(true)} />

      {editing && (
        <InlineEditOverlay data={data} nodeId={id} onClose={() => setEditing(false)} />
      )}

      {showNameBelow && (
        <p className="mt-1 max-w-full truncate text-center text-[13px] font-semibold text-slate-800">
          {data.name || 'Sin nombre'}
        </p>
      )}
      {subtitle && !isHousehold && (
        <p className="max-w-full truncate text-center text-[11px] text-slate-500">{subtitle}</p>
      )}
      {isPersonShape(data.shape) && !data.cohabits && (
        <p className="text-[10px] font-medium text-accent-600">No convive</p>
      )}
    </div>
  );
}

export const EntityNodeView = memo(EntityNodeComponent);
