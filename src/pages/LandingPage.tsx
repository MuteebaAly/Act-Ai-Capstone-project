import { useState } from "react";
import {
  Sparkles, Globe2, CalendarClock, FolderCheck, ShieldCheck, Users,
  UserPlus, Wand2, Rocket, ArrowRight, Check, ChevronDown, Star,
} from "lucide-react";
import { useApp } from "@/store/AppContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { UniversityLogo } from "@/components/ui/Logo";
import { features, howItWorks, stats, faqs, universities } from "@/data/sampleData";

const iconMap: Record<string, typeof Sparkles> = {
  Sparkles, Globe2, CalendarClock, FolderCheck, ShieldCheck, Users,
  UserPlus, Wand2, Rocket,
};

export function LandingPage() {
  const { navigate } = useApp();
  return (
    <div className="mesh-bg min-h-screen dark:bg-ink-950">
      <Navbar />
      <Hero onStart={() => navigate("/signup")} onExplore={() => navigate("/search")} />
      <TrustedBar />
      <Features />
      <HowItWorks />
      <Stats />
      <TopUniversities />
      <CTASection onStart={() => navigate("/signup")} />
      <FAQ />
      <Footer />
    </div>
  );
}

function Hero({ onStart, onExplore }: { onStart: () => void; onExplore: () => void }) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 lg:pt-24">
      <div className="container-app">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="animate-fade-up">
            <Badge tone="brand" className="mb-5 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5" /> AI-powered scholarship matching
            </Badge>
            <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-ink-900 dark:text-white sm:text-5xl lg:text-6xl">
              Find your perfect scholarship, <span className="gradient-text">all in one place</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-600 dark:text-ink-300">
              Stop scouring hundreds of university websites. Enter your academic profile once and
              instantly receive personalised, ranked scholarship opportunities from 95 countries.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={onStart} rightIcon={<ArrowRight className="h-5 w-5" />}>
                Get matched for free
              </Button>
              <Button size="lg" variant="outline" onClick={onExplore}>
                Explore scholarships
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-500 dark:text-ink-400">
              {["No credit card required", "12,400+ scholarships", "Updated weekly"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-500" /> {t}
                </span>
              ))}
            </div>
          </div>
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative animate-fade-up [animation-delay:120ms]">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-brand-200/40 via-sky-200/30 to-transparent blur-2xl" />
      <div className="card relative overflow-hidden p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <Badge tone="brand"><Sparkles className="h-3 w-3" /> 96% match</Badge>
        </div>
        <div className="mt-4 rounded-2xl bg-gradient-to-br from-brand-600 to-sky-500 p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Top recommendation</p>
          <p className="mt-1 font-display text-lg font-bold">Rhodes Scholarship</p>
          <p className="text-sm text-white/80">University of Oxford · Master's · Fully Funded</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-semibold">Deadline: Oct 4, 2026</span>
            <span className="rounded-lg bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">£1,900/mo</span>
          </div>
        </div>
        <div className="mt-3 space-y-2.5">
          {[
            { n: "MIT Presidential Fellowship", m: "88%", u: "MIT · PhD", tone: "from-sky-600 to-brand-700" },
            { n: "ETH Excellence Scholarship", m: "85%", u: "ETH Zürich · Master's", tone: "from-ink-700 to-ink-900" },
          ].map((r) => (
            <div key={r.n} className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white p-3 dark:border-ink-800 dark:bg-ink-900">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${r.tone} text-xs font-bold text-white`}>
                {r.u.split(" ")[0].slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink-800 dark:text-ink-100">{r.n}</p>
                <p className="truncate text-xs text-ink-500 dark:text-ink-400">{r.u}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600">{r.m}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -right-4 -top-4 hidden animate-float rounded-2xl bg-white px-4 py-3 shadow-lift dark:bg-ink-800 sm:block">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Check className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-ink-800 dark:text-ink-100">Application submitted</p>
            <p className="text-[10px] text-ink-500 dark:text-ink-400">ETH Zürich</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustedBar() {
  return (
    <section className="border-y border-ink-100 bg-white/60 py-6 dark:border-ink-800 dark:bg-ink-900/60">
      <div className="container-app">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-ink-400">
          Scholarships from the world's leading universities
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-ink-400 dark:text-ink-500">
          {universities.slice(0, 6).map((u) => (
            <span key={u.id} className="flex items-center gap-2 text-sm font-bold text-ink-500">
              <span className="text-lg">{u.countryFlag}</span> {u.name.split(" ").slice(-2).join(" ")}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="py-20 sm:py-24">
      <div className="container-app">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to find and win funding"
          subtitle="A complete platform built around how students actually search for scholarships."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = iconMap[f.icon];
            return (
              <div
                key={f.title}
                className="card group p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-ink-900 dark:text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="bg-white py-20 dark:bg-ink-900 sm:py-24">
      <div className="container-app">
        <SectionHeading
          eyebrow="How it works"
          title="Three steps to your scholarship"
          subtitle="From profile to application in minutes, not months."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {howItWorks.map((s, i) => {
            const Icon = iconMap[s.icon];
            return (
              <div key={s.step} className="relative animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="card h-full p-7">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-sky-500 text-white shadow-sm">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-display text-4xl font-extrabold text-ink-100 dark:text-ink-800">{s.step}</span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-ink-900 dark:text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{s.description}</p>
                </div>
                {i < howItWorks.length - 1 && (
                  <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-ink-200 md:block">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="py-16">
      <div className="container-app">
        <div className="grid grid-cols-2 gap-4 rounded-3xl bg-gradient-to-br from-brand-700 to-brand-600 p-8 text-white sm:grid-cols-4 sm:p-12">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-extrabold sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-white/80">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TopUniversities() {
  return (
    <section id="universities" className="bg-white py-20 dark:bg-ink-900 sm:py-24">
      <div className="container-app">
        <SectionHeading
          eyebrow="Top universities"
          title="Funding from institutions you recognise"
          subtitle="We index scholarships from over 1,850 universities worldwide."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {universities.slice(0, 8).map((u, i) => (
            <div
              key={u.id}
              className="card group flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-lift animate-fade-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <UniversityLogo university={u} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink-900 dark:text-white">{u.name}</p>
                <p className="truncate text-xs text-ink-500">{u.countryFlag} {u.country} · #{u.ranking}</p>
              </div>
              <Star className="h-4 w-4 text-amber-400" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ onStart }: { onStart: () => void }) {
  return (
    <section className="py-16">
      <div className="container-app">
        <div className="relative overflow-hidden rounded-3xl bg-ink-900 px-8 py-14 text-center sm:px-16">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand-600/30 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-sky-500/30 blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
              Your scholarship is waiting.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-ink-300">
              Join 230,000 students who found their perfect match with StudyMatch AI. It's free to start.
            </p>
            <Button size="lg" className="mt-8" onClick={onStart} rightIcon={<ArrowRight className="h-5 w-5" />}>
              Create your free profile
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="bg-white py-20 dark:bg-ink-900 sm:py-24">
      <div className="container-app">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions, answered"
          subtitle="Everything you need to know about finding scholarships with StudyMatch AI."
        />
        <div className="mx-auto mt-10 max-w-3xl space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-display text-base font-bold text-ink-900 dark:text-white">{f.q}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-ink-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-ink-600">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="text-xs font-bold uppercase tracking-widest text-brand-600">{eyebrow}</span>
      <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-lg text-ink-600 dark:text-ink-300">{subtitle}</p>}
    </div>
  );
}
