# 🚀 IÓN MAX - Operaciones Globales

**La marca que redefine la autoridad digital.**

---

## 📋 ¿Qué es IÓN MAX?

IÓN MAX es una plataforma premium integrada que combina:

- **🛍️ SHOP**: Productos de lujo, tecnología y accesorios de valor ($500+)
- **📚 ACADEMY**: Cursos online innovadores en programación y tecnología
- **⚙️ SERVICES**: Operaciones de alto valor para empresas en crecimiento
- **💼 ABOUT**: Tu historia como marca en crecimiento

Es la infraestructura donde **la autoridad digital, el valor y la innovación convergen**.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Animaciones**: Framer Motion
- **Backend/Base Datos**: Supabase (PostgreSQL + Auth)
- **Validación**: Zod
- **Herramientas**: ESLint, PostCSS

---

## 🎯 Características Principales

### ✅ Página Pública
- [x] Hero section premium con gradientes
- [x] 3 secciones de productos/servicios/cursos dinámicas
- [x] Carrito de compras con localStorage
- [x] Wishlist (favoritos)
- [x] Animaciones fluidas (Framer Motion)
- [x] Botón WhatsApp flotante
- [x] Sección "Sobre Nosotros" con visión de marca
- [x] Footer con contacto directo

### ✅ Panel Admin
- [x] Autenticación con Supabase Auth
- [x] CRUD completo (Crear, Leer, Actualizar, Eliminar)
- [x] Validación de formularios (Zod)
- [x] Preview de imágenes en tiempo real
- [x] Gestión de categorías (SHOP, ACADEMY, SERVICES)
- [x] Etiquetas personalizadas
- [x] Stock management
- [x] Interfaz moderna y responsive

### ✅ Carrito
- [x] Agregar/remover items
- [x] Persistencia en localStorage
- [x] Resumen de precios
- [x] Integración con WhatsApp para checkout
- [x] Contador en navbar

---

## 📁 Estructura del Proyecto

```
ion-max/
├── app/
│   ├── admin/
│   │   ├── login/page.tsx      # Login para admin
│   │   └── page.tsx             # Panel de administración
│   ├── carrito/
│   │   └── page.tsx             # Página del carrito
│   ├── layout.tsx               # Layout global
│   ├── page.tsx                 # Página principal
│   └── globals.css              # Estilos globales
├── lib/
│   ├── supabase.ts              # Cliente Supabase
│   ├── supabase-helpers.ts      # Funciones helpers
│   ├── types.ts                 # Tipos TypeScript
│   ├── validation.ts            # Schemas Zod
│   ├── cart-context.tsx         # Context del carrito
│   └── providers.tsx            # Providers globales
├── public/                       # Assets estáticos
├── .env.local                    # Variables de entorno (NO COMMITEAR)
├── next.config.ts               # Config Next.js
├── tailwind.config.ts           # Config Tailwind
├── tsconfig.json                # Config TypeScript
├── SETUP.md                      # Guía de configuración
└── README_ION_MAX.md            # Este archivo
```

---

## 🚀 Quick Start

### 1. Configurar Variables de Entorno
Crea `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 2. Ejecutar Servidor Local
```bash
npm install
npm run dev
```

Accede a:
- 🏠 Frontend: http://localhost:3000
- 🔐 Admin: http://localhost:3000/admin/login
- 🛒 Carrito: http://localhost:3000/carrito

---

## 📊 Setup de Supabase (CRÍTICO)

**Lee SETUP.md para instrucciones completas**

---

## 💻 Uso del Panel Admin

**Email**: `admin@ionmax.com`
**URL**: `http://localhost:3000/admin/login`

1. Crear, editar, eliminar productos
2. Gestionar 3 categorías: SHOP, ACADEMY, SERVICES
3. Agregar etiquetas y stock

---

## 🎨 Personalización

- Cambiar WhatsApp: Busca `593980887170`
- Cambiar nombre: Busca `IÓN MAX`
- Cambiar colores: Modifica clases Tailwind

---

## 📦 Despliegue a Vercel

```bash
vercel
```

Agrega env vars: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

**Hecho con ❤️ para IÓN MAX © 2026**
