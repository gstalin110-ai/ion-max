# 👨‍💻 Guía de Onboarding para Desarrolladores - IÓN MAX

## 🎯 Objetivo
Guía completa para que nuevos desarrolladores se integren rápidamente al equipo de IÓN MAX.

---

## 📋 Día 1: Configuración y Overview

### 1.1 Configuración del Entorno

**Requisitos previos:**
- Node.js 20+
- Git
- VS Code (recomendado) o tu editor preferido
- Cuenta en GitHub
- Cuenta en Vercel
- Cuenta en Supabase

**Pasos:**

1. **Clonar el repositorio**
```bash
git clone https://github.com/gstalin110-ai/ion-max.git
cd ion-max
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key
GEMINI_API_KEY=tu_gemini_api_key
NEXT_PUBLIC_OWNER_EMAIL=gstalin110@gmail.com
```

4. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

5. **Verificar que funcione**
- Abre http://localhost:3000
- Deberías ver la página principal de IÓN MAX

---

### 1.2 Overview del Proyecto

**Qué es IÓN MAX:**
- Ecosistema de e-commerce para Ecuador
- Marketplace + Red Social integrados
- IA como diferenciador
- Pagos sin intermediarios (QR/enlaces directos)

**Stack Tecnológico:**
- Frontend: Next.js 16 (App Router) + React 19
- Backend: Supabase (PostgreSQL + Auth + Storage)
- IA: Google Generative AI (Gemini 2.0 Flash)
- Styling: Tailwind CSS v4
- State: Zustand + React Context
- Hosting: Vercel

**Estructura del Proyecto:**
```
ion-max/
├── app/                    # Next.js App Router
│   ├── admin/             # Panel de administración
│   ├── api/               # API Routes
│   ├── marketplace/       # Marketplace
│   └── community/         # Red social
├── src/
│   ├── components/        # Componentes reutilizables
│   ├── contexts/          # React Contexts
│   ├── features/          # Features (settings, checkout, etc.)
│   ├── lib/               # Utilidades y helpers
│   └── services/          # Servicios (IA, facturación)
├── lib/                   # Librerías compartidas
│   ├── supabase-helpers.ts
│   └── types.ts
└── docs/                  # Documentación
```

---

## 📚 Día 2: Arquitectura y Flujo de Trabajo

### 2.1 Arquitectura del Sistema

**Leer documentación:**
1. `docs/ARCHITECTURE.md` - Arquitectura completa
2. `docs/RUNBOOKS.md` - Runbooks de operación
3. `INSTRUCCIONES-SUPABASE.md` - Configuración de Supabase

**Conceptos clave:**
- **Row Level Security (RLS):** Políticas de seguridad en Supabase
- **Server Components:** Next.js App Router
- **Client Components:** Componentes interactivos
- **API Routes:** Endpoints de backend
- **Rate Limiting:** Protección contra abuso

### 2.2 Flujo de Trabajo de Desarrollo

**Branch Strategy:**
- `main` - Producción
- `develop` - Staging
- `feature/nombre` - Nuevas funcionalidades
- `fix/nombre` - Correcciones de bugs

**Proceso de desarrollo:**
1. Crear feature branch desde `develop`
```bash
git checkout develop
git pull origin develop
git checkout -b feature/tu-feature
```

2. Hacer cambios y commit
```bash
git add .
git commit -m "feat: descripción de tu feature"
```

3. Push y crear PR
```bash
git push origin feature/tu-feature
```

4. GitHub Actions ejecuta tests automáticamente
5. Si pasa, deploy automático a staging
6. Probar en staging
7. Crear PR de `develop` a `main`
8. Deploy automático a production

**Convenciones de commits:**
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `refactor:` Refactorización
- `test:` Agregar o modificar tests
- `chore:` Cambios de configuración

---

## 🔧 Día 3: Desarrollo Práctico

### 3.1 Tarea 1: Agregar un nuevo componente

**Objetivo:** Crear un componente simple de botón

1. Crear archivo: `src/components/ui/button-premium.tsx`
```tsx
"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonPremiumProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export const ButtonPremium = forwardRef<HTMLButtonElement, ButtonPremiumProps>(
  ({ variant = "primary", className = "", ...props }, ref) => {
    const baseStyles = "px-6 py-3 rounded-xl font-black transition-all duration-200";
    const variants = {
      primary: "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:shadow-lg hover:shadow-yellow-500/50",
      secondary: "bg-zinc-800 text-white hover:bg-zinc-700",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);

ButtonPremium.displayName = "ButtonPremium";
```

2. Usar el componente en una página
```tsx
import { ButtonPremium } from "@/src/components/ui/button-premium";

export default function MiPagina() {
  return (
    <div>
      <ButtonPremium variant="primary">
        Click Me
      </ButtonPremium>
    </div>
  );
}
```

### 3.2 Tarea 2: Agregar un nuevo helper de Supabase

**Objetivo:** Crear una función para obtener listings populares

1. Abrir `lib/supabase-helpers.ts`
2. Agregar nueva función:
```typescript
export async function getPopularListings(limit = 10) {
  const { data, error } = await supabase
    .from("listings")
    .select("*, profiles(full_name, avatar_url)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data;
}
```

3. Usar en un componente:
```tsx
import { getPopularListings } from "@/lib/supabase-helpers";

export default function PopularListings() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    getPopularListings().then(setListings);
  }, []);

  return (
    <div>
      {listings.map(listing => (
        <div key={listing.id}>{listing.title}</div>
      ))}
    </div>
  );
}
```

### 3.3 Tarea 3: Agregar sanitización a un formulario

**Objetivo:** Sanitizar inputs de usuario

1. Importar funciones de sanitización:
```tsx
import { sanitizeText, sanitizeEmail } from "@/src/lib/sanitizer";
```

2. Usar en handler de formulario:
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const sanitizedData = {
    name: sanitizeName(formData.name),
    email: sanitizeEmail(formData.email),
    description: sanitizeLongText(formData.description),
  };
  
  // Enviar datos sanitizados
  await createListing(sanitizedData);
};
```

---

## 🛡️ Día 4: Seguridad y Best Practices

### 4.1 Seguridad

**Reglas de oro:**
1. **Nunca confíes en inputs del usuario** - Siempre sanitizar
2. **Usa RLS en Supabase** - Nunca bypass políticas
3. **Valida en frontend y backend** - Doble validación
4. **No expongas secrets** - Usar variables de entorno
5. **Usa HTTPS** - Nunca HTTP

**Sanitización:**
```tsx
import { sanitizeText, detectMaliciousContent } from "@/src/lib/sanitizer";

// Sanitizar texto
const safeText = sanitizeText(userInput);

// Detectar contenido malicioso
if (detectMaliciousContent(userInput)) {
  logger.warn('Malicious content detected', { input: userInput });
  return;
}
```

**Logging:**
```tsx
import { logger, securityLogger } from "@/src/lib/logger";

// Log normal
logger.info('User action', { action: 'click' }, userId);

// Log de seguridad
securityLogger.suspiciousActivity(userId, 'Multiple failed logins');
```

### 4.2 Best Practices

**TypeScript:**
- Siempre usar tipos estrictos
- Evitar `any` - usar `unknown` si es necesario
- Usar interfaces para objetos complejos

**React:**
- Usar Server Components cuando sea posible
- Minimizar Client Components
- Usar `useCallback` y `useMemo` para optimización

**Performance:**
- Lazy loading de componentes
- Optimización de imágenes
- Code splitting
- Caching de datos

**Code Quality:**
- Seguir convenciones de ESLint
- Usar Prettier para formato
- Escribir código legible
- Agregar comentarios cuando sea necesario

---

## 🧪 Día 5: Testing y Debugging

### 5.1 Debugging

**Herramientas:**
- **Vercel Logs:** Logs de producción
- **Supabase Logs:** Logs de base de datos
- **Browser DevTools:** Debugging de frontend
- **VS Code Debugger:** Debugging local

**Common issues:**

**Error: "RLS policy violation"**
- Verificar que el usuario esté autenticado
- Revisar políticas RLS en Supabase
- Verificar que el user_id sea correcto

**Error: "Rate limit exceeded"**
- Esperar 1 minuto
- Verificar límites en `src/lib/rate-limiter.ts`
- Usar diferente IP si es desarrollo

**Error: "Supabase connection failed"**
- Verificar variables de entorno
- Verificar que el proyecto de Supabase esté activo
- Revisar logs de Supabase

### 5.2 Testing (Futuro)

Cuando se implemente Vitest:
```typescript
// Ejemplo de test
import { describe, it, expect } from 'vitest';
import { sanitizeText } from '@/src/lib/sanitizer';

describe('sanitizeText', () => {
  it('should escape HTML', () => {
    expect(sanitizeText('<script>alert("xss")</script>'))
      .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  it('should limit length', () => {
    const longText = 'a'.repeat(20000);
    expect(sanitizeText(longText).length).toBe(10000);
  });
});
```

---

## 📖 Recursos Adicionales

### Documentación Interna
- `docs/ARCHITECTURE.md` - Arquitectura del sistema
- `docs/RUNBOOKS.md` - Runbooks de operación
- `docs/GUIA-CONFIGURACION-STAGING.md` - Configuración de staging
- `INSTRUCCIONES-SUPABASE.md` - Configuración de Supabase
- `PLAN-ACCION-EMPRESARIAL.md` - Plan de acción empresarial

### Documentación Externa
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- React: https://react.dev
- Tailwind CSS: https://tailwindcss.com/docs
- TypeScript: https://www.typescriptlang.org/docs

### Herramientas
- Vercel: https://vercel.com/docs
- GitHub Actions: https://docs.github.com/actions
- Gemini API: https://ai.google.dev/docs

---

## 🤝 Comunicación

**Canales de comunicación:**
- **GitHub Issues:** Para bugs y features
- **GitHub PRs:** Para code review
- **Email:** gstalin110@gmail.com (solo para emergencias)

**Code Review:**
- Revisar PRs de otros desarrolladores
- Dar feedback constructivo
- Aprender del código de otros
- Seguir convenciones del proyecto

---

## ✅ Checklist de Onboarding

**Semana 1:**
- [ ] Entorno configurado
- [ ] Repositorio clonado
- [ ] Dependencias instaladas
- [ ] Servidor de desarrollo funcionando
- [ ] Documentación leída
- [ ] Primer commit realizado

**Semana 2:**
- [ ] Primer componente creado
- [ ] Primer helper de Supabase creado
- [ ] Sanitización implementada
- [ ] Logging implementado
- [ ] PR creado y mergeado

**Semana 3:**
- [ ] Feature completa implementada
- [ ] Tests escritos (cuando estén disponibles)
- [ ] Code review de otros
- [ ] Runbooks leídos
- [ ] Seguridad entendida

---

## 🎯 Metas de Aprendizaje

**Primer mes:**
- Entender arquitectura completa
- Ser productivo con el stack
- Seguir best practices
- Contribuir a features

**Primeros 3 meses:**
- Dominar el stack
- Implementar features complejas
- Mejorar performance
- Contribuir a arquitectura

**Primeros 6 meses:**
- Ser senior en el stack
- Mentorar nuevos desarrolladores
- Liderar features
- Contribuir a roadmap

---

## 📞 Soporte

**Para preguntas:**
- Revisar documentación primero
- Buscar en GitHub Issues
- Preguntar en PRs
- Email solo para emergencias

**Para emergencias:**
- gstalin110@gmail.com
- Incluir contexto completo
- Ser específico sobre el problema

---

**Última actualización:** Julio 2026
**Versión:** 1.0
**Mantenedor:** Equipo de Desarrollo IÓN MAX
