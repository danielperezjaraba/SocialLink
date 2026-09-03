import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Copy, Download, FilePenLine, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/app/contexts/useAuth';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { getCatalog, TOOL_KINDS } from '@/features/editor/catalogs';
import { NewProjectModal } from '@/features/proyectos/NewProjectModal';
import type { ToolKind } from '@/features/editor/types';
import {
  deleteProject,
  duplicateProject,
  listProjects,
  PlanLimitError,
  updateProject,
} from '@/services/projectService';
import type { ProjectSummary } from '@/services/types';
import { cn, formatDate } from '@/lib/utils';

type Filter = 'todos' | ToolKind;

export function ProjectsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [filter, setFilter] = useState<Filter>('todos');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ProjectSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setProjects(await listProjects(user.id));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const visible = filter === 'todos' ? projects : projects.filter((item) => item.kind === filter);

  const handleDuplicate = async (project: ProjectSummary) => {
    if (!user) return;
    try {
      await duplicateProject(user, project.id);
      toast.success('Proyecto duplicado.');
      await refresh();
    } catch (error) {
      if (error instanceof PlanLimitError) {
        toast.error(error.message, {
          action: { label: 'Ver planes', onClick: () => navigate('/planes') },
        });
      } else {
        toast.error('No se pudo duplicar el proyecto.');
      }
    }
  };

  const handleDelete = async (project: ProjectSummary) => {
    if (!window.confirm(`¿Eliminar "${project.name}"? Esta acción no se puede deshacer.`)) return;
    await deleteProject(project.id);
    toast.success('Proyecto eliminado.');
    await refresh();
  };

  return (
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Mis proyectos</h1>
          <p className="mt-2 text-slate-600">
            Todo lo que has creado, con la fecha de su última edición.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          Nuevo proyecto
        </Button>
      </header>

      <div className="mt-6 flex flex-wrap gap-2">
        {(['todos', ...TOOL_KINDS] as Filter[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              filter === option
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400',
            )}
          >
            {option === 'todos' ? 'Todos' : getCatalog(option).name}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-slate-500">Cargando proyectos…</p>
      ) : visible.length === 0 ? (
        <div className="surface-card mt-6 px-6 py-12 text-center">
          <p className="font-semibold text-slate-700">Aquí no hay nada todavía</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            Cuando crees un genograma, un familiograma o un ecomapa, aparecerá en esta biblioteca
            listo para abrir, editar o exportar.
          </p>
          <Button className="mt-5" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Crear el primero
          </Button>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {visible.map((project) => (
            <li key={project.id} className="surface-card flex flex-col p-5">
              <span className="inline-flex w-fit rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                {getCatalog(project.kind).name}
              </span>

              <h2 className="mt-3 truncate font-semibold text-slate-900">{project.name}</h2>
              <p className="mt-1 text-xs text-slate-500">
                Última edición: {formatDate(project.updatedAt)}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {project.entityCount} elementos · {project.relationCount} vínculos
              </p>

              {project.description && (
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{project.description}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <Link
                  to={`/editor/${project.id}`}
                  className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                >
                  Abrir
                </Link>
                <Button size="sm" variant="outline" onClick={() => setEditing(project)}>
                  <FilePenLine className="h-3.5 w-3.5" />
                  Editar
                </Button>
                <Link
                  to={`/editor/${project.id}?exportar=1`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-brand-400 hover:text-brand-700"
                >
                  <Download className="h-3.5 w-3.5" />
                  Exportar
                </Link>

                <div className="ml-auto flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleDuplicate(project)}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    title="Duplicar"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(project)}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <NewProjectModal open={creating} onClose={() => setCreating(false)} />

      <RenameModal
        project={editing}
        onClose={() => setEditing(null)}
        onSaved={async () => {
          setEditing(null);
          await refresh();
        }}
      />
    </div>
  );
}

function RenameModal({
  project,
  onClose,
  onSaved,
}: {
  project: ProjectSummary | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
    }
  }, [project]);

  const handleSave = async () => {
    if (!project) return;
    setSaving(true);
    try {
      await updateProject(project.id, { name: name.trim() || project.name, description });
      toast.success('Datos del proyecto actualizados.');
      onSaved();
    } catch {
      toast.error('No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={project !== null}
      onClose={onClose}
      title="Editar proyecto"
      description="Cambia el nombre o agrega una nota sobre el caso."
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Guardar cambios
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Nombre">
          <Input value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
        <Field label="Descripción" hint="Aparece en la ficha del proyecto y en el PDF exportado.">
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ej. Caso de práctica profesional, barrio La Esperanza."
          />
        </Field>
      </div>
    </Modal>
  );
}
