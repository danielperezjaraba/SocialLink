-- Anclajes invisibles: fijan extremos libres de líneas sin dibujar una figura.
-- `junction` se conserva solo por compatibilidad con diagramas guardados antes.
ALTER TYPE entity_shape ADD VALUE IF NOT EXISTS 'anchor';
ALTER TYPE entity_shape ADD VALUE IF NOT EXISTS 'junction';
