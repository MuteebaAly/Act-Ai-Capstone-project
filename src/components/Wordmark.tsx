import { GraduationCap } from "lucide-react";
import { useApp } from "@/store/AppContext";

export function Wordmark({ onClick }: { onClick?: () => void }) {
  const { navigate } = useApp();
  return (
    <button
      onClick={() => (onClick ? onClick() : navigate("/"))}
      className="flex items-center gap-2.5"
      aria-label="StudyMatch AI home"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-sky-500 text-white shadow-sm">
        <GraduationCap className="h-5 w-5" />
      </span>
      <span className="font-display text-lg font-extrabold tracking-tight text-ink-900">
        StudyMatch<span className="text-brand-600"> AI</span>
      </span>
    </button>
  );
}
