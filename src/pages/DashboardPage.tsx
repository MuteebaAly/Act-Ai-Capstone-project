import {
  Sparkles, Bookmark, CalendarClock, ListChecks, TrendingUp,
  ArrowRight, Search, Clock, CheckCircle2, AlertCircle, GraduationCap, Loader2,
} from "lucide-react";
import { useApp } from "@/store/AppContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, fundingTone } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { EmptyState, SkeletonCard } from "@/components/ui/Feedback";

export function DashboardPage() {
  const { profile, profileLoading, savedIds, applications, applicationsLoading, navigate, recentSearches, scholarships, scholarshipsLoading } = useApp();

  const saved = scholarships.filter((s) => savedIds.includes(s.id));
  const upcoming = [...scholarships]
    .filter((s) => s.deadline && new Date(s.deadline).getTime() > Date.now())
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 4);
  const recommended = [...scholarships].sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0)).slice(0, 3);

  const completion = profile?.profile_completion ?? 0;
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <DashboardLayout title={`Welcome back, ${firstName}`} subtitle="Here's what's happening with your scholarship search.">
      <div className="space-y-6">
        <div className="grid gap-5 lg:grid-cols-3">
          <ProfileCompletionCard completion={completion} onContinue={() => navigate("/profile")} loading={profileLoading} />
          <StatCard icon={Bookmark} label="Saved scholarships" value={saved.length} tone="brand" onClick={() => navigate("/saved")} />
          <StatCard icon={ListChecks} label="Active applications" value={applications.length} tone="sky" onClick={() => navigate("/tracker")} />
        </div>

        <Card className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-brand-600" />
              <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Upcoming deadlines</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/search")} rightIcon={<ArrowRight className="h-4 w-4" />}>View all</Button>
          </div>
          {scholarshipsLoading ? (
            <div className="space-y-2.5">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : upcoming.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-500">No upcoming deadlines.</p>
          ) : (
            <div className="space-y-2.5">
              {upcoming.map((s) => {
                const days = Math.ceil((new Date(s.deadline!).getTime() - Date.now()) / 86400000);
                const urgent = days <= 45;
                return (
                  <button key={s.id} onClick={() => navigate(`/scholarship/${s.id}`)} className="flex w-full items-center gap-3 rounded-xl border border-ink-100 p-3 text-left transition hover:border-brand-200 hover:bg-brand-50/40 dark:border-ink-800 dark:hover:border-brand-800 dark:hover:bg-brand-900/20">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${s.university_accent} text-xs font-bold text-white`}>
                      {s.university_name.split(" ").filter((w) => w.length > 2 && !/^(of|the|and|for)$/i.test(w)).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink-900 dark:text-white">{s.name}</p>
                      <p className="truncate text-xs text-ink-500 dark:text-ink-400">{s.university_name} · {s.degree_level}</p>
                    </div>
                    <Badge tone={urgent ? "rose" : "ink"}>{days} days</Badge>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="p-5 sm:p-6 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-600" />
                <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Recommended for you</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/search")} rightIcon={<ArrowRight className="h-4 w-4" />}>More</Button>
            </div>
            {scholarshipsLoading ? (
              <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)}</div>
            ) : (
              <div className="space-y-3">
                {recommended.map((s) => (
                  <button key={s.id} onClick={() => navigate(`/scholarship/${s.id}`)} className="group flex w-full items-center gap-3 rounded-xl border border-ink-100 p-3 text-left transition hover:border-brand-200 hover:shadow-soft dark:border-ink-800 dark:hover:border-brand-800">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${s.university_accent} text-xs font-bold text-white`}>
                      {s.university_name.split(" ").filter((w) => w.length > 2 && !/^(of|the|and|for)$/i.test(w)).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">{s.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <Badge tone={fundingTone(s.funding_type)}>{s.funding_type}</Badge>
                        <Badge tone="sky">{s.degree_level}</Badge>
                        <span className="text-xs text-ink-500 dark:text-ink-400">{s.country_flag} {s.country}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-sm font-bold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
                      <Sparkles className="h-3.5 w-3.5" /> {s.matchScore ?? "—"}%
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-ink-500" />
              <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Recent searches</h2>
            </div>
            <div className="space-y-2">
              {recentSearches.map((q, i) => (
                <button key={i} onClick={() => navigate("/search")} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-ink-600 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800">
                  <Search className="h-4 w-4 text-ink-400" />
                  <span className="truncate">{q}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-brand-600" />
              <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Application tracker</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/tracker")} rightIcon={<ArrowRight className="h-4 w-4" />}>Open tracker</Button>
          </div>
          {applicationsLoading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-ink-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading applications…</div>
          ) : applications.length === 0 ? (
            <EmptyState icon={<ListChecks className="h-7 w-7" />} title="No applications yet" description="Start applying to scholarships to track your progress here." action={<Button size="sm" onClick={() => navigate("/search")}>Browse scholarships</Button>} />
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 4).map((a) => {
                const s = scholarships.find((x) => x.id === a.scholarship_id);
                if (!s) return null;
                return (
                  <div key={a.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3 dark:border-ink-800">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${s.university_accent} text-xs font-bold text-white`}>
                      {s.university_name.split(" ").filter((w) => w.length > 2 && !/^(of|the|and|for)$/i.test(w)).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink-900 dark:text-white">{s.name}</p>
                      <div className="mt-1.5"><Progress value={a.progress} size="sm" /></div>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

function ProfileCompletionCard({ completion, onContinue, loading }: { completion: number; onContinue: () => void; loading: boolean }) {
  return (
    <Card className="relative overflow-hidden p-5 sm:p-6">
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand-100/60 blur-2xl dark:bg-brand-900/40" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300"><TrendingUp className="h-5 w-5" /></div>
          <h2 className="font-display text-base font-bold text-ink-900 dark:text-white">Profile completion</h2>
        </div>
        {loading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-ink-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
        ) : (
          <>
            <div className="mt-4 flex items-end justify-between">
              <span className="font-display text-3xl font-extrabold text-ink-900 dark:text-white">{completion}%</span>
              <span className="text-xs text-ink-500 dark:text-ink-400">{completion === 100 ? "All set!" : "Almost there"}</span>
            </div>
            <Progress value={completion} className="mt-2" />
            <p className="mt-3 text-xs text-ink-500 dark:text-ink-400">
              {completion === 100 ? "Your profile is complete — you'll get the best matches." : "Complete your profile to unlock better, more accurate matches."}
            </p>
            <Button variant="secondary" size="sm" fullWidth className="mt-4" onClick={onContinue} rightIcon={<ArrowRight className="h-4 w-4" />}>
              {completion === 100 ? "View profile" : "Continue setup"}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}

function StatCard({ icon: Icon, label, value, tone, onClick }: { icon: typeof Bookmark; label: string; value: number; tone: "brand" | "sky"; onClick: () => void }) {
  const tones = { brand: "bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300", sky: "bg-sky-50 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300" };
  return (
    <Card hover className="p-5 sm:p-6" onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}><Icon className="h-5 w-5" /></div>
        <ArrowRight className="h-4 w-4 text-ink-300" />
      </div>
      <p className="mt-4 font-display text-3xl font-extrabold text-ink-900 dark:text-white">{value}</p>
      <p className="text-sm text-ink-500 dark:text-ink-400">{label}</p>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { tone: "ink" | "amber" | "brand" | "sky" | "green" | "rose"; icon: typeof CheckCircle2 }> = {
    "Not Started": { tone: "ink", icon: AlertCircle },
    "In Progress": { tone: "amber", icon: Clock },
    "Submitted": { tone: "brand", icon: CheckCircle2 },
    "Under Review": { tone: "sky", icon: Clock },
    "Accepted": { tone: "green", icon: CheckCircle2 },
    "Rejected": { tone: "rose", icon: AlertCircle },
  };
  const cfg = map[status] ?? map["Not Started"];
  const Icon = cfg.icon;
  return <Badge tone={cfg.tone} className="shrink-0"><Icon className="h-3 w-3" /> {status}</Badge>;
}
