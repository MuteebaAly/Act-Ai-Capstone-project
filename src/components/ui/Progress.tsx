export function Progress({
  value,
  className = "",
  tone = "brand",
  size = "md",
}: {
  value: number;
  className?: string;
  tone?: "brand" | "green" | "amber";
  size?: "sm" | "md";
}) {
  const tones = {
    brand: "bg-brand-500",
    green: "bg-emerald-500",
    amber: "bg-amber-500",
  };
  const h = size === "sm" ? "h-1.5" : "h-2.5";
  return (
    <div className={`w-full overflow-hidden rounded-full bg-ink-100 ${h} ${className}`}>
      <div
        className={`${tones[tone]} h-full rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
