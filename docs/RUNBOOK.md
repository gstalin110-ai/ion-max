# 📋 Runbook de Operación - IÓN MAX

## 🚨 Incidentes Críticos

### 1. Aplicación No Responde

**Síntomas:**
- Timeout en todas las páginas
- Error 502/503
- Vercel muestra deployment error

**Pasos de Resolución:**

1. **Verificar Status de Vercel**
   - Entra a https://vercel.com/status
   - Verificar si hay incidentes reportados

2. **Verificar Deployment**
   - Entra a Deployments en Vercel
   - Verificar estado del último deployment
   - Si está en ERROR, hacer rollback

3. **Verificar Logs**
   - Entra a Vercel Logs
   - Filtrar por errores
   - Identificar causa raíz

4. **Rollback si es necesario**
   - Selecciona deployment anterior exitoso
   - Click en "Redeploy"
   - Verificar que la aplicación funcione

**Tiempo estimado:** 5-15 minutos

---

### 2. Base de Datos No Responde

**Síntomas:**
- Errores de conexión a Supabase
- Timeout en queries
- Datos no cargan

**Pasos de Resolución:**

1. **Verificar Status de Supabase**
   - Entra a https://status.supabase.com
   - Verificar si hay incidentes

2. **Verificar Dashboard de Supabase**
   - Entra a tu proyecto en Supabase
   - Verificar Database usage
   - Verificar si hay locks o queries lentas

3. **Reiniciar Base de Datos**
   - Settings > Database > Restart database
   - Esperar 2-3 minutos
   - Verificar que la aplicación funcione

4. **Verificar RLS Policies**
   - Si hay errores de permisos
   - Revisar políticas RLS
   - Ajustar si es necesario

**Tiempo estimado:** 10-20 minutos

---

### 3. Error de Autenticación

**Síntomas:**
- Usuarios no pueden hacer login
- Session expira inmediatamente
- Error 401 en APIs

**Pasos de Resolución:**

1. **Verificar Variables de Entorno**
   - Vercel Settings > Environment Variables
   - Verificar `NEXT_PUBLIC_SUPABASE_URL`
   - Verificar `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **Verificar Supabase Auth**
   - Supabase Dashboard > Authentication
   - Verificar Email provider está activo
   - Verificar Site URL y Redirect URLs

3. **Verificar Cookies**
   - Middleware verifica session
   - Verificar que cookies HTTP-only funcionen
   - Verificar dominio de cookies

4. **Test Manual**
   - Intentar login con cuenta de prueba
   - Verificar flow completo
   - Revisar logs de Supabase Auth

**Tiempo estimado:** 10-15 minutos

---

### 4. Alto Uso de CPU/Memory

**Síntomas:**
- Vercel muestra alto uso de recursos
- Response time > 2s
- Timeouts en funciones

**Pasos de Resolución:**

1. **Verificar Métricas en Vercel**
   - Entra a Analytics
   - Verificar Web Vitals
   - Identificar páginas lentas

2. **Optimizar Queries**
   - Identificar queries lentas en Supabase
   - Agregar índices si es necesario
   - Optimizar joins y selects

3. **Implementar Caching**
   - Usar Redis para datos frecuentes
   - Cachear responses de API
   - Implementar cache en cliente

4. **Escalar si es necesario**
   - Considerar Vercel Pro plan
   - Aumentar timeouts de funciones
   - Optimizar bundle size

**Tiempo estimado:** 30-60 minutos

---

### 5. Error de Pago (PayPal)

**Síntomas:**
- Pagos fallan
- Webhook no recibe confirmación
- Transacciones no se registran

**Pasos de Resolución:**

1. **Verificar PayPal Dashboard**
   - Entra a PayPal Developer
   - Verificar Webhook URL
   - Verificar que webhooks estén activos

2. **Verificar Variables de Entorno**
   - `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`
   - Verificar que sean correctas

3. **Test Webhook Manual**
   - Usar PayPal Webhook Simulator
   - Enviar test webhook
   - Verificar que tu API lo reciba

4. **Verificar Logs de Transacciones**
   - Revisar tabla `wallet_transactions`
   - Verificar transacciones pendientes
   - Reconciliar manualmente si es necesario

**Tiempo estimado:** 20-30 minutos

---

## 🔥 Alertas y Monitoreo

### Alertas Configuradas

#### Sentry
- **Error rate > 1%** - Alerta inmediata
- **Nuevo error crítico** - Alerta inmediata
- **Performance degradation** - Alerta en 5 minutos

#### Vercel
- **Deployment fallido** - Alerta inmediata
- **Error rate > 5%** - Alerta en 10 minutos
- **Response time > 3s** - Alerta en 15 minutos

#### Supabase
- **Database CPU > 80%** - Alerta en 5 minutos
- **Storage > 90%** - Alerta en 15 minutos
- **API rate limit** - Alerta inmediata

### Procedimiento de Alerta

1. **Recibir alerta**
   - Revisar detalles en plataforma correspondiente
   - Evaluar severidad

2. **Clasificar severidad**
   - **P1:** Crítico - Aplicación no funciona
   - **P2:** Alto - Funcionalidad degradada
   - **P3:** Medio - Performance afectada
   - **P4:** Bajo - Mejora necesaria

3. **Responder según severidad**
   - **P1:** Resolución inmediata (< 15 min)
   - **P2:** Resolución rápida (< 1 hora)
   - **P3:** Resolución en día laboral
   - **P4:** Planificar en sprint

---

## 📊 Mantenimiento Rutinario

### Daily (Diario)

**Tiempo:** 5 minutos

- [ ] Revisar alertas de Sentry
- [ ] Verificar errores críticos en Vercel
- [ ] Revisar métricas básicas de Supabase
- [ ] Verificar que deployments recientes estén OK

### Weekly (Semanal)

**Tiempo:** 30 minutos

- [ ] Revisar performance de aplicación
  - Web Vitals en Vercel Analytics
  - Response time promedio
  - Error rate
- [ ] Revisar uso de recursos
  - CPU/Memory en Vercel
  - Database usage en Supabase
  - Storage usage en Supabase
- [ ] Revisar seguridad
  - Logs de acceso sospechoso
  - Errores de autenticación
  - Rate limiting violations
- [ ] Actualizar dependencias
  - Verificar actualizaciones de seguridad
  - Revisar changelog de dependencias principales

### Monthly (Mensual)

**Tiempo:** 2 horas

- [ ] Revisión completa de dependencias
  - `npm outdated`
  - Actualizar parches de seguridad
  - Test actualizaciones en staging
- [ ] Revisión de costos
  - Costos de Vercel
  - Costos de Supabase
  - Costos de Sentry (si aplica)
- [ ] Revisión de backups
  - Verificar que backups automáticos funcionen
  - Test restore de backup
  - Documentar procedimiento de restore
- [ ] Revisión de documentación
  - Actualizar runbooks si es necesario
  - Documentar nuevos incidentes
  - Actualizar guías de deployment
- [ ] Planificación de mejoras
  - Identificar cuellos de botella
  - Planear optimizaciones
  - Priorizar features técnicos

---

## 🔄 Procedimientos de Mantenimiento

### Actualización de Dependencias

**Frecuencia:** Mensual

**Pasos:**

1. **Verificar dependencias desactualizadas**
   ```bash
   npm outdated
   ```

2. **Actualizar dependencias**
   ```bash
   npm update
   # O para actualizaciones mayores
   npm install package@latest
   ```

3. **Test en local**
   ```bash
   npm run dev
   # Verificar que todo funcione
   ```

4. **Ejecutar tests**
   ```bash
   npm test
   npm run lint
   npx tsc --noEmit
   ```

5. **Build**
   ```bash
   npm run build
   ```

6. **Deploy a staging** (si existe)
   ```bash
   git checkout develop
   git push origin develop
   ```

7. **Verificar en staging**
   - Test funcionalidad completa
   - Verificar no hay regresiones

8. **Deploy a producción**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

**Tiempo estimado:** 1-2 horas

---

### Limpieza de Logs

**Frecuencia:** Semanal

**Pasos:**

1. **Vercel Logs**
   - Logs se retienen automáticamente por 7 días
   - Exportar logs importantes si es necesario

2. **Supabase Logs**
   - Entra a Database > Logs
   - Exportar logs importantes
   - Limpiar logs antiguos si es necesario

3. **Sentry Logs**
   - Logs se retienen según plan
   - Exportar reportes mensuales
   - Configurar retención según necesidades

**Tiempo estimado:** 15 minutos

---

### Optimización de Base de Datos

**Frecuencia:** Trimestral

**Pasos:**

1. **Analizar performance**
   - Supabase Dashboard > Database > Performance
   - Identificar queries lentos
   - Verificar uso de índices

2. **Optimizar queries**
   - Agregar índices faltantes
   - Optimizar joins
   - Revisar N+1 queries

3. **Vacuum y Analyze**
   ```sql
   VACUUM ANALYZE;
   ```

4. **Verificar tamaño de tablas**
   - Identificar tablas grandes
   - Considerar archivar datos antiguos
   - Implementar particionamiento si es necesario

**Tiempo estimado:** 2-3 horas

---

## 🚨 Escalation Matrix

### Nivel 1: Operaciones Básicas

**Responsable:** Desarrollador Senior

**Incidentes:**
- Deployment fallido
- Error de configuración
- Bug menor en producción

**Tiempo de respuesta:** < 1 hora
**Tiempo de resolución:** < 4 horas

---

### Nivel 2: Incidentes Moderados

**Responsable:** Tech Lead

**Incidentes:**
- Aplicación parcialmente down
- Error de autenticación
- Performance degradada
- Error de pago

**Tiempo de respuesta:** < 30 minutos
**Tiempo de resolución:** < 2 horas

---

### Nivel 3: Incidentes Críticos

**Responsable:** CTO / Founder

**Incidentes:**
- Aplicación completamente down
- Brecha de seguridad
- Pérdida de datos
- Error financiero crítico

**Tiempo de respuesta:** Inmediato
**Tiempo de resolución:** < 1 hora

---

## 📞 Comunicación de Incidentes

### Interno

1. **Notificar al equipo**
   - Slack/Discord channel #incidents
   - Incluir severidad y descripción
   - Asignar responsable

2. **Actualizaciones**
   - Cada 15 minutos para incidentes críticos
   - Cada 30 minutos para incidentes moderados
   - Cada hora para incidentes menores

3. **Post-incidente**
   - Documentar incidente
   - Análisis de causa raíz
   - Plan de prevención

### Externo (si afecta usuarios)

1. **Determinar si se requiere comunicación**
   - Solo para incidentes P1 y P2
   - Si afecta > 10% de usuarios
   - Si dura > 30 minutos

2. **Canales de comunicación**
   - Email a usuarios afectados
   - Banner en aplicación
   - Post en redes sociales (si aplica)

3. **Contenido**
   - Descripción del problema
   - Tiempo estimado de resolución
   - Medidas tomadas
   - Compensación si aplica

---

## 📈 Métricas KPI

### Disponibilidad
- **Objetivo:** 99.9% uptime
- **Métrica:** Uptime mensual
- **Alerta:** < 99.5%

### Performance
- **Objetivo:** < 2s response time
- **Métrica:** P95 response time
- **Alerta:** > 3s

### Error Rate
- **Objetivo:** < 0.1% error rate
- **Métrica:** Error rate mensual
- **Alerta:** > 1%

### Seguridad
- **Objetivo:** 0 incidentes de seguridad
- **Métrica:** Incidentes de seguridad
- **Alerta:** Cualquier incidente

---

## 🎯 Checklist de Operación

### Inicio de Turno
- [ ] Revisar alertas pendientes
- [ ] Verificar status de sistemas
- [ ] Revisar deployments recientes
- [ ] Verificar métricas clave

### Fin de Turno
- [ ] Documentar incidentes resueltos
- [ ] Actualizar runbooks si es necesario
- [ ] Pasar tareas pendientes
- [ ] Documentar observaciones

### Post-Incidente
- [ ] Documentar incidente completo
- [ ] Análisis de causa raíz
- [ ] Identificar mejoras necesarias
- [ ] Implementar mejoras
- [ ] Actualizar documentación
- [ ] Comunicar aprendizajes

---

## 📚 Referencias

- [Vercel Status](https://vercel.com/status)
- [Supabase Status](https://status.supabase.com)
- [Sentry Dashboard](https://sentry.io)
- [GitHub Actions](https://github.com/gstalin110-ai/ion-max/actions)
