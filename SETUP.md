# 🚀 IÓN MAX - Setup & Configuración Completa

## 📋 Tabla de Contenidos
1. [Requisitos](#requisitos)
2. [Configuración de Supabase](#configuración-de-supabase)
3. [Variables de Entorno](#variables-de-entorno)
4. [Ejecución Local](#ejecución-local)
5. [Guía de Uso](#guía-de-uso)

---

## ✅ Requisitos

- Node.js 18+ instalado
- Cuenta en [Supabase](https://supabase.com) (gratuita)
- Editor de código (VS Code recomendado)

---

## 🔧 Configuración de Supabase

### 1. Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión o crea cuenta
3. Click en "New Project"
4. Completa los detalles:
   - **Project name**: `ion-max`
   - **Database password**: Guarda esto de forma segura
   - **Region**: Selecciona la más cercana a ti

### 2. Crear Tabla `items`
Una vez en el dashboard de Supabase:

1. Ve a **SQL Editor** en el sidebar izquierdo
2. Click en "New Query"
3. Copia y ejecuta este SQL:

```sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  imagen_url TEXT NOT NULL,
  enlace_externo TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('SHOP', 'ACADEMY', 'SERVICES')),
  etiqueta TEXT,
  stock INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índice para optimizar búsquedas
CREATE INDEX idx_items_categoria ON items(categoria);
CREATE INDEX idx_items_created_at ON items(created_at DESC);
```

### 3. Crear Tabla de Autenticación (Users)
Supabase automáticamente maneja la tabla `auth.users`. 

Lo que necesitas hacer es crear una tabla de perfil (opcional):

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS para user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);
```

### 4. Configurar RLS (Row Level Security) para `items`

En Supabase, ve a **Authentication** → **Policies**

1. Selecciona la tabla `items`
2. Habilita RLS
3. Agrega estas políticas:

```sql
-- Permitir lectura pública de items
CREATE POLICY "Allow public read items"
  ON items FOR SELECT
  USING (true);

-- Permitir insertar solo a usuarios autenticados
CREATE POLICY "Allow authenticated insert items"
  ON items FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Permitir actualizar solo items del usuario autenticado
CREATE POLICY "Allow authenticated update items"
  ON items FOR UPDATE
  WITH CHECK (auth.role() = 'authenticated');

-- Permitir eliminar solo items del usuario autenticado
CREATE POLICY "Allow authenticated delete items"
  ON items FOR DELETE
  USING (auth.role() = 'authenticated');
```

### 5. Crear Usuario Admin
1. Ve a **Authentication** en Supabase
2. Click en "Create a new user"
3. Email: `admin@ionmax.com` (o el que prefieras)
4. Password: Elige una contraseña fuerte
5. Nota: Usa este email/password para acceder al panel admin

---

## 🔐 Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Supabase - Obtén estos valores de Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Cómo obtener tus valores:
1. En Supabase Dashboard, ve a **Settings** (engranaje abajo a la izquierda)
2. Click en **API**
3. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🏃 Ejecución Local

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar servidor de desarrollo
```bash
npm run dev
```

La aplicación estará disponible en:
- **Frontend**: http://localhost:3000
- **Admin**: http://localhost:3000/admin/login

### 3. Build para producción
```bash
npm run build
npm start
```

---

## 📖 Guía de Uso

### 🛍️ Página Principal (`/`)
- Muestra todos los productos, cursos y servicios
- **Wishlist**: Click en ❤️ para guardar favoritos
- **WhatsApp**: Botón flotante en esquina inferior derecha
- Navegación por secciones: SHOP, ACADEMY, SERVICES

### ⚙️ Panel Admin (`/admin`)

#### Login
1. Accede a http://localhost:3000/admin/login
2. Email: `admin@ionmax.com`
3. Contraseña: La que configuraste en Supabase

#### Crear Recurso
1. Completa el formulario en la parte superior
2. **Campos obligatorios**:
   - Nombre del producto/curso/servicio
   - Descripción (mín. 10 caracteres)
   - Precio (número > 0)
   - URL de imagen (validada)
   - Enlace destino (ej. WhatsApp, plataforma de pago)
   - Categoría (SHOP, ACADEMY o SERVICES)

3. **Campos opcionales**:
   - Etiqueta (🔥 Trending, ⭐ Premium)
   - Stock (cantidad disponible)

4. La imagen se previsualizará automáticamente
5. Click en "✅ Publicar Recurso"

#### Editar Recurso
1. En la lista de recursos, busca el que quieres editar
2. Click en "✏️ Editar"
3. El formulario se llena automáticamente
4. Realiza cambios
5. Click en "💾 Actualizar"

#### Eliminar Recurso
1. En la lista, click en "🗑️ Eliminar"
2. Confirma la eliminación

---

## 🎨 Personalización

### Cambiar nombre de la marca
Busca y reemplaza `IÓN MAX` en estos archivos:
- `app/page.tsx` (página principal)
- `app/admin/page.tsx` (admin)
- `lib/supabase.ts` (comentarios)

### Cambiar WhatsApp
En `app/page.tsx`, reemplaza `593980887170` con tu número:
```tsx
href="https://wa.me/TU_NUMERO_AQUI"
```

### Cambiar colores (Tailwind)
Los colores están en `globals.css` y usan Tailwind. Para cambiar:
- Fondo: `bg-black` → otro color
- Texto: `text-white` → otro color
- Acentos: `border-white/10` → otro

---

## 🚨 Troubleshooting

### "Error de conexión a Supabase"
- Verifica que las variables de entorno estén correctas en `.env.local`
- Reinicia el servidor: `npm run dev`

### "No puedo iniciar sesión en admin"
- Verifica que creaste el usuario en Supabase Auth
- Revisa que la contraseña sea correcta
- Intenta crear un nuevo usuario si olvidaste la contraseña

### "Las imágenes no cargan"
- Verifica que la URL sea válida y accesible
- Las imágenes deben estar en HTTPS
- Usa URLs públicas (no localhost)

### "RLS bloquea las operaciones"
- Ve a Supabase → Authentication → Policies
- Verifica que las políticas sean correctas
- Intenta desactivar RLS temporalmente para debug

---

## 📱 Despliegue (Vercel)

### 1. Push a GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Conectar a Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Click "New Project"
3. Importa tu repo de GitHub
4. Agrega las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy

---

## 📞 Soporte

Para ayuda:
- Revisa los logs: `npm run dev` (consola)
- Verifica Supabase Dashboard → Logs
- Contacta al desarrollador

---

**IÓN MAX © 2026 - Operaciones Globales en Expansión**
