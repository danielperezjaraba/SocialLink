-- Nuevos símbolos y vínculos del genograma clínico

ALTER TYPE entity_shape ADD VALUE IF NOT EXISTS 'patient_male';
ALTER TYPE entity_shape ADD VALUE IF NOT EXISTS 'patient_female';
ALTER TYPE entity_shape ADD VALUE IF NOT EXISTS 'stillborn';
ALTER TYPE entity_shape ADD VALUE IF NOT EXISTS 'induced_abortion';
ALTER TYPE entity_shape ADD VALUE IF NOT EXISTS 'spontaneous_abortion';
ALTER TYPE entity_shape ADD VALUE IF NOT EXISTS 'disorder_untreated';
ALTER TYPE entity_shape ADD VALUE IF NOT EXISTS 'disorder_treated';
ALTER TYPE entity_shape ADD VALUE IF NOT EXISTS 'substance_use';
ALTER TYPE entity_shape ADD VALUE IF NOT EXISTS 'substance_recovery';
ALTER TYPE entity_shape ADD VALUE IF NOT EXISTS 'household';

ALTER TYPE relation_kind ADD VALUE IF NOT EXISTS 'twins_identical';
ALTER TYPE relation_kind ADD VALUE IF NOT EXISTS 'twins_fraternal';
