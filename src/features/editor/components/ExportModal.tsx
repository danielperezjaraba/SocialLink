import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudUpload, FileImage, FileText, Lock, PenLine } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { exportDiagramAsPdf, exportDiagramAsPng, type ExportMeta } from '@/features/editor/export';
import type { EntityNode } from '@/features/editor/types';
import { cn } from '@/lib/utils';

type ExportModalProps = {
  open: boolean;
  onClose: () => void;
  nodes: () => EntityNode[];
  meta: ExportMeta;
  canExportPdf: boolean;
  onSaveToPlatform: () => Promise<void>;
};

export function ExportModal({
  open,
  onClose,
  nodes,
  meta,
  canExportPdf,
  onSaveToPlatform,
}: ExportModalProps) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (action: string, task: () => Promise<void>, successMessage: string) => {
    setBusy(action);
    try {
      await task();
      toast.success(successMessage);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo completar la acción.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="¿Qué deseas hacer con tu proyecto?"
      description="El diagrama se exporta completo, aunque no quepa en la pantalla."
      footer={
        <Button variant="ghost" onClick={onClose}>
          <PenLine className="h-4 w-4" />
          Continuar editando
        </Button>
      }
    >
      <div className="space-y-2.5">
        <ExportOption
          icon={FileText}
          title="Descargar en PDF"
          description="Hoja horizontal con encabezado, autoría y fecha de elaboración."
          locked={!canExportPdf}
          lockedHint="Disponible desde el plan Premium."
          loading={busy === 'pdf'}
          onClick={() => {
            if (!canExportPdf) {
              toast.info('La exportación en PDF está incluida en el plan Premium.', {
                action: { label: 'Ver planes', onClick: () => navigate('/planes') },
              });
              return;
            }
            void run('pdf', () => exportDiagramAsPdf(nodes(), meta), 'PDF descargado.');
          }}
        />

        <ExportOption
          icon={FileImage}
          title="Descargar como imagen"
          description="Archivo PNG de alta resolución, ideal para insertar en un informe."
          loading={busy === 'png'}
          onClick={() => void run('png', () => exportDiagramAsPng(nodes(), meta), 'Imagen descargada.')}
        />

        <ExportOption
          icon={CloudUpload}
          title="Guardar en la plataforma"
          description="Conserva los cambios en tu biblioteca de proyectos."
          loading={busy === 'save'}
          onClick={() => void run('save', onSaveToPlatform, 'Proyecto guardado.')}
        />
      </div>
    </Modal>
  );
}

function ExportOption({
  icon: Icon,
  title,
  description,
  onClick,
  loading = false,
  locked = false,
  lockedHint,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
  onClick: () => void;
  loading?: boolean;
  locked?: boolean;
  lockedHint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        'flex w-full items-center gap-4 rounded-xl border border-slate-200 px-4 py-3.5 text-left transition-colors',
        'hover:border-brand-400 hover:bg-brand-50 disabled:opacity-60',
      )}
    >
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
        ) : (
          <Icon className="h-5 w-5" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 font-semibold text-slate-800">
          {title}
          {locked && <Lock className="h-3.5 w-3.5 text-accent-600" />}
        </span>
        <span className="block text-sm text-slate-500">
          {locked && lockedHint ? lockedHint : description}
        </span>
      </span>
    </button>
  );
}
