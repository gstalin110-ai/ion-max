import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isOwnerEmail } from "@/lib/constants";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set(name, value);
  });
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const protectedPaths = [
    "/dashboard",
    "/profile",
    "/wallet",
    "/mensajes",
    "/comunidad",
    "/settings",
    "/publish",
    "/marketplace",
  ];
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  const isAdminPath = pathname.startsWith("/admin");
  const isLegacyOwnerPath = pathname.startsWith("/owner");
  const isLegacyMessagesPath = pathname.startsWith("/messages");

  const authPaths = ["/login", "/register"];
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  if (isLegacyOwnerPath) {
    const redirect = NextResponse.redirect(new URL("/admin", request.url));
    copyCookies(response, redirect);
    return redirect;
  }

  if (isLegacyMessagesPath) {
    const redirect = NextResponse.redirect(new URL("/mensajes", request.url));
    copyCookies(response, redirect);
    return redirect;
  }

  if (!user && (isProtectedPath || isAdminPath)) {
    const redirect = NextResponse.redirect(new URL("/login", request.url));
    copyCookies(response, redirect);
    return redirect;
  }

  if (user && isAuthPath) {
    const redirect = NextResponse.redirect(new URL("/comunidad", request.url));
    copyCookies(response, redirect);
    return redirect;
  }

  if (user && isAdminPath && !isOwnerEmail(user.email)) {
    const redirect = NextResponse.redirect(new URL("/comunidad", request.url));
    copyCookies(response, redirect);
    return redirect;
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
