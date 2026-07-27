/*
# StudyMatch AI — Core Schema

## Overview
Creates the full database schema for StudyMatch AI, a multi-user scholarship
discovery platform with AI features. Every user-scoped table is owner-protected
with RLS policies scoped to the authenticated user via auth.uid().

## Tables

### profiles
- Extends auth.users with application-level profile data.
- `id` (uuid, PK, references auth.users) — one row per user.
- `full_name`, `email`, `avatar_url`, `phone`, `bio`, `country`.
- `degree_level`, `field_of_study`, `gpa`, `english_test`, `english_score`.
- `target_countries` (text array), `joined_date` (text label), `profile_completion`.
- `created_at`, `updated_at`.

### scholarships
- Global, shared scholarship catalogue (all users read; no one writes from the
  client — seeded server-side). RLS: read-only to authenticated.
- `id` (uuid PK), `slug` (unique), `name`, `university_id`, `university_name`,
  `country`, `country_flag`, `city`, `degree_level`, `field_of_study`,
  `funding_type`, `intake`, `deadline` (date), `gpa_requirement`, `english_test`,
  `english_score`, `tuition_coverage`, `monthly_stipend`, `health_insurance`,
  `accommodation`, `benefits` (jsonb), `eligibility` (jsonb), `required_documents`
  (jsonb), `application_process` (jsonb), `contact_email`, `official_url`,
  `university_website`, `university_overview`, `university_accent` (gradient class),
  `university_ranking`, `tags` (jsonb), `supervisors` (jsonb), `source` (text:
  'sample' | 'live'), `last_verified_at` (timestamptz).
- `created_at`.

### saved_scholarships
- Owner-scoped bookmark join. `user_id` defaults to auth.uid().
- `scholarship_id`, `created_at`, composite unique on (user_id, scholarship_id).

### applications
- Owner-scoped application tracker rows.
- `user_id` defaults to auth.uid(). `scholarship_id`, `status`, `progress`,
  `notes`, `updated_at`.

### notifications
- Owner-scoped notifications.
- `user_id` defaults to auth.uid(). `type`, `title`, `message`, `read`, `created_at`.

### ai_chats
- Owner-scoped AI assistant conversation history.
- `user_id` defaults to auth.uid(). `role` (user|assistant), `content`, `created_at`.

### ai_cache
- Owner-scoped cached AI results keyed by feature + scholarship id, so repeated
  match-score / eligibility calls don't re-hit Gemini.
- `user_id` defaults to auth.uid(). `feature`, `scholarship_id` (nullable),
  `payload` (jsonb), `created_at`.

### sop_reviews
- Owner-scoped SOP/CV review results.
- `user_id` defaults to auth.uid(). `doc_type` (sop|cv), `doc_name`, `doc_text`,
  `result` (jsonb), `created_at`.

## Security
- RLS enabled on every table.
- profiles: owner CRUD (auth.uid() = id).
- scholarships: read-only to authenticated (USING true for SELECT), no inserts/
  updates/deletes from client.
- All owner-scoped tables (saved, applications, notifications, ai_chats,
  ai_cache, sop_reviews): CRUD policies each, scoped to auth.uid() = user_id,
  with user_id columns defaulting to auth.uid() so client inserts omitting
  user_id still pass WITH CHECK.

## Indexes
- scholarships.slug (unique), scholarships.country, scholarships.degree_level,
  scholarships.funding_type, scholarships.deadline.
- saved_scholarships (user_id, scholarship_id) unique.
- applications.user_id, notifications.user_id, ai_chats.user_id,
- ai_cache (user_id, feature, scholarship_id), sop_reviews.user_id.
*/

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  avatar_url text,
  phone text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  degree_level text NOT NULL DEFAULT 'Master''s',
  field_of_study text NOT NULL DEFAULT 'Computer Science',
  gpa numeric NOT NULL DEFAULT 0,
  english_test text NOT NULL DEFAULT 'None',
  english_score numeric NOT NULL DEFAULT 0,
  target_countries text[] NOT NULL DEFAULT '{}',
  joined_date text NOT NULL DEFAULT '',
  profile_completion integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- scholarships (global read-only catalogue)
CREATE TABLE IF NOT EXISTS scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  university_id text NOT NULL DEFAULT '',
  university_name text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  country_flag text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  degree_level text NOT NULL DEFAULT '',
  field_of_study text NOT NULL DEFAULT '',
  funding_type text NOT NULL DEFAULT '',
  intake text NOT NULL DEFAULT '',
  deadline date,
  gpa_requirement numeric NOT NULL DEFAULT 0,
  english_test text NOT NULL DEFAULT 'None',
  english_score numeric NOT NULL DEFAULT 0,
  tuition_coverage boolean NOT NULL DEFAULT false,
  monthly_stipend numeric,
  health_insurance boolean NOT NULL DEFAULT false,
  accommodation boolean NOT NULL DEFAULT false,
  benefits jsonb NOT NULL DEFAULT '[]'::jsonb,
  eligibility jsonb NOT NULL DEFAULT '[]'::jsonb,
  required_documents jsonb NOT NULL DEFAULT '[]'::jsonb,
  application_process jsonb NOT NULL DEFAULT '[]'::jsonb,
  contact_email text NOT NULL DEFAULT '',
  official_url text NOT NULL DEFAULT '',
  university_website text NOT NULL DEFAULT '',
  university_overview text NOT NULL DEFAULT '',
  university_accent text NOT NULL DEFAULT 'from-brand-600 to-brand-800',
  university_ranking integer NOT NULL DEFAULT 0,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  supervisors jsonb NOT NULL DEFAULT '[]'::jsonb,
  source text NOT NULL DEFAULT 'sample',
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_scholarships" ON scholarships;
CREATE POLICY "read_scholarships" ON scholarships FOR SELECT
  TO authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_scholarships_country ON scholarships(country);
CREATE INDEX IF NOT EXISTS idx_scholarships_degree ON scholarships(degree_level);
CREATE INDEX IF NOT EXISTS idx_scholarships_funding ON scholarships(funding_type);
CREATE INDEX IF NOT EXISTS idx_scholarships_deadline ON scholarships(deadline);

-- saved_scholarships
CREATE TABLE IF NOT EXISTS saved_scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_id uuid NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, scholarship_id)
);
ALTER TABLE saved_scholarships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_saved" ON saved_scholarships;
CREATE POLICY "select_own_saved" ON saved_scholarships FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_saved" ON saved_scholarships;
CREATE POLICY "insert_own_saved" ON saved_scholarships FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_saved" ON saved_scholarships;
CREATE POLICY "delete_own_saved" ON saved_scholarships FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_scholarships(user_id);

-- applications
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_id uuid NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'Not Started',
  progress integer NOT NULL DEFAULT 0,
  notes text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_applications" ON applications;
CREATE POLICY "select_own_applications" ON applications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_applications" ON applications;
CREATE POLICY "insert_own_applications" ON applications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_applications" ON applications;
CREATE POLICY "update_own_applications" ON applications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_applications" ON applications;
CREATE POLICY "delete_own_applications" ON applications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);

-- notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'system',
  title text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- ai_chats
CREATE TABLE IF NOT EXISTS ai_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_chats" ON ai_chats;
CREATE POLICY "select_own_chats" ON ai_chats FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_chats" ON ai_chats;
CREATE POLICY "insert_own_chats" ON ai_chats FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_chats" ON ai_chats;
CREATE POLICY "delete_own_chats" ON ai_chats FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_chats_user ON ai_chats(user_id);

-- ai_cache
CREATE TABLE IF NOT EXISTS ai_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  feature text NOT NULL,
  scholarship_id uuid,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, feature, scholarship_id)
);
ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_ai_cache" ON ai_cache;
CREATE POLICY "select_own_ai_cache" ON ai_cache FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_ai_cache" ON ai_cache;
CREATE POLICY "insert_own_ai_cache" ON ai_cache FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_ai_cache" ON ai_cache;
CREATE POLICY "update_own_ai_cache" ON ai_cache FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_ai_cache" ON ai_cache;
CREATE POLICY "delete_own_ai_cache" ON ai_cache FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_ai_cache_user ON ai_cache(user_id);

-- sop_reviews
CREATE TABLE IF NOT EXISTS sop_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  doc_type text NOT NULL DEFAULT 'sop',
  doc_name text NOT NULL DEFAULT '',
  doc_text text NOT NULL DEFAULT '',
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE sop_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_sop_reviews" ON sop_reviews;
CREATE POLICY "select_own_sop_reviews" ON sop_reviews FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_sop_reviews" ON sop_reviews;
CREATE POLICY "insert_own_sop_reviews" ON sop_reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_sop_reviews" ON sop_reviews;
CREATE POLICY "delete_own_sop_reviews" ON sop_reviews FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_sop_reviews_user ON sop_reviews(user_id);

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_applications_updated_at ON applications;
CREATE TRIGGER trg_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
