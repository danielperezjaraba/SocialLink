import { useState } from 'react';
import { Info } from 'lucide-react';
import { RELATION_CATEGORIES, relationsByCategory } from '@/features/editor/catalogs/relations';
import { SYMBOL_CATEGORIES, symbolsByCategory } from '@/features/editor/catalogs/symbols';
import { RelationPreview, SymbolPreview } from '@/features/editor/components/Previews';
import type { RelationCategory, RelationId, SymbolCategory, SymbolDef, ToolCatalog } from '@/features/editor/types';
import { cn } from '@/lib/utils';

export const SYMBOL_DRAG_TYPE = 'application/sociallink-symbol';

type PaletteProps = {
  catalog: ToolCatalog;
  activeRelation: RelationId;
  onRelationChange: (relation: RelationId) => void;
  onAddSymbol: (symbol: SymbolDef) => void;
};

function TabBar<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'rounded-lg px-2 py-1 text-[10px] font-semibold transition-colors',
            active === tab.id
              ? 'bg-brand-100 text-brand-800'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function Palette({ catalog, activeRelation, onRelationChange, onAddSymbol }: PaletteProps) {
  const [symbolTab, setSymbolTab] = useState<SymbolCategory>('integrantes');
  const [relationTab, setRelationTab] = useState<RelationCategory>('estructura');

  const visibleSymbols = symbolsByCategory(symbolTab);
  const visibleRelations = relationsByCategory(relationTab);

  return (
    <aside className="flex w-64 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="font-display text-sm font-bold tracking-wide text-slate-900 uppercase">
          Elementos
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Todos los símbolos están disponibles en {catalog.name.toLowerCase()}. Arrastra o haz clic.
        </p>
      </div>

      <div className="px-4 py-4">
        <h3 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Símbolos
        </h3>
        <TabBar tabs={SYMBOL_CATEGORIES} active={symbolTab} onChange={setSymbolTab} />
        <div className="mt-3 grid grid-cols-2 gap-2">
          {visibleSymbols.map((symbol) => (
            <button
              key={symbol.id}
              type="button"
              draggable
              title={symbol.hint}
              onDragStart={(event) => {
                event.dataTransfer.setData(SYMBOL_DRAG_TYPE, symbol.id);
                event.dataTransfer.effectAllowed = 'move';
              }}
              onClick={() => onAddSymbol(symbol)}
              className="flex cursor-grab flex-col items-center gap-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white px-2 py-2.5 text-center transition-colors hover:border-brand-400 hover:bg-brand-50 active:cursor-grabbing"
            >
              <SymbolPreview shape={symbol.shape} deceased={symbol.defaults?.deceased} />
              <span className="text-[11px] leading-tight font-medium text-slate-700">
                {symbol.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 px-4 py-4">
        <h3 className="mb-1 text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Vínculos
        </h3>
        <p className="mb-2 text-[11px] text-slate-500">
          Elige uno y arrastra desde cualquier punto del contorno de una figura.
        </p>
        <TabBar tabs={RELATION_CATEGORIES} active={relationTab} onChange={setRelationTab} />

        <div className="mt-2 space-y-1">
          {visibleRelations.map((relation) => {
            const isActive = relation.id === activeRelation;
            return (
              <button
                key={relation.id}
                type="button"
                title={relation.hint}
                onClick={() => onRelationChange(relation.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors',
                  isActive
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-transparent hover:border-slate-200 hover:bg-slate-50',
                )}
              >
                <RelationPreview relation={relation} />
                <span
                  className={cn(
                    'text-xs font-medium',
                    isActive ? 'text-brand-800' : 'text-slate-600',
                  )}
                >
                  {relation.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto border-t border-slate-200 bg-slate-50 px-4 py-3">
        <p className="flex gap-2 text-[11px] leading-relaxed text-slate-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Las líneas se trazan en ángulo recto (horizontal y vertical). Arrastra desde una línea
            para ramificar; al seleccionar una línea puedes cambiar su grosor.
          </span>
        </p>
      </div>
    </aside>
  );
}
