# 🌍 Guía de Configuración - Ambiente de Staging

## 🎯 Objetivo
Crear un ambiente de pruebas separado (staging) para IÓN MAX antes de deployar a producción.

---

## 📋 Requisitos Previos

- Cuenta en Vercel
- Proyecto de IÓN MAX ya creado en Vercel
- Acceso a Supabase
- Cuenta en GitHub

---

## 🚀 Paso 1: Crear Proyecto de Staging en Vercel

### 1.1 Clonar el Proyecto Existente

1. Ve a tu dashboard de Vercel: https://vercel.com/dashboard
2. Entra a tu proyecto IÓN MAX
3. Haz clic en "Settings" → "General"
4. Haz clic en "Duplicate Project"
5. Nombra el proyecto: `ion-max-staging`
6. Haz clic en "Duplicate"

### 1.2 Configurar Dominio de Staging

1. En el proyecto `ion-max-staging`, ve a "Settings" → "Domains"
2. Agrega dominio: `staging.ion-max.app`
3. (Opcional) Configura DNS si usas dominio personal

---

## 🗄️ Paso 2: Crear Base de Datos de Staging en Supabase

### 2.1 Crear Nuevo Proyecto en Supabase

1. Ve a https://supabase.com/dashboard
2. Haz clic en "New Project"
3. Configura:
   - **Name:** `ion-max-staging`
   - **Database Password:** (genera una segura)
   - **Region:** South America (São Paulo) - para Ecuador
   - **Pricing Plan:** Free (o Pro si prefieres)
4. Haz clic en "Create new project"

### 2.2 Ejecutar Scripts SQL en Staging

1. En el proyecto `ion-max-staging`, ve a "SQL Editor"
2. Ejecuta en orden:
   - `supabase-fix-tables.sql`
   - `supabase-payments-invoicing.sql`
   - `supabase-tickets.sql`
3. Verifica que no haya errores

### 2.3 Crear Bucket de Storage

1. Ve a "Storage" en el proyecto staging
2. Crea bucket llamado `invoices` (privado)
3. Configura políticas RLS para lectura/escritura

---

## 🔧 Paso 3: Configurar Variables de Entorno en Vercel Staging

### 3.1 Obtener Credenciales de Supabase Staging

1. En el proyecto `ion-max-staging` de Supabase:
   - Ve a "Settings" → "API"
   - Copia:
     - **Project URL**
     - **anon public key**
     - **service_role secret**

### 3.2 Configurar Variables en Vercel Staging

1. En el proyecto `ion-max-staging` de Vercel:
   - Ve a "Settings" → "Environment Variables"
   - Agrega las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[tu-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[tu-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[tu-service-role-key]
GEMINI_API_KEY=[tu-gemini-api-key]
NEXT_PUBLIC_OWNER_EMAIL=gstalin110@gmail.com
```

2. Marca todas las variables como:
   - **Environment:** Production, Preview, Development

---

## 🔄 Paso 4: Configurar GitHub Actions para Staging

### 4.1 Agregar Secrets en GitHub

1. Ve a tu repositorio en GitHub
2. Ve a "Settings" → "Secrets and variables" → "Actions"
3. Agrega los siguientes secrets:

```
VERCEL_TOKEN=[tu-vercel-token]
VERCEL_ORG_ID=[tu-vercel-org-id]
VERCEL_PROJECT_ID=[tu-vercel-project-id-staging]
NEXT_PUBLIC_SUPABASE_URL=[tu-supabase-staging-url]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[tu-supabase-staging-anon-key]
```

### 4.2 Obtener Vercel Token y IDs

1. Ve a https://vercel.com/account/tokens
2. Crea nuevo token: `GitHub Actions`
3. Copia el token

4. En el proyecto `ion-max-staging` de Vercel:
   - Ve a "Settings" → "General"
   - Copia **Project ID**

5. En tu perfil de Vercel:
   - Ve a "Settings" → "General"
   - Copia **Organization ID**

---

## 🌿 Paso 5: Crear Branch de Develop

### 5.1 Crear Branch en GitHub

```bash
git checkout -b develop
git push origin develop
```

### 5.2 Proteger Branch de Main

1. Ve a tu repositorio en GitHub
2. Ve a "Settings" → "Branches"
3. Agrega regla para `main`:
   - Require status checks to pass before merging
   - Require branches to be up to date before merging
   - Require pull request before merging

---

## 🚀 Paso 6: Verificar Deploy Automático

### 6.1 Test de Deploy a Staging

1. Crea un cambio pequeño en el branch `develop`
2. Haz commit y push:
```bash
git checkout develop
# Haz un cambio pequeño
git add .
git commit -m "test: deploy a staging"
git push origin develop
```

3. Ve a GitHub → Actions
4. Verifica que el workflow se ejecute
5. Verifica que deploy a staging funcione

### 6.2 Test de Deploy a Production

1. Crea un PR de `develop` a `main`
2. Haz merge del PR
3. Verifica que deploy a production funcione

---

## ✅ Verificación

### Checklist de Staging

- [ ] Proyecto `ion-max-staging` creado en Vercel
- [ ] Dominio `staging.ion-max.app` configurado
- [ ] Proyecto `ion-max-staging` creado en Supabase
- [ ] Scripts SQL ejecutados en staging
- [ ] Bucket `invoices` creado en staging
- [ ] Variables de entorno configuradas en Vercel staging
- [ ] Secrets configurados en GitHub Actions
- [ ] Branch `develop` creado
- [ ] Deploy automático a staging funciona
- [ ] Deploy automático a production funciona

---

## 🎯 Flujo de Trabajo

### Desarrollo Normal

1. Crear feature branch desde `develop`
```bash
git checkout develop
git checkout -b feature/nueva-funcionalidad
```

2. Hacer cambios y commit
```bash
git add .
git commit -m "feat: nueva funcionalidad"
```

3. Push y crear PR a `develop`
```bash
git push origin feature/nueva-funcionalidad
```

4. GitHub Actions ejecuta tests
5. Si pasa, deploy automático a staging
6. Probar en `staging.ion-max.app`
7. Si está bien, crear PR de `develop` a `main`
8. Deploy automático a production

---

## 📞 Troubleshooting

### Error: "VERCEL_TOKEN not found"

**Solución:**
- Verifica que el secret esté configurado en GitHub
- Verifica que el nombre sea exactamente `VERCEL_TOKEN`

### Error: "Supabase connection failed"

**Solución:**
- Verifica que las variables de entorno sean correctas
- Verifica que el proyecto de Supabase esté activo
- Verifica que las políticas RLS permitan acceso

### Error: "Build failed"

**Solución:**
- Revisa los logs en GitHub Actions
- Verifica que las dependencias estén instaladas
- Verifica que no haya errores de TypeScript

---

## 🎉 ¡Listo!

Tu ambiente de staging está configurado. Ahora puedes:

- Desarrollar en feature branches
- Deploy automático a staging desde `develop`
- Probar cambios en `staging.ion-max.app`
- Deploy a production desde `main` después de pruebas

**Última actualización:** Julio 2026
