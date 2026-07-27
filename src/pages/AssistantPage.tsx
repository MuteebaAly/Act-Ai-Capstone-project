import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, Loader2, Trash2, Bot, User as UserIcon } from "lucide-react";
import { useApp } from "@/store/AppContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { askAssistant } from "@/lib/ai";

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Which scholarship suits me?",
  "Can I apply without IELTS?",
  "Which documents are missing?",
  "Compare two universities",
  "Explain scholarship requirements in simple language",
];

export function AssistantPage() {
  const { profile, scholarships, user } = useApp();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase.from("ai_chats").select("*").eq("user_id", user.id).order("created_at", { ascending: true }).limit(50);
      if (data && data.length > 0) {
        setMessages(data.map((r: any) => ({ id: r.id, role: r.role, content: r.content })));
      } else {
        setMessages([{ id: "welcome", role: "assistant", content: "Hi! I'm your StudyMatch AI assistant. Ask me which scholarship suits you, whether you can apply without IELTS, what documents you're missing, or to compare universities." }]);
      }
    })();
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    setInput("");
    setError(null);
    const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    try {
      const history = messages.filter((m) => m.id !== "welcome").map((m) => ({ role: m.role, content: m.content }));
      const r = await askAssistant(profile, scholarships, history, text);
      const aiMsg: ChatMsg = { id: `a-${Date.now()}`, role: "assistant", content: r.reply };
      setMessages((m) => [...m, aiMsg]);
      if (user) {
        await supabase.from("ai_chats").insert([{ user_id: user.id, role: "user", content: text }, { user_id: user.id, role: "assistant", content: r.reply }]);
      }
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (!user) return;
    await supabase.from("ai_chats").delete().eq("user_id", user.id);
    setMessages([{ id: "welcome", role: "assistant", content: "Hi! I'm your StudyMatch AI assistant. How can I help you find the right scholarship today?" }]);
  };

  return (
    <DashboardLayout title="AI Scholarship Assistant" subtitle="Ask about scholarships, eligibility, documents and more.">
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card className="flex h-[calc(100vh-13rem)] flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-ink-100 p-4 dark:border-ink-800">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-sky-500 text-white"><Sparkles className="h-5 w-5" /></div>
              <div>
                <p className="font-display text-sm font-bold text-ink-900 dark:text-white">StudyMatch Assistant</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">● Online</p>
              </div>
            </div>
            <button onClick={clearChat} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink-500 transition hover:bg-ink-100 hover:text-rose-600 dark:hover:bg-ink-800"><Trash2 className="h-3.5 w-3.5" /> Clear</button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-sky-500 text-white"><Bot className="h-4 w-4" /></div>}
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-800 dark:bg-ink-800 dark:text-ink-100"}`}>
                  {m.content}
                </div>
                {m.role === "user" && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-200 text-ink-600 dark:bg-ink-700 dark:text-ink-200"><UserIcon className="h-4 w-4" /></div>}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-sky-500 text-white"><Bot className="h-4 w-4" /></div>
                <div className="flex items-center gap-2 rounded-2xl bg-ink-100 px-4 py-3 dark:bg-ink-800"><Loader2 className="h-4 w-4 animate-spin text-brand-500" /> <span className="text-sm text-ink-500">Thinking…</span></div>
              </div>
            )}
            {error && <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">{error}</div>}
          </div>

          <div className="border-t border-ink-100 p-4 dark:border-ink-800">
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me anything about scholarships…" className="input-base flex-1" disabled={loading} />
              <Button type="submit" size="md" disabled={loading || !input.trim()} leftIcon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}>
                Send
              </Button>
            </form>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-display text-sm font-bold text-ink-900 dark:text-white">Try asking</h3>
            <div className="mt-3 space-y-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} disabled={loading} className="block w-full rounded-lg border border-ink-100 px-3 py-2.5 text-left text-sm text-ink-600 transition hover:border-brand-200 hover:bg-brand-50/40 dark:border-ink-800 dark:text-ink-300 dark:hover:border-brand-800 dark:hover:bg-brand-900/20">
                  {s}
                </button>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <p className="text-xs leading-relaxed text-ink-500 dark:text-ink-400">
                The assistant uses your profile and the scholarship catalogue to give specific answers. Complete your profile for better recommendations.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
