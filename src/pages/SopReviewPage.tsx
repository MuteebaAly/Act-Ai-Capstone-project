import { useRef, useState } from "react";
import { Sparkles, Upload, FileText, Loader2, Check, AlertCircle, Award, Lightbulb, ListChecks } from "lucide-react";
import { useApp } from "@/store/AppContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { EmptyState } from "@/components/ui/Feedback";
import { supabase } from "@/lib/supabase";
import { reviewSop, type SopReviewResult } from "@/lib/ai";

export function SopReviewPage() {
  const { profile, user } = useApp();
  const [docType, setDocType] = useState<"sop" | "cv">("sop");
  const [docName, setDocName] = useState("");
  const [docText, setDocText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SopReviewResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setDocName(file.name);
    if (file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      const text = await file.text();
      setDocText(text.slice(0, 12000));
    } else {
      setError("Please upload a plain text file (.txt or .md). For PDFs/Word docs, paste the text into the box below.");
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const runReview = async () => {
    if (!docText.trim()) { setError("Please paste your document text or upload a text file."); return; }
    setError(null);
    setLoading(true);
    try {
      const r = await reviewSop(docType, docText, profile);
      setResult(r);
      if (user) {
        await supabase.from("sop_reviews").insert({
          user_id: user.id,
          doc_type: docType,
          doc_name: docName || "Untitled",
          doc_text: docText.slice(0, 8000),
          result: r as any,
        });
      }
    } catch (e: any) {
      setError(e?.message ?? "Review failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="AI SOP & CV Review" subtitle="Upload your Statement of Purpose or CV and get instant improvement suggestions.">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="mb-4 flex gap-2">
              {(["sop", "cv"] as const).map((t) => (
                <button key={t} onClick={() => { setDocType(t); setResult(null); }} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${docType === t ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700"}`}>
                  {t === "sop" ? "Statement of Purpose" : "CV / Resume"}
                </button>
              ))}
            </div>

            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="cursor-pointer rounded-2xl border-2 border-dashed border-ink-200 bg-ink-50/50 p-6 text-center transition hover:border-brand-300 hover:bg-brand-50/30 dark:border-ink-700 dark:bg-ink-800/40 dark:hover:border-brand-700 dark:hover:bg-brand-900/20"
            >
              <input ref={fileRef} type="file" accept=".txt,.md,text/plain" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              <Upload className="mx-auto h-8 w-8 text-ink-400" />
              <p className="mt-2 text-sm font-semibold text-ink-700 dark:text-ink-200">{docName || "Drop a file or click to upload"}</p>
              <p className="text-xs text-ink-400">.txt or .md — or paste text below</p>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-200">Document text</label>
              <textarea
                value={docText}
                onChange={(e) => setDocText(e.target.value.slice(0, 12000))}
                rows={8}
                placeholder={`Paste your ${docType === "sop" ? "statement of purpose" : "CV"} text here…`}
                className="input-base resize-none"
              />
              <p className="mt-1 text-xs text-ink-400">{docText.length}/12,000 characters</p>
            </div>

            {error && <div className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}</div>}

            <Button className="mt-4" fullWidth size="lg" onClick={runReview} disabled={loading || !docText.trim()} leftIcon={loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}>
              {loading ? "Reviewing…" : `Review my ${docType === "sop" ? "SOP" : "CV"}`}
            </Button>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-2">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div className="text-xs leading-relaxed text-ink-500 dark:text-ink-400">
                <p className="font-semibold text-ink-700 dark:text-ink-200">Tips for best results</p>
                <ul className="mt-1.5 space-y-1">
                  <li>• Paste the full text of your document for a thorough review.</li>
                  <li>• For SOPs, include your motivation, background, and goals.</li>
                  <li>• For CVs, include education, experience, and skills sections.</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Results */}
        <div>
          {loading ? (
            <Card className="flex h-96 flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
              <p className="text-sm font-semibold text-ink-500">Analysing your {docType === "sop" ? "statement of purpose" : "CV"}…</p>
            </Card>
          ) : result ? (
            <ReviewResult result={result} docType={docType} />
          ) : (
            <EmptyState icon={<FileText className="h-7 w-7" />} title="No review yet" description="Upload or paste your document on the left, then click review to get AI-powered suggestions." />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function ReviewResult({ result, docType }: { result: SopReviewResult; docType: string }) {
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300"><Award className="h-5 w-5" /></div>
            <div>
              <p className="font-display text-sm font-bold text-ink-900 dark:text-white">Overall score</p>
              <p className="text-xs text-ink-500 dark:text-ink-400">{docType === "sop" ? "Statement of Purpose" : "CV"} review</p>
            </div>
          </div>
          <span className="font-display text-3xl font-extrabold text-ink-900 dark:text-white">{result.overallScore ?? "—"}</span>
        </div>
        <Progress value={result.overallScore ?? 0} className="mt-3" />
        <p className="mt-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{result.summary}</p>
        {!result.ai && <p className="mt-2 text-xs text-ink-400">Heuristic review — connect the AI service for a detailed analysis.</p>}
      </Card>

      {result.strengths.length > 0 && (
        <Card className="p-5">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600"><Check className="h-3.5 w-3.5" /> Strengths</p>
          <ul className="mt-2 space-y-2">
            {result.strengths.map((s, i) => <li key={i} className="flex items-start gap-2 text-sm text-ink-700 dark:text-ink-300"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" /> {s}</li>)}
          </ul>
        </Card>
      )}

      {result.improvements.length > 0 && (
        <Card className="p-5">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600"><Lightbulb className="h-3.5 w-3.5" /> Suggested improvements</p>
          <ul className="mt-2 space-y-2">
            {result.improvements.map((s, i) => <li key={i} className="flex items-start gap-2 text-sm text-ink-700 dark:text-ink-300"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" /> {s}</li>)}
          </ul>
        </Card>
      )}

      {result.checklist.length > 0 && (
        <Card className="p-5">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600"><ListChecks className="h-3.5 w-3.5" /> Checklist</p>
          <div className="mt-3 space-y-2">
            {result.checklist.map((c, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-ink-100 p-2.5 dark:border-ink-800">
                <Badge tone={c.status === "Good" ? "green" : c.status === "Needs Work" ? "amber" : "rose"}>{c.status}</Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{c.item}</p>
                  <p className="text-xs text-ink-500 dark:text-ink-400">{c.note}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
