# 🏗️ Arquitectura del Sistema - IÓN MAX

## 📊 Visión General

IÓN MAX es un ecosistema de e-commerce que combina marketplace premium con red social profesional, construido con:

- **Frontend:** Next.js 16 (App Router) + React 19
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Hosting:** Vercel
- **IA:** Google Generative AI (Gemini 2.0 Flash)
- **Estyling:** Tailwind CSS v4
- **State Management:** Zustand + React Context

---

## 🗂️ Estructura del Proyecto

```
ion-max/
├── app/                          # Next.js App Router
│   ├── admin/                    # Panel de administración
│   ├── api/                      # API Routes
│   ├── marketplace/              # Marketplace
│   ├── community/                # Red social
│   ├── layout.tsx               # Layout principal
│   └── page.tsx                 # Home
├── src/
│   ├── components/              # Componentes reutilizables
│   ├── contexts/                # React Contexts
│   ├── features/                # Features (settings, checkout, etc.)
│   ├── lib/                     # Utilidades y helpers
│   └── services/                # Servicios (IA, facturación)
├── lib/                         # Librerías compartidas
│   ├── supabase-helpers.ts     # Helpers de Supabase
│   └── types.ts                # Tipos TypeScript
└── docs/                        # Documentación
```

---

## 🗄️ Base de Datos (Supabase PostgreSQL)

### Tablas Principales

#### `profiles`
- Información de usuarios
- Configuración de IA (gemini_api_key)
- Rol de usuario (user, admin, owner)

#### `listings`
- Publicaciones de productos/servicios
- Categorías, precios, descripciones
- Estado (active, pending, sold)

#### `orders`
- Órdenes de compra
- Relación buyer-seller
- Estado de pago

#### `seller_payment_methods`
- Métodos de pago del vendedor
- Enlaces y QR (máximo 5 de cada tipo)
- Proveedores: DEUNA, Kushki, Yape, Plin, Bancos

#### `invoices`
- Facturas electrónicas simples (sin IVA)
- Datos: vendedor, comprador, hora exacta, IDs únicos
- Número único: ION-YYYYMMDD-XXXXX

#### `support_tickets`
- Tickets de soporte
- Chat en tiempo real
- Prioridades y categorías

#### `ticket_messages`
- Mensajes de chat en tickets
- Soporte para dueño y usuarios

---

## 🔐 Seguridad

### Row Level Security (RLS)

Todas las tablas tienen políticas RLS configuradas:

- **Usuarios solo pueden ver sus propios datos**
- **Vendedores solo pueden gestionar sus listings**
- **Compradores solo pueden ver sus órdenes**
- **Dueño tiene acceso completo**

### Rate Limiting

Implementado en endpoints críticos:
- `/api/chat`: 10 requests/minuto
- `/api/listings`: 30 requests/minuto
- `/api/orders`: 5 requests/minuto

### Security Headers

Headers de seguridad configurados:
- HSTS
- X-Frame-Options
- X-Content-Type-Options
- CSP (Content Security Policy)

---

## 🤖 Inteligencia Artificial

### Servicios de IA

**AI Marketing Service** (`src/services/ai-marketing-service.ts`):
- Optimización de descripciones
- Generación de contenido social
- Recomendaciones de productos
- Respuestas automáticas
- Análisis de sentimiento

### Integración Gemini API

- Modelo: gemini-2.0-flash
- API Key personalizada por usuario
- Fallback a API key del servidor
- Prompts optimizados para Ecuador

---

## 💳 Sistema de Pagos

### Métodos de Pago del Vendedor

- **Sin API key** - Vendedores usan su cuenta personal
- **Enlaces de pago** (máximo 5)
- **Códigos QR** (máximo 5)
- **Proveedores:** DEUNA, Kushki, Yape, Plin, Bancos

### Flujo de Compra

1. Comprador selecciona producto
2. Checkout muestra métodos de pago del vendedor
3. Comprador paga usando enlace/QR del vendedor
4. Sistema crea orden en BD
5. Sistema genera factura automáticamente
6. Factura se guarda en Supabase Storage

---

## 🧾 Sistema de Facturación

### Facturas Simples (Sin IVA)

**Datos incluidos:**
- Quién compra (nombre, ID único, email)
- Quién vende (nombre, ID único, email)
- Hora exacta de transacción
- Monto total
- Número único: ION-YYYYMMDD-XXXXX

**Diseño:**
- Gradiente amarillo IÓN MAX
- Branding profesional
- Imprimir como PDF o descargar HTML

**Almacenamiento:**
- Supabase Storage bucket `invoices`
- Copia para vendedor
- Copia para dueño (referencia)

---

## 🎫 Sistema de Tickets

### Funcionalidades

- **Creación de tickets** por usuarios
- **Chat en tiempo real** dentro del ticket
- **Prioridades:** Baja, Media, Alta, Urgente
- **Categorías:** Producto, Pago, Usuario, Plataforma, Cuenta
- **Gestión por dueño:** Ver, responder, cambiar estado
- **Notas internas** para el dueño

### Panel del Dueño

- Filtros por estado
- Vista de todos los tickets
- Respuestas como dueño
- Notas internas
- Dashboard de métricas

---

## 📊 Dashboard del Dueño

### Métricas en Tiempo Real

- Usuarios totales
- Listings activos
- Órdenes totales
- Tickets abiertos
- Ingresos generados

### Funcionalidades

- Gestión de usuarios (banear, roles)
- Aprobación de listings
- Gestión de tickets
- Ver respuestas de encuestas

---

## 🚀 CI/CD

### GitHub Actions

Pipeline automatizado:
1. **Lint** - ESLint
2. **Type Check** - TypeScript
3. **Build** - Next.js build
4. **Test** - Pruebas unitarias
5. **Deploy** - Vercel (staging/production)

### Entornos

- **Production:** main branch → ion-max.app
- **Staging:** develop branch → staging.ion-max.app

---

## 📱 PWA y Mobile

### Service Worker

- Registro automático
- Caching de assets
- Soporte offline

### Navegación Móvil

- Bottom navigation
- Botón destacado de Publicar
- Optimizado para touch

---

## 🎨 Diseño

### Sistema de Diseño

- **Colores:** Gradiente amarillo IÓN MAX (#facc15)
- **Tipografía:** Geist Sans + Geist Mono
- **Componentes:** Glassmorphism, micro-interacciones
- **Dark Mode:** Por defecto

### UI Components

- Botones con gradientes
- Cards con bordes sutiles
- Badges de estado
- Animaciones con Framer Motion

---

## 🔧 Desarrollo

### Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run start        # Servidor de producción
npm run lint         # ESLint
```

### Variables de Entorno

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
NEXT_PUBLIC_OWNER_EMAIL
```

---

## 📈 Escalabilidad

### Arquitectura Escalable

- **Supabase:** Escala automáticamente
- **Vercel:** Edge deployment global
- **Rate Limiting:** Previene abuso
- **Caching:** Redis (pendiente)
- **CDN:** Cloudflare (pendiente)

### Plan de Escalado

1. **Fase 1 (Actual):** MVP funcional
2. **Fase 2:** Testing y monitoring
3. **Fase 3:** Caching y CDN
4. **Fase 4:** Auditoría de seguridad
5. **Fase 5:** Optimización de performance

---

## 🛠️ Troubleshooting

### Errores Comunes

**Error: "Rate limit exceeded"**
- Solución: Esperar 1 minuto o usar diferente IP

**Error: "No se encontró API Key"**
- Solución: Configurar en perfil de Configuración

**Error: "Bucket invoices no existe"**
- Solución: Crear bucket en Supabase Storage

---

## 📞 Soporte

Para problemas técnicos:
1. Revisar logs en Vercel
2. Verificar variables de entorno
3. Revisar políticas RLS en Supabase
4. Contactar al dueño: gstalin110@gmail.com

---

## 🎯 Roadmap

### Próximas Mejoras

- [ ] Pruebas unitarias (Vitest)
- [ ] Sentry para error tracking
- [ ] Ambiente de staging
- [ ] Pruebas E2E (Playwright)
- [ ] Auditoría de seguridad
- [ ] Sistema de caching (Redis)
- [ ] CDN (Cloudflare)
- [ ] Pentesting profesional
- [ ] Compliance GDPR/PCI-DSS
- [ ] Monitoring avanzado (Datadog)

---

**Última actualización:** Julio 2026
**Versión:** 0.1.0
**Estado:** MVP Funcional - Fase 1 Empresarial
