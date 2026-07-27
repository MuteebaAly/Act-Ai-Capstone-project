// Seed script: inserts the sample scholarships into the Supabase scholarships table.
// Run with: node scripts/seed-scholarships.mjs
import { scholarships as sampleScholarships, universities } from "../src/data/sampleData.ts";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  process.exit(1);
}

const uById = (id) => universities.find((u) => u.id === id);

const rows = sampleScholarships.map((s) => {
  const u = uById(s.universityId);
  return {
    slug: s.id,
    name: s.name,
    university_id: u.id,
    university_name: u.name,
    country: u.country,
    country_flag: u.countryFlag,
    city: u.city,
    degree_level: s.degreeLevel,
    field_of_study: s.fieldOfStudy,
    funding_type: s.fundingType,
    intake: s.intake,
    deadline: s.deadline,
    gpa_requirement: s.gpaRequirement,
    english_test: s.englishTest ?? "None",
    english_score: s.englishScore ?? 0,
    tuition_coverage: s.tuitionCoverage,
    monthly_stipend: s.monthlyStipend,
    health_insurance: s.healthInsurance,
    accommodation: s.accommodation,
    benefits: JSON.stringify(s.benefits),
    eligibility: JSON.stringify(s.eligibility),
    required_documents: JSON.stringify(s.requiredDocuments),
    application_process: JSON.stringify(s.applicationProcess),
    contact_email: s.contactEmail,
    official_url: s.officialUrl,
    university_website: u.website,
    university_overview: u.overview,
    university_accent: u.accent,
    university_ranking: u.ranking,
    tags: JSON.stringify(s.tags ?? []),
    supervisors: JSON.stringify(s.supervisors ?? []),
    source: "sample",
    last_verified_at: new Date().toISOString(),
  };
});

const res = await fetch(`${SUPABASE_URL}/rest/v1/scholarships?on_conflict=slug`, {
  method: "POST",
  headers: {
    "apikey": SERVICE_KEY,
    "Authorization": `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates,return=minimal",
  },
  body: JSON.stringify(rows),
});

if (!res.ok) {
  const text = await res.text();
  console.error("Seed failed:", res.status, text);
  process.exit(1);
}
console.log(`Seeded ${rows.length} scholarships.`);
