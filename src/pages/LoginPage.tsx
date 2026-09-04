import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthShell } from '@/app/layouts/AuthShell';
import { useAuth } from '@/app/contexts/useAuth';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';

const schema = yup.object({
  email: yup.string().required('Escribe tu correo.').email('El correo no tiene un formato válido.'),
  password: yup.string().required('Escribe tu contraseña.'),
});

type FormValues = yup.InferType<typeof schema>;

export function LoginPage() {
  const { signIn, exploreAsGuest } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: yupResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signIn(values.email, values.password);
      navigate('/panel');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo iniciar sesión.');
    }
  });

  const handleExplore = async () => {
    await exploreAsGuest();
    navigate('/panel');
  };

  return (
    <AuthShell
      title="Iniciar sesión"
      subtitle="Entra para continuar con tus proyectos de diagnóstico."
      footer={
        <>
          ¿Todavía no tienes cuenta?{' '}
          <Link to="/registro" className="font-semibold text-brand-700 hover:underline">
            Crear cuenta
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="Correo electrónico" error={errors.email?.message} required>
          <Input
            type="email"
            autoComplete="email"
            placeholder="nombre@correo.com"
            {...register('email')}
          />
        </Field>

        <Field label="Contraseña" error={errors.password?.message} required>
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password')}
          />
        </Field>

        <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
          Entrar
        </Button>

        <Button type="button" variant="ghost" className="w-full" onClick={handleExplore}>
          Explorar gratis, sin cuenta
        </Button>
      </form>
    </AuthShell>
  );
}
