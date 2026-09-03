import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Compass,
  FileDown,
  GitBranch,
  GraduationCap,
  Layers,
  MousePointerClick,
  Presentation,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button, buttonStyles } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { Parallax } from '@/components/motion/Parallax';
import { Reveal } from '@/components/motion/Reveal';
import { useAuth } from '@/app/contexts/useAuth';
import { BRAND } from '@/configs/brand';
import { PLANS } from '@/configs/plans';
import { getCatalog, TOOL_KINDS } from '@/features/editor/catalogs';
import { RELATIONS } from '@/features/editor/catalogs/relations';
import { RelationPreview, SymbolPreview } from '@/features/editor/components/Previews';
import { useScrolled } from '@/lib/motion';
import { cn } from '@/lib/utils';

const TOOL_ICONS = { genograma: GitBranch, familiograma: Layers, ecomapa: Compass };

const STATS = [
  { value: '3', label: 'instrumentos en un mismo editor' },
  { value: '11', label: 'tipos de vínculo con su trazo propio' },
  { value: '2', label: 'formatos de exportación: PDF e imagen' },
  { value: '0', label: 'hojas de papel para archivar' },
];

const AUDIENCES = [
  {
    icon: GraduationCap,
    title: 'Estudiantes',
    description:
      'Entrega diagramas legibles y con las convenciones correctas, sin pelear con un programa de diseño que no fue hecho para esto.',
  },
  {
    icon: Presentation,
    title: 'Docentes',
    description:
      'Prepara ejemplos de clase en minutos y revisa el trabajo de tus grupos sobre un lenguaje gráfico compartido.',
  },
  {
    icon: ShieldCheck,
    title: 'Profesionales',
    description:
      'Levanta el diagnóstico durante la visita y guarda cada caso con su historia de cambios y su exportación lista.',
  },
];

export function LandingPage() {
  const { user, exploreAsGuest } = useAuth();
  const navigate = useNavigate();
  const scrolled = useScrolled(20);
  const [exploring, setExploring] = useState(false);

  const handleExplore = async () => {
    setExploring(true);
    try {
      await exploreAsGuest();
      navigate('/panel');
    } catch {
      toast.error('No se pudo iniciar la exploración.');
      setExploring(false);
    }
  };

  return (
    <div className="overflow-x-clip bg-white">
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          scrolled ? 'border-b border-slate-200/80 bg-white/85 backdrop-blur-lg' : 'bg-transparent',
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />

          <nav className="hidden items-center gap-7 md:flex">
            <a href="#herramientas" className="text-sm font-medium text-slate-600 hover:text-brand-700">
              Herramientas
            </a>
            <a href="#como-funciona" className="text-sm font-medium text-slate-600 hover:text-brand-700">
              Cómo funciona
            </a>
            <a href="#planes" className="text-sm font-medium text-slate-600 hover:text-brand-700">
              Planes
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/panel" className={buttonStyles('primary', 'sm')}>
                Ir a mi panel
              </Link>
            ) : (
              <>
                <Link to="/ingresar" className={buttonStyles('ghost', 'sm')}>
                  Iniciar sesión
                </Link>
                <Link to="/registro" className={buttonStyles('primary', 'sm')}>
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <Hero exploring={exploring} onExplore={handleExplore} />
      <StatsStrip />
      <ContrastSection />
      <ToolsSection />
      <HowItWorks />
      <AudienceSection />
      <PlansPreview />
      <ClosingCta exploring={exploring} onExplore={handleExplore} />
      <SiteFooter />
    </div>
  );
}

function Hero({ exploring, onExplore }: { exploring: boolean; onExplore: () => void }) {
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div className="aurora absolute inset-0 -z-20" />
      <div className="grid-paper absolute inset-0 -z-20 opacity-60" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-white" />

      <FloatingSymbols />

      <div className="mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-brand-700 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Tecnología educativa para Trabajo Social
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 font-display text-4xl leading-[1.08] font-extrabold text-slate-900 sm:text-6xl">
              Conecta, comprende y{' '}
              <span className="relative inline-block">
                <span className="relative z-10">representa</span>
                <span className="absolute inset-x-0 bottom-1.5 -z-0 h-3 bg-accent-300/70 sm:bottom-2 sm:h-4" />
              </span>{' '}
              tu realidad social.
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              {BRAND.description}
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/registro" className={buttonStyles('primary', 'lg')}>
                Crear cuenta
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/ingresar" className={buttonStyles('outline', 'lg')}>
                Iniciar sesión
              </Link>
              <Button variant="ghost" size="lg" onClick={onExplore} loading={exploring}>
                Explorar gratis
              </Button>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <p className="mt-5 flex items-center gap-2 text-sm text-slate-500">
              <MousePointerClick className="h-4 w-4 text-brand-600" />
              Explorar gratis entra directo al editor, sin registro y sin tarjeta.
            </p>
          </Reveal>
        </div>

        <Parallax speed={0.06}>
          <Reveal delay={200}>
            <HeroDiagram />
          </Reveal>
        </Parallax>
      </div>
    </section>
  );
}

/** Símbolos de la disciplina flotando al fondo, cada uno a su propia velocidad. */
function FloatingSymbols() {
  const pieces = [
    { shape: 'male' as const, className: 'left-[4%] top-[18%] h-16 w-16', speed: 0.22, delay: '0s' },
    { shape: 'female' as const, className: 'right-[6%] top-[12%] h-20 w-20', speed: 0.34, delay: '1.4s' },
    { shape: 'unknown' as const, className: 'left-[12%] bottom-[14%] h-14 w-14', speed: -0.18, delay: '0.7s' },
    { shape: 'resource' as const, className: 'right-[14%] bottom-[10%] h-16 w-24', speed: 0.26, delay: '2.1s' },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 hidden lg:block" aria-hidden>
      {pieces.map((piece, index) => (
        <Parallax
          key={index}
          speed={piece.speed}
          className={cn('absolute opacity-45', piece.className)}
        >
          <div className="float-soft" style={{ animationDelay: piece.delay }}>
            <SymbolPreview shape={piece.shape} className="h-full w-full drop-shadow-sm" />
          </div>
        </Parallax>
      ))}
    </div>
  );
}

/** Genograma que se dibuja solo al cargar la portada. */
function HeroDiagram() {
  return (
    <div className="relative rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)] backdrop-blur-xl">
      <div className="grid-paper absolute inset-0 rounded-3xl opacity-70" />

      <svg viewBox="0 0 420 330" className="relative w-full">
        <g fill="none" strokeLinecap="round">
          <line x1="132" y1="72" x2="288" y2="72" stroke="#334155" strokeWidth="3" className="svg-draw" style={{ animationDelay: '0.5s' }} />
          <line x1="210" y1="72" x2="210" y2="132" stroke="#64748b" strokeWidth="2" className="svg-draw" style={{ animationDelay: '0.9s' }} />
          <line x1="118" y1="132" x2="302" y2="132" stroke="#64748b" strokeWidth="2" className="svg-draw" style={{ animationDelay: '1.05s' }} />
          <line x1="118" y1="132" x2="118" y2="190" stroke="#64748b" strokeWidth="2" className="svg-draw" style={{ animationDelay: '1.2s' }} />
          <line x1="302" y1="132" x2="302" y2="190" stroke="#64748b" strokeWidth="2" className="svg-draw" style={{ animationDelay: '1.2s' }} />
          <line x1="152" y1="226" x2="270" y2="226" stroke="#178578" strokeWidth="3" className="svg-draw" style={{ animationDelay: '1.5s' }} />
          <line x1="152" y1="234" x2="270" y2="234" stroke="#178578" strokeWidth="3" className="svg-draw" style={{ animationDelay: '1.6s' }} />
        </g>

        <g className="svg-pop" style={{ animationDelay: '0.15s' }}>
          <rect x="88" y="40" width="64" height="64" rx="5" fill="white" stroke="#334155" strokeWidth="3" />
          <text x="120" y="78" textAnchor="middle" className="fill-slate-600 text-[18px] font-semibold">46</text>
        </g>

        <g className="svg-pop" style={{ animationDelay: '0.3s' }}>
          <circle cx="290" cy="72" r="32" fill="white" stroke="#334155" strokeWidth="3" />
          <text x="290" y="78" textAnchor="middle" className="fill-slate-600 text-[18px] font-semibold">43</text>
        </g>

        <g className="svg-pop" style={{ animationDelay: '1.75s' }}>
          <rect x="86" y="192" width="64" height="64" rx="5" fill="#eefbf8" stroke="#178578" strokeWidth="3" />
          <text x="118" y="230" textAnchor="middle" className="fill-slate-600 text-[18px] font-semibold">17</text>
        </g>

        <g className="svg-pop" style={{ animationDelay: '1.9s' }}>
          <circle cx="302" cy="224" r="32" fill="white" stroke="#334155" strokeWidth="3" />
          <text x="302" y="230" textAnchor="middle" className="fill-slate-600 text-[18px] font-semibold">12</text>
        </g>

        <g className="svg-pop" style={{ animationDelay: '2.1s' }}>
          <text x="118" y="282" textAnchor="middle" className="fill-slate-700 text-[13px] font-semibold">Hijo</text>
          <text x="302" y="282" textAnchor="middle" className="fill-slate-700 text-[13px] font-semibold">Hija</text>
          <text x="210" y="312" textAnchor="middle" className="fill-brand-700 text-[12px] font-semibold">
            vínculo fuerte entre hermanos
          </text>
        </g>
      </svg>
    </div>
  );
}

function StatsStrip() {
  return (
    <section className="border-y border-slate-200 bg-slate-900">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 90}>
            <p className="font-display text-4xl font-extrabold text-white">{stat.value}</p>
            <p className="mt-1.5 text-sm leading-snug text-slate-400">{stat.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ContrastSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          El diagnóstico merece una herramienta propia
        </h2>
        <p className="mt-4 text-slate-600">
          El genograma no es un dibujo: es un instrumento clínico que revela patrones
          intergeneracionales. Merece algo mejor que una regla o un editor de presentaciones.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        <Reveal delay={80}>
          <article className="h-full rounded-2xl border border-slate-200 bg-slate-50 p-7">
            <h3 className="font-display text-lg font-bold text-slate-500">Como se hace hoy</h3>
            <ul className="mt-5 space-y-3">
              {[
                'Se dibuja a mano y hay que rehacerlo entero ante cualquier corrección.',
                'Cada quien usa símbolos distintos y la lectura se vuelve ambigua.',
                'La información vive en el papel, no en un archivo que se pueda consultar.',
                'Compartirlo obliga a fotografiar la hoja o a escanearla.',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-slate-600">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </Reveal>

        <Reveal delay={160}>
          <article className="relative h-full overflow-hidden rounded-2xl border border-brand-600 bg-brand-800 p-7 text-brand-50">
            <div className="aurora absolute inset-0 opacity-40" />
            <div className="relative">
              <h3 className="font-display text-lg font-bold text-white">Con {BRAND.name}</h3>
              <ul className="mt-5 space-y-3">
                {[
                  'Arrastras el símbolo correcto y lo corriges las veces que haga falta.',
                  'Las convenciones vienen definidas: cada trazo significa siempre lo mismo.',
                  'Cada figura guarda nombre, edad, ocupación y observaciones del caso.',
                  'Exportas en PDF o imagen y lo adjuntas al informe en un clic.',
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-brand-100">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}

function ToolsSection() {
  return (
    <section id="herramientas" className="relative overflow-hidden border-y border-slate-200 bg-slate-50 py-24">
      <div className="grid-paper absolute inset-0 opacity-50" />

      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Tres herramientas, un solo editor
          </h2>
          <p className="mt-4 text-slate-600">
            Comparten el mismo lienzo, pero cada una trae sus propios símbolos y sus propios tipos de
            vínculo.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {TOOL_KINDS.map((kind, index) => {
            const catalog = getCatalog(kind);
            const Icon = TOOL_ICONS[kind];

            return (
              <Reveal key={kind} delay={index * 110}>
                <article className="group h-full rounded-2xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-xl">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white">
                    <Icon className="h-5.5 w-5.5" />
                  </span>

                  <h3 className="mt-5 font-display text-xl font-bold">{catalog.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-brand-700">{catalog.tagline}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{catalog.description}</p>

                  <div className="mt-6 flex flex-wrap gap-1.5 border-t border-slate-100 pt-5">
                    {catalog.symbols.slice(0, 5).map((symbol) => (
                      <SymbolPreview
                        key={symbol.id}
                        shape={symbol.shape}
                        deceased={symbol.defaults?.deceased}
                        className="h-7 w-7"
                      />
                    ))}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      title: 'Arrastra los símbolos',
      detail:
        'El panel izquierdo trae el lenguaje gráfico de la disciplina: cuadrado para hombre, círculo para mujer, rombo cuando falta el dato, triángulo para el embarazo.',
      visual: <MockPalette />,
    },
    {
      title: 'Registra la información',
      detail:
        'Al seleccionar una persona se abre su ficha: nombre, edad, sexo, fecha de nacimiento, ocupación y observaciones. El diagrama guarda datos, no solo formas.',
      visual: <MockInspector />,
    },
    {
      title: 'Marca la calidad del vínculo',
      detail:
        'Una barra para la separación, dos para el divorcio, línea doble para el vínculo fuerte, zigzag para el conflictivo y flecha para el estresante.',
      visual: <MockRelations />,
    },
    {
      title: 'Exporta y entrega',
      detail:
        'Descarga el diagrama completo en PDF con encabezado, autoría y fecha, o como imagen de alta resolución para insertarla en tu informe.',
      visual: <MockExport />,
    },
  ];

  return (
    <section id="como-funciona" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Del caso al informe</h2>
        <p className="mt-4 text-slate-600">
          Cuatro momentos que resumen todo el trabajo dentro de la plataforma.
        </p>
      </Reveal>

      <div className="mt-16 space-y-20">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className={cn(
              'grid items-center gap-10 lg:grid-cols-2',
              index % 2 === 1 && 'lg:[&>*:first-child]:order-2',
            )}
          >
            <Reveal delay={60}>
              <span className="font-display text-6xl font-extrabold text-slate-100">
                0{index + 1}
              </span>
              <h3 className="-mt-6 font-display text-2xl font-bold">{step.title}</h3>
              <p className="mt-3 max-w-md leading-relaxed text-slate-600">{step.detail}</p>
            </Reveal>

            <Parallax speed={index % 2 === 0 ? 0.05 : -0.05}>
              <Reveal delay={140}>{step.visual}</Reveal>
            </Parallax>
          </div>
        ))}
      </div>
    </section>
  );
}

function MockFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_-24px_rgba(15,23,42,0.35)]">
      <div className="flex items-center gap-1.5 border-b border-slate-100 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        <span className="ml-2 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
          {title}
        </span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function MockPalette() {
  const symbols = getCatalog('genograma').symbols;

  return (
    <MockFrame title="Elementos">
      <div className="grid grid-cols-3 gap-2">
        {symbols.map((symbol) => (
          <div
            key={symbol.id}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 px-2 py-3 transition-colors hover:border-brand-400 hover:bg-brand-50"
          >
            <SymbolPreview
              shape={symbol.shape}
              deceased={symbol.defaults?.deceased}
              className="h-8 w-8"
            />
            <span className="text-[10px] leading-tight font-medium text-slate-600">
              {symbol.label}
            </span>
          </div>
        ))}
      </div>
    </MockFrame>
  );
}

function MockInspector() {
  const rows = [
    ['Nombre', 'María Pérez'],
    ['Edad', '43'],
    ['Sexo', 'Femenino'],
    ['Ocupación', 'Docente'],
  ];

  return (
    <MockFrame title="Información de la persona">
      <div className="space-y-2.5">
        {rows.map(([label, value]) => (
          <div key={label}>
            <p className="text-[11px] font-medium text-slate-500">{label}</p>
            <p className="mt-0.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-800">
              {value}
            </p>
          </div>
        ))}
        <div>
          <p className="text-[11px] font-medium text-slate-500">Observaciones</p>
          <p className="mt-0.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm leading-snug text-slate-600">
            Cuidadora principal del hogar. Jornada extendida.
          </p>
        </div>
      </div>
    </MockFrame>
  );
}

function MockRelations() {
  const ids = ['union', 'separation', 'divorce', 'strong', 'conflictive', 'stressful', 'none'] as const;

  return (
    <MockFrame title="Tipo de vínculo">
      <div className="space-y-1">
        {ids.map((id, index) => (
          <div
            key={id}
            className={cn(
              'flex items-center gap-3 rounded-lg border px-2.5 py-2',
              index === 4 ? 'border-brand-500 bg-brand-50' : 'border-transparent',
            )}
          >
            <RelationPreview relation={RELATIONS[id]} />
            <span className="text-xs font-medium text-slate-600">{RELATIONS[id].label}</span>
          </div>
        ))}
      </div>
    </MockFrame>
  );
}

function MockExport() {
  const options = [
    { title: 'Descargar en PDF', detail: 'Hoja horizontal con encabezado y fecha' },
    { title: 'Descargar como imagen', detail: 'PNG de alta resolución' },
    { title: 'Guardar en la plataforma', detail: 'Queda en tu biblioteca de proyectos' },
  ];

  return (
    <MockFrame title="¿Qué deseas hacer con tu proyecto?">
      <div className="space-y-2">
        {options.map((option) => (
          <div
            key={option.title}
            className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 transition-colors hover:border-brand-400 hover:bg-brand-50"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <FileDown className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-slate-800">{option.title}</span>
              <span className="block text-[11px] text-slate-500">{option.detail}</span>
            </span>
          </div>
        ))}
      </div>
    </MockFrame>
  );
}

function AudienceSection() {
  return (
    <section className="border-y border-slate-200 bg-slate-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Pensada para quien la usa</h2>
          <p className="mt-4 text-slate-600">
            Del aula a la visita domiciliaria, el mismo lenguaje gráfico y el mismo archivo.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {AUDIENCES.map(({ icon: Icon, title, description }, index) => (
            <Reveal key={title} delay={index * 110}>
              <article className="h-full rounded-2xl border border-slate-200 bg-white p-7">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-100 text-accent-600">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold">{title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlansPreview() {
  return (
    <section id="planes" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Empieza gratis, crece después</h2>
        <p className="mt-4 text-slate-600">
          Un plan libre para conocer la plataforma, una suscripción para el uso continuo y licencias
          para universidades e instituciones.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {PLANS.map((plan, index) => {
          const featured = plan.id === 'premium';

          return (
            <Reveal key={plan.id} delay={index * 110}>
              <article
                className={cn(
                  'flex h-full flex-col rounded-2xl border p-7 transition-transform duration-300 hover:-translate-y-1',
                  featured
                    ? 'border-brand-600 bg-brand-800 text-brand-50 shadow-xl'
                    : 'border-slate-200 bg-white',
                )}
              >
                {featured && (
                  <span className="mb-3 w-fit rounded-full bg-accent-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                    El más completo
                  </span>
                )}

                <h3
                  className={cn(
                    'font-display text-xl font-bold',
                    featured ? 'text-white' : 'text-slate-900',
                  )}
                >
                  {plan.name}
                </h3>
                <p className={cn('mt-1 text-sm', featured ? 'text-brand-200' : 'text-slate-500')}>
                  {plan.audience}
                </p>

                <p className="mt-5">
                  <span
                    className={cn(
                      'font-display text-3xl font-extrabold',
                      featured ? 'text-white' : 'text-slate-900',
                    )}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={cn('ml-1.5 text-sm', featured ? 'text-brand-200' : 'text-slate-500')}
                  >
                    {plan.priceHint}
                  </span>
                </p>

                <ul className="mt-6 flex-1 space-y-2">
                  {plan.features.slice(0, 5).map((feature) => (
                    <li
                      key={feature}
                      className={cn(
                        'flex gap-2 text-sm',
                        featured ? 'text-brand-100' : 'text-slate-700',
                      )}
                    >
                      <Check
                        className={cn(
                          'mt-0.5 h-4 w-4 shrink-0',
                          featured ? 'text-accent-300' : 'text-brand-600',
                        )}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/registro"
                  className={cn(
                    'mt-7 w-full',
                    featured
                      ? 'inline-flex h-11 items-center justify-center rounded-xl bg-white font-medium text-brand-800 transition-colors hover:bg-brand-50'
                      : buttonStyles('outline', 'md'),
                  )}
                >
                  Comenzar
                </Link>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function ClosingCta({ exploring, onExplore }: { exploring: boolean; onExplore: () => void }) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-900 py-24">
      <div className="aurora absolute inset-0 opacity-70" />
      <div className="grid-paper absolute inset-0 opacity-20" />

      <Reveal className="relative mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-display text-3xl font-extrabold text-white sm:text-5xl">
          Tu próximo diagnóstico empieza aquí
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-brand-100">
          Abre el editor, arrastra el primer símbolo y comprueba en cinco minutos la diferencia con
          el papel.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            to="/registro"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-7 font-semibold text-brand-800 transition-colors hover:bg-brand-50"
          >
            Crear cuenta
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={onExplore}
            loading={exploring}
            className="border-white/40 bg-transparent text-white hover:border-white hover:bg-white/10 hover:text-white"
          >
            Explorar gratis
          </Button>
        </div>
      </Reveal>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-slate-900 py-14 text-slate-300">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="max-w-sm">
            <Logo tone="light" />
            <p className="mt-4 text-sm leading-relaxed text-slate-400">{BRAND.tagline}</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-slate-200">Plataforma</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#herramientas" className="hover:text-white">
                    Herramientas
                  </a>
                </li>
                <li>
                  <a href="#como-funciona" className="hover:text-white">
                    Cómo funciona
                  </a>
                </li>
                <li>
                  <a href="#planes" className="hover:text-white">
                    Planes de uso
                  </a>
                </li>
                <li>
                  <Link to="/registro" className="hover:text-white">
                    Crear cuenta
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-200">Proyecto académico</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Corporación Universitaria del Caribe — CECAR
                <br />
                Facultad de Ciencias Humanas y Educación
                <br />
                Programa de Trabajo Social
                <br />
                Sincelejo, 2026
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-6 text-xs text-slate-500">
          <p>Yicela Acosta Buelvas · Mishell Dayana Rueda Lascano · Lida Eugenia Pérez López</p>
        </div>
      </div>
    </footer>
  );
}
