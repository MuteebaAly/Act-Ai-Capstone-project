import { Bookmark, Calendar, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { useApp } from "@/store/AppContext";
import type { DbScholarship } from "@/lib/supabase";
import { Badge, fundingTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface UniLike {
  name: string;
  country: string;
  countryFlag: string;
  accent: string;
}

export function ScholarshipCard({ scholarship }: { scholarship: DbScholarship }) {
  const { navigate, toggleSave, isSaved } = useApp();
  const saved = isSaved(scholarship.id);
  const daysLeft = scholarship.deadline
    ? Math.ceil((new Date(scholarship.deadline).getTime() - Date.now()) / 86400000)
    : null;

  const uni: UniLike = {
    name: scholarship.university_name,
    country: scholarship.country,
    countryFlag: scholarship.country_flag,
    accent: scholarship.university_accent,
  };

  const matchTone =
    scholarship.matchScore ?? 0 >= 85 ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300"
    : (scholarship.matchScore ?? 0) >= 70 ? "text-brand-600 bg-brand-50 dark:bg-brand-900/30 dark:text-brand-300"
    : "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300";

  return (
    <div className="card group flex flex-col p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-start gap-4">
        <UniversityLogoMini uni={uni} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-ink-500 dark:text-ink-400">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">{uni.name} · {uni.countryFlag} {uni.country}</span>
          </div>
          <h3 className="mt-1 truncate font-display text-base font-bold text-ink-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
            {scholarship.name}
          </h3>
        </div>
        <button
          onClick={() => toggleSave(scholarship.id)}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
            saved ? "bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300" : "text-ink-400 hover:bg-ink-100 hover:text-ink-600 dark:hover:bg-ink-800"
          }`}
          aria-label={saved ? "Unsave" : "Save"}
        >
          <Bookmark className={`h-[18px] w-[18px] ${saved ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <Badge tone={fundingTone(scholarship.funding_type)}>{scholarship.funding_type}</Badge>
        <Badge tone="sky">{scholarship.degree_level}</Badge>
        <Badge tone="ink">{scholarship.field_of_study}</Badge>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-ink-100 dark:border-ink-800 pt-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-ink-400" />
          <div>
            <p className="font-semibold text-ink-800 dark:text-ink-100">
              {daysLeft !== null && daysLeft > 0 ? `${daysLeft} days left` : daysLeft !== null ? "Deadline passed" : "Rolling"}
            </p>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              {scholarship.deadline ? `Due ${new Date(scholarship.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : "No fixed deadline"}
            </p>
          </div>
        </div>
        {(scholarship.matchScore ?? 0) > 0 && (
          <div className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm font-bold ${matchTone}`}>
            <Sparkles className="h-4 w-4" />
            {scholarship.matchScore}% match
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" fullWidth onClick={() => navigate(`/scholarship/${scholarship.id}`)}>
          View details
        </Button>
        <Button size="sm" fullWidth rightIcon={<ArrowRight className="h-4 w-4" />} onClick={() => navigate(`/scholarship/${scholarship.id}`)}>
          Apply
        </Button>
      </div>
    </div>
  );
}

function UniversityLogoMini({ uni }: { uni: UniLike }) {
  const initials = uni.name
    .split(" ")
    .filter((w) => w.length > 2 && !/^(of|the|and|for)$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${uni.accent} font-display text-base font-bold text-white shadow-sm`}>
      {initials}
    </div>
  );
}
