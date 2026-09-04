import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type OnSelectionChangeParams,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { EntityNodeView } from '@/features/editor/components/EntityNode';
import { Inspector } from '@/features/editor/components/Inspector';
import { Palette, SYMBOL_DRAG_TYPE } from '@/features/editor/components/Palette';
import { RelationEdgeView } from '@/features/editor/components/RelationEdge';
import { EditorActionsContext } from '@/features/editor/EditorActionsContext';
import { EMPTY_ENTITY, EMPTY_RELATION } from '@/features/editor/types';
import type {
  Diagram,
  EntityData,
  EntityNode,
  RelationData,
  RelationEdge,
  RelationId,
  SymbolDef,
  ToolCatalog,
} from '@/features/editor/types';
import { createId } from '@/lib/utils';

const nodeTypes = { entity: EntityNodeView };
const edgeTypes = { relation: RelationEdgeView };

export type DiagramEditorProps = {
  catalog: ToolCatalog;
  diagram: Diagram;
  saving: boolean;
  onChange: (diagram: Diagram) => void;
  onSave: () => void;
};

function EditorCanvas({ catalog, diagram, saving, onChange, onSave }: DiagramEditorProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<EntityNode>(diagram.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RelationEdge>(diagram.edges);
  const [activeRelation, setActiveRelation] = useState<RelationId>(catalog.relations[0].id);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // El diagrama recibido puede cambiar cuando se aplica una plantilla o se
  // genera el esquema automáticamente desde la lista de integrantes.
  useEffect(() => {
    setNodes(diagram.nodes);
    setEdges(diagram.edges);
  }, [diagram, setNodes, setEdges]);

  useEffect(() => {
    onChange({ nodes, edges });
  }, [nodes, edges, onChange]);

  const addSymbol = useCallback(
    (symbol: SymbolDef, position: { x: number; y: number }) => {
      setNodes((current) => [
        ...current,
        {
          id: createId(),
          type: 'entity',
          position,
          ...(symbol.shape === 'household' ? { zIndex: -1 } : {}),
          data: { ...EMPTY_ENTITY, shape: symbol.shape, ...symbol.defaults },
        },
      ]);
    },
    [setNodes],
  );

  const addSymbolAtCenter = useCallback(
    (symbol: SymbolDef) => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      const point = rect
        ? screenToFlowPosition({
            x: rect.x + rect.width / 2 + (Math.random() - 0.5) * 120,
            y: rect.y + rect.height / 2 + (Math.random() - 0.5) * 120,
          })
        : { x: 240, y: 200 };
      addSymbol(symbol, point);
    },
    [addSymbol, screenToFlowPosition],
  );

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const symbolId = event.dataTransfer.getData(SYMBOL_DRAG_TYPE);
      const symbol = catalog.symbols.find((item) => item.id === symbolId);
      if (!symbol) return;

      addSymbol(symbol, screenToFlowPosition({ x: event.clientX, y: event.clientY }));
    },
    [addSymbol, catalog.symbols, screenToFlowPosition],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((current) =>
        addEdge<RelationEdge>(
          {
            ...connection,
            id: createId(),
            type: 'relation',
            data: { ...EMPTY_RELATION, relation: activeRelation },
          },
          current,
        ),
      );
    },
    [activeRelation, setEdges],
  );

  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    setSelectedNodeId(params.nodes[0]?.id ?? null);
    setSelectedEdgeId(params.edges[0]?.id ?? null);
  }, []);

  const updateNode = useCallback(
    (id: string, patch: Partial<EntityData>) => {
      setNodes((current) =>
        current.map((node) => (node.id === id ? { ...node, data: { ...node.data, ...patch } } : node)),
      );
    },
    [setNodes],
  );

  const deleteNode = useCallback(
    (id: string) => {
      setNodes((current) => current.filter((node) => node.id !== id));
      setEdges((current) => current.filter((edge) => edge.source !== id && edge.target !== id));
      setSelectedNodeId(null);
    },
    [setEdges, setNodes],
  );

  const updateEdge = useCallback(
    (id: string, patch: Partial<RelationData>) => {
      setEdges((current) =>
        current.map((edge) =>
          edge.id === id
            ? { ...edge, data: { ...EMPTY_RELATION, ...edge.data, ...patch } }
            : edge,
        ),
      );
    },
    [setEdges],
  );

  const deleteEdge = useCallback(
    (id: string) => {
      setEdges((current) => current.filter((edge) => edge.id !== id));
      setSelectedEdgeId(null);
    },
    [setEdges],
  );

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );
  const selectedEdge = useMemo(
    () => edges.find((edge) => edge.id === selectedEdgeId) ?? null,
    [edges, selectedEdgeId],
  );

  return (
    <EditorActionsContext.Provider value={{ onNodeChange: updateNode }}>
      <div className="flex min-h-0 flex-1">
        <Palette
          catalog={catalog}
          activeRelation={activeRelation}
          onRelationChange={setActiveRelation}
          onAddSymbol={addSymbolAtCenter}
        />

        <div ref={wrapperRef} className="relative min-w-0 flex-1 bg-slate-100">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectionChange={onSelectionChange}
            onDrop={onDrop}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
            }}
            // Permite unir dos figuras desde cualquiera de sus cuatro bordes
            connectionMode={ConnectionMode.Loose}
            deleteKeyCode={['Delete', 'Backspace']}
            fitView
            fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
            minZoom={0.2}
            maxZoom={2.5}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="#cbd5e1" />
            <Controls showInteractive={false} />
            <MiniMap pannable zoomable nodeColor="#94a3b8" />
          </ReactFlow>

          {nodes.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <p className="max-w-xs rounded-2xl border border-dashed border-slate-300 bg-white/80 px-6 py-5 text-center text-sm text-slate-500">
                Arrastra un elemento del panel izquierdo para empezar tu {catalog.name.toLowerCase()}.
              </p>
            </div>
          )}
        </div>

        <Inspector
          catalog={catalog}
          node={selectedNode}
          edge={selectedEdge}
          saving={saving}
          onNodeChange={updateNode}
          onNodeDelete={deleteNode}
          onEdgeChange={updateEdge}
          onEdgeDelete={deleteEdge}
          onSave={onSave}
        />
      </div>
    </EditorActionsContext.Provider>
  );
}

export function DiagramEditor(props: DiagramEditorProps) {
  return (
    <ReactFlowProvider>
      <EditorCanvas {...props} />
    </ReactFlowProvider>
  );
}
