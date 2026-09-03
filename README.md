# SocialLink

Plataforma digital especializada para estudiantes, docentes y profesionales de Trabajo Social que
facilita la elaboración de herramientas de diagnóstico social: **genogramas**, **familiogramas** y
**ecomapas**.

> Conecta, comprende y representa tu realidad social.

Proyecto académico — Corporación Universitaria del Caribe (CECAR), Facultad de Ciencias Humanas y
Educación, Programa de Trabajo Social. Sincelejo, 2026.

---

## Cómo está armado

El proyecto tiene dos piezas que se ejecutan por separado:

| Pieza     | Carpeta   | Qué hace                                                        |
| --------- | --------- | --------------------------------------------------------------- |
| Aplicación | `src/`    | Lo que se ve en el navegador: pantallas y editor de diagramas    |
| API        | `server/` | Autenticación, proyectos y acceso a la base de datos PostgreSQL  |

La base de datos está alojada en **Supabase**, pero solo se usa como PostgreSQL: la autenticación y
las reglas de negocio son propias y viven en `server/`.

## Puesta en marcha

Requiere Node.js 20 o superior y una base de datos PostgreSQL.

### 1. La base de datos

Crea un proyecto en [supabase.com](https://supabase.com) y ejecuta `server/sql/schema.sql` en el
editor SQL, o desde DBeaver conectado a esa base. El script crea las cinco tablas, los tipos
enumerados y deja registrados los tres planes.

### 2. La API

```bash
npm run api:install   # instala las dependencias del servidor
npm run api:setup     # crea server/.env con una clave de firma nueva
```

Abre `server/.env` y pega la cadena de conexión en `DATABASE_URL`. La encuentras en Supabase, en
**Project Settings → Database → Session pooler**, en formato URI, reemplazando `[YOUR-PASSWORD]` por
la contraseña de la base.

```bash
npm run api           # levanta la API en http://localhost:4000
```

Si la conexión funciona, el arranque imprime la versión de PostgreSQL.

### 3. La aplicación

En otra terminal:

```bash
npm install
npm run dev           # http://localhost:5173
```

| Comando             | Descripción                                             |
| ------------------- | ------------------------------------------------------- |
| `npm run dev`       | Aplicación con recarga en caliente                      |
| `npm run build`     | Verificación de tipos y compilación a `dist/`           |
| `npm run preview`   | Sirve localmente el resultado de `npm run build`         |
| `npm run api`       | API en modo desarrollo                                   |
| `npm run api:setup` | Genera `server/.env` a partir del ejemplo                |

## Stack

**Aplicación:** React 19 con TypeScript estricto, Vite, Tailwind CSS 4, React Flow
(`@xyflow/react`) como motor del lienzo, React Router 7, react-hook-form con Yup, jsPDF y
html-to-image para la exportación.

**API:** Node con Express 5 y TypeScript, PostgreSQL a través del driver `pg` con SQL escrito a
mano, bcrypt para las contraseñas, JWT para las sesiones y Zod para validar todo lo que entra.

No se usa ORM: las consultas están a la vista en los repositorios, que es lo que permite explicar y
defender cada operación sobre la base.

## Estructura

```
src/                       La aplicación
├── app/                   Arranque, contexto de sesión, rutas y guardas
├── components/ui/         Botones, campos, modales y marca
├── configs/               Identidad de marca y presentación de los planes
├── features/
│   ├── editor/            Motor del lienzo, catálogos y exportación
│   └── proyectos/         Creación de proyectos
├── lib/                   Utilidades transversales
├── pages/                 Las pantallas del producto
└── services/              Capa de datos
    ├── api/               Llamadas HTTP a la API
    ├── local/             Almacén del navegador para la sesión de exploración
    ├── httpClient.ts      Token, errores y fallos de red en un solo lugar
    └── *Service.ts        Fachada que elige entre servidor y navegador

server/                    La API
├── sql/schema.sql         El esquema de la base
└── src/
    ├── config/            Variables de entorno y pool de conexiones
    ├── middleware/        Autenticación, validación, errores y límite de intentos
    ├── modules/           auth, users, projects, plans
    │   └── <módulo>/      routes → service → repository
    └── shared/            Tipos, traducción base ↔ editor, errores de dominio
```

### El editor

Las tres herramientas comparten un único motor de lienzo. Lo que las diferencia es su **catálogo**
(`src/features/editor/catalogs/`), que define qué símbolos y qué tipos de vínculo están disponibles.
Agregar una cuarta herramienta consiste en escribir un archivo de catálogo nuevo, sin tocar el
editor.

Los vínculos se dibujan con el trazo que les corresponde en el lenguaje de la disciplina: línea
continua para la unión, con una barra para la separación y dos para el divorcio, línea doble para el
vínculo fuerte, zigzag para el conflictivo, flecha para el estresante y punteado para la ausencia de
relación.

### Cómo se guarda un diagrama

Un diagrama no se almacena como un bloque de texto: cada figura es una fila en `diagram_entities` y
cada vínculo una fila en `diagram_relations`. Eso permite consultar la información después —cuántas
personas, qué vínculos predominan— en lugar de tener un dato opaco.

Al guardar, la API borra las figuras y los vínculos anteriores del proyecto y escribe los nuevos
**dentro de una transacción**: si algo falla a mitad de camino, el proyecto queda como estaba y
nunca a medias.

## Dos modalidades de uso

**Con cuenta.** Todo viaja a la API y queda en PostgreSQL. Los proyectos siguen ahí desde cualquier
equipo y la contraseña se guarda cifrada con bcrypt, nunca en texto plano.

**Sesión de exploración.** Permite probar el editor sin registrarse. Nada sale del navegador: los
borradores quedan en IndexedDB, en ese equipo. Por eso esta modalidad **no debe usarse con datos
reales de familias**; sirve para conocer la herramienta.

## Seguridad

- Las contraseñas se cifran con bcrypt y jamás se devuelven al navegador.
- La sesión viaja como JWT firmado; el servidor deduce de él la identidad, así que ninguna petición
  puede pedir datos a nombre de otra cuenta.
- Cada operación sobre un proyecto verifica la pertenencia. Si el proyecto es de otra persona, la
  respuesta es la misma que si no existiera, para no confirmar identificadores ajenos.
- Todo lo que entra se valida con Zod antes de llegar a la base.
- El inicio de sesión tiene límite de intentos por dirección para frenar ataques automatizados.
- Las tablas tienen Row Level Security activa y sin políticas, de modo que la API pública de
  Supabase no puede leer ni escribir nada: el único camino a los datos es este servidor.
- Las credenciales viven en `server/.env`, que está excluido del repositorio.

## Planes

El modelo freemium está implementado de verdad, no solo en la interfaz: los límites se leen de la
tabla `plans` y el cupo de proyectos se comprueba **en el servidor**, bloqueando la fila de la
cuenta durante la transacción para que dos peticiones simultáneas no lo sobrepasen juntas.

Desde **Planes de uso** se puede cambiar de plan para demostrar el comportamiento, ya que esta
versión no incluye pasarela de pago. Cuando se integre el cobro, ese cambio debe moverse a un
endpoint que solo escriba tras confirmar el pago.

## Publicación

`npm run build` genera archivos estáticos en `dist/`, que cualquier hosting estático puede servir.
El repositorio ya incluye la configuración de reescritura que necesitan estos servicios para que las
rutas internas funcionen al entrar directamente a ellas:

- `vercel.json` para Vercel
- `public/_redirects` para Netlify y Cloudflare Pages

La API se despliega aparte, en un servicio que ejecute Node —Render o Railway sirven—, con las
mismas variables de `server/.env` cargadas como variables de entorno y `CORS_ORIGIN` apuntando al
dominio público de la aplicación. En la aplicación hay que definir `VITE_API_URL` con la dirección
de la API antes de compilar.
