-- ============================================================
-- BOTTLENECK LAB — Initial Database Schema
-- Run this in Supabase SQL Editor after creating your project.
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---- profiles -----------------------------------------------
-- One row per auth user. Created automatically via trigger
-- or manually on first login.

CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---- datasets -----------------------------------------------

CREATE TABLE IF NOT EXISTS public.datasets (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name               TEXT NOT NULL,
  description        TEXT NOT NULL DEFAULT '',
  data_mode          TEXT NOT NULL DEFAULT 'simulated' CHECK (data_mode IN ('simulated', 'measured')),
  source_description TEXT NOT NULL DEFAULT '',
  collection_start   TIMESTAMPTZ,
  collection_end     TIMESTAMPTZ,
  units              TEXT NOT NULL DEFAULT '',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS datasets_user_id_idx ON public.datasets(user_id);

CREATE TRIGGER datasets_updated_at
  BEFORE UPDATE ON public.datasets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---- dataset_observations -----------------------------------

CREATE TABLE IF NOT EXISTS public.dataset_observations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id    UUID NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label         TEXT NOT NULL DEFAULT '',
  timestamp     TIMESTAMPTZ,
  cpu           NUMERIC(6, 2),
  memory        NUMERIC(6, 2),
  disk          NUMERIC(6, 2),
  network       NUMERIC(6, 2),
  response_time NUMERIC(10, 2) NOT NULL,
  queue_length  NUMERIC(10, 2),
  throughput    NUMERIC(10, 2),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dataset_observations_dataset_id_idx ON public.dataset_observations(dataset_id);
CREATE INDEX IF NOT EXISTS dataset_observations_user_id_idx ON public.dataset_observations(user_id);

-- Constraint: utilization values must be 0–100 if provided
ALTER TABLE public.dataset_observations
  ADD CONSTRAINT cpu_range    CHECK (cpu    IS NULL OR (cpu    >= 0 AND cpu    <= 100)),
  ADD CONSTRAINT memory_range CHECK (memory IS NULL OR (memory >= 0 AND memory <= 100)),
  ADD CONSTRAINT disk_range   CHECK (disk   IS NULL OR (disk   >= 0 AND disk   <= 100)),
  ADD CONSTRAINT network_range CHECK (network IS NULL OR (network >= 0 AND network <= 100));

-- ---- analysis_runs ------------------------------------------

CREATE TABLE IF NOT EXISTS public.analysis_runs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dataset_id       UUID NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
  x_variable       TEXT NOT NULL,
  y_variable       TEXT NOT NULL,
  method           TEXT NOT NULL CHECK (method IN ('Pearson', 'Spearman', 'Both')),
  pearson_r        NUMERIC(10, 6),
  spearman_rho     NUMERIC(10, 6),
  n_observations   INTEGER,
  result_metadata  JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analysis_runs_user_id_idx ON public.analysis_runs(user_id);
CREATE INDEX IF NOT EXISTS analysis_runs_dataset_id_idx ON public.analysis_runs(dataset_id);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- datasets
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own datasets"
  ON public.datasets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own datasets"
  ON public.datasets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own datasets"
  ON public.datasets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own datasets"
  ON public.datasets FOR DELETE
  USING (auth.uid() = user_id);

-- dataset_observations
ALTER TABLE public.dataset_observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own observations"
  ON public.dataset_observations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own observations"
  ON public.dataset_observations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own observations"
  ON public.dataset_observations FOR DELETE
  USING (auth.uid() = user_id);

-- analysis_runs
ALTER TABLE public.analysis_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own analysis runs"
  ON public.analysis_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analysis runs"
  ON public.analysis_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analysis runs"
  ON public.analysis_runs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- DONE
-- ============================================================
-- To verify RLS is working:
--   1. Sign in as user A, create a dataset.
--   2. Sign in as user B, query public.datasets.
--   3. User B should not see user A's datasets.
-- ============================================================
