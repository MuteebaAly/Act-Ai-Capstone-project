import { type ReactNode } from "react";

type Tone = "brand" | "green" | "amber" | "rose" | "sky" | "ink";

const tones: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700 ring-brand-200/70 dark:bg-brand-900/40 dark:text-brand-300 dark:ring-brand-800/60",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200/70 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800/60",
  amber: "bg-amber-50 text-amber-700 ring-amber-200/70 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-800/60",
  rose: "bg-rose-50 text-rose-700 ring-rose-200/70 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-800/60",
  sky: "bg-sky-50 text-sky-700 ring-sky-200/70 dark:bg-sky-900/30 dark:text-sky-300 dark:ring-sky-800/60",
  ink: "bg-ink-100 text-ink-700 ring-ink-200/70 dark:bg-ink-800 dark:text-ink-300 dark:ring-ink-700",
};

export function Badge({
  tone = "ink",
  children,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function fundingTone(type: string): Tone {
  if (type === "Fully Funded") return "green";
  if (type === "Partially Funded") return "amber";
  return "ink";
}
