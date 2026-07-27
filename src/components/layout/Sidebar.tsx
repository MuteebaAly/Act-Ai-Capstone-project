import { useEffect, useState } from "react";
import {
  LayoutDashboard, Search, Bookmark, ListChecks, Bell, User, Settings,
  LogOut, X, ChevronRight, Sparkles, MessageSquare, FileCheck,
} from "lucide-react";
import { useApp } from "@/store/AppContext";
import { Avatar } from "@/components/ui/Logo";

const nav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Scholarship Search", icon: Search, path: "/search" },
  { label: "Saved Scholarships", icon: Bookmark, path: "/saved" },
  { label: "Application Tracker", icon: ListChecks, path: "/tracker" },
  { label: "AI Assistant", icon: MessageSquare, path: "/assistant" },
  { label: "AI SOP & CV Review", icon: FileCheck, path: "/sop-review" },
  { label: "Notifications", icon: Bell, path: "/notifications", showBadge: true },
  { label: "Profile", icon: User, path: "/profile" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export function Sidebar() {
  const { route, navigate, signOut, profile, unreadCount } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [route]);

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pb-2 pt-5">
        <span className="text-xs font-bold uppercase tracking-wider text-ink-400">Menu</span>
        <button className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 lg:hidden" onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {nav.map((item) => {
          const active = route === item.path || (item.path !== "/dashboard" && route.startsWith(item.path));
          const Icon = item.icon;
          return (
            <button key={item.path} onClick={() => navigate(item.path)} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${active ? "bg-brand-600 text-white shadow-sm" : "text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white"}`}>
              <Icon className={`h-[18px] w-[18px] ${active ? "text-white" : "text-ink-400 group-hover:text-ink-600 dark:group-hover:text-ink-200"}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.showBadge && unreadCount > 0 && <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-white/20 text-white" : "bg-rose-500 text-white"}`}>{unreadCount}</span>}
              {active && <ChevronRight className="h-4 w-4 text-white/70" />}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto p-3">
        <button onClick={() => navigate("/profile")} className="flex w-full items-center gap-3 rounded-xl p-2.5 transition hover:bg-ink-100 dark:hover:bg-ink-800">
          <Avatar name={profile?.full_name ?? "User"} url={profile?.avatar_url ?? undefined} size="sm" />
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-bold text-ink-800 dark:text-ink-100">{profile?.full_name ?? "Loading…"}</p>
            <p className="truncate text-xs text-ink-500 dark:text-ink-400">{profile?.email ?? ""}</p>
          </div>
        </button>
        <button onClick={signOut} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-600 transition hover:bg-rose-50 hover:text-rose-600 dark:text-ink-300 dark:hover:bg-rose-900/30">
          <LogOut className="h-[18px] w-[18px] text-ink-400" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-ink-100 bg-white dark:border-ink-800 dark:bg-ink-900 lg:block">{content}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 animate-slide-in-right bg-white shadow-lift dark:bg-ink-900">{content}</aside>
        </div>
      )}
      <MobileTopbar onMenu={() => setMobileOpen(true)} />
    </>
  );
}

function MobileTopbar({ onMenu }: { onMenu: () => void }) {
  const { navigate, profile } = useApp();
  return (
    <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-ink-100 bg-white/90 px-4 backdrop-blur dark:border-ink-800 dark:bg-ink-900/90 lg:hidden">
      <button onClick={onMenu} className="rounded-lg p-2 text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800" aria-label="Open menu">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
      <button onClick={() => navigate("/dashboard")} className="font-display text-base font-extrabold text-ink-900 dark:text-white">StudyMatch<span className="text-brand-600"> AI</span></button>
      <button onClick={() => navigate("/profile")}><Avatar name={profile?.full_name ?? "User"} url={profile?.avatar_url ?? undefined} size="sm" /></button>
    </div>
  );
}

void Sparkles;
