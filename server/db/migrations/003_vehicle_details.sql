-- Module 5 owns canonical vehicle specifications and maintenance history.
-- Existing rows remain valid; the new specifications are optional until entered by an administrator.
ALTER TABLE app.vehicles
  ADD COLUMN size_category text CHECK (size_category IN ('SMALL', 'MEDIUM', 'LARGE')),
  ADD COLUMN indicative_max_vessels integer CHECK (indicative_max_vessels > 0);

CREATE TABLE app.vehicle_maintenance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES app.vehicles(id),
  serviced_on date NOT NULL,
  condition text NOT NULL CHECK (condition IN ('GOOD', 'NEEDS_SERVICE', 'UNSAFE')),
  summary text NOT NULL CHECK (length(trim(summary)) > 0),
  next_service_due_on date,
  recorded_by uuid REFERENCES app.app_users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (next_service_due_on IS NULL OR next_service_due_on >= serviced_on)
);
CREATE INDEX vehicle_maintenance_history ON app.vehicle_maintenance_records(vehicle_id, serviced_on DESC);

-- Reservation and downtime writers lock the same canonical vehicle row. This
-- serializes concurrent scheduling decisions; Pickup still owns the transaction.
CREATE FUNCTION app.assert_vehicle_reservable() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE vehicle_status text;
BEGIN
  IF NEW.vehicle_id IS NULL OR NEW.state <> 'ACTIVE' THEN RETURN NEW; END IF;
  SELECT status INTO vehicle_status FROM app.vehicles WHERE id = NEW.vehicle_id FOR UPDATE;
  IF vehicle_status IS DISTINCT FROM 'ACTIVE' THEN
    RAISE EXCEPTION 'Vehicle is not active' USING ERRCODE = '23514';
  END IF;
  IF EXISTS (
    SELECT 1 FROM app.vehicle_unavailability
    WHERE vehicle_id = NEW.vehicle_id
      AND tstzrange(starts_at, ends_at, '[)') && tstzrange(NEW.starts_at, NEW.ends_at, '[)')
  ) THEN
    RAISE EXCEPTION 'Vehicle is unavailable during reservation' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER check_vehicle_reservation
  BEFORE INSERT OR UPDATE OF vehicle_id, starts_at, ends_at, state ON app.resource_reservations
  FOR EACH ROW EXECUTE FUNCTION app.assert_vehicle_reservable();

CREATE FUNCTION app.assert_vehicle_downtime_available() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM 1 FROM app.vehicles WHERE id = NEW.vehicle_id FOR UPDATE;
  IF EXISTS (
    SELECT 1 FROM app.resource_reservations
    WHERE vehicle_id = NEW.vehicle_id AND state = 'ACTIVE'
      AND during && tstzrange(NEW.starts_at, NEW.ends_at, '[)')
  ) THEN
    RAISE EXCEPTION 'Vehicle has an active reservation during downtime' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER check_vehicle_downtime
  BEFORE INSERT OR UPDATE OF vehicle_id, starts_at, ends_at ON app.vehicle_unavailability
  FOR EACH ROW EXECUTE FUNCTION app.assert_vehicle_downtime_available();

CREATE FUNCTION app.assert_vehicle_status_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM app.resource_reservations
    WHERE vehicle_id = NEW.id AND state = 'ACTIVE' AND ends_at > now()
  ) THEN
    RAISE EXCEPTION 'Release active vehicle reservations before changing status'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER check_vehicle_status_change
  BEFORE UPDATE OF status ON app.vehicles
  FOR EACH ROW WHEN (OLD.status = 'ACTIVE' AND NEW.status <> 'ACTIVE')
  EXECUTE FUNCTION app.assert_vehicle_status_change();
