import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/app/contexts/useAuth';
import { Button } from '@/components/ui/Button';
import { getCatalog } from '@/features/editor/catalogs';
import { SymbolPreview } from '@/features/editor/components/Previews';
import { createProject, PlanLimitError } from '@/services/projectService';
import { listTemplates, type Template } from '@/services/templateService';

export function TemplatesPage() {
  const { user, plan } = useAuth();
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState<string | null>(null);

  const useTemplate = async (template: Template) => {
    if (!user) return;

    if (template.isPremium && !plan.limits.allTemplates) {
      toast.info('Esta plantilla está incluida en el plan Premium.', {
        action: { label: 'Ver planes', onClick: () => navigate('/planes') },
      });
      return;
    }

    setBusyId(template.id);
    try {
      const project = await createProject(user, {
        name: template.name,
        kind: template.kind,
        description: template.description,
        diagram: template.build(),
      });
      navigate(`/editor/${project.id}`);
    } catch (error) {
      if (error instanceof PlanLimitError) {
        toast.error(error.message, {
          action: { label: 'Ver planes', onClick: () => navigate('/planes') },
        });
      } else {
        toast.error('No se pudo crear el proyecto a partir de la plantilla.');
      }
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <header>
        <h1 className="font-display text-3xl font-bold">Plantillas</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Esquemas ya armados con las composiciones familiares más frecuentes. Se abren en el editor
          y puedes modificarlos por completo.
        </p>
      </header>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {listTemplates().map((template) => {
          const locked = template.isPremium && !plan.limits.allTemplates;
          const preview = template.build();

          return (
            <li key={template.id} className="surface-card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                    {getCatalog(template.kind).name}
                  </span>
                  <h2 className="mt-2.5 flex items-center gap-1.5 font-semibold text-slate-900">
                    {template.name}
                    {locked && <Lock className="h-3.5 w-3.5 text-accent-600" />}
                  </h2>
                </div>

                <div className="flex -space-x-1.5">
                  {preview.nodes.slice(0, 4).map((node) => (
                    <SymbolPreview
                      key={node.id}
                      shape={node.data.shape}
                      deceased={node.data.deceased}
                      className="h-8 w-8"
                    />
                  ))}
                </div>
              </div>

              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                {template.description}
              </p>

              <p className="mt-3 text-xs text-slate-400">
                {preview.nodes.length} elementos · {preview.edges.length} vínculos
              </p>

              <Button
                className="mt-4 w-fit"
                size="sm"
                variant={locked ? 'outline' : 'primary'}
                loading={busyId === template.id}
                onClick={() => void useTemplate(template)}
              >
                {locked ? 'Disponible en Premium' : 'Usar esta plantilla'}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
