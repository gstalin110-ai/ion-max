# 📚 Runbooks de Operación - IÓN MAX

## 🎯 Objetivo
Guías paso a paso para operar y mantener IÓN MAX en producción.

---

## 🚨 Incident Management

### Runbook: Error 500 en API

**Severidad:** Alta
**Tiempo de respuesta objetivo:** < 15 minutos
**Tiempo de resolución objetivo:** < 1 hora

#### Pasos:

1. **Identificar el error**
   - Ir a Vercel Logs
   - Filtrar por status code 500
   - Identificar endpoint afectado

2. **Verificar logs de aplicación**
   - Revisar logger.error entries
   - Buscar patrones recurrentes
   - Identificar usuarios afectados

3. **Verificar dependencias externas**
   - Supabase status: https://status.supabase.com
   - Vercel status: https://status.vercel.com
   - Gemini API status

4. **Solución rápida (si es posible)**
   - Si es error de Supabase: Verificar políticas RLS
   - Si es error de IA: Verificar API key
   - Si es error de rate limit: Aumentar límites temporalmente

5. **Comunicación**
   - Notificar a usuarios afectados
   - Actualizar status page (si existe)
   - Documentar incidente

6. **Post-mortem**
   - Crear ticket en GitHub
   - Documentar causa raíz
   - Implementar prevención

---

### Runbook: Degradación de Performance

**Severidad:** Media
**Tiempo de respuesta objetivo:** < 30 minutos
**Tiempo de resolución objetivo:** < 2 horas

#### Pasos:

1. **Monitorear métricas**
   - Vercel Analytics
   - Supabase Database metrics
   - Tiempo de respuesta de APIs

2. **Identificar cuello de botella**
   - ¿Es frontend? (Next.js build, bundle size)
   - ¿Es backend? (Supabase queries, API calls)
   - ¿Es red? (CDN, DNS)

3. **Soluciones comunes**
   - **Frontend:** Optimizar imágenes, lazy loading, code splitting
   - **Backend:** Agregar índices en BD, optimizar queries, caching
   - **Red:** Verificar CDN, configurar cache headers

4. **Implementar hotfix**
   - Deploy de optimización
   - Monitorear mejora
   - Revertir si empeora

---

### Runbook: Base de Datos Lenta

**Severidad:** Alta
**Tiempo de respuesta objetivo:** < 15 minutos
**Tiempo de resolución objetivo:** < 1 hora

#### Pasos:

1. **Identificar query lento**
   - Supabase Database logs
   - pg_stat_statements
   - Identificar query más lento

2. **Analizar query**
   - ¿Usa índices?
   - ¿Hace full table scan?
   - ¿Retorna demasiados datos?

3. **Optimizar**
   - Agregar índices faltantes
   - Reescribir query
   - Limitar resultados con pagination
   - Usar select específico (no select *)

4. **Verificar**
   - Ejecutar EXPLAIN ANALYZE
   - Comparar antes/después
   - Monitorear performance

---

## 🔐 Security Incidents

### Runbook: Ataque de Rate Limiting

**Severidad:** Alta
**Tiempo de respuesta objetivo:** < 5 minutos
**Tiempo de resolución objetivo:** < 30 minutos

#### Pasos:

1. **Detectar ataque**
   - Logs de rate limiter
   - Spike en requests por IP
   - Múltiples fallos de autenticación

2. **Mitigación inmediata**
   - Bloquear IP ofensiva
   - Reducir límites temporalmente
   - Activar CAPTCHA (si existe)

3. **Investigación**
   - Identificar patrón del ataque
   - ¿Es bot? ¿Es humano?
   - ¿Qué endpoint está siendo atacado?

4. **Prevención**
   - Implementar CAPTCHA
   - Mejorar rate limiting
   - Agregar fingerprinting

---

### Runbook: Intento de Inyección SQL

**Severidad:** Crítica
**Tiempo de respuesta objetivo:** < 1 minuto
**Tiempo de resolución objetivo:** < 15 minutos

#### Pasos:

1. **Detectar intento**
   - Logs de sanitización
   - Patterns SQL en inputs
   - Errores de BD inusuales

2. **Bloquear inmediatamente**
   - Bloquear IP del atacante
   - Bloquear usuario (si está autenticado)
   - Notificar a security team

3. **Verificar impacto**
   - ¿Se ejecutó el ataque?
   - ¿Se exfiltraron datos?
   - ¿Se modificaron datos?

4. **Remediación**
   - Revertir cambios si es necesario
   - Rotar credenciales de BD
   - Forzar reset de passwords
   - Notificar a usuarios afectados

5. **Post-mortem**
   - Auditoría de seguridad
   - Mejorar sanitización
   - Implementar WAF

---

## 🔄 Deployment

### Runbook: Deploy Fallido

**Severidad:** Alta
**Tiempo de respuesta objetivo:** < 10 minutos
**Tiempo de resolución objetivo:** < 30 minutos

#### Pasos:

1. **Identificar causa**
   - Vercel build logs
   - ¿Es error de build?
   - ¿Es error de runtime?
   - ¿Es error de configuración?

2. **Soluciones comunes**
   - **Build error:** Revisar dependencias, limpiar cache
   - **Runtime error:** Revisar variables de entorno, verificar BD
   - **Config error:** Verificar .env, secrets

3. **Rollback**
   - Vercel tiene rollback automático
   - O usar git revert
   - Deploy versión anterior

4. **Verificar**
   - Testear funcionalidades críticas
   - Monitorear logs
   - Verificar métricas

---

### Runbook: Database Migration Fallida

**Severidad:** Crítica
**Tiempo de respuesta objetivo:** < 5 minutos
**Tiempo de resolución objetivo:** < 15 minutos

#### Pasos:

1. **Detener inmediatamente**
   - No ejecutar más migraciones
   - No hacer deploy
   - Bloquear acceso a aplicación si es necesario

2. **Evaluar estado**
   - ¿Qué tablas se afectaron?
   - ¿Hay datos corruptos?
   - ¿Se puede revertir?

3. **Restaurar**
   - Restaurar backup de BD
   - Revertir cambios manuales
   - Verificar integridad de datos

4. **Prevenir**
   - Hacer backup antes de migración
   - Testear migración en staging
   - Usar migraciones reversibles

---

## 💾 Data Management

### Runbook: Pérdida de Datos

**Severidad:** Crítica
**Tiempo de respuesta objetivo:** < 1 minuto
**Tiempo de resolución objetivo:** < 1 hora

#### Pasos:

1. **Identificar alcance**
   - ¿Qué datos se perdieron?
   - ¿Cuántos usuarios afectados?
   - ¿Cuándo ocurrió?

2. **Restaurar desde backup**
   - Supabase tiene point-in-time recovery
   - Restaurar al momento antes de la pérdida
   - Verificar integridad

3. **Comunicación**
   - Notificar a usuarios afectados
   - Ser transparente sobre el incidente
   - Ofrecer compensación si es necesario

4. **Prevención**
   - Mejorar backups
   - Implementar soft deletes
   - Agregar confirmación antes de eliminar

---

### Runbook: Data Corruption

**Severidad:** Alta
**Tiempo de respuesta objetivo:** < 15 minutos
**Tiempo de resolución objetivo:** < 2 horas

#### Pasos:

1. **Detectar corrupción**
   - Validaciones de integridad
   - Reportes de usuarios
   - Anomalías en datos

2. **Identificar causa**
   - ¿Es bug de aplicación?
   - ¿Es error de migración?
   - ¿Es ataque malicioso?

3. **Restaurar**
   - Restaurar backup
   - Corregir datos manualmente
   - Verificar consistencia

4. **Prevenir**
   - Mejorar validaciones
   - Agregar constraints en BD
   - Implementar auditoría de cambios

---

## 🤖 AI Services

### Runbook: AI API No Responde

**Severidad:** Media
**Tiempo de respuesta objetivo:** < 15 minutos
**Tiempo de resolución objetivo:** < 1 hora

#### Pasos:

1. **Verificar estado**
   - Gemini API status
   - API key válida
   - Límites de cuota

2. **Soluciones**
   - Si API key inválida: Rotar key
   - Si cuota excedida: Upgrade plan o implementar cola
   - Si API down: Usar fallback o mostrar mensaje

3. **Monitorear**
   - Logs de aiLogger
   - Tiempo de respuesta
   - Tasa de errores

---

## 📊 Monitoring

### Runbook: Métricas Anormales

**Severidad:** Media
**Tiempo de respuesta objetivo:** < 30 minutos
**Tiempo de resolución objetivo:** < 2 horas

#### Pasos:

1. **Identificar anomalía**
   - ¿Spike en tráfico?
   - ¿Caída en conversiones?
   - ¿Aumento en errores?

2. **Investigar**
   - Correlacionar con eventos
   - ¿Deploy reciente?
   - ¿Campaña de marketing?
   - ¿Cambio en API externa?

3. **Actuar**
   - Si es positivo: Escalar infraestructura
   - Si es negativo: Investigar y corregir
   - Si es desconocido: Monitorear y documentar

---

## 🎯 Maintenance

### Runbook: Mantenimiento Programado

**Severidad:** Baja
**Tiempo de respuesta objetivo:** N/A
**Tiempo de resolución objetivo:** Programado

#### Pasos:

1. **Planificar**
   - Elegir momento de bajo tráfico
   - Notificar a usuarios con anticipación
   - Preparar rollback plan

2. **Ejecutar**
   - Hacer backup
   - Aplicar cambios
   - Verificar funcionalidad

3. **Post-mantenimiento**
   - Monitorear performance
   - Verificar logs
   - Documentar cambios

---

## 📞 Escalation

### Matriz de Escalation

| Severidad | Tiempo de Respuesta | Escalar A |
|-----------|---------------------|-----------|
| Crítica | < 1 minuto | Dueño + Security Team |
| Alta | < 15 minutos | Dueño + Dev Team |
| Media | < 30 minutos | Dev Team |
| Baja | < 2 horas | Dev Team (próximo sprint) |

**Contactos:**
- Dueño: gstalin110@gmail.com
- Security Team: (pendiente de configurar)
- Dev Team: (pendiente de configurar)

---

## 📝 Incident Template

```markdown
## Incident #[NUMBER]

**Fecha:** [YYYY-MM-DD HH:MM]
**Severidad:** [Crítica/Alta/Media/Baja]
**Estado:** [Detectado/Investigando/Mitigado/Resuelto]

### Descripción
[Brief description del incidente]

### Impacto
- Usuarios afectados: [X]
- Funcionalidades afectadas: [lista]
- Duración: [X horas]

### Timeline
- [HH:MM] Incidente detectado
- [HH:MM] Investigación iniciada
- [HH:MM] Mitigación aplicada
- [HH:MM] Resolución completada

### Causa Raíz
[Análisis de causa raíz]

### Acciones Tomadas
- [Acción 1]
- [Acción 2]

### Prevención
- [Acción de prevención 1]
- [Acción de prevención 2]

### Lecciones Aprendidas
[Lecciones aprendidas]
```

---

**Última actualización:** Julio 2026
**Versión:** 1.0
