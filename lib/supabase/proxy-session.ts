import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";

export async function refreshSupabaseSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Paso 1: actualizar las cookies en el request (para el resto del pipeline)
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          // Paso 2: recrear la respuesta con el request actualizado
          supabaseResponse = NextResponse.next({ request });
          // Paso 3: propagar las cookies (con opciones completas: httpOnly, sameSite, etc.) a la respuesta
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // FIX: Usar getSession() en lugar de getUser() en el middleware.
  // getUser() hace una llamada de red al servidor de Supabase en cada request
  // y NO refresca ni persiste el token renovado en las cookies → sesión
  // siempre aparece como nula en el browser aunque el login fuera exitoso.
  // getSession() lee el token desde las cookies del request, lo refresca si
  // está por vencer, y propaga las cookies actualizadas a través de setAll().
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user ?? null;

  return { supabaseResponse, user };
}

export function redirectWithSessionCookies(url: URL, sessionResponse: NextResponse) {
  const redirect = NextResponse.redirect(url);
  sessionResponse.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(cookie);
  });
  return redirect;
}

export type { User };
