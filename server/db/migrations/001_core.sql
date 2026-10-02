CREATE SCHEMA IF NOT EXISTS app;
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA extensions;

CREATE TABLE app.app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'DONOR' CHECK (role IN ('ADMIN', 'VOLUNTEER', 'DONOR')),
  display_name text,
  disabled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE app.user_role_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_user_id uuid NOT NULL REFERENCES app.app_users(id),
  actor_user_id uuid NOT NULL REFERENCES app.app_users(id),
  from_role text NOT NULL,
  to_role text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

-- A person is the single scheduling identity, even when they are both a volunteer and a driver.
CREATE TABLE app.people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_user_id uuid UNIQUE REFERENCES app.app_users(id),
  name text NOT NULL,
  phone_e164 text UNIQUE CHECK (phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE app.donors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_user_id uuid NOT NULL UNIQUE REFERENCES app.app_users(id),
  organization_name text,
  contact_phone_e164 text,
  created_at timestamptz NOT NULL DEFAULT now()
);
