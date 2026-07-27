import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn("Supabase env vars missing — auth and database features will be disabled.");
}

export const supabase = createClient(url ?? "", anonKey ?? "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Row shapes (subset of columns we use). Kept loose to avoid a codegen step.
export interface DbScholarship {
  id: string;
  slug: string;
  name: string;
  university_id: string;
  university_name: string;
  country: string;
  country_flag: string;
  city: string;
  degree_level: string;
  field_of_study: string;
  funding_type: string;
  intake: string;
  deadline: string | null;
  gpa_requirement: number;
  english_test: string;
  english_score: number;
  tuition_coverage: boolean;
  monthly_stipend: number | null;
  health_insurance: boolean;
  accommodation: boolean;
  benefits: string[];
  eligibility: string[];
  required_documents: string[];
  application_process: string[];
  contact_email: string;
  official_url: string;
  university_website: string;
  university_overview: string;
  university_accent: string;
  university_ranking: number;
  tags: string[];
  supervisors: any[];
  source: string;
  last_verified_at: string | null;
  matchScore?: number; // computed client-side from AI match-score feature
}

export interface DbSaved {
  id: string;
  scholarship_id: string;
  created_at: string;
}

export interface DbApplication {
  id: string;
  scholarship_id: string;
  status: string;
  progress: number;
  notes: string;
  updated_at: string;
}

export interface DbNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface DbProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  phone: string;
  bio: string;
  country: string;
  degree_level: string;
  field_of_study: string;
  gpa: number;
  english_test: string;
  english_score: number;
  target_countries: string[];
  joined_date: string;
  profile_completion: number;
}
