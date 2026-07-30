import { NextResponse, type NextRequest } from "next/server";
import { proxy } from "./proxy";

// Rate limiting simple basado en memoria
const rateLimit = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, limit: number = 100, window: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimit.get(identifier);

  if (!record || now > record.resetTime) {
    // Nuevo registro o ventana expirada
    rateLimit.set(identifier, { count: 1, resetTime: now + window });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

function getIdentifier(request: NextRequest): string {
  // Prioridad: IP del usuario > User-Agent > Default
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            'unknown';
  
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return `${ip}-${userAgent}`;
}

// Headers de seguridad empresarial
function setSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://*.supabase.co https://*.vercel.app https://*.paypal.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://*.vercel.app https://*.paypal.com https://*.googleapis.com; frame-src https://*.paypal.com https://*.stripe.com; media-src 'self' https://*.supabase.co;"
  );
  
  // X-Frame-Options
  response.headers.set('X-Frame-Options', 'DENY');
  
  // X-Content-Type-Options
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Referrer-Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions-Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  
  // X-XSS-Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Strict-Transport-Security (solo en HTTPS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  return response;
}

export async function middleware(request: NextRequest) {
  // Rate limiting para APIs críticas
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const identifier = getIdentifier(request);
    
    // Límites diferentes según el endpoint
    let limit = 100;
    let window = 60000; // 1 minuto

    if (request.nextUrl.pathname.startsWith('/api/chat')) {
      limit = 20; // Más estricto para chat
      window = 60000;
    } else if (request.nextUrl.pathname.startsWith('/api/listings')) {
      limit = 50; // Moderado para listings
      window = 60000;
    } else if (request.nextUrl.pathname.startsWith('/api/admin')) {
      limit = 30; // Muy estricto para admin
      window = 60000;
    }

    if (!checkRateLimit(identifier, limit, window)) {
      const response = NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimit.get(identifier)?.resetTime.toString() || '0',
          'Retry-After': Math.ceil((rateLimit.get(identifier)?.resetTime || 0) - Date.now() / 1000).toString()
        }}
      );
      return setSecurityHeaders(response);
    }
  }

  try {
    const response = await proxy(request);
    if (response) {
      return setSecurityHeaders(response);
    }
  } catch (error) {
    console.error("Error en el middleware proxy:", error);
  }

  const response = NextResponse.next();
  return setSecurityHeaders(response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
