import { Bell, CheckCheck, CalendarClock, Sparkles, ListChecks, Info, Loader2 } from "lucide-react";
import { useApp } from "@/store/AppContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Feedback";

const typeIcon: Record<string, { icon: typeof Bell; tone: string }> = {
  deadline: { icon: CalendarClock, tone: "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300" },
  match: { icon: Sparkles, tone: "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300" },
  status: { icon: ListChecks, tone: "bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300" },
  system: { icon: Info, tone: "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300" },
};

export function NotificationsPage() {
  const { notifications, notificationsLoading, markRead, markAllRead, unreadCount } = useApp();

  return (
    <DashboardLayout title="Notifications" subtitle={`${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.`}>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-ink-500 dark:text-ink-400">Stay on top of deadlines, new matches and application updates.</p>
        {unreadCount > 0 && <Button variant="outline" size="sm" onClick={markAllRead} leftIcon={<CheckCheck className="h-4 w-4" />}>Mark all read</Button>}
      </div>

      {notificationsLoading ? (
        <div className="flex items-center gap-2 py-12 text-ink-500"><Loader2 className="h-5 w-5 animate-spin" /> Loading notifications…</div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={<Bell className="h-7 w-7" />} title="No notifications" description="You're all caught up." />
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => {
            const cfg = typeIcon[n.type] ?? typeIcon.system;
            const Icon = cfg.icon;
            return (
              <Card key={n.id} className={`p-4 transition ${n.read ? "" : "ring-1 ring-brand-200 dark:ring-brand-800"}`} onClick={() => markRead(n.id)}>
                <div className="flex gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.tone}`}><Icon className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-ink-900 dark:text-white">{n.title}</p>
                      <span className="shrink-0 text-xs text-ink-400">{new Date(n.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">{n.message}</p>
                  </div>
                  {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
