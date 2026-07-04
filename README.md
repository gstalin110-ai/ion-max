# ⚡ IÓN MAX - Premium Platform

**Plataforma premium de lujo para SHOP, ACADEMY y SERVICES.**

- 🌐 [Sitio en vivo](https://tu-dominio.com)
- 🔐 Autenticación con Supabase
- 📱 Diseño responsive
- ⚙️ Panel admin CRUD

## 🚀 Stack

- **Next.js 16** - Framework React
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Estilos
- **Framer Motion** - Animaciones
- **Supabase** - Base de datos + Auth
- **Zod** - Validación de esquemas

## 🛠️ Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📦 Despliegue

Desplegado en **Vercel** con integración automática con Git.

## 📝 Variables de Entorno

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## 📂 Estructura

```
app/
├── page.tsx           # Página pública (shop, academy, services)
├── admin/page.tsx     # Panel de administración
└── carrito/page.tsx   # Carrito de compras

lib/
├── supabase.ts        # Cliente Supabase
├── supabase-helpers.ts # Funciones CRUD
├── types.ts           # Tipos TypeScript
└── validation.ts      # Esquemas Zod
```

## 📄 Licencia

Privado © 2026 IÓN MAX
