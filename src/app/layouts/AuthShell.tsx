import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { BRAND } from '@/configs/brand';

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="flex min-h-screen">
      <div className="relative isolate hidden w-1/2 flex-col justify-between overflow-hidden bg-brand-900 p-12 text-brand-50 lg:flex">
        <div className="aurora absolute inset-0 -z-10 opacity-80" />
        <div className="grid-paper absolute inset-0 -z-10 opacity-25" />

        <Link to="/" className="relative">
          <Logo tone="light" />
        </Link>

        <div className="relative">
          <h2 className="font-display text-4xl leading-tight font-extrabold text-white">
            {BRAND.tagline}
          </h2>
          <p className="mt-5 max-w-md text-brand-100">{BRAND.description}</p>

          <svg viewBox="0 0 320 120" className="mt-10 w-64 opacity-90" aria-hidden>
            <line x1="52" y1="34" x2="196" y2="34" stroke="#a9eade" strokeWidth="2.5" />
            <line x1="124" y1="34" x2="124" y2="82" stroke="#79d9c8" strokeWidth="2" />
            <line x1="72" y1="82" x2="176" y2="82" stroke="#79d9c8" strokeWidth="2" />
            <rect x="28" y="14" width="40" height="40" rx="3" fill="none" stroke="#eefbf8" strokeWidth="2.5" />
            <circle cx="198" cy="34" r="20" fill="none" stroke="#eefbf8" strokeWidth="2.5" />
            <rect x="52" y="82" width="36" height="36" rx="3" fill="none" stroke="#f0a04b" strokeWidth="2.5" />
            <circle cx="176" cy="100" r="18" fill="none" stroke="#eefbf8" strokeWidth="2.5" />
          </svg>
        </div>

        <p className="relative text-xs text-brand-200">
          Corporación Universitaria del Caribe — CECAR · Programa de Trabajo Social
        </p>
      </div>

      <div className="flex w-full flex-col justify-center px-6 py-10 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="lg:hidden">
            <Logo />
          </Link>

          <h1 className="mt-8 font-display text-2xl font-bold lg:mt-0">{title}</h1>
          <p className="mt-1.5 text-sm text-slate-600">{subtitle}</p>

          <div className="mt-7">{children}</div>

          <div className="mt-6 text-center text-sm text-slate-600">{footer}</div>
        </div>
      </div>
    </div>
  );
}
