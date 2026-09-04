-- Tope de edad: máximo 110 años (edad y fecha de nacimiento).

ALTER TABLE diagram_entities DROP CONSTRAINT IF EXISTS diagram_entities_age_check;
ALTER TABLE diagram_entities
  ADD CONSTRAINT diagram_entities_age_check CHECK (age IS NULL OR age BETWEEN 0 AND 110);
