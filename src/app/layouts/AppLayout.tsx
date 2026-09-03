import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FolderOpen,
  LayoutGrid,
  LogOut,
  Sparkles,
  UserRound,
  Wallet,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/app/contexts/useAuth';
import { PROFILE_LABELS } from '@/services/types';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/panel', label: 'Panel principal', icon: LayoutGrid },
  { to: '/proyectos', label: 'Mis proyectos', icon: FolderOpen },
  { to: '/plantillas', label: 'Plantillas', icon: Sparkles },
  { to: '/tutoriales', label: 'Tutoriales', icon: BookOpen },
  { to: '/planes', label: 'Planes de uso', icon: Wallet },
  { to: '/perfil', label: 'Mi perfil', icon: UserRound },
];

export function AppLayout() {
  const { user, plan, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="px-5 py-5">
          <NavLink to="/panel">
            <Logo />
          </NavLink>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-800'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )
              }
            >
              <Icon className="h-4.5 w-4.5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <div className="rounded-xl bg-slate-50 px-3 py-3">
            <p className="truncate text-sm font-semibold text-slate-800">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">
              {user ? PROFILE_LABELS[user.profile] : ''}
            </p>
            <span className="mt-2 inline-flex rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-semibold text-brand-800">
              {plan.name}
            </span>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <LogOut className="h-4.5 w-4.5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <NavLink to="/panel">
            <Logo />
          </NavLink>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 lg:hidden">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium',
                  isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600',
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
