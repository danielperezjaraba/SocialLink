-- Color personalizado en vínculos + personalización habilitada en plan gratuito

ALTER TABLE diagram_relations
  ADD COLUMN IF NOT EXISTS stroke_color text NOT NULL DEFAULT '';

UPDATE plans SET customization = true WHERE id = 'free';
