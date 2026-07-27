// Client for the ai-assistant edge function. Handles all 5 AI features.
import { supabase } from "@/lib/supabase";

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

export interface MatchScoreResult {
  score: number;
  label: string;
  explanation: string;
  ai: boolean;
}

export interface EligibilityResult {
  status: "Eligible" | "Partially Eligible" | "Not Eligible";
  summary: string;
  missing: string[];
  strengths: string[];
  ai: boolean;
}

export interface AssistantResult {
  reply: string;
  ai: boolean;
}

export interface SopReviewResult {
  overallScore?: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  checklist: { item: string; status: string; note: string }[];
  ai: boolean;
  error?: string;
}

export interface DeadlineReminder {
  scholarship: string;
  university: string;
  daysLeft: number | null;
  priority: "High" | "Medium" | "Low";
  message: string;
  suggestedAction: string;
}

export interface DeadlineReminderResult {
  reminders: DeadlineReminder[];
  ai: boolean;
}

async function callAi(payload: Record<string, unknown>) {
  const { data: session } = await supabase.auth.getSession();
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`AI request failed (${res.status}). ${text.slice(0, 180)}`);
  }
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "AI request failed.");
  return json.data;
}

export async function getMatchScore(profile: unknown, scholarship: unknown): Promise<MatchScoreResult> {
  return callAi({ feature: "match-score", profile, scholarship });
}

export async function getEligibility(profile: unknown, scholarship: unknown): Promise<EligibilityResult> {
  return callAi({ feature: "eligibility", profile, scholarship });
}

export async function askAssistant(
  profile: unknown,
  scholarships: unknown[],
  history: { role: string; content: string }[],
  message: string
): Promise<AssistantResult> {
  return callAi({ feature: "assistant", profile, scholarships, history, message });
}

export async function reviewSop(docType: string, docText: string, profile: unknown): Promise<SopReviewResult> {
  return callAi({ feature: "sop-review", docType, docText, profile });
}

export async function getDeadlineReminders(
  profile: unknown,
  scholarships: unknown[],
  applications: unknown[]
): Promise<DeadlineReminderResult> {
  return callAi({ feature: "deadline-reminder", profile, scholarships, applications });
}
