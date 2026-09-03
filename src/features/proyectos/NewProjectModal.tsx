import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/app/contexts/useAuth';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { getCatalog, TOOL_KINDS } from '@/features/editor/catalogs';
import { SymbolPreview } from '@/features/editor/components/Previews';
import type { ToolKind } from '@/features/editor/types';
import { createProject, PlanLimitError } from '@/services/projectService';
import { listTemplatesByKind } from '@/services/templateService';
import { cn } from '@/lib/utils';

type NewProjectModalProps = {
  open: boolean;
  onClose: () => void;
  defaultKind?: ToolKind;
};

export function NewProjectModal({ open, onClose, defaultKind = 'genograma' }: NewProjectModalProps) {
  const { user, plan } = useAuth();
  const navigate = useNavigate();

  const [kind, setKind] = useState<ToolKind>(defaultKind);
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState<string>('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) {
      setKind(defaultKind);
      setName('');
      setTemplateId('');
    }
  }, [open, defaultKind]);

  const templates = listTemplatesByKind(kind);

  const handleCreate = async () => {
    if (!user) return;
    setCreating(true);

    try {
      const template = templates.find((item) => item.id === templateId);
      const project = await createProject(user, {
        name: name.trim() || `${getCatalog(kind).name} sin título`,
        kind,
        diagram: template?.build(),
      });
      onClose();
      navigate(`/editor/${project.id}`);
    } catch (error) {
      if (error instanceof PlanLimitError) {
        toast.error(error.message, {
          action: { label: 'Ver planes', onClick: () => navigate('/planes') },
        });
      } else {
        toast.error('No se pudo crear el proyecto.');
      }
      setCreating(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo proyecto"
      description="Elige la herramienta, ponle nombre y decide si partes de una plantilla."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} loading={creating}>
            Crear y abrir editor
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <span className="mb-2 block text-sm font-medium text-slate-700">Herramienta</span>
          <div className="grid gap-2 sm:grid-cols-3">
            {TOOL_KINDS.map((toolKind) => {
              const catalog = getCatalog(toolKind);
              return (
                <button
                  key={toolKind}
                  type="button"
                  onClick={() => {
                    setKind(toolKind);
                    setTemplateId('');
                  }}
                  className={cn(
                    'rounded-xl border px-3 py-3 text-left transition-colors',
                    kind === toolKind
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-slate-300 hover:border-slate-400',
                  )}
                >
                  <span className="block text-sm font-semibold text-slate-800">{catalog.name}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">
                    {catalog.tagline}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Field label="Nombre del proyecto" hint="Por ejemplo: Genograma — Familia Pérez.">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={`${getCatalog(kind).name} — `}
          />
        </Field>

        <div>
          <span className="mb-2 block text-sm font-medium text-slate-700">Punto de partida</span>
          <div className="space-y-2">
            <TemplateOption
              selected={templateId === ''}
              title="Lienzo en blanco"
              description="Empieza solo con la persona índice y construye desde cero."
              onSelect={() => setTemplateId('')}
            />

            {templates.map((template) => {
              const locked = template.isPremium && !plan.limits.allTemplates;
              return (
                <TemplateOption
                  key={template.id}
                  selected={templateId === template.id}
                  title={template.name}
                  description={template.description}
                  locked={locked}
                  onSelect={() => {
                    if (locked) {
                      toast.info('Esta plantilla está incluida en el plan Premium.');
                      return;
                    }
                    setTemplateId(template.id);
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function TemplateOption({
  selected,
  title,
  description,
  locked = false,
  onSelect,
}: {
  selected: boolean;
  title: string;
  description: string;
  locked?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors',
        selected ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300',
        locked && 'opacity-70',
      )}
    >
      <SymbolPreview shape="female" className="h-8 w-8 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
          {title}
          {locked && <Lock className="h-3.5 w-3.5 text-accent-600" />}
        </span>
        <span className="block text-xs text-slate-500">{description}</span>
      </span>
    </button>
  );
}
