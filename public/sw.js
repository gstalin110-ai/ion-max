const CACHE_NAME = 'ion-max-v2';
const urlsToCache = [
  '/',
  '/marketplace',
  '/comunidad',
  '/settings',
  '/manifest.json'
];

// Estrategia: Network First para contenido dinámico, Cache First para estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  // No cachear API calls ni rutas dinámicas
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('/auth/') ||
      event.request.url.includes('/rest/v1/') ||
      event.request.url.includes('supabase') ||
      event.request.url.includes('vercel.com/sso-api')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          // Verificar si el caché es muy antiguo (más de 5 minutos)
          const cachedDate = response.headers.get('date');
          if (cachedDate) {
            const cacheTime = new Date(cachedDate).getTime();
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000;
            if (now - cacheTime > fiveMinutes) {
              // Caché antiguo, fetch fresh
              return fetch(event.request).then((freshResponse) => {
                const responseClone = freshResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseClone);
                });
                return freshResponse;
              });
            }
          }
          return response;
        }
        return fetch(event.request).then((freshResponse) => {
          const responseClone = freshResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return freshResponse;
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
