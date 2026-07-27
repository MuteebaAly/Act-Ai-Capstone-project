import { useEffect, useState } from "react";
import {
  ArrowLeft, Bookmark, ExternalLink, Mail, MapPin, Calendar, Sparkles,
  Check, FileText, GraduationCap, Wallet, HeartPulse, Home, Globe, Users,
  BookOpen, Award, ChevronRight, ShieldCheck, AlertCircle, Loader2, Send,
  RefreshCw,
} from "lucide-react";
import { useApp } from "@/store/AppContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, fundingTone } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Progress } from "@/components/ui/Progress";
import { Avatar } from "@/components/ui/Logo";
import { getMatchScore, getEligibility, type MatchScoreResult, type EligibilityResult } from "@/lib/ai";

export function ScholarshipDetailsPage({ id }: { id: string }) {
  const { navigate, toggleSave, isSaved, getApplication, upsertApplication, scholarships, profile } = useApp();
  const scholarship = scholarships.find((s) => s.id === id || s.slug === id);

  const [tab, setTab] = useState("overview");
  const [match, setMatch] = useState<MatchScoreResult | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [eligLoading, setEligLoading] = useState(false);

  useEffect(() => {
    if (!scholarship || !profile) return;
    let cancelled = false;
    setMatchLoading(true);
    getMatchScore(profile, scholarship)
      .then((r) => { if (!cancelled) setMatch(r); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setMatchLoading(false); });
    return () => { cancelled = true; };
  }, [scholarship, profile]);

  const runEligibility = async () => {
    if (!scholarship || !profile) return;
    setEligLoading(true);
    try {
      const r = await getEligibility(profile, scholarship);
      setEligibility(r);
    } catch {
      setEligibility({ status: "Not Eligible", summary: "Could not run the eligibility check right now.", missing: [], strengths: [], ai: false });
    } finally {
      setEligLoading(false);
    }
  };

  if (!scholarship) {
    return (
      <DashboardLayout title="Scholarship not found">
        <Card className="p-10 text-center">
          <p className="text-ink-600 dark:text-ink-300">We couldn't find that scholarship.</p>
          <Button className="mt-4" onClick={() => navigate("/search")}>Back to search</Button>
        </Card>
      </DashboardLayout>
    );
  }

  const saved = isSaved(scholarship.id);
  const app = getApplication(scholarship.id);
  const daysLeft = scholarship.deadline ? Math.ceil((new Date(scholarship.deadline).getTime() - Date.now()) / 86400000) : null;
  const showSupervisors = (scholarship.degree_level === "Master's" || scholarship.degree_level === "PhD") && (scholarship.supervisors?.length ?? 0) > 0;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "benefits", label: "Benefits" },
    { id: "eligibility", label: "Eligibility" },
    { id: "ai", label: "AI Checker", icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: "documents", label: "Documents" },
    { id: "process", label: "Process" },
    ...(showSupervisors ? [{ id: "supervisors", label: "Supervisors" }] : []),
  ];

  return (
    <DashboardLayout title="Scholarship details" subtitle="Review the full details and apply on the official site.">
      <button onClick={() => navigate("/search")} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Back to search
      </button>

      {/* Hero card */}
      <Card className="overflow-hidden">
        <div className={`h-28 bg-gradient-to-r ${scholarship.university_accent} sm:h-32`} />
        <div className="px-5 pb-5 sm:px-7 sm:pb-7">
          <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${scholarship.university_accent} font-display text-xl font-bold text-white shadow-sm ring-4 ring-white dark:ring-ink-900`}>
              {scholarship.university_name.split(" ").filter((w) => w.length > 2 && !/^(of|the|and|for)$/i.test(w)).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge tone={fundingTone(scholarship.funding_type)}>{scholarship.funding_type}</Badge>
                <Badge tone="sky">{scholarship.degree_level}</Badge>
                <Badge tone="ink">{scholarship.field_of_study}</Badge>
                {scholarship.intake && <Badge tone="amber">{scholarship.intake}</Badge>}
              </div>
              <h1 className="mt-2 font-display text-2xl font-extrabold text-ink-900 dark:text-white">{scholarship.name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500 dark:text-ink-400">
                <MapPin className="h-4 w-4" /> {scholarship.university_name} · {scholarship.country_flag} {scholarship.country}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="md" onClick={() => toggleSave(scholarship.id)} leftIcon={<Bookmark className={`h-4 w-4 ${saved ? "fill-current text-brand-600" : ""}`} />}>
                {saved ? "Saved" : "Save"}
              </Button>
              <Button size="md" onClick={() => window.open(scholarship.official_url, "_blank")} leftIcon={<ExternalLink className="h-4 w-4" />}>
                Apply on official site
              </Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <QuickStat icon={Sparkles} label="Match score" value={matchLoading ? "…" : match ? `${match.score}%` : "—"} tone="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300" />
            <QuickStat icon={Calendar} label="Deadline" value={scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Rolling"} sub={daysLeft !== null ? `${daysLeft} days left` : undefined} tone="text-brand-600 bg-brand-50 dark:bg-brand-900/30 dark:text-brand-300" />
            <QuickStat icon={GraduationCap} label="GPA required" value={`${scholarship.gpa_requirement}/4.0`} tone="text-sky-600 bg-sky-50 dark:bg-sky-900/30 dark:text-sky-300" />
            <QuickStat icon={Award} label="English test" value={scholarship.english_test && scholarship.english_test !== "None" ? scholarship.english_test : "Optional"} sub={scholarship.english_score ? `${scholarship.english_score}+` : undefined} tone="text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300" />
          </div>
        </div>
      </Card>

      {/* AI match explanation banner */}
      {match && !matchLoading && (
        <Card className="mt-5 border-brand-200 bg-brand-50/40 p-4 dark:border-brand-800 dark:bg-brand-900/20">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-800 dark:text-brand-200">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-ink-900 dark:text-white">AI Match Analysis — {match.label}</p>
              <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">{match.explanation}</p>
              {!match.ai && <p className="mt-1.5 text-xs text-ink-400">Heuristic estimate — connect the AI service for a deeper analysis.</p>}
            </div>
          </div>
        </Card>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <Tabs tabs={tabs} active={tab} onChange={setTab} />
          <div className="mt-6">
            {tab === "overview" && <OverviewTab scholarship={scholarship} />}
            {tab === "benefits" && <BenefitsTab scholarship={scholarship} />}
            {tab === "eligibility" && <EligibilityTab scholarship={scholarship} />}
            {tab === "ai" && <AICheckerTab scholarship={scholarship} eligibility={eligibility} eligLoading={eligLoading} onRun={runEligibility} />}
            {tab === "documents" && <DocumentsTab scholarship={scholarship} />}
            {tab === "process" && <ProcessTab scholarship={scholarship} />}
            {tab === "supervisors" && showSupervisors && <SupervisorsTab scholarship={scholarship} />}
          </div>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="font-display text-base font-bold text-ink-900 dark:text-white">Funding summary</h3>
            <div className="mt-4 space-y-3">
              <FundingRow icon={Wallet} label="Tuition coverage" value={scholarship.tuition_coverage ? "Fully covered" : "Not covered"} ok={scholarship.tuition_coverage} />
              <FundingRow icon={Wallet} label="Monthly stipend" value={scholarship.monthly_stipend ? `$${Number(scholarship.monthly_stipend).toLocaleString()}` : "—"} ok={!!scholarship.monthly_stipend} />
              <FundingRow icon={HeartPulse} label="Health insurance" value={scholarship.health_insurance ? "Included" : "Not included"} ok={scholarship.health_insurance} />
              <FundingRow icon={Home} label="Accommodation" value={scholarship.accommodation ? "Provided" : "Not provided"} ok={scholarship.accommodation} />
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-display text-base font-bold text-ink-900 dark:text-white">Application status</h3>
            {app ? (
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-ink-700 dark:text-ink-200">{app.status}</span>
                  <span className="text-ink-500 dark:text-ink-400">{app.progress}%</span>
                </div>
                <Progress value={app.progress} className="mt-2" />
                <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">Updated {new Date(app.updated_at).toLocaleDateString()}</p>
                <Button variant="outline" size="sm" fullWidth className="mt-4" onClick={() => navigate("/tracker")}>Open in tracker</Button>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-sm text-ink-500 dark:text-ink-400">You haven't started this application yet.</p>
                <div className="mt-3 space-y-2">
                  <Button size="sm" fullWidth onClick={() => upsertApplication(scholarship.id, { status: "In Progress", progress: 10 })}>Start tracking</Button>
                  <Button variant="outline" size="sm" fullWidth onClick={() => window.open(scholarship.official_url, "_blank")} leftIcon={<ExternalLink className="h-4 w-4" />}>Visit official site</Button>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="font-display text-base font-bold text-ink-900 dark:text-white">Contact & links</h3>
            <div className="mt-3 space-y-2">
              <a href={`mailto:${scholarship.contact_email}`} className="flex items-center gap-2 rounded-lg p-2 text-sm text-ink-700 transition hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800">
                <Mail className="h-4 w-4 text-ink-400" /> <span className="truncate">{scholarship.contact_email}</span>
              </a>
              <a href={scholarship.university_website} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg p-2 text-sm text-ink-700 transition hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800">
                <Globe className="h-4 w-4 text-ink-400" /> <span className="truncate">University website</span>
              </a>
              <a href={scholarship.official_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg p-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-50 dark:hover:bg-brand-900/30">
                <ExternalLink className="h-4 w-4" /> Official scholarship page
              </a>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function QuickStat({ icon: Icon, label, value, sub, tone }: { icon: typeof Sparkles; label: string; value: string; sub?: string; tone: string }) {
  return (
    <div className="rounded-xl border border-ink-100 p-3 dark:border-ink-800">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}><Icon className="h-4 w-4" /></div>
      <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">{label}</p>
      <p className="font-display text-base font-bold text-ink-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-ink-400">{sub}</p>}
    </div>
  );
}

function FundingRow({ icon: Icon, label, value, ok }: { icon: typeof Wallet; label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${ok ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-ink-100 text-ink-400 dark:bg-ink-800"}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-ink-500 dark:text-ink-400">{label}</p>
        <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{value}</p>
      </div>
      {ok ? <Check className="h-4 w-4 text-emerald-500" /> : <span className="h-1.5 w-1.5 rounded-full bg-ink-300" />}
    </div>
  );
}

function SectionList({ items, icon: Icon }: { items: string[]; icon: typeof Check }) {
  return (
    <ul className="space-y-2.5">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-ink-700 dark:text-ink-300">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300"><Icon className="h-3 w-3" /></span>
          {it}
        </li>
      ))}
    </ul>
  );
}

type S = import("@/lib/supabase").DbScholarship;

function OverviewTab({ scholarship }: { scholarship: S }) {
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white">University overview</h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{scholarship.university_overview}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone="brand">#{scholarship.university_ranking} globally</Badge>
          <Badge tone="ink">{scholarship.city}</Badge>
          <Badge tone="sky">{scholarship.field_of_study}</Badge>
        </div>
      </Card>
      <Card className="p-5">
        <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white">Scholarship benefits</h3>
        <div className="mt-3"><SectionList items={scholarship.benefits ?? []} icon={Check} /></div>
      </Card>
    </div>
  );
}

function BenefitsTab({ scholarship }: { scholarship: S }) {
  return (
    <Card className="p-5">
      <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white">What's included</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <BenefitBox icon={Wallet} title="Tuition coverage" ok={scholarship.tuition_coverage} desc={scholarship.tuition_coverage ? "Full tuition fees covered for the program duration." : "Tuition is not covered by this scholarship."} />
        <BenefitBox icon={Wallet} title="Monthly stipend" ok={!!scholarship.monthly_stipend} desc={scholarship.monthly_stipend ? `$${Number(scholarship.monthly_stipend).toLocaleString()} per month for living costs.` : "No monthly stipend provided."} />
        <BenefitBox icon={HeartPulse} title="Health insurance" ok={scholarship.health_insurance} desc={scholarship.health_insurance ? "Comprehensive health insurance included." : "Health insurance not included."} />
        <BenefitBox icon={Home} title="Accommodation" ok={scholarship.accommodation} desc={scholarship.accommodation ? "On-campus or subsidised accommodation provided." : "Accommodation is not provided."} />
      </div>
      <div className="mt-5"><SectionList items={scholarship.benefits ?? []} icon={Check} /></div>
    </Card>
  );
}

function BenefitBox({ icon: Icon, title, ok, desc }: { icon: typeof Wallet; title: string; ok: boolean; desc: string }) {
  return (
    <div className={`rounded-xl border p-4 ${ok ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-800 dark:bg-emerald-900/20" : "border-ink-200 bg-ink-50/40 dark:border-ink-700 dark:bg-ink-800/40"}`}>
      <div className="flex items-center gap-2">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${ok ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-ink-100 text-ink-400 dark:bg-ink-800"}`}><Icon className="h-4 w-4" /></div>
        <p className="text-sm font-bold text-ink-900 dark:text-white">{title}</p>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink-600 dark:text-ink-300">{desc}</p>
    </div>
  );
}

function EligibilityTab({ scholarship }: { scholarship: S }) {
  return (
    <Card className="p-5">
      <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white">Eligibility criteria</h3>
      <div className="mt-3"><SectionList items={scholarship.eligibility ?? []} icon={Check} /></div>
    </Card>
  );
}

function AICheckerTab({ scholarship, eligibility, eligLoading, onRun }: { scholarship: S; eligibility: EligibilityResult | null; eligLoading: boolean; onRun: () => void }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-brand-600" />
        <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white">AI Eligibility Checker</h3>
      </div>
      <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
        Our AI analyses your profile against this scholarship's requirements and tells you whether you're eligible, partially eligible, or not eligible — with a clear list of what's missing.
      </p>
      {!eligibility && !eligLoading && (
        <Button className="mt-4" onClick={onRun} leftIcon={<ShieldCheck className="h-4 w-4" />}>Check my eligibility</Button>
      )}
      {eligLoading && (
        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-brand-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Analysing your profile…
        </div>
      )}
      {eligibility && !eligLoading && (
        <div className="mt-5 space-y-4">
          <div className={`flex items-center gap-3 rounded-xl p-4 ${eligibility.status === "Eligible" ? "bg-emerald-50 dark:bg-emerald-900/30" : eligibility.status === "Partially Eligible" ? "bg-amber-50 dark:bg-amber-900/30" : "bg-rose-50 dark:bg-rose-900/30"}`}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${eligibility.status === "Eligible" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-800 dark:text-emerald-200" : eligibility.status === "Partially Eligible" ? "bg-amber-100 text-amber-600 dark:bg-amber-800 dark:text-amber-200" : "bg-rose-100 text-rose-600 dark:bg-rose-800 dark:text-rose-200"}`}>
              {eligibility.status === "Eligible" ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            </div>
            <div>
              <p className="font-display text-base font-bold text-ink-900 dark:text-white">{eligibility.status}</p>
              <p className="text-sm text-ink-600 dark:text-ink-300">{eligibility.summary}</p>
            </div>
          </div>
          {eligibility.strengths.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Your strengths</p>
              <div className="mt-2"><SectionList items={eligibility.strengths} icon={Check} /></div>
            </div>
          )}
          {eligibility.missing.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-600">Missing requirements</p>
              <div className="mt-2">
                <ul className="space-y-2.5">
                  {eligibility.missing.map((m, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-ink-700 dark:text-ink-300">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300"><AlertCircle className="h-3 w-3" /></span>
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {!eligibility.ai && <p className="text-xs text-ink-400">Heuristic estimate — connect the AI service for a deeper analysis.</p>}
          <Button variant="outline" size="sm" onClick={onRun} leftIcon={<RefreshIcon />}>Re-run check</Button>
        </div>
      )}
    </Card>
  );
}

function RefreshIcon() {
  return <RefreshCw className="h-4 w-4" />;
}

function DocumentsTab({ scholarship }: { scholarship: S }) {
  return (
    <Card className="p-5">
      <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white">Required documents</h3>
      <div className="mt-3"><SectionList items={scholarship.required_documents ?? []} icon={FileText} /></div>
    </Card>
  );
}

function ProcessTab({ scholarship }: { scholarship: S }) {
  return (
    <Card className="p-5">
      <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white">Application process</h3>
      <ol className="mt-4 space-y-4">
        {(scholarship.application_process ?? []).map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">{i + 1}</span>
            <p className="pt-0.5 text-sm text-ink-700 dark:text-ink-300">{step}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function SupervisorsTab({ scholarship }: { scholarship: S }) {
  const supervisors = scholarship.supervisors ?? [];
  return (
    <div className="space-y-4">
      <Card className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300"><Users className="h-5 w-5" /></div>
        <div>
          <h3 className="font-display text-base font-bold text-ink-900 dark:text-white">Potential supervisors</h3>
          <p className="text-sm text-ink-500 dark:text-ink-400">Reach out to a supervisor whose research aligns with your interests before applying.</p>
        </div>
      </Card>
      {supervisors.map((sup: any) => (
        <Card key={sup.id} className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <Avatar name={sup.name} url={sup.photoUrl} size="lg" />
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h4 className="font-display text-base font-bold text-ink-900 dark:text-white">{sup.name}</h4>
                  <p className="text-sm text-brand-600 dark:text-brand-400">{sup.title}</p>
                  <p className="text-xs text-ink-500 dark:text-ink-400">{sup.department}</p>
                </div>
                <Badge tone="brand"><BookOpen className="h-3 w-3" /> {sup.publications} publications</Badge>
              </div>
              <div className="mt-3">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Research interests</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(sup.researchInterests ?? []).map((r: string) => <Badge key={r} tone="sky">{r}</Badge>)}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => window.open(`mailto:${sup.email}`)} leftIcon={<Mail className="h-4 w-4" />}>{sup.email}</Button>
                <Button size="sm" onClick={() => window.open(`mailto:${sup.email}`)} rightIcon={<ChevronRight className="h-4 w-4" />}>Contact supervisor</Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
