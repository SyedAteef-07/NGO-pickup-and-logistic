SET search_path TO app, public, extensions;

CREATE TABLE app.volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL UNIQUE REFERENCES app.people(id),
  registration_code text NOT NULL UNIQUE,
  skills text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE app.volunteer_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid NOT NULL REFERENCES app.volunteers(id),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  state text NOT NULL CHECK (state IN ('AVAILABLE', 'UNAVAILABLE')),
  CHECK (ends_at > starts_at)
);
CREATE INDEX volunteer_availability_lookup ON app.volunteer_availability(volunteer_id, starts_at, ends_at);
CREATE TABLE app.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  leader_volunteer_id uuid REFERENCES app.volunteers(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE app.team_members (
  team_id uuid NOT NULL REFERENCES app.teams(id),
  volunteer_id uuid NOT NULL UNIQUE REFERENCES app.volunteers(id),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (team_id, volunteer_id)
);

CREATE TABLE app.food_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid NOT NULL REFERENCES app.donors(id),
  source_name text NOT NULL,
  source_type text NOT NULL,
  pickup_address text NOT NULL,
  prepared_at timestamptz NOT NULL,
  ready_at timestamptz NOT NULL,
  pickup_deadline timestamptz NOT NULL,
  estimated_weight_kg numeric(10,2) CHECK (estimated_weight_kg > 0),
  handling_requirements text NOT NULL DEFAULT '',
  donor_safety_declaration boolean NOT NULL CHECK (donor_safety_declaration),
  safety_review text NOT NULL DEFAULT 'PENDING' CHECK (safety_review IN ('PENDING', 'APPROVED', 'REJECTED')),
  safety_reviewed_by uuid REFERENCES app.app_users(id),
  safety_reviewed_at timestamptz,
  contact_name text NOT NULL,
  contact_phone_e164 text NOT NULL CHECK (contact_phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  notes text,
  status text NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'CANCELLED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (prepared_at <= ready_at AND ready_at <= pickup_deadline),
  CHECK ((safety_review = 'PENDING' AND safety_reviewed_at IS NULL AND safety_reviewed_by IS NULL) OR (safety_review <> 'PENDING' AND safety_reviewed_at IS NOT NULL AND safety_reviewed_by IS NOT NULL))
);
CREATE TABLE app.food_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_request_id uuid NOT NULL REFERENCES app.food_requests(id),
  food_type text NOT NULL,
  quantity numeric(12,2) NOT NULL CHECK (quantity > 0),
  unit text NOT NULL CHECK (unit IN ('MEALS', 'KG', 'LITRES', 'PACKAGES')),
  handling_requirements text NOT NULL DEFAULT ''
);

CREATE TABLE app.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number text NOT NULL UNIQUE,
  kind text NOT NULL,
  capacity_kg numeric(10,2) NOT NULL CHECK (capacity_kg > 0),
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'MAINTENANCE', 'RETIRED')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE app.drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL UNIQUE REFERENCES app.people(id),
  licence_number text NOT NULL UNIQUE,
  licence_expires_on date NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE'))
);
CREATE TABLE app.vehicle_unavailability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES app.vehicles(id),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  reason text NOT NULL,
  CHECK (ends_at > starts_at)
);

CREATE TABLE app.pickups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_request_id uuid NOT NULL UNIQUE REFERENCES app.food_requests(id),
  window_starts_at timestamptz NOT NULL,
  window_ends_at timestamptz NOT NULL,
  delivery_address text NOT NULL,
  status text NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'ASSIGNED', 'EN_ROUTE', 'ARRIVED_AT_DONOR', 'FOOD_COLLECTED', 'DELIVERED', 'CANCELLED', 'FAILED')),
  version integer NOT NULL DEFAULT 0 CHECK (version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (window_ends_at > window_starts_at)
);
CREATE TABLE app.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pickup_id uuid NOT NULL REFERENCES app.pickups(id),
  team_id uuid REFERENCES app.teams(id),
  driver_id uuid NOT NULL REFERENCES app.drivers(id),
  vehicle_id uuid NOT NULL REFERENCES app.vehicles(id),
  role text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED_AT_DONOR', 'FOOD_COLLECTED', 'DELIVERED', 'REJECTED', 'CANCELLED', 'FAILED')),
  version integer NOT NULL DEFAULT 0 CHECK (version >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX one_active_assignment_per_pickup ON app.assignments(pickup_id) WHERE status NOT IN ('REJECTED', 'CANCELLED', 'FAILED');
CREATE TABLE app.assignment_members (
  assignment_id uuid NOT NULL REFERENCES app.assignments(id),
  volunteer_id uuid NOT NULL REFERENCES app.volunteers(id),
  PRIMARY KEY (assignment_id, volunteer_id)
);
CREATE TABLE app.resource_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES app.assignments(id),
  person_id uuid REFERENCES app.people(id),
  vehicle_id uuid REFERENCES app.vehicles(id),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  during tstzrange GENERATED ALWAYS AS (tstzrange(starts_at, ends_at, '[)')) STORED,
  state text NOT NULL DEFAULT 'ACTIVE' CHECK (state IN ('ACTIVE', 'RELEASED')),
  released_at timestamptz,
  CHECK (ends_at > starts_at),
  CHECK ((state = 'ACTIVE' AND released_at IS NULL) OR (state = 'RELEASED' AND released_at IS NOT NULL)),
  CHECK ((person_id IS NOT NULL) <> (vehicle_id IS NOT NULL)),
  CONSTRAINT no_overlapping_person_reservation EXCLUDE USING gist (person_id WITH =, during WITH &&) WHERE (state = 'ACTIVE' AND person_id IS NOT NULL),
  CONSTRAINT no_overlapping_vehicle_reservation EXCLUDE USING gist (vehicle_id WITH =, during WITH &&) WHERE (state = 'ACTIVE' AND vehicle_id IS NOT NULL)
);
CREATE TABLE app.container_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pickup_id uuid NOT NULL REFERENCES app.pickups(id),
  container_type text NOT NULL,
  count integer NOT NULL CHECK (count > 0),
  estimated_load_kg numeric(10,2) CHECK (estimated_load_kg >= 0)
);
CREATE TABLE app.assignment_status_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES app.assignments(id),
  actor_user_id uuid REFERENCES app.app_users(id),
  from_status text,
  to_status text NOT NULL,
  reason text,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE app.pickup_status_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pickup_id uuid NOT NULL REFERENCES app.pickups(id),
  actor_user_id uuid REFERENCES app.app_users(id),
  from_status text,
  to_status text NOT NULL,
  reason text,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE app.idempotency_keys (
  actor_user_id uuid NOT NULL REFERENCES app.app_users(id),
  key text NOT NULL,
  request_hash text NOT NULL,
  assignment_id uuid REFERENCES app.assignments(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (actor_user_id, key)
);
CREATE TABLE app.vehicle_tracking_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pickup_id uuid NOT NULL REFERENCES app.pickups(id),
  app_user_id uuid NOT NULL REFERENCES app.app_users(id),
  granted_at timestamptz NOT NULL DEFAULT now(),
  withdrawn_at timestamptz,
  UNIQUE (pickup_id, app_user_id),
  UNIQUE (id, pickup_id, app_user_id),
  CHECK (withdrawn_at IS NULL OR withdrawn_at >= granted_at)
);
CREATE TABLE app.vehicle_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES app.vehicles(id),
  pickup_id uuid NOT NULL REFERENCES app.pickups(id),
  reporter_user_id uuid NOT NULL REFERENCES app.app_users(id),
  tracking_consent_id uuid NOT NULL,
  latitude double precision NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude double precision NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  recorded_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  CHECK (expires_at > recorded_at),
  FOREIGN KEY (tracking_consent_id, pickup_id, reporter_user_id) REFERENCES app.vehicle_tracking_consents(id, pickup_id, app_user_id)
);
CREATE INDEX vehicle_locations_active_lookup ON app.vehicle_locations(vehicle_id, recorded_at DESC);
CREATE INDEX vehicle_locations_expiry ON app.vehicle_locations(expires_at);
