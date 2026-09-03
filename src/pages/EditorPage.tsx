import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Download, Loader2, Save, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/app/contexts/useAuth';
import { Button } from '@/components/ui/Button';
import { getCatalog } from '@/features/editor/catalogs';
import { DiagramEditor } from '@/features/editor/components/DiagramEditor';
import { ExportModal } from '@/features/editor/components/ExportModal';
import { MembersModal } from '@/features/editor/components/MembersModal';
import type { Diagram } from '@/features/editor/types';
import { getProject, updateProject } from '@/services/projectService';
import type { Project } from '@/services/types';

const AUTOSAVE_DELAY = 1500;

export function EditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user, plan } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [project, setProject] = useState<Project | null>(null);
  const [diagram, setDiagram] = useState<Diagram | null>(null);
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'dirty' | 'saving' | 'saved'>('idle');
  const [exportOpen, setExportOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // El diagrama vivo se guarda en una ref para que cada movimiento del lienzo
  // no vuelva a renderizar la página completa.
  const liveDiagram = useRef<Diagram>({ nodes: [], edges: [] });
  const savedSnapshot = useRef('');
  const savingRef = useRef(false);

  // Cada edición incrementa esta cuenta. Es lo que reinicia la espera del
  // autoguardado: mientras se sigue arrastrando una figura no se envía nada.
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!projectId) return;

    let active = true;
    void getProject(projectId).then((found) => {
      if (!active) return;
      if (!found) {
        setNotFound(true);
        return;
      }
      setProject(found);
      setName(found.name);
      setDiagram(found.diagram);
      liveDiagram.current = found.diagram;
      savedSnapshot.current = JSON.stringify(found.diagram);
    });

    return () => {
      active = false;
    };
  }, [projectId]);

  useEffect(() => {
    if (searchParams.get('exportar') === '1') {
      setExportOpen(true);
      searchParams.delete('exportar');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const markDirty = useCallback(() => {
    setStatus('dirty');
    setRevision((current) => current + 1);
  }, []);

  const handleDiagramChange = useCallback(
    (next: Diagram) => {
      liveDiagram.current = next;
      if (JSON.stringify(next) === savedSnapshot.current) return;
      markDirty();
    },
    [markDirty],
  );

  const save = useCallback(async () => {
    if (!project) return;
    // Dos guardados a la vez reescribirían el diagrama en desorden; si ya hay
    // uno en curso, los cambios nuevos quedan para la siguiente pasada.
    if (savingRef.current) return;

    savingRef.current = true;
    setStatus('saving');

    const snapshot = liveDiagram.current;
    try {
      await updateProject(project.id, {
        diagram: snapshot,
        name: name.trim() || project.name,
      });
      savedSnapshot.current = JSON.stringify(snapshot);

      // Lo que se editó mientras viajaba la petición todavía no está guardado.
      const hasNewerChanges = JSON.stringify(liveDiagram.current) !== savedSnapshot.current;
      setStatus(hasNewerChanges ? 'dirty' : 'saved');
    } catch (error) {
      setStatus('dirty');
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar el proyecto.');
    } finally {
      savingRef.current = false;
    }
  }, [project, name]);

  useEffect(() => {
    if (status !== 'dirty') return;
    const timer = window.setTimeout(() => void save(), AUTOSAVE_DELAY);
    return () => window.clearTimeout(timer);
  }, [status, revision, save]);

  // Al salir del editor se intenta un último guardado con lo que quedara
  // pendiente, para no perder los segundos previos a cerrar la pantalla.
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  useEffect(
    () => () => {
      if (JSON.stringify(liveDiagram.current) !== savedSnapshot.current) {
        void saveRef.current();
      }
    },
    [],
  );

  // Cerrar la pestaña sí interrumpe el guardado, así que ahí el navegador avisa.
  useEffect(() => {
    if (status !== 'dirty' && status !== 'saving') return;

    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [status]);

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
        <h1 className="font-display text-2xl font-bold">Este proyecto ya no existe</h1>
        <p className="max-w-sm text-slate-600">
          Es posible que lo hayas eliminado desde la biblioteca de proyectos.
        </p>
        <Button onClick={() => navigate('/proyectos')}>Volver a mis proyectos</Button>
      </div>
    );
  }

  if (!project || !diagram) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      </div>
    );
  }

  const catalog = getCatalog(project.kind);

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <header className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <Link
          to="/proyectos"
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          title="Volver a mis proyectos"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold tracking-wide text-brand-700 uppercase">
            {catalog.name}
          </p>
          <input
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              markDirty();
            }}
            className="w-full max-w-md truncate rounded-lg border border-transparent bg-transparent px-1 py-0.5 font-display text-lg font-bold text-slate-900 hover:border-slate-200 focus:border-brand-400 focus:outline-none"
            aria-label="Nombre del proyecto"
          />
        </div>

        <StatusBadge status={status} />

        {project.kind === 'familiograma' && (
          <Button variant="outline" size="sm" onClick={() => setMembersOpen(true)}>
            <Wand2 className="h-4 w-4" />
            Generar esquema
          </Button>
        )}

        <Button variant="outline" size="sm" onClick={() => void save()}>
          <Save className="h-4 w-4" />
          Guardar
        </Button>

        <Button size="sm" onClick={() => setExportOpen(true)}>
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </header>

      <DiagramEditor
        catalog={catalog}
        diagram={diagram}
        saving={status === 'saving'}
        onChange={handleDiagramChange}
        onSave={() => void save()}
      />

      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        nodes={() => liveDiagram.current.nodes}
        canExportPdf={plan.limits.exportPdf}
        meta={{
          projectName: name || project.name,
          toolName: catalog.name,
          authorName: user?.name ?? 'Autoría no registrada',
          notes: project.description,
        }}
        onSaveToPlatform={save}
      />

      <MembersModal
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
        onGenerate={(generated) => {
          setDiagram(generated);
          liveDiagram.current = generated;
          markDirty();
          toast.success('Esquema generado a partir de los integrantes.');
        }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: 'idle' | 'dirty' | 'saving' | 'saved' }) {
  if (status === 'saving') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-slate-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Guardando…
      </span>
    );
  }

  if (status === 'dirty') {
    return <span className="text-xs text-accent-600">Cambios sin guardar</span>;
  }

  if (status === 'saved') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-brand-700">
        <Check className="h-3.5 w-3.5" />
        Guardado
      </span>
    );
  }

  return null;
}
