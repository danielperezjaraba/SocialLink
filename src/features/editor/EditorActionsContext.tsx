import { createContext, useContext } from 'react';
import type { EntityData } from '@/features/editor/types';
import type { FlowPoint } from '@/features/editor/edgeGeometry';

type EditorActions = {
  onNodeChange: (id: string, patch: Partial<EntityData>) => void;
  /** Arrastra desde un punto de una línea para sacar otra hacia otro lado. */
  onBeginLineConnection: (from: FlowPoint, edgeId: string, clientX: number, clientY: number) => void;
};

export const EditorActionsContext = createContext<EditorActions | null>(null);

export function useEditorActions(): EditorActions {
  const ctx = useContext(EditorActionsContext);
  if (!ctx) {
    throw new Error('useEditorActions debe usarse dentro del editor de diagramas.');
  }
  return ctx;
}
