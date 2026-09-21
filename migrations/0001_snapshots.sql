CREATE TABLE IF NOT EXISTS gonkastats_snapshots (slot timestamptz PRIMARY KEY,collected_at timestamptz NOT NULL,checksum text NOT NULL,data jsonb NOT NULL);
-- Additive migration. Back up before any retention or rollback operation.
-- Manual rollback (destructive): DROP TABLE gonkastats_snapshots;
