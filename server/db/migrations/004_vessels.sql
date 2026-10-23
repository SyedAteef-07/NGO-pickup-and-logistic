-- Migration 004_vessels.sql
-- Module: Food Container / Vessel Inventory Management
-- Manages vessels/containers used for food rescue transport, tracking cleanliness, inspections, condition, and pickup assignment issuance.

SET search_path TO app, public, extensions;

-- Canonical vessels table
CREATE TABLE IF NOT EXISTS app.vessels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_code text NOT NULL UNIQUE,
  name text NOT NULL CHECK (length(trim(name)) > 0),
  vessel_type text NOT NULL CHECK (vessel_type IN ('HOT_BOX', 'INSULATED_BAG', 'MILK_CAN', 'CRATE', 'COLD_BOX', 'OTHER')),
  material text NOT NULL CHECK (material IN ('STAINLESS_STEEL', 'FOOD_GRADE_PLASTIC', 'ALUMINUM', 'INSULATED_POLYMER', 'OTHER')),
  capacity_value numeric(10,2) NOT NULL CHECK (capacity_value > 0),
  capacity_unit text NOT NULL CHECK (capacity_unit IN ('LITRES', 'KG')),
  food_grade_certified boolean NOT NULL DEFAULT true,
  temperature_suitability text NOT NULL CHECK (temperature_suitability IN ('AMBIENT', 'CHILLED', 'HOT', 'FROZEN', 'MULTI_TEMP')),
  has_insulation boolean NOT NULL DEFAULT false,
  has_tight_lid boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'IN_USE', 'CLEANING_REQUIRED', 'INSPECTION_REQUIRED', 'MAINTENANCE', 'RETIRED')),
  cleaning_status text NOT NULL DEFAULT 'CLEAN' CHECK (cleaning_status IN ('CLEAN', 'DIRTY', 'SANITIZING')),
  last_cleaned_at timestamptz,
  next_cleaning_due timestamptz,
  last_inspected_at timestamptz,
  inspection_result text CHECK (inspection_result IN ('PASSED', 'ACTION_REQUIRED', 'FAILED')),
  maintenance_condition text NOT NULL DEFAULT 'GOOD' CHECK (maintenance_condition IN ('GOOD', 'MINOR_WEAR', 'NEEDS_REPAIR', 'UNSAFE')),
  storage_location text NOT NULL DEFAULT 'Main Central Warehouse',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vessels_status_idx ON app.vessels(status);
CREATE INDEX IF NOT EXISTS vessels_cleaning_idx ON app.vessels(cleaning_status);
CREATE INDEX IF NOT EXISTS vessels_vessel_code_idx ON app.vessels(vessel_code);

-- Vessel Issuances to Pickup Assignments
CREATE TABLE IF NOT EXISTS app.vessel_issuances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id uuid NOT NULL REFERENCES app.vessels(id),
  pickup_id uuid REFERENCES app.pickups(id),
  vehicle_id uuid REFERENCES app.vehicles(id),
  registration_number text,
  issued_at timestamptz NOT NULL DEFAULT now(),
  issued_by uuid REFERENCES app.app_users(id),
  issued_notes text,
  returned_at timestamptz,
  returned_by uuid REFERENCES app.app_users(id),
  returned_condition text CHECK (returned_condition IN ('GOOD', 'MINOR_WEAR', 'DAMAGED', 'UNSAFE')),
  return_cleanliness text CHECK (return_cleanliness IN ('CLEAN', 'DIRTY', 'CONTAMINATED')),
  return_notes text,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RETURNED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (returned_at IS NULL OR returned_at >= issued_at),
  CHECK ((status = 'ACTIVE' AND returned_at IS NULL) OR (status = 'RETURNED' AND returned_at IS NOT NULL))
);

-- Ensure a vessel cannot be issued to multiple active pickups concurrently
CREATE UNIQUE INDEX IF NOT EXISTS one_active_vessel_issuance
  ON app.vessel_issuances(vessel_id)
  WHERE status = 'ACTIVE';

-- Vessel Cleaning & Inspection Logs (History preservation)
CREATE TABLE IF NOT EXISTS app.vessel_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id uuid NOT NULL REFERENCES app.vessels(id),
  log_type text NOT NULL CHECK (log_type IN ('CLEANING', 'INSPECTION', 'MAINTENANCE', 'STATUS_CHANGE')),
  performed_at timestamptz NOT NULL DEFAULT now(),
  performed_by uuid REFERENCES app.app_users(id),
  result_status text NOT NULL,
  summary text NOT NULL CHECK (length(trim(summary)) > 0),
  details text,
  next_due_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vessel_logs_history_idx ON app.vessel_logs(vessel_id, performed_at DESC);
