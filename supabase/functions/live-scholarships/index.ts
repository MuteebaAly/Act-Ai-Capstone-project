// StudyMatch AI — Live scholarships edge function.
// Returns the scholarship catalogue from the Supabase database (the verified
// source of truth). Each row carries `source` ('sample' | 'live') and
// `last_verified_at`, so the frontend can display a "verified" / "sample data"
// badge. In a production deployment this function would also poll official
// university feeds and update `source='live'` + `last_verified_at`; here it
// returns the DB catalogue as the trusted fallback, which is always available.

import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } }
    );

    const { data, error } = await supabase
      .from("scholarships")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      return json({ ok: false, error: error.message, scholarships: [] }, 500);
    }

    // Compute an aggregate freshness signal for the frontend badge.
    const liveCount = (data ?? []).filter((r: any) => r.source === "live").length;
    const anyVerified = (data ?? []).some((r: any) => r.last_verified_at);
    const lastVerifiedAt = anyVerified
      ? (data ?? []).map((r: any) => r.last_verified_at).filter(Boolean).sort().pop()
      : null;

    return json({
      ok: true,
      scholarships: data ?? [],
      live: liveCount > 0,
      source: liveCount > 0 ? "live" : "sample",
      lastVerifiedAt,
      count: (data ?? []).length,
    });
  } catch (err) {
    return json({ ok: false, error: err?.message ?? "Internal error", scholarships: [] }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
