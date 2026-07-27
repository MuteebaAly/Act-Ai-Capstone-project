import { useEffect, useState } from "react";
import { ListChecks, Plus, Trash2, ExternalLink, Sparkles, Loader2, CalendarClock } from "lucide-react";
import { useApp } from "@/store/AppContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { EmptyState } from "@/components/ui/Feedback";
import { getDeadlineReminders, type DeadlineReminder } from "@/lib/ai";

const statuses = ["Not Started", "In Progress", "Submitted", "Under Review", "Accepted", "Rejected"];
const statusTone: Record<string, "ink" | "amber" | "brand" | "sky" | "green" | "rose"> = {
  "Not Started": "ink", "In Progress": "amber", "Submitted": "brand",
  "Under Review": "sky", "Accepted": "green", "Rejected": "rose",
};

export function TrackerPage() {
  const { applications, applicationsLoading, upsertApplication, removeApplication, navigate, savedIds, scholarships, profile } = useApp();
  const [reminders, setReminders] = useState<DeadlineReminder[]>([]);
  const [remindersLoading, setRemindersLoading] = useState(false);
  const [remindersLoaded, setRemindersLoaded] = useState(false);

  const stats = {
    total: applications.length,
    inProgress: applications.filter((a) => a.status === "In Progress").length,
    submitted: applications.filter((a) => ["Submitted", "Under Review"].includes(a.status)).length,
    accepted: applications.filter((a) => a.status === "Accepted").length,
  };

  const loadReminders = async () => {
    if (!profile || scholarships.length === 0) return;
    setRemindersLoading(true);
    try {
      const r = await getDeadlineReminders(profile, scholarships, applications);
      setReminders(r.reminders);
    } catch {
      setReminders([]);
    } finally {
      setRemindersLoading(false);
      setRemindersLoaded(true);
    }
  };

  useEffect(() => {
    if (profile && scholarships.length > 0 && !remindersLoaded && !remindersLoading) {
      loadReminders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, scholarships.length]);

  return (
    <DashboardLayout title="Application Tracker" subtitle="Track every scholarship from saved to accepted.">
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatBox label="Total" value={stats.total} tone="bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200" />
        <StatBox label="In progress" value={stats.inProgress} tone="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300" />
        <StatBox label="Submitted" value={stats.submitted} tone="bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300" />
        <StatBox label="Accepted" value={stats.accepted} tone="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300" />
      </div>

      {/* AI Deadline Reminders */}
      <Card className="mb-6 border-brand-200 bg-brand-50/30 p-5 dark:border-brand-800 dark:bg-brand-900/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300"><Sparkles className="h-5 w-5" /></div>
            <div>
              <h2 className="font-display text-base font-bold text-ink-900 dark:text-white">AI Deadline Reminders</h2>
              <p className="text-xs text-ink-500 dark:text-ink-400">Smart, prioritised reminders based on your applications.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={loadReminders} disabled={remindersLoading} leftIcon={remindersLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}>
            {remindersLoading ? "Analysing…" : "Refresh"}
          </Button>
        </div>
        {remindersLoaded && reminders.length > 0 && (
          <div className="mt-4 space-y-2">
            {reminders.slice(0, 5).map((r, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-ink-100 bg-white p-3 dark:border-ink-800 dark:bg-ink-900">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${r.priority === "High" ? "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300" : r.priority === "Medium" ? "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300" : "bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-300"}`}>
                  <CalendarClock className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-ink-900 dark:text-white">{r.scholarship}</p>
                    <Badge tone={r.priority === "High" ? "rose" : r.priority === "Medium" ? "amber" : "ink"}>{r.priority}</Badge>
                  </div>
                  <p className="text-xs text-ink-500 dark:text-ink-400">{r.message}</p>
                  <p className="mt-1 text-xs font-semibold text-brand-600 dark:text-brand-400">{r.suggestedAction}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {remindersLoaded && reminders.length === 0 && !remindersLoading && (
          <p className="mt-4 text-sm text-ink-500 dark:text-ink-400">No upcoming deadlines to remind you about right now.</p>
        )}
      </Card>

      {applicationsLoading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-ink-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading applications…</div>
      ) : applications.length === 0 ? (
        <EmptyState icon={<ListChecks className="h-7 w-7" />} title="No applications to track" description="Start by saving scholarships and moving them into your tracker." action={<Button size="sm" onClick={() => navigate("/search")}>Browse scholarships</Button>} />
      ) : (
        <div className="space-y-3">
          {applications.map((a) => {
            const s = scholarships.find((x) => x.id === a.scholarship_id);
            if (!s) return null;
            return (
              <Card key={a.id} className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <button onClick={() => navigate(`/scholarship/${s.id}`)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${s.university_accent} text-xs font-bold text-white`}>
                      {s.university_name.split(" ").filter((w) => w.length > 2 && !/^(of|the|and|for)$/i.test(w)).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm font-bold text-ink-900 hover:text-brand-700 dark:text-white">{s.name}</p>
                      <p className="truncate text-xs text-ink-500 dark:text-ink-400">{s.university_name} · {s.degree_level} · {s.field_of_study}</p>
                    </div>
                  </button>
                  <div className="flex flex-1 flex-col gap-2 lg:max-w-md">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-ink-500 dark:text-ink-400">Status</span>
                      <span className="text-xs text-ink-400">Updated {new Date(a.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {statuses.map((st) => (
                        <button key={st} onClick={() => {
                          const progress = st === "Not Started" ? 5 : st === "In Progress" ? 40 : 100;
                          upsertApplication(s.id, { status: st, progress });
                        }}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${a.status === st ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700"}`}>
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(s.official_url, "_blank")} leftIcon={<ExternalLink className="h-4 w-4" />}>Official site</Button>
                    <button onClick={() => removeApplication(a.id)} className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <Progress value={a.progress} size="sm" className="flex-1" />
                  <span className="text-xs font-bold text-ink-600 dark:text-ink-300">{a.progress}%</span>
                  <Badge tone={statusTone[a.status] ?? "ink"}>{a.status}</Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {savedIds.length > 0 && (
        <Card className="mt-6 p-5">
          <h3 className="font-display text-base font-bold text-ink-900 dark:text-white">Add a saved scholarship to your tracker</h3>
          <div className="mt-3 space-y-2">
            {savedIds.filter((id) => !applications.some((a) => a.scholarship_id === id)).map((id) => {
              const s = scholarships.find((x) => x.id === id);
              if (!s) return null;
              return (
                <div key={id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3 dark:border-ink-800">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${s.university_accent} text-xs font-bold text-white`}>
                    {s.university_name.split(" ").filter((w) => w.length > 2 && !/^(of|the|and|for)$/i.test(w)).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink-900 dark:text-white">{s.name}</p>
                    <p className="truncate text-xs text-ink-500 dark:text-ink-400">{s.university_name}</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => upsertApplication(s.id, { status: "Not Started", progress: 5 })} leftIcon={<Plus className="h-4 w-4" />}>Add to tracker</Button>
                </div>
              );
            })}
            {savedIds.filter((id) => !applications.some((a) => a.scholarship_id === id)).length === 0 && (
              <p className="text-sm text-ink-500 dark:text-ink-400">All your saved scholarships are already being tracked.</p>
            )}
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
}

function StatBox({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <Card className="p-4">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}><ListChecks className="h-4 w-4" /></div>
      <p className="mt-3 font-display text-2xl font-extrabold text-ink-900 dark:text-white">{value}</p>
      <p className="text-sm text-ink-500 dark:text-ink-400">{label}</p>
    </Card>
  );
}
