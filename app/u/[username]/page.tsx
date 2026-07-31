import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

export default async function UsernameRedirect({ params }: { params: { username: string } }) {
  const supabase = await createClient();
  
  // Buscar usuario por username
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", params.username)
    .single();

  if (!profile) {
    redirect("/404");
  }

  // Redirigir al perfil con ID
  redirect(`/profile/${profile.id}`);
}
