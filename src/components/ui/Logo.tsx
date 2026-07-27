import type { University } from "@/types";

export function UniversityLogo({
  university,
  size = "md",
  className = "",
}: {
  university: University;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = size === "sm" ? "h-10 w-10 text-sm" : size === "lg" ? "h-16 w-16 text-xl" : "h-12 w-12 text-base";
  const initials = university.name
    .split(" ")
    .filter((w) => w.length > 2 && !/^(of|the|and|for)$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${university.accent} font-display font-bold text-white shadow-sm ${dims} ${className}`}
    >
      {initials}
    </div>
  );
}

export function Avatar({
  name,
  url,
  size = "md",
  className = "",
}: {
  name: string;
  url?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-16 w-16 text-xl" : "h-10 w-10 text-sm";
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  if (url) {
    return <img src={url} alt={name} className={`rounded-full object-cover ${dims} ${className}`} />;
  }
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-sky-500 font-display font-bold text-white ${dims} ${className}`}
    >
      {initials}
    </div>
  );
}
