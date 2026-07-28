-- Vitrine pública de clubes: flag para controlar quais clubes ATIVOS aparecem na home.
-- Independente do status (desligar não tira a afiliação). Ver docs/MODULO-CLUBES-VITRINE.md.
ALTER TABLE clubes ADD COLUMN IF NOT EXISTS visivel_na_home BOOLEAN NOT NULL DEFAULT TRUE;
