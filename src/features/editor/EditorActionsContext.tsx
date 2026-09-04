import { createContext, useContext } from 'react';
import type { EntityData } from '@/features/editor/types';

type EditorActions = {
  onNodeChange: (id: string, patch: Partial<EntityData>) => void;
};

export const EditorActionsContext = createContext<EditorActions | null>(null);

export function useEditorActions(): EditorActions {
  const ctx = useContext(EditorActionsContext);
  if (!ctx) {
    throw new Error('useEditorActions debe usarse dentro del editor de diagramas.');
  }
  return ctx;
}
