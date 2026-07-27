import { useEffect, useState } from "react";
import { AppProvider, useApp } from "@/store/AppContext";
import { ThemeProvider } from "@/store/ThemeContext";
import { Spinner } from "@/components/ui/Feedback";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage, SignUpPage } from "@/pages/AuthPages";
import { DashboardPage } from "@/pages/DashboardPage";
import { SearchPage } from "@/pages/SearchPage";
import { ScholarshipDetailsPage } from "@/pages/ScholarshipDetailsPage";
import { SavedPage } from "@/pages/SavedPage";
import { TrackerPage } from "@/pages/TrackerPage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { SettingsPage } from "@/pages/SettingsPage";
import { AssistantPage } from "@/pages/AssistantPage";
import { SopReviewPage } from "@/pages/SopReviewPage";

const PUBLIC_ROUTES = ["/", "/login", "/signup"];

function PageTransition({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(false);
    const t = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(t);
  }, [children]);
  return <div className={show ? "animate-fade-up" : "opacity-0"}>{children}</div>;
}

function Router() {
  const { route, user, authLoading } = useApp();

  // Show a full-page loader while the initial auth session resolves.
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50 dark:bg-ink-950">
        <Spinner size={40} />
      </div>
    );
  }

  const isPublic = PUBLIC_ROUTES.includes(route) || route === "";

  // Protected route guard
  if (!isPublic && !user) {
    return <LoginPage />;
  }

  let page: React.ReactNode;
  if (route === "/" || route === "") page = <LandingPage />;
  else if (route === "/login") page = <LoginPage />;
  else if (route === "/signup") page = <SignUpPage />;
  else if (route === "/dashboard") page = <DashboardPage />;
  else if (route === "/search") page = <SearchPage />;
  else if (route.startsWith("/scholarship/")) page = <ScholarshipDetailsPage id={route.replace("/scholarship/", "")} />;
  else if (route === "/saved") page = <SavedPage />;
  else if (route === "/tracker") page = <TrackerPage />;
  else if (route === "/assistant") page = <AssistantPage />;
  else if (route === "/sop-review") page = <SopReviewPage />;
  else if (route === "/notifications") page = <NotificationsPage />;
  else if (route === "/profile") page = <ProfilePage />;
  else if (route === "/settings") page = <SettingsPage />;
  else page = (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-50 text-center dark:bg-ink-950">
      <p className="font-display text-3xl font-extrabold text-ink-900 dark:text-white">404</p>
      <p className="text-ink-500 dark:text-ink-400">We couldn't find that page.</p>
      <button onClick={() => (window.location.hash = "/dashboard")} className="font-semibold text-brand-600 hover:text-brand-700">Back to dashboard</button>
    </div>
  );

  return <PageTransition>{page}</PageTransition>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Router />
      </AppProvider>
    </ThemeProvider>
  );
}
