import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

/** Anclaje interno: invisible; su position es el extremo exacto de la línea. */
function AnchorNodeComponent() {
  const center = {
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: 1,
    height: 1,
    minWidth: 1,
    minHeight: 1,
    opacity: 0,
    border: 'none',
    background: 'transparent',
  } as const;

  return (
    <div className="h-px w-px" aria-hidden>
      <Handle id="center" type="source" position={Position.Top} style={center} />
      <Handle id="center" type="target" position={Position.Top} style={center} />
    </div>
  );
}

export const AnchorNodeView = memo(AnchorNodeComponent);
