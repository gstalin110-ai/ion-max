import { withSupabase } from "@supabase/server"

export const GET = withSupabase({ auth: "publishable" }, async (_req, ctx) => {
  const { data, error } = await ctx.supabase.from("items").select("*").limit(10)
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    })
  }
  return new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json" },
  })
})
