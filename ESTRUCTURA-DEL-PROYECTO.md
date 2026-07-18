# 📋 ESTRUCTURA COMPLETA DEL PROYECTO IÓN MAX

## 🎯 VISIÓN GENERAL

**IÓN MAX** es una plataforma premium de ecosistema profesional que combina:
- **Marketplace** (SHOP, ACADEMY, SERVICES)
- **Red Social Profesional** (Comunidad y Mensajes)
- **Sistema de Roles** (Cliente, Admin, Dueño)
- **Billetera Digital** (Pagos y retiros)
- **Panel de Administración** (Gestión completa)

---

## 📁 ESTRUCTURA DE DIRECTORIOS

```
ion-max/
├── app/                          # Rutas Next.js App Router
│   ├── admin/                   # Panel de administración
│   ├── api/                     # API Routes
│   ├── auth/                    # Callbacks de autenticación
│   ├── carrito/                 # Carrito de compras
│   ├── comunidad/               # Red social profesional
│   ├── dashboard/               # Dashboard del cliente
│   ├── login/                   # Página de login
│   ├── marketplace/             # Marketplace público
│   ├── mensajes/                # Mensajería privada
│   ├── messages/                # Chat con IA (Gemini)
│   ├── owner/                   # Panel del dueño
│   ├── profile/                 # Perfil de usuario
│   ├── publish/                 # Publicar listings
│   ├── register/                # Registro
│   ├── reset-password/          # Recuperar contraseña
│   ├── settings/                # Configuración
│   ├── wallet/                  # Billetera digital
│   ├── layout.tsx               # Layout principal
│   ├── page.tsx                 # Página de inicio
│   └── globals.css              # Estilos globales
├── lib/                         # Utilidades y helpers
│   ├── auth/                    # Acciones de autenticación
│   ├── supabase/                # Cliente Supabase
│   ├── cart-context.tsx         # Contexto del carrito
│   ├── constants.ts             # Constantes
│   ├── providers.tsx            # Providers globales
│   ├── supabase-helpers.ts      # Helpers de Supabase
│   ├── supabase.ts              # Cliente Supabase
│   ├── types.ts                 # Tipos TypeScript
│   └── validation.ts            # Esquemas de validación
├── src/                         # Código fuente principal
│   ├── components/              # Componentes React
│   │   ├── layout/              # Layouts (AppShell, GlobalNav)
│   │   ├── protected-route.tsx   # Ruta protegida
│   │   └── providers.tsx        # Providers
│   ├── contexts/                # Contextos React
│   │   └── auth-context.tsx     # Contexto de autenticación
│   ├── features/                # Features de la aplicación
│   │   ├── admin/               # Panel de administración
│   │   ├── auth/                # Formularios de autenticación
│   │   ├── comunidad/           # Red social profesional
│   │   ├── dashboard/           # Dashboard del cliente
│   │   ├── marketplace/         # Marketplace
│   │   ├── messages/            # Chat con IA
│   │   ├── owner/               # Panel del dueño
│   │   ├── profile/             # Perfil de usuario
│   │   ├── publish/             # Publicar listings
│   │   ├── settings/            # Configuración
│   │   └── wallet/              # Billetera digital
│   ├── hooks/                   # Custom hooks
│   ├── lib/                     # Librerías internas
│   │   └── supabase/            # Cliente Supabase
│   ├── middleware.ts            # Middleware de Next.js
│   ├── services/                # Servicios de API
│   │   ├── account.ts           # Servicios de cuenta
│   │   ├── items.ts             # Servicios de listings
│   │   ├── owner.ts             # Servicios del dueño
│   │   └── social.ts            # Servicios sociales
│   ├── store/                   # Estado global (Zustand)
│   ├── types/                   # Tipos TypeScript
│   └── utils/                   # Utilidades
├── public/                      # Archivos estáticos
├── supabase-migration.sql       # Migración principal de DB
├── supabase-social-migration.sql # Migración de funcionalidad social
├── package.json                 # Dependencias del proyecto
├── tsconfig.json                # Configuración TypeScript
├── next.config.ts               # Configuración Next.js
├── tailwind.config.ts           # Configuración Tailwind
└── .env.local                   # Variables de entorno (local)
```

---

## 🛤️ RUTAS Y PÁGINAS

### PÁGINAS PÚBLICAS (Sin autenticación)

| Ruta | Descripción | Componente |
|------|-------------|------------|
| `/` | Página principal / Landing | `page.tsx` |
| `/login` | Iniciar sesión | `login/page.tsx` |
| `/register` | Crear cuenta | `register/page.tsx` |
| `/reset-password` | Recuperar contraseña | `reset-password/page.tsx` |
| `/auth/callback` | Callback de Supabase | `auth/callback/route.ts` |

### PÁGINAS DEL CLIENTE (Requieren autenticación)

| Ruta | Descripción | Layout | Componente |
|------|-------------|--------|------------|
| `/dashboard` | Dashboard principal | AppShell | `dashboard/page.tsx` |
| `/marketplace` | Marketplace público | - | `marketplace/page.tsx` |
| `/comunidad` | Red social profesional | AppShell | `comunidad/page.tsx` |
| `/mensajes` | Mensajería privada | AppShell | `mensajes/page.tsx` |
| `/messages` | Chat con IA (Gemini) | - | `messages/page.tsx` |
| `/profile` | Perfil de usuario | - | `profile/page.tsx` |
| `/publish` | Publicar listings | - | `publish/page.tsx` |
| `/settings` | Configuración | - | `settings/page.tsx` |
| `/wallet` | Billetera digital | - | `wallet/page.tsx` |
| `/carrito` | Carrito de compras | - | `carrito/page.tsx` |

### PÁGINAS DE ADMINISTRACIÓN

| Ruta | Descripción | Requisito | Componente |
|------|-------------|-----------|------------|
| `/admin` | Panel de administración | Rol: admin | `admin/page.tsx` |
| `/admin/login` | Login de admin | - | `admin/login/page.tsx` |

### PÁGINAS DEL DUEÑO

| Ruta | Descripción | Requisito | Componente |
|------|-------------|-----------|------------|
| `/owner` | Panel del dueño | Email: gstalin110@gmail.com | `owner/page.tsx` |

### API ROUTES

| Ruta | Descripción |
|------|-------------|
| `/api/chat` | Chat con Gemini AI |
| `/api/supabase` | Proxy de Supabase |

---

## 🧩 COMPONENTES PRINCIPALES

### Layouts

- **`AppShell`** (`src/components/layout/app-shell.tsx`)
  - Sidebar de navegación
  - Header con búsqueda y carrito
  - Layout para páginas internas del dashboard

- **`GlobalNav`** (`src/components/layout/global-nav.tsx`)
  - Navegación principal pública
  - Links a Marketplace, Dashboard, Perfil, Login/Registro

### Componentes de Protección

- **`ProtectedRoute`** (`src/components/protected-route.tsx`)
  - Verifica autenticación
  - Redirige a login si no está autenticado

### Contextos

- **`AuthProvider`** (`src/contexts/auth-context.tsx`)
  - Gestión de autenticación
  - Funciones: signIn, signUp, signOut, resetPassword

- **`CartProvider`** (`lib/cart-context.tsx`)
  - Gestión del carrito de compras
  - Persistencia en localStorage

---

## 🔧 SERVICIOS Y HELPERS

### Servicios de Supabase (`lib/supabase-helpers.ts`)

#### Listings
- `getListings()` - Obtener todos los listings activos
- `getListingsByCategory(categoryId)` - Filtrar por categoría
- `createListing(formData)` - Crear nuevo listing
- `updateListing(id, formData)` - Actualizar listing
- `deleteListing(id)` - Eliminar listing

#### Profiles
- `getProfile(userId)` - Obtener perfil de usuario
- `updateProfile(userId, updates)` - Actualizar perfil

#### Wallet
- `getWallet(userId)` - Obtener billetera del usuario

#### Roles
- `getUserRole(userId)` - Obtener rol del usuario
- `isAdmin(userId)` - Verificar si es admin

#### Autenticación
- `signIn(email)` - Iniciar sesión con magic link
- `signOut()` - Cerrar sesión
- `getCurrentUser()` - Obtener usuario actual

### Servicios de Negocio (`src/services/`)

- **`account.ts`** - Servicios de cuenta y billetera
- **`items.ts`** - Servicios de listings (wrapper)
- **`owner.ts`** - Servicios del panel del dueño
- **`social.ts`** - Servicios de red social:
  - `getCommunityMembers()` - Obtener miembros
  - `getCommunityPosts()` - Obtener publicaciones
  - `createCommunityPost()` - Crear publicación
  - `getDirectMessages()` - Obtener mensajes
  - `sendDirectMessage()` - Enviar mensaje
  - `getConversationPartners()` - Obtener conversaciones

---

## 📊 TIPOS DE DATOS (`lib/types.ts`)

### Listings
```typescript
interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  category_id: string;
  category_name?: string;
  status: "pending_review" | "active" | "paused" | "sold" | "deleted";
  location?: string;
  tags?: string[];
  images: string[];
  view_count: number;
  created_at: string;
  updated_at: string;
}
```

### Profile
```typescript
interface Profile {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  phone?: string;
  country?: string;
  province?: string;
  city?: string;
  email_verified: boolean;
  account_verified: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}
```

### Wallet
```typescript
interface Wallet {
  id: string;
  user_id: string;
  available_balance: number;
  pending_balance: number;
  retained_balance: number;
  total_income: number;
  total_commissions: number;
  created_at: string;
  updated_at: string;
}
```

### Orders
```typescript
interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  total_amount: number;
  shipping_address?: string;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
}
```

### Cart (LocalStorage)
```typescript
interface CartItem {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  cantidad: number;
}
```

---

## 🔐 SISTEMA DE ROLES

### Roles Disponibles
1. **`user`** - Cliente estándar (por defecto)
2. **`admin`** - Administrador del sistema
3. **`owner`** - Dueño de la plataforma (acceso vía email)

### Asignación de Roles
- **Admin**: Asignado en tabla `user_roles` en Supabase
- **Owner**: Verificado por variable de entorno `NEXT_PUBLIC_OWNER_EMAIL`

### Acceso por Rol
- **`/admin`** - Requiere rol `admin`
- **`/owner`** - Requiere email coincidente con `NEXT_PUBLIC_OWNER_EMAIL`
- **Rutas de cliente** - Require autenticación

---

## 🗄️ ESTRUCTURA DE BASE DE DATOS (SUPABASE)

### Tablas Principales
- **`listings`** - Publicaciones (productos, servicios, cursos, empleos, empresas)
- **`categories`** - Categorías de listings
- **`profiles`** - Perfiles de usuarios
- **`wallets`** - Billeteras digitales
- **`orders`** - Órdenes de compra
- **`roles`** - Roles del sistema
- **`user_roles`** - Asignación de roles a usuarios
- **`audit_logs`** - Logs de auditoría

### Tablas Sociales (requieren migración)
- **`community_posts`** - Publicaciones de la comunidad
- **`direct_messages`** - Mensajes directos entre usuarios

### Migraciones
- **`supabase-migration.sql`** - Migración principal de la DB
- **`supabase-social-migration.sql`** - Migración de funcionalidad social

---

## ⚙️ CONFIGURACIÓN

### Variables de Entorno

**Requeridas:**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_OWNER_EMAIL=gstalin110@gmail.com
GEMINI_API_KEY=your_gemini_api_key
```

### Archivos de Configuración
- **`next.config.ts`** - Configuración de Next.js
- **`tsconfig.json`** - Configuración de TypeScript
- **`tailwind.config.ts`** - Configuración de Tailwind CSS v4
- **`eslint.config.mjs`** - Configuración de ESLint

---

## 📦 DEPENDENCIAS PRINCIPALES

### Framework y Core
- **`next`** (16.2.9) - Framework React
- **`react`** (19.2.4) - Librería UI
- **`typescript`** (5.x) - Type safety

### Estilos y UI
- **`tailwindcss`** (v4) - Estilos utility-first
- **`framer-motion`** (12.41.0) - Animaciones
- **`lucide-react`** (1.23.0) - Iconos

### Backend y Datos
- **`@supabase/supabase-js`** (2.108.2) - Cliente Supabase
- **`@supabase/ssr`** (0.12.0) - Soporte SSR
- **`@supabase/server`** (1.2.0) - Server actions
- **`@tanstack/react-query`** (5.101.2) - Data fetching
- **`@google/generative-ai`** (0.24.1) - Gemini AI

### Formularios y Validación
- **`react-hook-form`** (7.80.0) - Gestión de formularios
- **`@hookform/resolvers`** (5.4.0) - Integración con Zod
- **`zod`** (4.3.3) - Validación de esquemas

### Estado y Utilidades
- **`zustand`** (5.0.14) - Estado global
- **`clsx`** (2.1.1) - Utilidad de clases
- **`react-hot-toast`** (2.6.0) - Notificaciones

---

## 🔄 ESTADO ACTUAL DE LA MIGRACIÓN

### ✅ Completado
- Migración de `items` a `listings`
- Actualización de tipos de datos
- Implementación de red social profesional (Comunidad y Mensajes)
- Integración de AppShell en rutas principales
- Corrección de autenticación
- Configuración de Vercel

### ⏳ Pendiente
- Ejecutar `supabase-social-migration.sql` en Supabase
- Configurar variable `NEXT_PUBLIC_OWNER_EMAIL` en Vercel (COMPLETADO)
- Verificar despliegue en producción

---

## 🚀 SCRIPTS DISPONIBLES

```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Compilar para producción
npm run start        # Iniciar servidor de producción
npm run lint         # Ejecutar ESLint
```

---

## 📝 NOTAS IMPORTANTES

1. **Autenticación**: Usa Supabase Auth con magic links
2. **Base de Datos**: PostgreSQL vía Supabase
3. **Despliegue**: Vercel con integración Git automática
4. **Estilos**: Tailwind CSS v4 con configuración personalizada
5. **Estado Global**: Zustand para estado global, Context para auth
6. **Carrito**: Persistencia en localStorage
7. **IA**: Integración con Gemini AI para chat

---

## 🔗 ENLACES IMPORTANTES

- **Repositorio GitHub**: `https://github.com/gstalin110-ai/ion-max`
- **Proyecto Vercel**: Configurado y conectado
- **Proyecto Supabase**: Configurado con migraciones listas
- **Panel del Dueño**: `/owner` (requiere email gstalin110@gmail.com)
- **Panel Admin**: `/admin` (requiere rol admin)

---

## 📊 RESUMEN DE FUNCIONALIDADES

### Para Clientes
- ✅ Navegar marketplace
- ✅ Ver detalles de listings
- ✅ Agregar al carrito
- ✅ Publicar listings
- ✅ Red social profesional
- ✅ Mensajería privada
- ✅ Chat con IA
- ✅ Billetera digital
- ✅ Perfil personal

### Para Administradores
- ✅ Panel de administración
- ✅ Gestión de listings
- ✅ Gestión de usuarios
- ✅ Logs de auditoría

### Para el Dueño
- ✅ Panel exclusivo
- ✅ Estadísticas globales
- ✅ Gestión de roles
- ✅ Logs del sistema

---

**Última actualización**: 8 de julio de 2026
**Estado del proyecto**: 🟢 Activo y funcional
**Versión**: 0.1.0
