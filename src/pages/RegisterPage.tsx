import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthShell } from '@/app/layouts/AuthShell';
import { useAuth } from '@/app/contexts/useAuth';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { PROFILE_LABELS, type UserProfile } from '@/services/types';
import { cn } from '@/lib/utils';

const PROFILE_HINTS: Record<UserProfile, string> = {
  estudiante: 'Curso Trabajo Social o una disciplina afín.',
  docente: 'Acompaño asignaturas o prácticas profesionales.',
  profesional: 'Ejerzo en una institución o de forma independiente.',
};

const schema = yup.object({
  name: yup.string().required('Escribe tu nombre.').min(3, 'Escribe tu nombre completo.'),
  email: yup.string().required('Escribe tu correo.').email('El correo no tiene un formato válido.'),
  password: yup
    .string()
    .required('Crea una contraseña.')
    .min(6, 'Usa al menos 6 caracteres.'),
  profile: yup
    .mixed<UserProfile>()
    .oneOf(['estudiante', 'docente', 'profesional'])
    .required('Selecciona tu perfil.'),
  institution: yup.string().default(''),
});

type FormValues = yup.InferType<typeof schema>;

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { profile: 'estudiante', institution: '' },
  });

  const selectedProfile = watch('profile');

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signUp(values);
      toast.success('Cuenta creada. ¡Bienvenida a bordo!');
      navigate('/panel');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo crear la cuenta.');
    }
  });

  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Regístrate para guardar tus proyectos y exportarlos cuando los necesites."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/ingresar" className="font-semibold text-brand-700 hover:underline">
            Iniciar sesión
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="Nombre" error={errors.name?.message} required>
          <Input autoComplete="name" placeholder="Nombre y apellido" {...register('name')} />
        </Field>

        <Field label="Correo electrónico" error={errors.email?.message} required>
          <Input
            type="email"
            autoComplete="email"
            placeholder="nombre@correo.com"
            {...register('email')}
          />
        </Field>

        <Field
          label="Contraseña"
          error={errors.password?.message}
          hint="Mínimo 6 caracteres."
          required
        >
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...register('password')}
          />
        </Field>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Perfil <span className="text-brand-600">*</span>
          </span>
          <div className="space-y-2">
            {(Object.keys(PROFILE_LABELS) as UserProfile[]).map((profile) => (
              <button
                key={profile}
                type="button"
                onClick={() => setValue('profile', profile, { shouldValidate: true })}
                className={cn(
                  'w-full rounded-xl border px-3.5 py-3 text-left transition-colors',
                  selectedProfile === profile
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-slate-300 hover:border-slate-400',
                )}
              >
                <span className="block text-sm font-semibold text-slate-800">
                  {PROFILE_LABELS[profile]}
                </span>
                <span className="block text-xs text-slate-500">{PROFILE_HINTS[profile]}</span>
              </button>
            ))}
          </div>
        </div>

        <Field label="Institución" hint="Opcional. Universidad, entidad u organización.">
          <Input placeholder="Ej. CECAR" {...register('institution')} />
        </Field>

        <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
          Registrarme
        </Button>
      </form>
    </AuthShell>
  );
}
