import { Search, Bell, Moon, Sun } from "lucide-react";
import { useApp } from "@/store/AppContext";
import { useTheme } from "@/store/ThemeContext";
import { Avatar } from "@/components/ui/Logo";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { navigate, profile, unreadCount } = useApp();
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-20 hidden border-b border-ink-100 bg-white/85 px-6 py-4 backdrop-blur dark:border-ink-800 dark:bg-ink-900/85 lg:block">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-ink-900 dark:text-white">{title}</h1>
          {subtitle && <p className="text-sm text-ink-500 dark:text-ink-400">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/search")} className="flex h-10 items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-500 transition hover:border-brand-300 hover:text-brand-600 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-400">
            <Search className="h-4 w-4" />
            <span className="hidden xl:inline">Search scholarships…</span>
            <kbd className="hidden rounded border border-ink-200 bg-ink-50 px-1.5 text-[10px] font-semibold text-ink-400 dark:border-ink-700 dark:bg-ink-800 xl:inline">⌘K</kbd>
          </button>
          <button onClick={toggle} className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-600 transition hover:border-brand-300 hover:text-brand-600 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button onClick={() => navigate("/notifications")} className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-600 transition hover:border-brand-300 hover:text-brand-600 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unreadCount}</span>}
          </button>
          <button onClick={() => navigate("/profile")} className="ml-1"><Avatar name={profile?.full_name ?? "User"} url={profile?.avatar_url ?? undefined} /></button>
        </div>
      </div>
    </header>
  );
}

export function MobilePageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-4 pb-2 pt-4 lg:hidden">
      <h1 className="text-lg font-extrabold text-ink-900 dark:text-white">{title}</h1>
      {subtitle && <p className="text-sm text-ink-500 dark:text-ink-400">{subtitle}</p>}
    </div>
  );
}
