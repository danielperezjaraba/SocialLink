import { getCatalog, TOOL_KINDS } from '@/features/editor/catalogs';
import { RelationPreview, SymbolPreview } from '@/features/editor/components/Previews';

const STEPS = [
  {
    title: 'Elige la herramienta',
    detail:
      'Desde el panel principal selecciona genograma, familiograma o ecomapa. Cada una abre el mismo lienzo con sus propios símbolos.',
  },
  {
    title: 'Coloca los elementos',
    detail:
      'Arrastra las figuras del panel izquierdo al área de trabajo, o haz clic sobre ellas para que aparezcan en el centro.',
  },
  {
    title: 'Registra la información',
    detail:
      'Selecciona una figura y completa nombre, edad, sexo, fecha de nacimiento, ocupación y observaciones en el panel derecho.',
  },
  {
    title: 'Une con el vínculo correcto',
    detail:
      'Elige primero el tipo de vínculo en el panel izquierdo y luego arrastra desde el borde de una figura hasta la otra.',
  },
  {
    title: 'Exporta el resultado',
    detail:
      'Con el botón Exportar obtienes el diagrama en PDF o en imagen, o lo guardas en tu biblioteca de proyectos.',
  },
];

export function TutorialsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <header>
        <h1 className="font-display text-3xl font-bold">Tutoriales</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Una guía breve para construir cada herramienta y para no confundir las convenciones
          gráficas de la disciplina.
        </p>
      </header>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold">Cómo se construye un diagrama</h2>
        <ol className="mt-4 space-y-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="surface-card flex gap-4 px-5 py-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {index + 1}
              </span>
              <div>
                <p className="font-semibold text-slate-800">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Convenciones de cada herramienta</h2>
        <p className="mt-2 text-sm text-slate-600">
          Estas son las figuras y los trazos disponibles en cada caso. El editor muestra el mismo
          significado al pasar el cursor sobre ellos.
        </p>

        <div className="mt-5 space-y-4">
          {TOOL_KINDS.map((kind) => {
            const catalog = getCatalog(kind);
            return (
              <article key={kind} className="surface-card p-5">
                <h3 className="font-semibold text-slate-900">{catalog.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{catalog.description}</p>

                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Símbolos
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {catalog.symbols.map((symbol) => (
                        <li key={symbol.id} className="flex items-center gap-2">
                          <SymbolPreview
                            shape={symbol.shape}
                            deceased={symbol.defaults?.deceased}
                            className="h-6 w-6 shrink-0"
                          />
                          <span className="text-xs text-slate-600">
                            <span className="font-medium text-slate-800">{symbol.label}</span> —{' '}
                            {symbol.hint}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Vínculos
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {catalog.relations.map((relation) => (
                        <li key={relation.id} className="flex items-center gap-2">
                          <RelationPreview relation={relation} />
                          <span className="text-xs text-slate-600">
                            <span className="font-medium text-slate-800">{relation.label}</span> —{' '}
                            {relation.hint}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
