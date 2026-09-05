import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  ConnectionLineType,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useStore,
  type Connection,
  type FinalConnectionState,
  type OnSelectionChangeParams,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { AnchorNodeView } from '@/features/editor/components/AnchorNode';
import { EntityNodeView } from '@/features/editor/components/EntityNode';
import { Inspector } from '@/features/editor/components/Inspector';
import { Palette, SYMBOL_DRAG_TYPE } from '@/features/editor/components/Palette';
import { SnappedConnectionLine } from '@/features/editor/components/SnappedConnectionLine';
import { RelationEdgeView } from '@/features/editor/components/RelationEdge';
import { EditorActionsContext } from '@/features/editor/EditorActionsContext';
import {
  GRID_GAP,
  resolveDropTarget,
  type DropTarget,
  type FlowPoint,
} from '@/features/editor/edgeGeometry';
import { orthogonalPoints } from '@/features/editor/orthogonalPath';
import { EMPTY_ENTITY, EMPTY_RELATION } from '@/features/editor/types';
import type {
  AnchorNode,
  Diagram,
  DiagramNode,
  EntityData,
  EntityNode,
  RelationData,
  RelationEdge,
  RelationId,
  SymbolDef,
  ToolCatalog,
} from '@/features/editor/types';
import { createId } from '@/lib/utils';

const nodeTypes = { entity: EntityNodeView, anchor: AnchorNodeView };
const edgeTypes = { relation: RelationEdgeView };

const MIN_LINE = GRID_GAP * 0.45;

type PendingConnection = {
  from: FlowPoint;
  fromEdgeId?: string;
};

export type DiagramEditorProps = {
  catalog: ToolCatalog;
  diagram: Diagram;
  saving: boolean;
  onChange: (diagram: Diagram) => void;
  onSave: () => void;
};

function isAnchorNode(node: DiagramNode): node is AnchorNode {
  return node.type === 'anchor';
}

function visibleEntityCount(nodes: DiagramNode[]): number {
  return nodes.filter((node) => node.type === 'entity').length;
}

function PendingConnectionLine({
  from,
  clientX,
  clientY,
  excludeEdgeId,
  nodes,
  edges,
  nodeLookup,
  screenToFlowPosition,
  flowToScreenPosition,
  zoom,
}: {
  from: FlowPoint;
  clientX: number;
  clientY: number;
  excludeEdgeId?: string;
  nodes: DiagramNode[];
  edges: RelationEdge[];
  nodeLookup: Map<string, import('@xyflow/react').InternalNode>;
  screenToFlowPosition: (point: { x: number; y: number }) => FlowPoint;
  flowToScreenPosition: (point: FlowPoint) => { x: number; y: number };
  zoom: number;
}) {
  const target = resolveDropTarget(clientX, clientY, {
    nodes,
    edges,
    nodeLookup,
    screenToFlowPosition,
    flowToScreenPosition,
    zoom,
    excludeEdgeId,
    fromPoint: from,
  });
  const [a, corner, b] = orthogonalPoints(from, target.point);
  const sa = flowToScreenPosition(a);
  const sc = flowToScreenPosition(corner);
  const sb = flowToScreenPosition(b);

  return (
    <svg className="pointer-events-none absolute inset-0 z-20">
      <path
        d={`M ${sa.x} ${sa.y} L ${sc.x} ${sc.y} L ${sb.x} ${sb.y}`}
        fill="none"
        stroke="#334155"
        strokeWidth={2}
        strokeDasharray="7 5"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <circle cx={sb.x} cy={sb.y} r={5} fill="#178578" stroke="#fff" strokeWidth={1.5} />
    </svg>
  );
}

function normalizeDiagram(diagram: Diagram): Diagram {
  return {
    nodes: diagram.nodes.map((node) => {
      if (
        node.type === 'entity' &&
        ((node.data.shape as string) === 'junction' || (node.data.shape as string) === 'anchor')
      ) {
        return {
          id: node.id,
          type: 'anchor' as const,
          position: node.position,
          nodeOrigin: [0.5, 0.5] as [number, number],
          selectable: false,
          draggable: false,
          data: {},
        };
      }
      return node;
    }),
    edges: diagram.edges,
  };
}

function EditorCanvas({ catalog, diagram, saving, onChange, onSave }: DiagramEditorProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, flowToScreenPosition, getViewport } = useReactFlow();
  const nodeLookup = useStore((state) => state.nodeLookup);

  const [nodes, setNodes, onNodesChange] = useNodesState<DiagramNode>(diagram.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RelationEdge>(diagram.edges);
  const [activeRelation, setActiveRelation] = useState<RelationId>(catalog.relations[0].id);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingConnection | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const dropOptions = useCallback(
    (excludeEdgeId?: string) => ({
      nodes,
      edges,
      nodeLookup,
      screenToFlowPosition,
      flowToScreenPosition,
      zoom: getViewport().zoom,
      excludeEdgeId,
    }),
    [edges, flowToScreenPosition, getViewport, nodeLookup, nodes, screenToFlowPosition],
  );

  useEffect(() => {
    const normalized = normalizeDiagram(diagram);
    setNodes(normalized.nodes);
    setEdges(normalized.edges);
  }, [diagram, setNodes, setEdges]);

  useEffect(() => {
    onChange({ nodes, edges });
  }, [nodes, edges, onChange]);

  const createAnchor = useCallback(
    (point: FlowPoint): AnchorNode => ({
      id: createId(),
      type: 'anchor',
      position: point,
      // El punto de la línea coincide con position, no con la esquina del nodo.
      nodeOrigin: [0.5, 0.5],
      selectable: false,
      draggable: false,
      data: {},
    }),
    [],
  );

  const addRelationEdge = useCallback(
    (connection: {
      source: string;
      target: string;
      sourceHandle?: string | null;
      targetHandle?: string | null;
    }) => {
      setEdges((current) =>
        addEdge<RelationEdge>(
          {
            id: createId(),
            type: 'relation',
            source: connection.source,
            target: connection.target,
            sourceHandle: connection.sourceHandle ?? null,
            targetHandle: connection.targetHandle ?? null,
            data: { ...EMPTY_RELATION, relation: activeRelation },
          },
          current,
        ),
      );
    },
    [activeRelation, setEdges],
  );

  const commitDropTarget = useCallback(
    (
      target: DropTarget,
      connection: {
        sourceId: string;
        sourceHandle?: string | null;
        fromPoint?: FlowPoint;
      },
    ) => {
      if (
        connection.fromPoint &&
        Math.hypot(target.point.x - connection.fromPoint.x, target.point.y - connection.fromPoint.y) <
          MIN_LINE
      ) {
        return;
      }

      if (target.kind === 'handle') {
        if (connection.fromPoint) {
          const sourceAnchor = createAnchor(connection.fromPoint);
          setNodes((current) => [...current, sourceAnchor]);
          addRelationEdge({
            source: sourceAnchor.id,
            target: target.nodeId,
            sourceHandle: 'center',
            targetHandle: target.handleId,
          });
          return;
        }

        addRelationEdge({
          source: connection.sourceId,
          target: target.nodeId,
          sourceHandle: connection.sourceHandle ?? null,
          targetHandle: target.handleId,
        });
        return;
      }

      if (connection.fromPoint) {
        const sourceAnchor = createAnchor(connection.fromPoint);
        const endAnchor = createAnchor(target.point);
        setNodes((current) => [...current, sourceAnchor, endAnchor]);
        addRelationEdge({
          source: sourceAnchor.id,
          target: endAnchor.id,
          sourceHandle: 'center',
          targetHandle: 'center',
        });
        return;
      }

      const endAnchor = createAnchor(target.point);
      setNodes((current) => [...current, endAnchor]);
      addRelationEdge({
        source: connection.sourceId,
        target: endAnchor.id,
        sourceHandle: connection.sourceHandle ?? null,
        targetHandle: 'center',
      });
    },
    [addRelationEdge, createAnchor, setNodes],
  );

  const finishFreeConnection = useCallback(
    (from: FlowPoint, clientX: number, clientY: number, fromEdgeId?: string) => {
      const target = resolveDropTarget(clientX, clientY, {
        ...dropOptions(fromEdgeId),
        fromPoint: from,
      });
      commitDropTarget(target, { sourceId: '', fromPoint: from });
    },
    [commitDropTarget, dropOptions],
  );

  useEffect(() => {
    if (!pending) return;

    const onMove = (event: MouseEvent) => {
      setCursor({ x: event.clientX, y: event.clientY });
    };

    const onUp = (event: MouseEvent) => {
      finishFreeConnection(pending.from, event.clientX, event.clientY, pending.fromEdgeId);
      setPending(null);
      setCursor(null);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [finishFreeConnection, pending]);

  const beginLineConnection = useCallback(
    (from: FlowPoint, edgeId: string, clientX: number, clientY: number) => {
      setPending({ from, fromEdgeId: edgeId });
      setCursor({ x: clientX, y: clientY });
      setSelectedEdgeId(null);
    },
    [],
  );

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

  /** Soltar en vacío: la línea queda abierta, alineada al punto del tablero más cercano. */
  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, connectionState: FinalConnectionState) => {
      if (connectionState.isValid || connectionState.toNode) return;
      const fromNodeId = connectionState.fromNode?.id;
      if (!fromNodeId) return;

      const point = 'changedTouches' in event ? event.changedTouches[0] : event;
      if (!point) return;

      const target = resolveDropTarget(point.clientX, point.clientY, {
        ...dropOptions(),
        fromPoint: connectionState.from ?? undefined,
      });
      const start = connectionState.from;
      if (start && Math.hypot(target.point.x - start.x, target.point.y - start.y) < MIN_LINE) return;

      commitDropTarget(target, {
        sourceId: fromNodeId,
        sourceHandle: connectionState.fromHandle?.id ?? null,
      });
    },
    [commitDropTarget, dropOptions],
  );

  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    const node = params.nodes[0] as DiagramNode | undefined;
    setSelectedNodeId(node && !isAnchorNode(node) ? node.id : null);
    setSelectedEdgeId(params.edges[0]?.id ?? null);
  }, []);

  const updateNode = useCallback(
    (id: string, patch: Partial<EntityData>) => {
      setNodes((current) =>
        current.map((node) =>
          node.id === id && node.type === 'entity'
            ? { ...node, data: { ...node.data, ...patch } }
            : node,
        ),
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
      setEdges((current) => {
        const next = current.filter((edge) => edge.id !== id);
        setNodes((nodeList) =>
          nodeList.filter(
            (node) =>
              node.type !== 'anchor' ||
              next.some((edge) => edge.source === node.id || edge.target === node.id),
          ),
        );
        return next;
      });
      setSelectedEdgeId(null);
    },
    [setEdges, setNodes],
  );

  const selectedNode = useMemo(
    () =>
      (nodes.find((node) => node.id === selectedNodeId && node.type === 'entity') as EntityNode | undefined) ??
      null,
    [nodes, selectedNodeId],
  );
  const selectedEdge = useMemo(
    () => edges.find((edge) => edge.id === selectedEdgeId) ?? null,
    [edges, selectedEdgeId],
  );

  const editorActions = useMemo(
    () => ({ onNodeChange: updateNode, onBeginLineConnection: beginLineConnection }),
    [beginLineConnection, updateNode],
  );

  return (
    <EditorActionsContext.Provider value={editorActions}>
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
            onConnectEnd={onConnectEnd}
            onSelectionChange={onSelectionChange}
            onDrop={onDrop}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
            }}
            connectionMode={ConnectionMode.Loose}
            connectionLineType={ConnectionLineType.Straight}
            connectionLineComponent={SnappedConnectionLine}
            connectionRadius={8}
            snapToGrid
            snapGrid={[GRID_GAP, GRID_GAP]}
            deleteKeyCode={['Delete', 'Backspace']}
            fitView
            fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
            minZoom={0.2}
            maxZoom={2.5}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={GRID_GAP} size={1.5} color="#cbd5e1" />
            <Controls showInteractive={false} />
            <MiniMap
              pannable
              zoomable
              nodeColor={(node) => (node.type === 'anchor' ? 'transparent' : '#94a3b8')}
            />
          </ReactFlow>

          {pending && cursor && (
            <PendingConnectionLine
              from={pending.from}
              clientX={cursor.x}
              clientY={cursor.y}
              excludeEdgeId={pending.fromEdgeId}
              nodes={nodes}
              edges={edges}
              nodeLookup={nodeLookup}
              screenToFlowPosition={screenToFlowPosition}
              flowToScreenPosition={flowToScreenPosition}
              zoom={getViewport().zoom}
            />
          )}

          {visibleEntityCount(nodes) === 0 && (
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

export { BRANCH_DRAG } from '@/features/editor/edgeGeometry';
