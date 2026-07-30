# 🏗️ Arquitectura del Sistema - IÓN MAX

## 📊 Visión General

IÓN MAX es una aplicación web moderna construida con Next.js 16, React 19 y Supabase. Combina un marketplace, red social y wallet en una sola plataforma.

## 🎯 Stack Tecnológico

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Toast:** react-hot-toast

### Backend
- **Runtime:** Node.js (Vercel Edge Functions)
- **API:** Next.js API Routes
- **Rate Limiting:** Middleware personalizado (memoria)
- **Authentication:** Supabase Auth

### Database & Storage
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **Real-time:** Supabase Realtime

### Deployment
- **Hosting:** Vercel
- **CI/CD:** GitHub Actions
- **Domain:** ion-max.vercel.app

## 📁 Estructura del Proyecto

```
ion-max/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Rutas de autenticación
│   ├── (dashboard)/         # Dashboard principal
│   ├── admin/               # Panel de administrador
│   ├── api/                 # API Routes
│   └── login/               # Página de login
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── contexts/           # Contextos React
│   ├── features/           # Features por dominio
│   │   ├── auth/          # Autenticación
│   │   ├── marketplace/   # Marketplace
│   │   ├── community/     # Comunidad
│   │   └── wallet/        # Wallet
│   ├── lib/               # Utilidades y helpers
│   ├── services/          # Servicios de negocio
│   └── middleware.ts      # Middleware Next.js
├── docs/                  # Documentación
└── public/               # Assets estáticos
```

## 🔐 Seguridad

### Autenticación
- Supabase Auth con email/password
- OAuth (Google, GitHub) - configurado
- Session management con cookies
- RLS (Row Level Security) en Supabase

### Rate Limiting
- Implementado en middleware
- Límites por endpoint:
  - `/api/chat`: 20 requests/minuto
  - `/api/listings`: 50 requests/minuto
  - Otros: 100 requests/minuto
- Headers de rate limit en respuestas

### Variables de Entorno
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (solo en server)

## 🗄️ Base de Datos

### Tablas Principales
- `profiles` - Perfiles de usuario
- `listings` - Listings del marketplace
- `posts` - Posts de comunidad
- `messages` - Mensajes de chat
- `friend_requests` - Solicitudes de amistad
- `wallet_transactions` - Transacciones de wallet
- `payment_methods` - Métodos de pago del vendedor

### Políticas RLS
- Cada tabla tiene políticas RLS
- Los usuarios solo pueden acceder a sus propios datos
- Los vendedores pueden acceder a sus listings
- Los admins tienen acceso completo

## 🔄 Flujo de Datos

### Autenticación
1. Usuario ingresa email/password
2. Supabase Auth valida credenciales
3. Session creada en cookie HTTP-only
4. Middleware verifica session en cada request

### Publicación de Listing
1. Usuario completa formulario
2. Validación con Zod
3. Upload de imágenes a Supabase Storage
4. Insert en tabla `listings`
5. Notificación a seguidores (real-time)

### Compra
1. Usuario agrega al carrito (Zustand)
2. Checkout con PayPal
3. Webhook de PayPal confirma pago
4. Transacción registrada en `wallet_transactions`
5. Notificación a vendedor

## 🚀 Performance

### Optimizaciones
- Next.js Image optimization
- Code splitting automático
- Lazy loading de componentes
- Caching de Supabase queries
- Edge Functions para baja latencia

### Monitoreo
- Vercel Analytics (Web Analytics)
- Vercel Logs (Runtime logs)
- Supabase Dashboard (Database metrics)

## 📱 PWA

### Características
- Service Worker para offline
- Manifest para instalación
- Instalación desde login page
- Soporte móvil y desktop

### Configuración
- `manifest.webmanifest` en public/
- Service Worker en app/
- Instalación manual con API `beforeinstallprompt`

## 🧪 Testing

### Estado Actual
- CI/CD configurado con GitHub Actions
- Script de test temporal (placeholder)
- Plan para implementar Vitest

### Pruebas Planeadas
- Unit tests con Vitest
- E2E tests con Playwright
- Cobertura mínima: 70%

## 🔄 CI/CD

### Pipeline
1. **Lint:** ESLint
2. **Type Check:** TypeScript
3. **Build:** Next.js build
4. **Test:** npm test
5. **Deploy:** Vercel (automático en main)

### Branches
- `main` - Producción
- `develop` - Staging (planeado)

## 📝 Notas de Desarrollo

### Convenciones
- TypeScript estricto
- Componentes en PascalCase
- Hooks en camelCase con prefijo `use`
- Utilidades en kebab-case
- Comentarios en español

### Buenas Prácticas
- Usar Zod para validación
- Manejar errores con try/catch
- Usar toasts para feedback al usuario
- Optimizar imágenes antes de upload
- Sanitizar inputs de usuario

## 🚨 Troubleshooting Común

### Build Errors
- Verificar tipos TypeScript
- Revisar variables de entorno
- Limpiar cache: `rm -rf .next`

### Runtime Errors
- Verificar logs de Vercel
- Revisar Supabase RLS policies
- Validar session cookies

### Performance Issues
- Optimizar imágenes
- Revisar queries de Supabase
- Usar React.memo para componentes pesados

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vercel Docs](https://vercel.com/docs)
