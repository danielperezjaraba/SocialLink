-- Migración: personalización visual de figuras del diagrama
-- Ejecutar sobre bases existentes que ya tienen el esquema inicial.

ALTER TABLE diagram_entities
  ADD COLUMN IF NOT EXISTS stroke_color text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS fill_color text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS text_color text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS show_age boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_birth_date boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_name_inside boolean NOT NULL DEFAULT false;
