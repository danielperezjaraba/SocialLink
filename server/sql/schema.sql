-- ============================================================
-- SocialLink · esquema inicial
-- Se ejecuta sobre la base "postgres" de Supabase, esquema public
-- ============================================================

-- ------------------------------------------------------------
-- 1. Tipos enumerados: el motor valida los valores permitidos
-- ------------------------------------------------------------
CREATE TYPE user_profile  AS ENUM ('estudiante', 'docente', 'profesional');
CREATE TYPE plan_id       AS ENUM ('free', 'premium', 'institucional');
CREATE TYPE tool_kind     AS ENUM ('genograma', 'familiograma', 'ecomapa');
CREATE TYPE entity_shape  AS ENUM (
  'male', 'female', 'unknown', 'pregnancy', 'resource',
  'patient_male', 'patient_female', 'stillborn',
  'induced_abortion', 'spontaneous_abortion',
  'disorder_untreated', 'disorder_treated',
  'substance_use', 'substance_recovery', 'household',
  'anchor', 'junction'
);
CREATE TYPE sex_type      AS ENUM ('M', 'F', 'X');
CREATE TYPE relation_kind AS ENUM (
  'union', 'cohabitation', 'separation', 'divorce', 'child', 'adoption',
  'twins_identical', 'twins_fraternal',
  'strong', 'weak', 'conflictive', 'stressful', 'none'
);

-- ------------------------------------------------------------
-- 2. Planes: el modelo de negocio vive en la base
-- ------------------------------------------------------------
CREATE TABLE plans (
  id            plan_id PRIMARY KEY,
  name          text    NOT NULL,
  price_cop     integer,                -- NULL = precio a convenir
  max_projects  integer,                -- NULL = sin límite
  all_templates boolean NOT NULL DEFAULT false,
  export_pdf    boolean NOT NULL DEFAULT false,
  export_image  boolean NOT NULL DEFAULT true,
  customization boolean NOT NULL DEFAULT false
);

INSERT INTO plans (id, name, price_cop, max_projects, all_templates, export_pdf, export_image, customization) VALUES
  ('free',          'Plan gratuito',      0,     2,    false, false, true, true),
  ('premium',       'Plan Premium',       19900, NULL, true,  true,  true, true),
  ('institucional', 'Plan Institucional', NULL,  NULL, true,  true,  true, true);

-- ------------------------------------------------------------
-- 3. Usuarios
-- ------------------------------------------------------------
CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  email         text NOT NULL UNIQUE,
  password_hash text,                   -- NULL en sesiones de exploración
  profile       user_profile NOT NULL DEFAULT 'estudiante',
  institution   text NOT NULL DEFAULT '',
  plan          plan_id NOT NULL DEFAULT 'free' REFERENCES plans (id),
  is_guest      boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 4. Proyectos
-- ------------------------------------------------------------
CREATE TABLE projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name        text NOT NULL,
  kind        tool_kind NOT NULL,
  description text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX projects_owner_idx ON projects (owner_id, updated_at DESC);

-- ------------------------------------------------------------
-- 5. Figuras del diagrama: personas y redes del entorno
-- ------------------------------------------------------------
CREATE TABLE diagram_entities (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  shape      entity_shape NOT NULL,
  name       text NOT NULL DEFAULT '',
  age        smallint CHECK (age IS NULL OR age BETWEEN 0 AND 110),
  sex        sex_type,
  birth_date date,
  occupation text NOT NULL DEFAULT '',
  kinship    text NOT NULL DEFAULT '',
  cohabits   boolean NOT NULL DEFAULT true,
  deceased   boolean NOT NULL DEFAULT false,
  is_index   boolean NOT NULL DEFAULT false,
  notes      text NOT NULL DEFAULT '',
  stroke_color   text NOT NULL DEFAULT '',
  fill_color     text NOT NULL DEFAULT '',
  text_color     text NOT NULL DEFAULT '',
  show_age       boolean NOT NULL DEFAULT true,
  show_birth_date boolean NOT NULL DEFAULT false,
  show_name_inside boolean NOT NULL DEFAULT false,
  position_x double precision NOT NULL DEFAULT 0,
  position_y double precision NOT NULL DEFAULT 0
);

CREATE INDEX diagram_entities_project_idx ON diagram_entities (project_id);

-- ------------------------------------------------------------
-- 6. Vínculos entre figuras
-- ------------------------------------------------------------
CREATE TABLE diagram_relations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  source_id     uuid NOT NULL REFERENCES diagram_entities (id) ON DELETE CASCADE,
  target_id     uuid NOT NULL REFERENCES diagram_entities (id) ON DELETE CASCADE,
  source_handle text,
  target_handle text,
  relation      relation_kind NOT NULL,
  note          text NOT NULL DEFAULT '',
  stroke_color  text NOT NULL DEFAULT '',
  line_scale    real NOT NULL DEFAULT 1 CHECK (line_scale >= 0.5 AND line_scale <= 3),
  CONSTRAINT sin_auto_vinculo CHECK (source_id <> target_id)
);

CREATE INDEX diagram_relations_project_idx ON diagram_relations (project_id);

-- ------------------------------------------------------------
-- 7. Candado: nadie entra por la puerta pública de Supabase.
--    Las tablas quedan sin políticas, de modo que los roles anónimos
--    de la API de Supabase no pueden leer ni escribir nada.
--    El servidor de SocialLink se conecta como dueño de las tablas,
--    por eso sí puede operar sobre ellas.
-- ------------------------------------------------------------
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects          ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagram_entities  ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagram_relations ENABLE ROW LEVEL SECURITY;
