/**
 * Security Headers - IÓN MAX
 * Headers de seguridad para proteger la aplicación
 */

export const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://www.googletagmanager.com;
      style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com;
      img-src 'self' data: https: blob:;
      font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com;
      connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com;
      frame-src 'self' https://www.paypal.com;
    `.replace(/\s{2,}/g, ' ').trim()
  }
];

/**
 * Aplica headers de seguridad a la响应
 */
export function applySecurityHeaders(response: Response) {
  securityHeaders.forEach(header => {
    response.headers.set(header.key, header.value);
  });
  return response;
}
