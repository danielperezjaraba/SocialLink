import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/contexts/useAuth';
import { Logo } from '@/components/ui/Logo';

function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <Logo showWordmark={false} className="animate-pulse" />
      <p className="text-sm text-slate-500">Cargando tu espacio de trabajo…</p>
    </div>
  );
}

/** Rutas que exigen una sesión activa, incluida la de exploración. */
export function RequireSession() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/ingresar" state={{ from: location.pathname }} replace />;
  return <Outlet />;
}

/** Rutas de entrada: si ya hay sesión, no tiene sentido volver a mostrarlas. */
export function RedirectIfSession() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/panel" replace />;
  return <Outlet />;
}
