-- Grosor relativo de líneas.

ALTER TABLE diagram_relations
  ADD COLUMN IF NOT EXISTS line_scale real NOT NULL DEFAULT 1
  CHECK (line_scale >= 0.5 AND line_scale <= 3);

-- Quitar escala de figuras si se aplicó una versión anterior de esta migración.
ALTER TABLE diagram_entities DROP COLUMN IF EXISTS scale;
