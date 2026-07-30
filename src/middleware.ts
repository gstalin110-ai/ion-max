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
    }

    if (!checkRateLimit(identifier, limit, window)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimit.get(identifier)?.resetTime.toString() || '0',
          'Retry-After': Math.ceil((rateLimit.get(identifier)?.resetTime || 0) - Date.now() / 1000).toString()
        }}
      );
    }
  }

  try {
    const response = await proxy(request);
    if (response) {
      return response;
    }
  } catch (error) {
    console.error("Error en el middleware proxy:", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
