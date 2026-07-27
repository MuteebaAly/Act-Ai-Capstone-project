import { Bookmark, Search } from "lucide-react";
import { useApp } from "@/store/AppContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { EmptyState, SkeletonCard } from "@/components/ui/Feedback";
import { ScholarshipCard } from "@/components/ScholarshipCard";

export function SavedPage() {
  const { savedIds, scholarships, savedLoading, navigate } = useApp();
  const saved = scholarships.filter((s) => savedIds.includes(s.id));

  return (
    <DashboardLayout title="Saved Scholarships" subtitle={`${saved.length} scholarship${saved.length === 1 ? "" : "s"} bookmarked.`}>
      {savedLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : saved.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="h-7 w-7" />}
          title="No saved scholarships yet"
          description="Tap the bookmark icon on any scholarship to save it here for later."
          action={<Button size="sm" onClick={() => navigate("/search")} leftIcon={<Search className="h-4 w-4" />}>Browse scholarships</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {saved.map((s) => <ScholarshipCard key={s.id} scholarship={s} />)}
        </div>
      )}
    </DashboardLayout>
  );
}
