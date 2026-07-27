import { useState } from "react";
import { Bell, Globe, Lock, User, Mail, Check, Moon, Monitor, Loader2 } from "lucide-react";
import { useApp } from "@/store/AppContext";
import { useTheme } from "@/store/ThemeContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Logo";

export function SettingsPage() {
  const { profile, signOut } = useApp();
  const { theme, setTheme } = useTheme();
  const [toggles, setToggles] = useState({
    emailDeadlines: true, emailMatches: true, emailStatus: true, pushNotif: false, weeklyDigest: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (k: keyof typeof toggles) => setToggles((t) => ({ ...t, [k]: !t[k] }));
  const save = () => { setSaving(true); setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500); }, 600); };

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account, notifications and preferences.">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <SectionHeader icon={User} title="Account" subtitle="Your personal information." />
            <div className="mt-4 flex items-center gap-4">
              <Avatar name={profile?.full_name ?? "User"} url={profile?.avatar_url ?? undefined} size="lg" />
              <div>
                <p className="font-display text-base font-bold text-ink-900 dark:text-white">{profile?.full_name}</p>
                <p className="text-sm text-ink-500 dark:text-ink-400">{profile?.email}</p>
                <Button variant="outline" size="sm" className="mt-2">Change photo</Button>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input label="Full name" defaultValue={profile?.full_name ?? ""} />
              <Input label="Email" defaultValue={profile?.email ?? ""} leftIcon={<Mail className="h-4 w-4" />} />
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionHeader icon={Bell} title="Notifications" subtitle="Choose what we contact you about." />
            <div className="mt-4 divide-y divide-ink-100 dark:divide-ink-800">
              <ToggleRow label="Deadline reminders" desc="Get notified before a scholarship deadline." checked={toggles.emailDeadlines} onChange={() => toggle("emailDeadlines")} />
              <ToggleRow label="New scholarship matches" desc="When we find new scholarships matching your profile." checked={toggles.emailMatches} onChange={() => toggle("emailMatches")} />
              <ToggleRow label="Application status updates" desc="Changes to your tracked applications." checked={toggles.emailStatus} onChange={() => toggle("emailStatus")} />
              <ToggleRow label="Push notifications" desc="Real-time alerts in your browser." checked={toggles.pushNotif} onChange={() => toggle("pushNotif")} />
              <ToggleRow label="Weekly digest" desc="A weekly summary of new opportunities." checked={toggles.weeklyDigest} onChange={() => toggle("weeklyDigest")} />
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionHeader icon={Globe} title="Appearance" subtitle="Customise how StudyMatch looks." />
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-ink-700 dark:text-ink-200">Theme</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "light", label: "Light", icon: Sun },
                  { id: "dark", label: "Dark", icon: Moon },
                  { id: "system", label: "System", icon: Monitor },
                ].map((t) => {
                  const Icon = t.icon;
                  const active = theme === t.id || (t.id === "system" && false);
                  return (
                    <button key={t.id} onClick={() => t.id !== "system" && setTheme(t.id as "light" | "dark")} className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-semibold transition ${active ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-900/30 dark:text-brand-300" : "border-ink-200 text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800"}`}>
                      <Icon className="h-5 w-5" /> {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionHeader icon={Lock} title="Security" subtitle="Keep your account safe." />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input label="Current password" type="password" placeholder="••••••••" />
              <Input label="New password" type="password" placeholder="••••••••" />
            </div>
            <Button className="mt-4" onClick={save} disabled={saving} leftIcon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}>{saving ? "Saving…" : "Save changes"}</Button>
            {saved && <p className="mt-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">Settings saved.</p>}
          </Card>

          <Card className="border-rose-200 p-5 sm:p-6 dark:border-rose-800">
            <SectionHeader icon={Lock} title="Danger zone" subtitle="Irreversible account actions." />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" onClick={signOut}>Sign out</Button>
              <Button variant="danger">Delete account</Button>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="font-display text-base font-bold text-ink-900 dark:text-white">Need help?</h3>
            <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">Visit our help center or contact support for any questions about your account.</p>
            <Button variant="secondary" size="sm" fullWidth className="mt-4">Contact support</Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: typeof Bell; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300"><Icon className="h-5 w-5" /></div>
      <div>
        <h2 className="font-display text-base font-bold text-ink-900 dark:text-white">{title}</h2>
        <p className="text-sm text-ink-500 dark:text-ink-400">{subtitle}</p>
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <div>
        <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{label}</p>
        <p className="text-xs text-ink-500 dark:text-ink-400">{desc}</p>
      </div>
      <button onClick={onChange} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-brand-600" : "bg-ink-200 dark:bg-ink-700"}`} aria-pressed={checked}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

function Sun(props: { className?: string }) {
  return <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>;
}
