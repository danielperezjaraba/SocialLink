import { Info } from 'lucide-react';
import { RelationPreview, SymbolPreview } from '@/features/editor/components/Previews';
import type { RelationId, SymbolDef, ToolCatalog } from '@/features/editor/types';
import { cn } from '@/lib/utils';

export const SYMBOL_DRAG_TYPE = 'application/sociallink-symbol';

type PaletteProps = {
  catalog: ToolCatalog;
  activeRelation: RelationId;
  onRelationChange: (relation: RelationId) => void;
  onAddSymbol: (symbol: SymbolDef) => void;
};

export function Palette({ catalog, activeRelation, onRelationChange, onAddSymbol }: PaletteProps) {
  return (
    <aside className="flex w-64 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="font-display text-sm font-bold tracking-wide text-slate-900 uppercase">
          Elementos
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Arrástralos al área de trabajo o haz clic para agregarlos.
        </p>
      </div>

      <div className="px-4 py-4">
        <h3 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
          {catalog.symbolsTitle}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {catalog.symbols.map((symbol) => (
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
              className="flex cursor-grab flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-3 text-center transition-colors hover:border-brand-400 hover:bg-brand-50 active:cursor-grabbing"
            >
              <SymbolPreview
                shape={symbol.shape}
                deceased={symbol.defaults?.deceased}
                className="h-8 w-8"
              />
              <span className="text-[11px] leading-tight font-medium text-slate-700">
                {symbol.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 px-4 py-4">
        <h3 className="mb-1 text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Tipo de vínculo
        </h3>
        <p className="mb-3 text-[11px] text-slate-500">
          Elige uno y luego une dos elementos arrastrando desde el borde de una figura.
        </p>

        <div className="space-y-1">
          {catalog.relations.map((relation) => {
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
            Selecciona una figura o una línea para editar sus datos en el panel derecho. Con la tecla
            Suprimir eliminas lo seleccionado.
          </span>
        </p>
      </div>
    </aside>
  );
}
