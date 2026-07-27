import { type ReactNode, useState } from "react";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Check, Loader2, AlertCircle } from "lucide-react";
import { useApp } from "@/store/AppContext";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Wordmark } from "@/components/Wordmark";
import { fieldsOfStudy } from "@/data/sampleData";

function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  const { navigate } = useApp();
  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="container-app flex flex-col items-center justify-center py-10">
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-6 text-center">
            <div className="mb-4 flex justify-center lg:hidden"><Wordmark onClick={() => navigate("/")} /></div>
            <h1 className="font-display text-2xl font-extrabold text-ink-900 dark:text-white">{title}</h1>
            <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">{subtitle}</p>
          </div>
          <div className="card p-6 sm:p-8">{children}</div>
          <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-400">{footer}</p>
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { signIn, navigate } = useApp();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setError(error);
    else navigate("/dashboard");
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue your scholarship journey." footer={<>Don't have an account? <button onClick={() => navigate("/signup")} className="font-semibold text-brand-600 hover:text-brand-700">Sign up free</button></>}>
      <form onSubmit={submit} className="space-y-4">
        {error && <ErrorBanner message={error} />}
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" leftIcon={<Mail className="h-4 w-4" />} required />
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-sm font-semibold text-ink-700 dark:text-ink-200">Password</span>
            <button type="button" className="text-xs font-semibold text-brand-600 hover:text-brand-700">Forgot?</button>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="input-base pl-10 pr-10" placeholder="••••••••" required />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          </div>
        </div>
        <Button type="submit" fullWidth size="lg" disabled={loading} leftIcon={loading ? <Loader2 className="h-5 w-5 animate-spin" /> : undefined}>
          {loading ? "Signing in…" : "Log in"}
        </Button>
      </form>
      <div className="relative py-2"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-ink-100 dark:border-ink-800" /></div><div className="relative flex justify-center"><span className="bg-white px-3 text-xs font-semibold text-ink-400 dark:bg-ink-900">OR</span></div></div>
      <Button type="button" variant="outline" fullWidth size="lg" onClick={() => navigate("/signup")}>Create a free account</Button>
    </AuthShell>
  );
}

export function SignUpPage() {
  const { signUp, navigate } = useApp();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", degreeLevel: "Master's", fieldOfStudy: "Computer Science" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.fullName);
    setLoading(false);
    if (error) setError(error);
    else navigate("/dashboard");
  };

  return (
    <AuthShell title="Create your free account" subtitle="Get matched with scholarships in under two minutes." footer={<>Already have an account? <button onClick={() => navigate("/login")} className="font-semibold text-brand-600 hover:text-brand-700">Log in</button></>}>
      <form onSubmit={submit} className="space-y-4">
        {error && <ErrorBanner message={error} />}
        <Input label="Full name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Amara Okafor" leftIcon={<User className="h-4 w-4" />} required />
        <Input label="Email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" leftIcon={<Mail className="h-4 w-4" />} required />
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-200">Password</span>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input type={show ? "text" : "password"} value={form.password} onChange={(e) => set("password", e.target.value)} className="input-base pl-10 pr-10" placeholder="Create a password (min 6 characters)" required />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Degree level" value={form.degreeLevel} onChange={(e) => set("degreeLevel", e.target.value)}>
            <option>Bachelor's</option><option>Master's</option><option>PhD</option>
          </Select>
          <Select label="Field of study" value={form.fieldOfStudy} onChange={(e) => set("fieldOfStudy", e.target.value)}>
            {fieldsOfStudy.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </Select>
        </div>
        <Button type="submit" fullWidth size="lg" disabled={loading} leftIcon={loading ? <Loader2 className="h-5 w-5 animate-spin" /> : undefined}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
        <div className="flex items-center justify-center gap-4 text-xs text-ink-500 dark:text-ink-400">
          {["Free forever", "No credit card", "12,400+ scholarships"].map((t) => <span key={t} className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-emerald-500" /> {t}</span>)}
        </div>
      </form>
    </AuthShell>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {message}
    </div>
  );
}
