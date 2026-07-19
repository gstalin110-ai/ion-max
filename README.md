# ⚡ IÓN MAX - Premium Platform

**Plataforma premium de ecosistema profesional con SHOP, ACADEMY, SERVICES y RED SOCIAL.**

- 🌐 [Sitio en vivo](https://ion-max.vercel.app)
- 🔐 Autenticación con Supabase
- 📱 Diseño responsive
- ⚙️ Panel admin CRUD
- 👥 Red social profesional (Comunidad y Mensajes)
- 💳 Sistema de pagos completo
- 🛒 Marketplace con carrito y checkout
- 📦 Sistema de órdenes y facturación

## 🚀 Stack

- **Next.js 16** - Framework React
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Estilos
- **Framer Motion** - Animaciones
- **Supabase** - Base de datos + Auth
- **Zod** - Validación de esquemas
- **Stripe** - Pagos (opcional)

## 🛠️ Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📦 Despliegue en Vercel

### Paso 1: Crear Repositorio en GitHub
1. Ve a [GitHub](https://github.com) y crea un nuevo repositorio llamado `ion-max`
2. No inicialices con README (ya existe uno)
3. Copia la URL del repositorio

### Paso 2: Subir el Código
```bash
# Si aún no has conectado el repositorio local:
git remote add origin https://github.com/TU_USUARIO/ion-max.git
git branch -M main
git push -u origin main
```

### Paso 3: Conectar con Vercel
1. Ve a [Vercel](https://vercel.com)
2. Clic en "Add New Project"
3. Importa desde GitHub
4. Selecciona el repositorio `ion-max`
5. Configura el nombre del proyecto como `ion-max`

### Paso 4: Configurar Variables de Entorno
En Vercel, agrega estas variables en Settings > Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
SUPABASE_SERVICE_ROLE_KEY=tu_clave_servicio
NEXT_PUBLIC_APP_URL=https://ion-max.vercel.app
```

### Paso 5: Configurar Dominio Personalizado
1. En Vercel, ve a Settings > Domains
2. Agrega tu dominio personalizado (ej: `ionmax.com`)
3. Configura los DNS según las instrucciones de Vercel

## 🔒 Seguridad Implementada

### Headers de Seguridad
- **HSTS** - HTTPS obligatorio
- **X-Frame-Options** - Protección contra clickjacking
- **X-Content-Type-Options** - Prevención de MIME-sniffing
- **X-XSS-Protection** - Protección XSS
- **Content-Security-Policy** - Control de recursos
- **Permissions-Policy** - Control de permisos del navegador

### Protecciones Adicionales
- Validación de datos con Zod
- Autenticación con Supabase
- Variables de entorno para datos sensibles
- CORS configurado
- Sanitización de inputs

## 📝 Variables de Entorno

Ver `ENV_SETUP.md` para detalles completos de configuración.

## 📂 Estructura

```
app/
├── page.tsx           # Página pública (shop, academy, services)
├── admin/page.tsx     # Panel de administración
├── carrito/page.tsx   # Carrito de compras
├── checkout/page.tsx  # Checkout de pagos
├── ordenes/page.tsx   # Historial de pedidos
└── comunidad/page.tsx # Red social

src/features/
├── marketplace/       # Funcionalidades del marketplace
├── comunidad/        # Red social
├── messages/         # Sistema de mensajes
└── auth/            # Autenticación

lib/
├── supabase.ts        # Cliente Supabase
├── supabase-helpers.ts # Funciones CRUD
├── types.ts           # Tipos TypeScript
└── validation.ts      # Esquemas Zod
```

## 📄 Licencia

Privado © 2026 IÓN MAX
