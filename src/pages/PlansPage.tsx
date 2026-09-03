import { useState } from 'react';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/app/contexts/useAuth';
import { Button } from '@/components/ui/Button';
import { PLANS, type PlanId } from '@/configs/plans';
import { cn } from '@/lib/utils';

export function PlansPage() {
  const { user, selectPlan } = useAuth();
  const [busy, setBusy] = useState<PlanId | null>(null);

  const handleSelect = async (planId: PlanId) => {
    setBusy(planId);
    try {
      await selectPlan(planId);
      toast.success('Plan actualizado.');
    } catch {
      toast.error('No se pudo cambiar el plan.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <header className="text-center">
        <h1 className="font-display text-3xl font-bold">Planes de uso</h1>
        <p className="mx-auto mt-2 max-w-2xl text-slate-600">
          Un plan gratuito para empezar, una suscripción para quien trabaja a diario y licencias
          para instituciones.
        </p>
      </header>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = user?.plan === plan.id;
          const isFeatured = plan.id === 'premium';

          return (
            <article
              key={plan.id}
              className={cn(
                'flex flex-col rounded-2xl border p-6',
                isFeatured
                  ? 'border-brand-600 bg-white shadow-lg ring-1 ring-brand-600'
                  : 'border-slate-200 bg-white',
              )}
            >
              {isFeatured && (
                <span className="mb-3 w-fit rounded-full bg-brand-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  El más completo
                </span>
              )}

              <h2 className="font-display text-xl font-bold">{plan.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{plan.audience}</p>

              <p className="mt-4">
                <span className="font-display text-3xl font-extrabold text-slate-900">
                  {plan.price}
                </span>
                <span className="ml-1.5 text-sm text-slate-500">{plan.priceHint}</span>
              </p>

              <p className="mt-3 text-sm leading-relaxed text-slate-600">{plan.summary}</p>

              <ul className="mt-5 flex-1 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-sm text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className="mt-6 w-full"
                variant={isCurrent ? 'outline' : isFeatured ? 'primary' : 'secondary'}
                disabled={isCurrent}
                loading={busy === plan.id}
                onClick={() => void handleSelect(plan.id)}
              >
                {isCurrent ? 'Plan actual' : 'Activar este plan'}
              </Button>
            </article>
          );
        })}
      </div>

      <p className="mx-auto mt-8 max-w-2xl rounded-xl bg-amber-50 px-4 py-3 text-center text-xs leading-relaxed text-amber-800">
        En esta versión de demostración no hay pasarela de pago: al activar un plan se aplican sus
        límites de inmediato para poder mostrar cómo se comporta el modelo freemium.
      </p>
    </div>
  );
}
