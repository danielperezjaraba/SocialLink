import { cn } from '@/lib/utils';
import { BRAND } from '@/configs/brand';

type LogoProps = {
  className?: string;
  showWordmark?: boolean;
  tone?: 'brand' | 'light';
};

/**
 * La marca reutiliza el lenguaje gráfico de la disciplina: el cuadrado y el
 * círculo del genograma unidos por una línea de vínculo.
 */
export function Logo({ className, showWordmark = true, tone = 'brand' }: LogoProps) {
  const wordmarkColor = tone === 'light' ? 'text-white' : 'text-slate-900';

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 64 64" className="h-9 w-9 shrink-0" aria-hidden>
        <rect width="64" height="64" rx="16" fill="#178578" />
        <line x1="24" y1="24" x2="42" y2="24" stroke="#eefbf8" strokeWidth="3" strokeLinecap="round" />
        <line x1="24" y1="44" x2="42" y2="44" stroke="#eefbf8" strokeWidth="3" strokeLinecap="round" />
        <line x1="33" y1="24" x2="33" y2="44" stroke="#eefbf8" strokeWidth="3" strokeLinecap="round" />
        <rect x="12" y="17" width="14" height="14" rx="3" fill="#eefbf8" />
        <circle cx="45" cy="24" r="7" fill="#f0a04b" />
        <rect x="12" y="37" width="14" height="14" rx="3" fill="#eefbf8" />
        <circle cx="45" cy="44" r="7" fill="#eefbf8" />
      </svg>
      {showWordmark && (
        <span className={cn('font-display text-xl font-extrabold tracking-tight', wordmarkColor)}>
          {BRAND.name}
        </span>
      )}
    </span>
  );
}
