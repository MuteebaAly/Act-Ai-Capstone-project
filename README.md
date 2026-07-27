# StudyMatch AI

An AI-powered global scholarship discovery platform that helps students find the most suitable scholarships from one place — powered by Gemini AI and Supabase.

## Features

- **AI Scholarship Match Score** — Gemini analyses your profile and scores every scholarship with a personalised explanation.
- **AI Eligibility Checker** — Tells you whether you're Eligible, Partially Eligible, or Not Eligible, with a clear list of missing requirements.
- **AI Scholarship Assistant** — A chat assistant that answers "Which scholarship suits me?", "Can I apply without IELTS?", "Which documents are missing?", "Compare two universities", and more.
- **AI SOP & CV Review** — Upload or paste your Statement of Purpose or CV and receive actionable improvement suggestions.
- **AI Deadline Reminder** — Smart, prioritised deadline reminders based on your saved scholarships and active applications.
- **Real-time data** — Scholarships are served from a verified database catalogue with a live/sample data badge and refresh.
- **Dark / Light mode** — System-aware theme toggle, persisted to localStorage.
- **Auth** — Email/password sign-up and login via Supabase Auth.
- **Application Tracker** — Move scholarships through stages and visualise progress.
- **Responsive design** — Optimised from mobile to desktop with smooth page transitions.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, lucide-react
- **Backend:** Supabase (Postgres, Auth, Row Level Security)
- **AI:** Google Gemini via a Supabase Edge Function
- **Deployment:** Vercel-ready

## Getting Started

```bash
npm install
npm run dev
```

### Environment Variables

The following are pre-configured in the Bolt environment. For local development or a new Vercel project, add them to `.env`:

```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### Gemini AI Key

The AI features run through the `ai-assistant` edge function, which reads `GEMINI_API_KEY` from Supabase Edge Function secrets. If the key is not set, the app gracefully falls back to deterministic heuristic logic so all features remain functional.

To enable full Gemini-powered AI:

1. Go to your Supabase project → Edge Functions → Secrets.
2. Add a secret named `GEMINI_API_KEY` with your Google Gemini API key.
3. Redeploy the `ai-assistant` function (or it will pick up the secret on the next invocation).

## Database

The schema is managed via Supabase migrations (applied through the Supabase MCP). Tables:

- `profiles` — user profile data (owner-scoped)
- `scholarships` — global, read-only scholarship catalogue
- `saved_scholarships` — bookmarks (owner-scoped)
- `applications` — application tracker (owner-scoped)
- `notifications` — notifications (owner-scoped)
- `ai_chats` — assistant conversation history (owner-scoped)
- `ai_cache` — cached AI results (owner-scoped)
- `sop_reviews` — SOP/CV review history (owner-scoped)

All tables have Row Level Security enabled with owner-scoped policies.

## Edge Functions

- `ai-assistant` — handles match-score, eligibility, assistant, sop-review, and deadline-reminder features.
- `live-scholarships` — returns the verified scholarship catalogue with freshness metadata.

## Build

```bash
npm run build      # production build
npm run typecheck  # TypeScript checking
npm run preview    # preview the production build
```

## Deployment to Vercel

1. Push this repository to GitHub.
2. Import the project in Vercel.
3. Add the environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
4. Deploy.

## License

MIT
