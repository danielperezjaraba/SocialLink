import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/app/layouts/AppLayout';
import { RedirectIfSession, RequireSession } from '@/app/router/guards';
import { DashboardPage } from '@/pages/DashboardPage';
import { EditorPage } from '@/pages/EditorPage';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { PlansPage } from '@/pages/PlansPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { TemplatesPage } from '@/pages/TemplatesPage';
import { TutorialsPage } from '@/pages/TutorialsPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<RedirectIfSession />}>
        <Route path="/ingresar" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
      </Route>

      <Route element={<RequireSession />}>
        <Route element={<AppLayout />}>
          <Route path="/panel" element={<DashboardPage />} />
          <Route path="/proyectos" element={<ProjectsPage />} />
          <Route path="/plantillas" element={<TemplatesPage />} />
          <Route path="/tutoriales" element={<TutorialsPage />} />
          <Route path="/planes" element={<PlansPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Route>

        <Route path="/editor/:projectId" element={<EditorPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
