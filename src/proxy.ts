import { NextResponse, type NextRequest } from "next/server";
import { isOwnerEmail } from "@/lib/constants";
import { redirectWithSessionCookies, refreshSupabaseSession } from "@/lib/supabase/proxy-session";

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await refreshSupabaseSession(request);
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
  const isAuthPath = pathname === "/login" || pathname === "/register";
  const isPublicAuthRoute =
    pathname.startsWith("/auth") || pathname.startsWith("/reset-password");

  if (pathname.startsWith("/owner")) {
    return redirectWithSessionCookies(new URL("/admin", request.url), supabaseResponse);
  }

  if (pathname.startsWith("/messages")) {
    return redirectWithSessionCookies(new URL("/mensajes", request.url), supabaseResponse);
  }

  if (!user && (isProtectedPath || isAdminPath)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return redirectWithSessionCookies(loginUrl, supabaseResponse);
  }

  if (user && isAuthPath) {
    const next = request.nextUrl.searchParams.get("next");
    const destination = next && next.startsWith("/") ? next : "/comunidad";
    return redirectWithSessionCookies(new URL(destination, request.url), supabaseResponse);
  }

  if (user && isAdminPath && !isOwnerEmail(user.email)) {
    return redirectWithSessionCookies(new URL("/comunidad", request.url), supabaseResponse);
  }

  if (isPublicAuthRoute) {
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
