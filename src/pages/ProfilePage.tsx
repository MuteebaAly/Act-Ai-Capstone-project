import { useState } from "react";
import { Mail, Phone, MapPin, GraduationCap, BookOpen, Globe, Award, Pencil, Check, Loader2 } from "lucide-react";
import { useApp } from "@/store/AppContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Logo";
import { countries, fieldsOfStudy } from "@/data/sampleData";
import type { DbProfile } from "@/lib/supabase";

export function ProfilePage() {
  const { profile, profileLoading, updateProfile } = useApp();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<DbProfile | null>(profile);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // keep draft in sync when profile loads
  if (profile && !draft) setDraft(profile);
  if (profile && draft && draft.id !== profile.id) setDraft(profile);

  const set = <K extends keyof DbProfile>(k: K, v: DbProfile[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    await updateProfile(draft);
    setSaving(false);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const completion = profile?.profile_completion ?? 0;

  if (profileLoading && !profile) {
    return (
      <DashboardLayout title="My Profile" subtitle="Keep your profile up to date for the best matches.">
        <div className="flex items-center gap-2 py-20 text-ink-500"><Loader2 className="h-5 w-5 animate-spin" /> Loading profile…</div>
      </DashboardLayout>
    );
  }

  const p = editing ? (draft ?? profile) : profile;

  return (
    <DashboardLayout title="My Profile" subtitle="Keep your profile up to date for the best matches.">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-brand-600 to-sky-500" />
            <div className="px-5 pb-5 sm:px-7">
              <div className="-mt-10 flex items-end justify-between">
                <Avatar name={p?.full_name ?? "User"} url={p?.avatar_url ?? undefined} size="lg" className="ring-4 ring-white dark:ring-ink-900" />
                {!editing ? (
                  <Button variant="outline" size="sm" onClick={() => { setDraft(profile); setEditing(true); }} leftIcon={<Pencil className="h-4 w-4" />}>Edit profile</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setDraft(profile); }}>Cancel</Button>
                    <Button size="sm" onClick={save} disabled={saving} leftIcon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}>{saving ? "Saving…" : "Save"}</Button>
                  </div>
                )}
              </div>
              <h2 className="mt-3 font-display text-xl font-extrabold text-ink-900 dark:text-white">{p?.full_name}</h2>
              <p className="text-sm text-ink-500 dark:text-ink-400">{p?.email}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge tone="brand"><GraduationCap className="h-3 w-3" /> {p?.degree_level}</Badge>
                <Badge tone="sky"><BookOpen className="h-3 w-3" /> {p?.field_of_study}</Badge>
                <Badge tone="ink"><MapPin className="h-3 w-3" /> {p?.country || "—"}</Badge>
                <Badge tone="amber"><Award className="h-3 w-3" /> GPA {p?.gpa ?? "—"}</Badge>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h3 className="font-display text-base font-bold text-ink-900 dark:text-white">About</h3>
            {editing ? (
              <Textarea label="Bio" value={draft?.bio ?? ""} onChange={(e) => set("bio", e.target.value)} rows={4} className="mt-3" />
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{p?.bio || "No bio added yet."}</p>
            )}
          </Card>

          <Card className="p-5 sm:p-6">
            <h3 className="font-display text-base font-bold text-ink-900 dark:text-white">Academic profile</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {editing ? (
                <>
                  <Input label="Full name" value={draft?.full_name ?? ""} onChange={(e) => set("full_name", e.target.value)} />
                  <Input label="Email" value={draft?.email ?? ""} onChange={(e) => set("email", e.target.value)} />
                  <Select label="Degree level" value={draft?.degree_level ?? "Master's"} onChange={(e) => set("degree_level", e.target.value)}>
                    <option>Bachelor's</option><option>Master's</option><option>PhD</option>
                  </Select>
                  <Select label="Field of study" value={draft?.field_of_study ?? "Computer Science"} onChange={(e) => set("field_of_study", e.target.value)}>
                    {fieldsOfStudy.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </Select>
                  <Input label="GPA (out of 4.0)" type="number" step="0.1" value={draft?.gpa ?? 0} onChange={(e) => set("gpa", parseFloat(e.target.value) || 0)} />
                  <Select label="English test" value={draft?.english_test ?? "None"} onChange={(e) => set("english_test", e.target.value)}>
                    <option>None</option><option>IELTS</option><option>TOEFL</option><option>Duolingo</option><option>PTE</option>
                  </Select>
                  <Input label="English score" type="number" step="0.5" value={draft?.english_score ?? 0} onChange={(e) => set("english_score", parseFloat(e.target.value) || 0)} />
                  <Input label="Phone" value={draft?.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
                  <Input label="Country" value={draft?.country ?? ""} onChange={(e) => set("country", e.target.value)} />
                </>
              ) : (
                <>
                  <InfoRow icon={GraduationCap} label="Degree level" value={p?.degree_level ?? "—"} />
                  <InfoRow icon={BookOpen} label="Field of study" value={p?.field_of_study ?? "—"} />
                  <InfoRow icon={Award} label="GPA" value={`${p?.gpa ?? "—"} / 4.0`} />
                  <InfoRow icon={Award} label="English test" value={p?.english_test && p.english_test !== "None" ? `${p.english_test} ${p.english_score}` : "Not provided"} />
                  <InfoRow icon={Mail} label="Email" value={p?.email ?? "—"} />
                  <InfoRow icon={Phone} label="Phone" value={p?.phone || "—"} />
                </>
              )}
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h3 className="font-display text-base font-bold text-ink-900 dark:text-white">Target countries</h3>
            {editing ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {countries.map((c) => {
                  const active = (draft?.target_countries ?? []).includes(c);
                  return (
                    <button key={c} onClick={() => set("target_countries", active ? (draft?.target_countries ?? []).filter((x) => x !== c) : [...(draft?.target_countries ?? []), c])} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${active ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700"}`}>{c}</button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(p?.target_countries ?? []).length > 0 ? p?.target_countries.map((c) => <Badge key={c} tone="brand"><Globe className="h-3 w-3" /> {c}</Badge>) : <span className="text-sm text-ink-400">No target countries set.</span>}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="font-display text-base font-bold text-ink-900 dark:text-white">Profile completion</h3>
            <p className="mt-3 font-display text-3xl font-extrabold text-ink-900 dark:text-white">{completion}%</p>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
              <div className="h-full rounded-full bg-brand-500 transition-all duration-700" style={{ width: `${completion}%` }} />
            </div>
            <p className="mt-3 text-xs text-ink-500 dark:text-ink-400">{completion === 100 ? "Your profile is complete." : "Add more details to improve your match quality."}</p>
          </Card>
          <Card className="p-5">
            <h3 className="font-display text-base font-bold text-ink-900 dark:text-white">Member since</h3>
            <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{p?.joined_date || "—"}</p>
          </Card>
          {saved && <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"><Check className="h-4 w-4" /> Profile updated successfully.</div>}
        </div>
      </div>
    </DashboardLayout>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400"><Icon className="h-4 w-4" /></div>
      <div>
        <p className="text-xs text-ink-500 dark:text-ink-400">{label}</p>
        <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{value}</p>
      </div>
    </div>
  );
}
