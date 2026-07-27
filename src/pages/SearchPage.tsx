import { useMemo, useState, useEffect } from "react";
import { Search, SlidersHorizontal, X, RotateCcw, ChevronDown, Sparkles, RefreshCw } from "lucide-react";
import { useApp } from "@/store/AppContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, SkeletonCard } from "@/components/ui/Feedback";
import { ScholarshipCard } from "@/components/ScholarshipCard";
import { countries, fieldsOfStudy } from "@/data/sampleData";

interface Filters {
  q: string;
  degree: string;
  country: string;
  university: string;
  field: string;
  funding: string;
  intake: string;
  minGpa: string;
  englishTest: string;
}

const defaultFilters: Filters = {
  q: "", degree: "", country: "", university: "", field: "", funding: "", intake: "", minGpa: "", englishTest: "",
};

export function SearchPage() {
  const { scholarships, scholarshipsLoading, scholarshipsSource, lastVerifiedAt, refreshScholarships, addRecentSearch, profile } = useApp();
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [sort, setSort] = useState("match");

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [filters, scholarships]);

  const set = (k: keyof Filters, v: string) => setFilters((f) => ({ ...f, [k]: v }));

  const universityOptions = useMemo(
    () => Array.from(new Set(scholarships.map((s) => s.university_name))).sort(),
    [scholarships]
  );
  const intakeOptions = useMemo(
    () => Array.from(new Set(scholarships.map((s) => s.intake).filter(Boolean))).sort(),
    [scholarships]
  );

  const results = useMemo(() => {
    let list = scholarships.filter((s) => {
      if (filters.q && !`${s.name} ${s.university_name} ${s.field_of_study}`.toLowerCase().includes(filters.q.toLowerCase())) return false;
      if (filters.degree && s.degree_level !== filters.degree) return false;
      if (filters.country && s.country !== filters.country) return false;
      if (filters.university && s.university_name !== filters.university) return false;
      if (filters.field && s.field_of_study !== filters.field) return false;
      if (filters.funding && s.funding_type !== filters.funding) return false;
      if (filters.intake && s.intake !== filters.intake) return false;
      if (filters.minGpa && s.gpa_requirement > parseFloat(filters.minGpa)) return false;
      if (filters.englishTest && s.english_test !== filters.englishTest) return false;
      return true;
    });
    if (sort === "match") list = [...list].sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
    if (sort === "deadline") list = [...list].sort((a, b) => (new Date(a.deadline ?? "9999").getTime()) - (new Date(b.deadline ?? "9999").getTime()));
    if (sort === "stipend") list = [...list].sort((a, b) => (b.monthly_stipend ?? 0) - (a.monthly_stipend ?? 0));
    return list;
  }, [filters, sort, scholarships]);

  const activeCount = Object.entries(filters).filter(([k, v]) => k !== "q" && v).length;
  const reset = () => setFilters(defaultFilters);
  const runSearch = () => {
    const label = [filters.funding, filters.degree, filters.field, filters.country].filter(Boolean).join(", ") || "All scholarships";
    addRecentSearch(label);
  };

  const FilterPanel = (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-400">Degree level</p>
        <div className="flex flex-wrap gap-2">
          {["Bachelor's", "Master's", "PhD"].map((d) => (
            <Chip key={d} active={filters.degree === d} onClick={() => set("degree", filters.degree === d ? "" : d)}>{d}</Chip>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-400">Funding type</p>
        <div className="flex flex-wrap gap-2">
          {["Fully Funded", "Partially Funded", "Self Funded"].map((f) => (
            <Chip key={f} active={filters.funding === f} onClick={() => set("funding", filters.funding === f ? "" : f)}>{f}</Chip>
          ))}
        </div>
      </div>
      <Select label="Country" value={filters.country} onChange={(e) => set("country", e.target.value)}>
        <option value="">All countries</option>
        {countries.map((c) => <option key={c} value={c}>{c}</option>)}
      </Select>
      <Select label="University" value={filters.university} onChange={(e) => set("university", e.target.value)}>
        <option value="">All universities</option>
        {universityOptions.map((u) => <option key={u} value={u}>{u}</option>)}
      </Select>
      <Select label="Field of study" value={filters.field} onChange={(e) => set("field", e.target.value)}>
        <option value="">All fields</option>
        {fieldsOfStudy.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
      </Select>
      <Select label="Intake" value={filters.intake} onChange={(e) => set("intake", e.target.value)}>
        <option value="">All intakes</option>
        {intakeOptions.map((i) => <option key={i} value={i}>{i}</option>)}
      </Select>
      <Input label="Minimum GPA (your score)" type="number" step="0.1" min="0" max="4" placeholder="e.g. 3.5" value={filters.minGpa} onChange={(e) => set("minGpa", e.target.value)} hint={profile ? `Your GPA: ${profile.gpa}` : undefined} />
      <Select label="English test (optional)" value={filters.englishTest} onChange={(e) => set("englishTest", e.target.value)}>
        <option value="">Any / not required</option>
        <option value="IELTS">IELTS</option>
        <option value="TOEFL">TOEFL</option>
        <option value="Duolingo">Duolingo</option>
        <option value="PTE">PTE</option>
      </Select>
      {activeCount > 0 && (
        <Button variant="ghost" size="sm" fullWidth onClick={reset} leftIcon={<RotateCcw className="h-4 w-4" />}>
          Reset all filters
        </Button>
      )}
    </div>
  );

  return (
    <DashboardLayout title="Scholarship Search" subtitle="Find scholarships tailored to your profile.">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <Card className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-brand-600" />
                <h2 className="font-display text-base font-bold text-ink-900 dark:text-white">Filters</h2>
                {activeCount > 0 && <Badge tone="brand">{activeCount}</Badge>}
              </div>
              {FilterPanel}
            </Card>
          </div>
        </aside>

        <div>
          <Card className="mb-5 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  value={filters.q}
                  onChange={(e) => set("q", e.target.value)}
                  placeholder="Search by scholarship, university or field…"
                  className="input-base pl-10"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowFiltersMobile(true)} className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 text-sm font-semibold text-ink-700 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200 lg:hidden">
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                  {activeCount > 0 && <Badge tone="brand">{activeCount}</Badge>}
                </button>
                <div className="relative">
                  <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-base appearance-none pr-9">
                    <option value="match">Sort: Match score</option>
                    <option value="deadline">Sort: Deadline</option>
                    <option value="stipend">Sort: Stipend</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                </div>
                <Button onClick={runSearch}>Search</Button>
              </div>
            </div>
            {/* Live data badge */}
            <div className="mt-3 flex items-center gap-2 border-t border-ink-100 dark:border-ink-800 pt-3">
              <span className={`flex h-2 w-2 rounded-full ${scholarshipsSource === "live" ? "bg-emerald-500" : "bg-amber-400"}`} />
              <span className="text-xs font-semibold text-ink-600 dark:text-ink-300">
                {scholarshipsSource === "live" ? "Live data" : "Verified sample data"}
                {lastVerifiedAt && ` · last verified ${new Date(lastVerifiedAt).toLocaleDateString()}`}
              </span>
              <button onClick={refreshScholarships} className="ml-auto flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700" disabled={scholarshipsLoading}>
                <RefreshCw className={`h-3.5 w-3.5 ${scholarshipsLoading ? "animate-spin" : ""}`} /> Refresh
              </button>
            </div>
          </Card>

          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-ink-500 dark:text-ink-400">
              {loading || scholarshipsLoading ? "Searching…" : <><span className="font-bold text-ink-800 dark:text-ink-100">{results.length}</span> scholarships found</>}
            </p>
          </div>

          {loading || scholarshipsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : results.length === 0 ? (
            <EmptyState
              icon={<Search className="h-7 w-7" />}
              title="No scholarships match your filters"
              description="Try widening your search — remove a filter or lower your GPA requirement."
              action={<Button size="sm" onClick={reset} leftIcon={<RotateCcw className="h-4 w-4" />}>Reset filters</Button>}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {results.map((s) => <ScholarshipCard key={s.id} scholarship={s} />)}
            </div>
          )}
        </div>
      </div>

      {showFiltersMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={() => setShowFiltersMobile(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85%] animate-slide-in-right overflow-y-auto bg-white p-5 dark:bg-ink-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Filters</h2>
              <button onClick={() => setShowFiltersMobile(false)} className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"><X className="h-5 w-5" /></button>
            </div>
            {FilterPanel}
            <Button fullWidth className="mt-5" onClick={() => { runSearch(); setShowFiltersMobile(false); }}>Show {results.length} results</Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${active ? "bg-brand-600 text-white shadow-sm" : "bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700"}`}
    >
      {children}
    </button>
  );
}
