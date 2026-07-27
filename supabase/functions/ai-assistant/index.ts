// StudyMatch AI — Gemini-powered AI edge function.
// Handles all AI features via a `feature` field in the request body:
//   - match-score    : AI scholarship match score + explanation
//   - eligibility    : AI eligibility checker (Eligible / Partially / Not)
//   - assistant      : AI scholarship assistant (Q&A)
//   - sop-review     : AI SOP & CV review
//   - deadline-reminder : AI deadline reminder summary
// Falls back to deterministic local logic when GEMINI_API_KEY is not set, so the
// app remains fully functional in demo/preview environments.

import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

interface Profile {
  full_name?: string;
  degree_level?: string;
  field_of_study?: string;
  gpa?: number;
  english_test?: string;
  english_score?: number;
  target_countries?: string[];
  country?: string;
  bio?: string;
}

interface Scholarship {
  name?: string;
  university_name?: string;
  country?: string;
  degree_level?: string;
  field_of_study?: string;
  funding_type?: string;
  intake?: string;
  deadline?: string;
  gpa_requirement?: number;
  english_test?: string;
  english_score?: number;
  tuition_coverage?: boolean;
  monthly_stipend?: number | null;
  health_insurance?: boolean;
  accommodation?: boolean;
  benefits?: string[];
  eligibility?: string[];
  required_documents?: string[];
  application_process?: string[];
  tags?: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const feature: string = body.feature;
    const profile: Profile = body.profile ?? {};
    const scholarship: Scholarship = body.scholarship ?? {};
    const scholarships: Scholarship[] = body.scholarships ?? [];
    const applications: any[] = body.applications ?? [];
    const history: { role: string; content: string }[] = body.history ?? [];
    const message: string = body.message ?? "";
    const docType: string = body.docType ?? "sop";
    const docText: string = body.docText ?? "";

    if (!feature) {
      return json({ error: "Missing 'feature' field." }, 400);
    }

    // Auth: verify the caller has a valid JWT (optional but recommended).
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    // We do not hard-block anonymous calls so the public demo still works, but
    // we pass the user id through for logging.

    let result: unknown;

    switch (feature) {
      case "match-score":
        result = await handleMatchScore(profile, scholarship);
        break;
      case "eligibility":
        result = await handleEligibility(profile, scholarship);
        break;
      case "assistant":
        result = await handleAssistant(profile, scholarships, history, message);
        break;
      case "sop-review":
        result = await handleSopReview(docType, docText, profile);
        break;
      case "deadline-reminder":
        result = await handleDeadlineReminder(profile, scholarships, applications);
        break;
      default:
        return json({ error: `Unknown feature: ${feature}` }, 400);
    }

    return json({ ok: true, data: result, ai: !!GEMINI_API_KEY, user_id: user?.id ?? null });
  } catch (err) {
    return json({ ok: false, error: err?.message ?? "Internal error", ai: !!GEMINI_API_KEY }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/* ----------------------------- Gemini helper ----------------------------- */

async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!GEMINI_API_KEY) return "";
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.4,
        topP: 0.9,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  const out = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return out;
}

function tryParseJson<T>(raw: string, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Sometimes models wrap JSON in markdown fences — strip and retry.
    const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    try {
      return JSON.parse(cleaned) as T;
    } catch {
      return fallback;
    }
  }
}

/* ------------------------------ Features -------------------------------- */

async function handleMatchScore(profile: Profile, s: Scholarship) {
  // Deterministic fallback score.
  const fallback = computeFallbackScore(profile, s);

  if (!GEMINI_API_KEY) {
    return {
      score: fallback.score,
      label: fallback.label,
      explanation: fallback.explanation,
      ai: false,
    };
  }

  const system =
    "You are StudyMatch AI, an expert scholarship matching engine. You analyse a student's profile against a scholarship and return a match score from 0 to 100 plus a concise, encouraging explanation. Always respond with strict JSON.";
  const user = `Student profile:
${JSON.stringify(profile, null, 2)}

Scholarship:
${JSON.stringify(s, null, 2)}

Return JSON with this exact shape:
{
  "score": <integer 0-100>,
  "label": "<Strong Match | Good Match | Possible Match | Weak Match>",
  "explanation": "<2-4 sentences explaining why this score, referencing the student's GPA, field, degree level, language scores and the scholarship's requirements. Mention any gaps.>"
}`;
  const raw = await callGemini(system, user);
  const parsed = tryParseJson<{ score?: number; label?: string; explanation?: string }>(raw, {});
  return {
    score: Math.max(0, Math.min(100, Math.round(parsed.score ?? fallback.score))),
    label: parsed.label || fallback.label,
    explanation: parsed.explanation || fallback.explanation,
    ai: true,
  };
}

async function handleEligibility(profile: Profile, s: Scholarship) {
  const fallback = computeFallbackEligibility(profile, s);
  if (!GEMINI_API_KEY) {
    return { ...fallback, ai: false };
  }
  const system =
    "You are StudyMatch AI's eligibility checker. You determine whether a student is Eligible, Partially Eligible, or Not Eligible for a scholarship, and clearly list any missing requirements. Always respond with strict JSON.";
  const user = `Student profile:
${JSON.stringify(profile, null, 2)}

Scholarship:
${JSON.stringify(s, null, 2)}

Return JSON with this exact shape:
{
  "status": "<Eligible | Partially Eligible | Not Eligible>",
  "summary": "<1-2 sentence summary>",
  "missing": ["<each missing requirement, or empty array if none>"],
  "strengths": ["<what the student has that matches>"]
}`;
  const raw = await callGemini(system, user);
  const parsed = tryParseJson<{ status?: string; summary?: string; missing?: string[]; strengths?: string[] }>(raw, {});
  return {
    status: parsed.status || fallback.status,
    summary: parsed.summary || fallback.summary,
    missing: parsed.missing || fallback.missing,
    strengths: parsed.strengths || fallback.strengths,
    ai: true,
  };
}

async function handleAssistant(profile: Profile, scholarships: Scholarship[], history: { role: string; content: string }[], message: string) {
  if (!GEMINI_API_KEY) {
    return { reply: fallbackAssistantReply(message, profile, scholarships), ai: false };
  }
  const system =
    "You are the StudyMatch AI Scholarship Assistant. You help students find scholarships, understand requirements, compare universities, check if they can apply without IELTS, identify missing documents, and explain scholarship requirements in simple language. Be concise, friendly and specific. Use the student's profile and the provided scholarship list when relevant. Always respond in plain text (not JSON).";
  const context = `Student profile:
${JSON.stringify(profile, null, 2)}

Available scholarships (titles + key facts):
${scholarships.map((s) => `- ${s.name} (${s.university_name}, ${s.country}, ${s.degree_level}, ${s.funding_type}, GPA ${s.gpa_requirement}, ${s.english_test} ${s.english_score}, deadline ${s.deadline})`).join("\n")}

Conversation so far:
${history.map((m) => `${m.role}: ${m.content}`).join("\n")}

Student question: ${message}`;
  const raw = await callGemini(system, context);
  return { reply: raw || fallbackAssistantReply(message, profile, scholarships), ai: true };
}

async function handleSopReview(docType: string, docText: string, profile: Profile) {
  if (!docText.trim()) {
    return { error: "No document text provided." };
  }
  const fallback = fallbackSopReview(docType);
  if (!GEMINI_API_KEY) {
    return { ...fallback, ai: false };
  }
  const system =
    "You are StudyMatch AI's SOP & CV reviewer. You review a student's Statement of Purpose or CV and return specific, actionable improvement suggestions. Be encouraging but honest. Always respond with strict JSON.";
  const user = `Document type: ${docType.toUpperCase()}
Student profile: ${JSON.stringify(profile, null, 2)}

Document text:
"""
${docText.slice(0, 12000)}
"""

Return JSON with this exact shape:
{
  "overallScore": <integer 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<specific strengths>"],
  "improvements": ["<specific, actionable improvement suggestions>"],
  "checklist": [{"item": "<area>", "status": "<Good | Needs Work | Missing>", "note": "<brief note>"}]
}`;
  const raw = await callGemini(system, user);
  const parsed = tryParseJson<{
    overallScore?: number; summary?: string; strengths?: string[];
    improvements?: string[]; checklist?: { item: string; status: string; note: string }[];
  }>(raw, {});
  return {
    overallScore: parsed.overallScore ?? fallback.overallScore,
    summary: parsed.summary || fallback.summary,
    strengths: parsed.strengths || fallback.strengths,
    improvements: parsed.improvements || fallback.improvements,
    checklist: parsed.checklist || fallback.checklist,
    ai: true,
  };
}

async function handleDeadlineReminder(profile: Profile, scholarships: Scholarship[], applications: any[]) {
  const upcoming = computeUpcoming(profile, scholarships, applications);
  if (!GEMINI_API_KEY) {
    return { reminders: upcoming, ai: false };
  }
  const system =
    "You are StudyMatch AI's deadline assistant. You produce a concise, prioritised list of deadline reminders for a student based on their saved scholarships and active applications. Always respond with strict JSON.";
  const user = `Student profile:
${JSON.stringify(profile, null, 2)}

Active applications:
${JSON.stringify(applications, null, 2)}

Scholarships with deadlines:
${scholarships.map((s) => `- ${s.name} (${s.university_name}) — deadline ${s.deadline}`).join("\n")}

Return JSON with this exact shape:
{
  "reminders": [
    {"scholarship": "<name>", "university": "<university>", "daysLeft": <integer>, "priority": "<High | Medium | Low>", "message": "<short actionable reminder>", "suggestedAction": "<next step>"}
  ]
}`;
  const raw = await callGemini(system, user);
  const parsed = tryParseJson<{ reminders?: any[] }>(raw, {});
  return { reminders: parsed.reminders && parsed.reminders.length ? parsed.reminders : upcoming, ai: true };
}

/* --------------------------- Fallback logic ------------------------------ */

function computeFallbackScore(profile: Profile, s: Scholarship): { score: number; label: string; explanation: string } {
  let score = 50;
  const reasons: string[] = [];
  if (profile.degree_level && s.degree_level && profile.degree_level === s.degree_level) { score += 15; reasons.push("your degree level matches"); }
  else { score -= 10; reasons.push("the degree level differs from your target"); }
  if (profile.field_of_study && s.field_of_study && profile.field_of_study === s.field_of_study) { score += 15; reasons.push("your field of study aligns"); }
  if (profile.gpa && s.gpa_requirement && profile.gpa >= s.gpa_requirement) { score += 12; reasons.push("your GPA meets the requirement"); }
  else { score -= 12; reasons.push("your GPA is below the stated requirement"); }
  if (s.country && profile.target_countries?.includes(s.country)) { score += 8; reasons.push(`${s.country} is one of your target countries`); }
  if (profile.english_test && s.english_test && profile.english_test === s.english_test && profile.english_score && s.english_score && profile.english_score >= s.english_score) { score += 8; reasons.push("your English score satisfies the requirement"); }
  score = Math.max(5, Math.min(99, Math.round(score)));
  const label = score >= 85 ? "Strong Match" : score >= 70 ? "Good Match" : score >= 55 ? "Possible Match" : "Weak Match";
  const explanation = `This scholarship is a ${label.toLowerCase()} for you because ${reasons.join(", ")}. Review the full eligibility criteria on the details page before applying.`;
  return { score, label, explanation };
}

function computeFallbackEligibility(profile: Profile, s: Scholarship) {
  const missing: string[] = [];
  const strengths: string[] = [];
  if (profile.gpa && s.gpa_requirement && profile.gpa < s.gpa_requirement) missing.push(`GPA below the required ${s.gpa_requirement}/4.0`);
  else if (profile.gpa) strengths.push(`GPA of ${profile.gpa} meets the requirement`);
  if (profile.degree_level && s.degree_level && profile.degree_level !== s.degree_level) missing.push(`This scholarship is for ${s.degree_level} applicants`);
  else if (profile.degree_level) strengths.push(`Degree level (${profile.degree_level}) matches`);
  if (profile.field_of_study && s.field_of_study && profile.field_of_study !== s.field_of_study) missing.push(`Field of study differs (scholarship targets ${s.field_of_study})`);
  else if (profile.field_of_study) strengths.push(`Field of study aligns`);
  if (s.english_test && s.english_test !== "None") {
    if (!profile.english_test || profile.english_test === "None") missing.push(`English test ${s.english_test} required (not provided)`);
    else if (profile.english_test !== s.english_test) missing.push(`Requires ${s.english_test}, you have ${profile.english_test}`);
    else if (profile.english_score && s.english_score && profile.english_score < s.english_score) missing.push(`${s.english_test} score below ${s.english_score}`);
    else strengths.push(`English proficiency meets the requirement`);
  }
  const status = missing.length === 0 ? "Eligible" : missing.length <= 2 ? "Partially Eligible" : "Not Eligible";
  const summary = status === "Eligible"
    ? "Based on your profile, you appear to meet the core requirements for this scholarship."
    : status === "Partially Eligible"
    ? "You meet some requirements but a few are missing — review the list below."
    : "Several key requirements are not yet met. Consider addressing these before applying.";
  return { status, summary, missing, strengths };
}

function fallbackAssistantReply(message: string, profile: Profile, scholarships: Scholarship[]): string {
  const m = message.toLowerCase();
  if (m.includes("ielts") || m.includes("toefl") || m.includes("english")) {
    const noTest = scholarships.filter((s) => !s.english_test || s.english_test === "None");
    return `Yes — some scholarships don't require an English test. Based on the catalogue, ${noTest.map((s) => s.name).join(", ")} have no mandatory English test. Others may waive it if your previous degree was taught in English. Check each scholarship's official page to confirm.`;
  }
  if (m.includes("document") || m.includes("missing")) {
    return `Common required documents include academic transcripts, a degree certificate, a personal/statement of purpose, a CV, two to three recommendation letters, proof of English proficiency, and (for PhD) a research proposal. Open any scholarship's details page to see the exact list, and use the Eligibility Checker to see what's missing for your profile.`;
  }
  if (m.includes("compare") || m.includes("versus") || m.includes(" vs ")) {
    return `To compare universities, open two scholarships in separate tabs and look at: funding type, monthly stipend, tuition coverage, GPA and English requirements, deadline, and supervisor research interests (for Master's/PhD). The Scholarship Search page lets you filter by country and field to surface comparable options side by side.`;
  }
  if (m.includes("which") || m.includes("suit") || m.includes("best") || m.includes("recommend")) {
    const top = [...scholarships].sort((a, b) => (b.gpa_requirement ?? 0) - (a.gpa_requirement ?? 0)).slice(0, 3);
    return `Based on your profile (${profile.degree_level} in ${profile.field_of_study}, GPA ${profile.gpa}), I'd suggest looking at: ${top.map((s) => `${s.name} at ${s.university_name}`).join("; ")}. Check the match score on each card — the higher the score, the better the fit.`;
  }
  return `I'm your scholarship assistant. I can help you find suitable scholarships, check eligibility, identify missing documents, compare universities, and explain requirements in simple language. Try asking: "Which scholarship suits me?" or "Can I apply without IELTS?"`;
}

function fallbackSopReview(docType: string) {
  return {
    overallScore: 0,
    summary: `AI review is not available right now, but your ${docType.toUpperCase()} has been saved. Once the AI service is connected, you'll get specific strengths, improvements, and a checklist here.`,
    strengths: [] as string[],
    improvements: [] as string[],
    checklist: [] as { item: string; status: string; note: string }[],
  };
}

function computeUpcoming(profile: Profile, scholarships: Scholarship[], applications: any[]) {
  const now = Date.now();
  const items = scholarships
    .map((s) => {
      const days = s.deadline ? Math.ceil((new Date(s.deadline).getTime() - now) / 86400000) : null;
      const app = applications.find((a) => a.scholarship_id === s.slug || a.scholarship_id === s.name);
      return { scholarship: s.name, university: s.university_name, daysLeft: days, priority: "", message: "", suggestedAction: "", progress: app?.progress ?? 0, status: app?.status ?? "Not Started" };
    })
    .filter((x) => x.daysLeft !== null && x.daysLeft >= 0)
    .sort((a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0))
    .slice(0, 6)
    .map((x) => {
      const priority = (x.daysLeft ?? 999) <= 30 ? "High" : (x.daysLeft ?? 999) <= 60 ? "Medium" : "Low";
      return {
        ...x,
        priority,
        message: `${x.scholarship} deadline is in ${x.daysLeft} days.`,
        suggestedAction: x.progress > 0 ? `Continue your ${x.status} application.` : "Start your application and gather documents.",
      };
    });
  return items;
}
