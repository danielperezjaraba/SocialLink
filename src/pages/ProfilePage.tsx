import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/app/contexts/useAuth';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Field';
import { countProjects } from '@/services/projectService';
import { PROFILE_LABELS, type UserProfile } from '@/services/types';
import { formatDate } from '@/lib/utils';

export function ProfilePage() {
  const { user, plan, updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [profile, setProfile] = useState<UserProfile>('estudiante');
  const [institution, setInstitution] = useState('');
  const [projectCount, setProjectCount] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setProfile(user.profile);
    setInstitution(user.institution);
  }, [user]);

  const refreshCount = useCallback(async () => {
    if (!user) return;
    setProjectCount(await countProjects(user.id));
  }, [user]);

  useEffect(() => {
    void refreshCount();
  }, [refreshCount]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name, profile, institution });
      toast.success('Perfil actualizado.');
    } catch {
      toast.error('No se pudo actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const limit = plan.limits.maxProjects;

  return (
    <div className="mx-auto max-w-3xl">
      <header>
        <h1 className="font-display text-3xl font-bold">Mi perfil</h1>
        <p className="mt-2 text-slate-600">Tus datos y el estado de tu plan.</p>
      </header>

      {user.isGuest && (
        <div className="mt-6 rounded-xl border border-accent-300 bg-accent-100 px-4 py-3 text-sm text-amber-900">
          Estás explorando sin cuenta. Tus proyectos se guardan solo en este navegador.{' '}
          <Link to="/registro" className="font-semibold underline">
            Crea una cuenta
          </Link>{' '}
          para conservarlos con tu nombre.
        </div>
      )}

      <section className="surface-card mt-6 p-6">
        <h2 className="font-display text-lg font-bold">Datos personales</h2>

        <div className="mt-5 space-y-4">
          <Field label="Nombre">
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </Field>

          <Field label="Correo electrónico" hint="El correo no se puede modificar.">
            <Input value={user.email} disabled />
          </Field>

          <Field label="Perfil">
            <Select
              value={profile}
              onChange={(event) => setProfile(event.target.value as UserProfile)}
            >
              {(Object.keys(PROFILE_LABELS) as UserProfile[]).map((option) => (
                <option key={option} value={option}>
                  {PROFILE_LABELS[option]}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Institución">
            <Input
              value={institution}
              onChange={(event) => setInstitution(event.target.value)}
              placeholder="Ej. CECAR"
            />
          </Field>

          <Button onClick={handleSave} loading={saving}>
            Guardar cambios
          </Button>
        </div>
      </section>

      <section className="surface-card mt-5 p-6">
        <h2 className="font-display text-lg font-bold">Plan y almacenamiento</h2>

        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-slate-500">Plan actual</dt>
            <dd className="mt-0.5 font-semibold text-slate-800">{plan.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Proyectos</dt>
            <dd className="mt-0.5 font-semibold text-slate-800">
              {limit === null ? `${projectCount} (sin límite)` : `${projectCount} de ${limit}`}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Cuenta creada</dt>
            <dd className="mt-0.5 font-semibold text-slate-800">{formatDate(user.createdAt)}</dd>
          </div>
        </dl>

        <Link
          to="/planes"
          className="mt-5 inline-block text-sm font-medium text-brand-700 hover:underline"
        >
          Ver y cambiar de plan
        </Link>
      </section>

      <p className="mt-5 rounded-xl bg-slate-100 px-4 py-3 text-xs leading-relaxed text-slate-600">
        En esta versión de demostración la información se guarda únicamente en este navegador. No
        registres datos reales de familias hasta que la plataforma cuente con servidor y las
        garantías de tratamiento de datos personales correspondientes.
      </p>
    </div>
  );
}
