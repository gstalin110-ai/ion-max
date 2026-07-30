import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Sample rate para performance
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0.1,
  
  // Integraciones de servidor
  integrations: [
    Sentry.httpIntegration(),
    Sentry.postgresIntegration(),
  ],
  
  // Filtros para ignorar errores específicos
  beforeSend(event: any, hint: any) {
    // Ignorar errores de desarrollo
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    
    // Ignorar errores de cancelación
    if (event.exception?.values?.[0]?.type === 'AbortError') {
      return null;
    }
    
    return event;
  },
  
  // Release para tracking de deployment
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || 'ion-max@' + process.env.npm_package_version,
  
  // Tags adicionales
  initialScope: {
    tags: {
      app: 'ion-max',
      platform: 'server',
    },
  },
  
  // Profiling de performance
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0.1,
});
