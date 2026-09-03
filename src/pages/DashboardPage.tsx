import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Compass, FolderOpen, GitBranch, Layers, Sparkles, UserRound } from 'lucide-react';
import { useAuth } from '@/app/contexts/useAuth';
import { getCatalog, TOOL_KINDS } from '@/features/editor/catalogs';
import { NewProjectModal } from '@/features/proyectos/NewProjectModal';
import type { ToolKind } from '@/features/editor/types';
import { listProjects } from '@/services/projectService';
import type { ProjectSummary } from '@/services/types';
import { formatRelative } from '@/lib/utils';

const TOOL_ICONS = {
  genograma: GitBranch,
  familiograma: Layers,
  ecomapa: Compass,
};

const SHORTCUTS = [
  { to: '/proyectos', label: 'Mis proyectos', description: 'Abre, edita o exporta lo que ya creaste.', icon: FolderOpen },
  { to: '/plantillas', label: 'Plantillas', description: 'Parte de un esquema ya armado.', icon: Sparkles },
  { to: '/tutoriales', label: 'Tutoriales', description: 'Aprende a leer y construir cada herramienta.', icon: BookOpen },
  { to: '/perfil', label: 'Mi perfil', description: 'Tus datos, tu plan y tu almacenamiento.', icon: UserRound },
];

export function DashboardPage() {
  const { user, plan } = useAuth();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [modalKind, setModalKind] = useState<ToolKind | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setProjects(await listProjects(user.id));
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const firstName = user?.name.split(' ')[0] ?? '';
  const limit = plan.limits.maxProjects;

  return (
    <div className="mx-auto max-w-5xl">
      <header>
        <p className="text-sm text-slate-500">Hola{firstName ? `, ${firstName}` : ''} 👋</p>
        <h1 className="mt-1 font-display text-3xl font-bold">¿Qué quieres crear hoy?</h1>
        <p className="mt-2 text-slate-600">
          Elige una herramienta para abrir el editor. Podrás cambiarle el nombre y exportarla cuando
          quieras.
        </p>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {TOOL_KINDS.map((kind) => {
          const catalog = getCatalog(kind);
          const Icon = TOOL_ICONS[kind];
          return (
            <button
              key={kind}
              type="button"
              onClick={() => setModalKind(kind)}
              className="surface-card group relative overflow-hidden p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg"
            >
              <span className="absolute -right-8 -bottom-8 h-28 w-28 rounded-full bg-brand-50 transition-transform duration-500 group-hover:scale-150" />

              <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="relative mt-4 text-lg font-semibold">{catalog.name}</h2>
              <p className="relative mt-1 text-sm leading-relaxed text-slate-600">
                {catalog.tagline}
              </p>
            </button>
          );
        })}
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-xl font-bold">Continúa donde ibas</h2>
          <Link to="/proyectos" className="text-sm font-medium text-brand-700 hover:underline">
            Ver todos
          </Link>
        </div>

        {projects.length === 0 ? (
          <p className="surface-card mt-4 px-5 py-8 text-center text-sm text-slate-500">
            Todavía no tienes proyectos guardados. Crea el primero desde una de las tarjetas de
            arriba.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {projects.slice(0, 3).map((project) => (
              <li key={project.id}>
                <Link
                  to={`/editor/${project.id}`}
                  className="surface-card flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:border-brand-300"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-slate-800">
                      {project.name}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {getCatalog(project.kind).name} · {project.entityCount} elementos ·{' '}
                      {formatRelative(project.updatedAt)}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-medium text-brand-700">Abrir</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SHORTCUTS.map(({ to, label, description, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-4 transition-colors hover:border-brand-300"
          >
            <Icon className="h-5 w-5 text-slate-400" />
            <p className="mt-3 text-sm font-semibold text-slate-800">{label}</p>
            <p className="mt-0.5 text-xs leading-snug text-slate-500">{description}</p>
          </Link>
        ))}
      </section>

      <section className="relative isolate mt-8 flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-2xl bg-brand-900 px-6 py-5 text-brand-50">
        <div className="aurora absolute inset-0 -z-10 opacity-70" />
        <div>
          <p className="font-semibold text-white">{plan.name}</p>
          <p className="text-sm text-brand-100">
            {limit === null
              ? `Proyectos ilimitados · ${projects.length} creados`
              : `${projects.length} de ${limit} proyectos usados`}
          </p>
        </div>
        <Link
          to="/planes"
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50"
        >
          {limit === null ? 'Ver planes' : 'Ampliar plan'}
        </Link>
      </section>

      <NewProjectModal
        open={modalKind !== null}
        defaultKind={modalKind ?? 'genograma'}
        onClose={() => setModalKind(null)}
      />
    </div>
  );
}
