/**
 * Rate Limiter Manual - IÓN MAX
 * Implementación simple de rate limiting sin dependencias externas
 * Usa memoria en proceso (para producción usar Redis)
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Configuración de rate limiting por endpoint
 */
const RATE_LIMITS = {
  '/api/chat': { maxRequests: 10, windowMs: 60000 }, // 10 requests por minuto
  '/api/listings': { maxRequests: 30, windowMs: 60000 }, // 30 requests por minuto
  '/api/orders': { maxRequests: 5, windowMs: 60000 }, // 5 requests por minuto
  '/api/invoices': { maxRequests: 5, windowMs: 60000 }, // 5 requests por minuto
  default: { maxRequests: 100, windowMs: 60000 }, // 100 requests por minuto
};

/**
 * Verifica si una solicitud debe ser rate limited
 * @param identifier - Identificador único (IP, user ID, etc.)
 * @param endpoint - Endpoint solicitado
 * @returns Objeto con información del rate limit
 */
export function checkRateLimit(identifier: string, endpoint: string) {
  const config = RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS] || RATE_LIMITS.default;
  const now = Date.now();
  const key = `${identifier}:${endpoint}`;

  // Limpiar entradas expiradas
  if (rateLimitStore.has(key)) {
    const entry = rateLimitStore.get(key)!;
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }

  // Crear nueva entrada si no existe
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    });
    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: new Date(now + config.windowMs).toISOString()
    };
  }

  // Incrementar contador
  const entry = rateLimitStore.get(key)!;
  entry.count++;

  // Verificar si excedió el límite
  if (entry.count > config.maxRequests) {
    return {
      allowed: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: new Date(entry.resetTime).toISOString(),
      retryAfter: Math.ceil((entry.resetTime - now) / 1000)
    };
  }

  return {
    allowed: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - entry.count,
    reset: new Date(entry.resetTime).toISOString()
  };
}

/**
 * Middleware de rate limiting para Next.js API routes
 */
export function rateLimitMiddleware(identifier: string, endpoint: string) {
  const result = checkRateLimit(identifier, endpoint);

  if (!result.allowed) {
    throw new Error('Rate limit exceeded');
  }

  return result;
}

/**
 * Limpia entradas antiguas del rate limiter (llamar periódicamente)
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Limpieza automática cada 5 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}
