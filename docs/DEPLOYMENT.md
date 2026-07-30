# 🚀 Guía de Deployment Profesional - IÓN MAX

## 📋 Prerrequisitos

### Cuentas y Servicios
- [x] Cuenta en Vercel (https://vercel.com)
- [x] Cuenta en Supabase (https://supabase.com)
- [x] Cuenta en GitHub (https://github.com)
- [x] Cuenta en Sentry (https://sentry.io) - opcional para error tracking

### Herramientas Locales
- Node.js 20+
- Git
- NPM o Yarn

---

## 🔐 Variables de Entorno

### Variables de Entorno Requeridas

#### Supabase
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Sentry (Opcional)
```env
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_RELEASE=ion-max@version
```

#### Vercel (Automático)
```env
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

### Configuración en Vercel

1. **Entra a tu proyecto en Vercel**
2. **Ve a Settings > Environment Variables**
3. **Agrega las variables:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (solo en producción)
   - `NEXT_PUBLIC_SENTRY_DSN` (opcional)

---

## 🌍 Ambientes de Deployment

### Producción (Main Branch)
- **URL:** https://ion-max.vercel.app
- **Base de datos:** Supabase Production
- **Branch:** `main`
- **Trigger:** Push a `main`

### Staging (Develop Branch) - Planeado
- **URL:** https://staging.ion-max.app
- **Base de datos:** Supabase Staging
- **Branch:** `develop`
- **Trigger:** Push a `develop`

### Preview Deployments
- **URL:** https://ion-*.vercel.app
- **Base de datos:** Supabase Production
- **Branch:** Cualquier PR
- **Trigger:** Pull Request

---

## 🔄 Pipeline de CI/CD

### GitHub Actions Workflow

El pipeline `.github/workflows/ci.yml` ejecuta:

1. **Lint** - ESLint
2. **Type Check** - TypeScript
3. **Build** - Next.js build
4. **Test** - npm test
5. **Deploy** - Vercel (automático)

### Ejecución Manual

```bash
# Trigger manual desde GitHub
# Actions > CI/CD Pipeline > Run workflow
```

---

## 📦 Proceso de Deployment

### 1. Desarrollo Local

```bash
# Clonar repositorio
git clone https://github.com/gstalin110-ai/ion-max.git
cd ion-max

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Iniciar desarrollo
npm run dev
```

### 2. Commit y Push

```bash
# Crear branch para feature
git checkout -b feature/nueva-funcionalidad

# Hacer cambios
git add .
git commit -m "feat: descripción del cambio"

# Push a GitHub
git push origin feature/nueva-funcionalidad
```

### 3. Pull Request

1. **Crear PR en GitHub**
2. **Vercel crea deployment automático**
3. **Revisar deployment de preview**
4. **Merge a main** (si está aprobado)

### 4. Deployment a Producción

```bash
# Merge a main
git checkout main
git merge feature/nueva-funcionalidad

# Push a main
git push origin main

# Vercel despliega automáticamente
```

---

## 🚨 Rollback en Caso de Error

### Opción 1: Desde Vercel Dashboard

1. **Entra a Deployments en Vercel**
2. **Encuentra el deployment anterior exitoso**
3. **Click en "..." > "Redeploy"**
4. **Selecciona "Redeploy this deployment"**

### Opción 2: Desde Git

```bash
# Revertir commit
git revert <commit-hash>

# Push
git push origin main
```

### Opción 3: Promote Preview Deployment

1. **Entra al deployment de preview**
2. **Click en "Promote to Production"**

---

## 🔍 Verificación Post-Deployment

### Checklist

- [ ] Deployment está en estado "READY"
- [ ] URL principal carga correctamente
- [ ] Login funciona
- [ ] Marketplace funciona
- [ ] Comunidad funciona
- [ ] Wallet funciona
- [ ] No hay errores en consola
- [ ] Sentry no muestra errores críticos
- [ ] Vercel Analytics muestra tráfico

### Tests Manuales

```bash
# Test de login
# 1. Ir a /login
# 2. Ingresar credenciales
# 3. Verificar redirección

# Test de marketplace
# 1. Ir a /marketplace
# 2. Verificar listings cargan
# 3. Crear listing de prueba

# Test de comunidad
# 1. Ir a /community
# 2. Verificar posts cargan
# 3. Crear post de prueba
```

---

## 📊 Monitoreo

### Vercel Analytics

- **URL:** https://vercel.com/analytics
- **Métricas:**
  - Page views
  - Unique visitors
  - Web Vitals (LCP, FID, CLS)
  - Geolocalización

### Vercel Logs

- **URL:** https://vercel.com/logs
- **Tipos:**
  - Runtime logs
  - Build logs
  - Function logs

### Sentry Error Tracking

- **URL:** https://sentry.io
- **Métricas:**
  - Error rate
  - Performance
  - User sessions
  - Release tracking

### Supabase Dashboard

- **URL:** https://supabase.com/dashboard
- **Métricas:**
  - Database usage
  - Storage usage
  - API calls
  - Real-time connections

---

## 🆘 Troubleshooting

### Build Fails

**Causa:** Error de TypeScript o dependencias

**Solución:**
```bash
# Limpiar cache
rm -rf .next node_modules
npm install

# Verificar tipos
npx tsc --noEmit

# Reintentar build
npm run build
```

### Deployment Fails

**Causa:** Variables de entorno faltantes

**Solución:**
1. Verificar variables en Vercel Settings
2. Asegurar que todas las variables estén configuradas
3. Reintentar deployment

### Runtime Errors

**Causa:** Error en código o configuración

**Solución:**
1. Verificar logs en Vercel
2. Verificar errores en Sentry
3. Revisar Supabase RLS policies
4. Hacer rollback si es necesario

### Rate Limiting Issues

**Causa:** Límites excedidos

**Solución:**
1. Verificar middleware rate limiting
2. Ajustar límites si es necesario
3. Implementar caching para reducir llamadas

---

## 🔒 Seguridad en Deployment

### Best Practices

1. **Nunca commitear secrets**
   - Usar `.env.local` para desarrollo
   - Configurar variables en Vercel
   - Usar Supabase Service Role Key solo en server

2. **Usar HTTPS siempre**
   - Vercel proporciona HTTPS automático
   - HSTS configurado en middleware

3. **Validar inputs**
   - Zod para validación de forms
   - Sanitizar datos de usuario
   - Implementar RLS en Supabase

4. **Monitorear accesos**
   - Revisar logs regularmente
   - Configurar alertas en Sentry
   - Monitorear patrones sospechosos

---

## 📈 Escalado

### Cuándo Escalar

- **CPU > 80%** por tiempo prolongado
- **Memory > 80%** por tiempo prolongado
- **Response time > 2s** consistentemente
- **Error rate > 1%** sostenido

### Estrategias de Escalado

1. **Optimizar queries de Supabase**
2. **Implementar caching con Redis**
3. **Usar CDN para assets**
4. **Escalar Vercel a Pro plan**
5. **Considerar arquitectura microservicios**

---

## 📝 Runbook de Operación

### Daily

- [ ] Revisar errores en Sentry
- [ ] Verificar métricas en Vercel Analytics
- [ ] Revisar logs de Supabase

### Weekly

- [ ] Revisar performance de aplicación
- [ ] Verificar uso de storage
- [ ] Actualizar dependencias si hay parches de seguridad

### Monthly

- [ ] Revisar y actualizar dependencias
- [ ] Revisar costos de infraestructura
- [ ] Planear mejoras de performance
- [ ] Documentar incidentes y soluciones

---

## 🚀 Deployment Automatizado con Script

### Script de Deployment (Opcional)

```bash
#!/bin/bash

# deploy.sh

echo "🚀 Iniciando deployment de IÓN MAX"

# Verificar branch
BRANCH=$(git branch --show-current)
echo "📌 Branch actual: $BRANCH"

# Ejecutar tests
echo "🧪 Ejecutando tests..."
npm test

# Ejecutar lint
echo "🔍 Ejecutando lint..."
npm run lint

# Ejecutar type check
echo "📝 Ejecutando type check..."
npx tsc --noEmit

# Build
echo "🔨 Building..."
npm run build

# Push
echo "📤 Pushing a GitHub..."
git push origin $BRANCH

echo "✅ Deployment iniciado. Verifica Vercel para progreso."
```

Uso:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📚 Recursos Adicionales

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Sentry Docs](https://docs.sentry.io)
- [GitHub Actions](https://docs.github.com/actions)

---

## 🎯 Checklist de Deployment Completo

### Pre-Deployment
- [ ] Código review completado
- [ ] Tests pasan
- [ ] Lint pasa
- [ ] Type check pasa
- [ ] Variables de entorno configuradas
- [ ] Database migrations ejecutadas
- [ ] Backup de base de datos creado

### During Deployment
- [ ] Monitoring activo
- [ ] Logs revisados
- [ ] Métricas verificadas
- [ ] Rollback plan preparado

### Post-Deployment
- [ ] Funcionalidad verificada
- [ ] Performance verificada
- [ ] Seguridad verificada
- [ ] Documentación actualizada
- [ ] Equipo notificado
