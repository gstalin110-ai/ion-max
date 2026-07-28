// FIX: Este archivo reexporta el cliente correcto (createBrowserClient con soporte SSR/cookies)
// en lugar del createClient vanilla que no maneja cookies de sesión.
// Así cualquier import legacy de "@/lib/supabase" sigue funcionando sin romper nada.
export { supabase } from "@/src/lib/supabase/client";
