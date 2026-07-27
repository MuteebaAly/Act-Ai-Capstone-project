import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, type DbProfile, type DbScholarship, type DbApplication, type DbNotification } from "@/lib/supabase";
import { initialProfile } from "@/data/sampleData";

interface AppState {
  // routing
  route: string;
  navigate: (path: string) => void;
  // auth
  user: User | null;
  session: Session | null;
  authLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  // profile
  profile: DbProfile | null;
  profileLoading: boolean;
  updateProfile: (patch: Partial<DbProfile>) => Promise<void>;
  // scholarships (live catalogue)
  scholarships: DbScholarship[];
  scholarshipsLoading: boolean;
  scholarshipsSource: "sample" | "live";
  lastVerifiedAt: string | null;
  refreshScholarships: () => Promise<void>;
  // saved
  savedIds: string[];
  savedLoading: boolean;
  toggleSave: (scholarshipId: string) => Promise<void>;
  isSaved: (scholarshipId: string) => boolean;
  // applications
  applications: DbApplication[];
  applicationsLoading: boolean;
  upsertApplication: (scholarshipId: string, patch: Partial<DbApplication>) => Promise<void>;
  removeApplication: (id: string) => Promise<void>;
  getApplication: (scholarshipId: string) => DbApplication | undefined;
  // notifications
  notifications: DbNotification[];
  notificationsLoading: boolean;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  unreadCount: number;
  // recent searches (local only)
  recentSearches: string[];
  addRecentSearch: (q: string) => void;
}

const Ctx = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  // ---- routing ----
  const [route, setRoute] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return window.location.hash.replace(/^#/, "") || "/";
    }
    return "/";
  });
  const navigate = useCallback((path: string) => {
    if (typeof window !== "undefined") window.location.hash = path;
    else setRoute(path);
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onHash = () => {
      setRoute(window.location.hash.replace(/^#/, "") || "/");
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    };
    window.addEventListener("hashchange", onHash);
    if (!window.location.hash) window.location.hash = "/";
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // ---- auth ----
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [applications, setApplications] = useState<DbApplication[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const [scholarships, setScholarships] = useState<DbScholarship[]>([]);
  const [scholarshipsLoading, setScholarshipsLoading] = useState(true);
  const [scholarshipsSource, setScholarshipsSource] = useState<"sample" | "live">("sample");
  const [lastVerifiedAt, setLastVerifiedAt] = useState<string | null>(null);

  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Fully Funded Master's, Germany",
    "PhD Computer Science, Canada",
    "Bachelor's Business, Singapore",
  ]);

  // Load scholarships (public catalogue) once on mount.
  const refreshScholarships = useCallback(async () => {
    setScholarshipsLoading(true);
    try {
      const { data, error } = await supabase.from("scholarships").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      setScholarships((data as DbScholarship[]) ?? []);
      const anyLive = (data ?? []).some((r: any) => r.source === "live");
      setScholarshipsSource(anyLive ? "live" : "sample");
      const verified = (data ?? []).map((r: any) => r.last_verified_at).filter(Boolean).sort().pop();
      setLastVerifiedAt(verified ?? null);
    } catch (e) {
      // graceful fallback: empty list; UI shows empty state
      setScholarships([]);
    } finally {
      setScholarshipsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshScholarships();
  }, [refreshScholarships]);

  // Auth state listener
  useEffect(() => {
    let mounted = true;
    setAuthLoading(true);
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      (async () => {
        setSession(sess);
        setUser(sess?.user ?? null);
        if (sess?.user) {
          await loadUserData(sess.user.id);
        } else {
          setProfile(null);
          setSavedIds([]);
          setApplications([]);
          setNotifications([]);
        }
      })();
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserData = useCallback(async (uid: string) => {
    setProfileLoading(true);
    setSavedLoading(true);
    setApplicationsLoading(true);
    setNotificationsLoading(true);

    // profile
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    if (prof) {
      setProfile(prof as DbProfile);
    } else {
      // create profile row for new users
      const meta = user?.user_metadata ?? {};
      const newProf = {
        id: uid,
        full_name: meta.full_name ?? "New Student",
        email: user?.email ?? "",
        degree_level: meta.degree_level ?? "Master's",
        field_of_study: meta.field_of_study ?? "Computer Science",
        target_countries: [],
        joined_date: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        profile_completion: 30,
      };
      const { data: inserted } = await supabase.from("profiles").insert(newProf).select("*").maybeSingle();
      setProfile((inserted as DbProfile) ?? ({ ...newProf, avatar_url: null, phone: "", bio: "", country: "", gpa: 0, english_test: "None", english_score: 0 } as DbProfile));
      // seed a welcome notification
      await supabase.from("notifications").insert({
        user_id: uid,
        type: "system",
        title: "Welcome to StudyMatch AI",
        message: "Complete your profile to unlock personalised scholarship recommendations.",
      });
    }
    setProfileLoading(false);

    // saved
    const { data: saved } = await supabase.from("saved_scholarships").select("scholarship_id").eq("user_id", uid);
    setSavedIds((saved ?? []).map((s: any) => s.scholarship_id));
    setSavedLoading(false);

    // applications
    const { data: apps } = await supabase.from("applications").select("*").eq("user_id", uid).order("updated_at", { ascending: false });
    setApplications((apps as DbApplication[]) ?? []);
    setApplicationsLoading(false);

    // notifications
    const { data: notifs } = await supabase.from("notifications").select("*").eq("user_id", uid).order("created_at", { ascending: false });
    setNotifications((notifs as DbNotification[]) ?? []);
    setNotificationsLoading(false);
  }, [user]);

  // ---- auth actions ----
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { error: error?.message };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSavedIds([]);
    setApplications([]);
    setNotifications([]);
    navigate("/");
  }, [navigate]);

  // ---- profile ----
  const updateProfile = useCallback(async (patch: Partial<DbProfile>) => {
    if (!user) return;
    const completion = computeCompletion({ ...(profile ?? ({} as DbProfile)), ...patch });
    const { data, error } = await supabase
      .from("profiles")
      .update({ ...patch, profile_completion: completion })
      .eq("id", user.id)
      .select("*")
      .maybeSingle();
    if (!error && data) setProfile(data as DbProfile);
  }, [user, profile]);

  // ---- saved ----
  const toggleSave = useCallback(async (scholarshipId: string) => {
    if (!user) return;
    if (savedIds.includes(scholarshipId)) {
      setSavedIds((p) => p.filter((x) => x !== scholarshipId));
      await supabase.from("saved_scholarships").delete().eq("user_id", user.id).eq("scholarship_id", scholarshipId);
    } else {
      setSavedIds((p) => [...p, scholarshipId]);
      await supabase.from("saved_scholarships").insert({ user_id: user.id, scholarship_id: scholarshipId });
    }
  }, [user, savedIds]);
  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  // ---- applications ----
  const upsertApplication = useCallback(async (scholarshipId: string, patch: Partial<DbApplication>) => {
    if (!user) return;
    const existing = applications.find((a) => a.scholarship_id === scholarshipId);
    if (existing) {
      const { data, error } = await supabase
        .from("applications")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select("*")
        .maybeSingle();
      if (!error && data) {
        setApplications((prev) => prev.map((a) => (a.id === existing.id ? (data as DbApplication) : a)));
      }
    } else {
      const { data, error } = await supabase
        .from("applications")
        .insert({ user_id: user.id, scholarship_id: scholarshipId, status: patch.status ?? "Not Started", progress: patch.progress ?? 0, notes: patch.notes ?? "" })
        .select("*")
        .maybeSingle();
      if (!error && data) {
        setApplications((prev) => [data as DbApplication, ...prev]);
      }
    }
  }, [user, applications]);

  const removeApplication = useCallback(async (id: string) => {
    if (!user) return;
    setApplications((prev) => prev.filter((a) => a.id !== id));
    await supabase.from("applications").delete().eq("id", id);
  }, [user]);

  const getApplication = useCallback((scholarshipId: string) => applications.find((a) => a.scholarship_id === scholarshipId), [applications]);

  // ---- notifications ----
  const markRead = useCallback(async (id: string) => {
    if (!user) return;
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  }, [user]);
  const markAllRead = useCallback(async () => {
    if (!user) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
  }, [user]);
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const addRecentSearch = useCallback((q: string) => {
    if (!q.trim()) return;
    setRecentSearches((prev) => [q, ...prev.filter((x) => x !== q)].slice(0, 6));
  }, []);

  const value: AppState = useMemo(
    () => ({
      route, navigate,
      user, session, authLoading, signIn, signUp, signOut,
      profile, profileLoading, updateProfile,
      scholarships, scholarshipsLoading, scholarshipsSource, lastVerifiedAt, refreshScholarships,
      savedIds, savedLoading, toggleSave, isSaved,
      applications, applicationsLoading, upsertApplication, removeApplication, getApplication,
      notifications, notificationsLoading, markRead, markAllRead, unreadCount,
      recentSearches, addRecentSearch,
    }),
    [route, navigate, user, session, authLoading, signIn, signUp, signOut, profile, profileLoading, updateProfile, scholarships, scholarshipsLoading, scholarshipsSource, lastVerifiedAt, refreshScholarships, savedIds, savedLoading, toggleSave, isSaved, applications, applicationsLoading, upsertApplication, removeApplication, getApplication, notifications, notificationsLoading, markRead, markAllRead, unreadCount, recentSearches, addRecentSearch]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function computeCompletion(p: Partial<DbProfile>): number {
  const fields = [
    !!p.full_name, !!p.email, !!p.bio, (p.gpa ?? 0) > 0,
    !!p.english_test && p.english_test !== "None", (p.target_countries ?? []).length > 0,
  !!p.country, !!p.field_of_study, !!p.degree_level,
  !!p.phone,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

// Keep initialProfile import used (avoids tree-shake warning in some setups).
void initialProfile;
