import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Sample rate para performance (100% en producción)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0.1,
  
  // Sample rate para sesiones
  replaysSessionSampleRate: 0.1,
  
  // Sample rate para errores
  replaysOnErrorSampleRate: 1.0,
  
  // Integraciones
  integrations: [
    Sentry.replayIntegration({
      // Mask sensitive data
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],
  
  // Filtros para ignorar errores específicos
  beforeSend(event: any, hint: any) {
    // Ignorar errores de desarrollo
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    
    // Ignorar errores de cancelación de usuario
    if (event.exception?.values?.[0]?.type === 'AbortError') {
      return null;
    }
    
    // Contexto de usuario
    if (event.user) {
      const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
      if (userId) {
        event.user.id = userId;
      }
    }
    
    return event;
  },
  
  // Release para tracking de deployment
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || 'ion-max@' + process.env.npm_package_version,
  
  // Tags adicionales
  initialScope: {
    tags: {
      app: 'ion-max',
      platform: 'web',
    },
  },
});
