import { withSupabase } from "@supabase/server";

export const GET = withSupabase({ auth: "publishable" }, async (_req, ctx) => {
  const { data, error } = await ctx.supabase.from("items").select("*").order("created_at", { ascending: false }).limit(10);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ items: data ?? [] }), {
    headers: { "content-type": "application/json" },
  });
});
