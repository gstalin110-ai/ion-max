# 🔧 Guía de Troubleshooting Avanzada - IÓN MAX

## 🎯 Objetivo
Guía avanzada para diagnosticar y resolver problemas complejos en IÓN MAX.

---

## 🚨 Errores Críticos

### Error: "Database connection failed"

**Síntomas:**
- Error 500 en todas las APIs
- Timeout en consultas a Supabase
- Logs muestran "connection refused"

**Diagnóstico:**
1. Verificar estado de Supabase: https://status.supabase.com
2. Verificar variables de entorno:
   ```bash
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
3. Testear conexión manual:
   ```typescript
   const { data, error } = await supabase.from('profiles').select('id').limit(1);
   console.log('Connection test:', error || 'OK');
   ```

**Soluciones:**
- **Si Supabase está down:** Esperar resolución del servicio
- **Si variables incorrectas:** Corregir en Vercel
- **Si proyecto pausado:** Reactivar en Supabase dashboard
- **Si límite de conexiones:** Upgrade plan de Supabase

---

### Error: "RLS policy violation"

**Síntomas:**
- Error 403 al acceder a datos
- "Permission denied" en logs
- Usuario autenticado pero no puede acceder

**Diagnóstico:**
1. Verificar autenticación:
   ```typescript
   const { data: { user } } = await supabase.auth.getUser();
   console.log('User:', user);
   ```
2. Verificar políticas RLS en Supabase:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'tu_tabla';
   ```
3. Verificar user_id en datos:
   ```typescript
   console.log('User ID:', user?.id);
   console.log('Data user_id:', data?.user_id);
   ```

**Soluciones:**
- **Si usuario no autenticado:** Implementar login
- **Si política incorrecta:** Corregir política RLS
- **Si user_id mismatch:** Verificar que user_id sea correcto
- **Si necesitas bypass:** Usar service_role key (solo en server)

---

### Error: "Rate limit exceeded"

**Síntomas:**
- Error 429 en APIs
- "Too many requests" en logs
- Bloqueo temporal de IP

**Diagnóstico:**
1. Verificar rate limiter:
   ```typescript
   import { checkRateLimit } from '@/src/lib/rate-limiter';
   const result = checkRateLimit('test-ip', '/api/chat');
   console.log('Rate limit:', result);
   ```
2. Verificar logs de rate limiting:
   ```typescript
   import { securityLogger } from '@/src/lib/logger';
   // Buscar "Rate limit exceeded" en logs
   ```

**Soluciones:**
- **Si es legítimo:** Esperar 1 minuto o usar diferente IP
- **Si límite muy bajo:** Aumentar en `src/lib/rate-limiter.ts`
- **Si es ataque:** Bloquear IP ofensiva
- **Si necesitas más:** Implementar Redis para rate limiting distribuido

---

## 🔍 Errores de Frontend

### Error: "Hydration failed"

**Síntomas:**
- Error en consola del navegador
- "Text content does not match server-rendered HTML"
- UI glitchy

**Diagnóstico:**
1. Verificar uso de localStorage/sessionStorage:
   ```typescript
   // ❌ Mal - se ejecuta en server
   const value = localStorage.getItem('key');
   
   // ✅ Bien - solo en client
   useEffect(() => {
     const value = localStorage.getItem('key');
   }, []);
   ```
2. Verificar uso de Date/Random:
   ```typescript
   // ❌ Mal - diferente en server/client
   const now = new Date();
   
   // ✅ Bien - consistente
   const now = useCurrentDate();
   ```

**Soluciones:**
- Mover código que usa localStorage a useEffect
- Usar componentes Client para código interactivo
- Verificar que Date/Math sea consistente

---

### Error: "Module not found"

**Síntomas:**
- Build falla
- Error de importación
- "Cannot find module"

**Diagnóstico:**
1. Verificar ruta de importación:
   ```typescript
   // ❌ Mal - ruta incorrecta
   import { Component } from '@/components/component';
   
   // ✅ Bien - ruta correcta
   import { Component } from '@/src/components/component';
   ```
2. Verificar que el archivo exista:
   ```bash
   ls src/components/component.tsx
   ```
3. Verificar tsconfig.json paths

**Soluciones:**
- Corregir ruta de importación
- Verificar que el archivo exista
- Limpiar cache: `rm -rf .next`
- Reinstalar dependencias: `rm -rf node_modules && npm install`

---

### Error: "Too many re-renders"

**Síntomas:**
- Loop infinito de renders
- Browser se congela
- "Maximum update depth exceeded"

**Diagnóstico:**
1. Verificar useState/useEffect:
   ```typescript
   // ❌ Mal - loop infinito
   const [count, setCount] = useState(0);
   setCount(count + 1); // Se ejecuta en cada render
   
   // ✅ Bien - solo en evento
   const handleClick = () => setCount(count + 1);
   ```
2. Verificar dependencias de useEffect:
   ```typescript
   // ❌ Mal - loop si obj cambia
   useEffect(() => {
     doSomething(obj);
   }, [obj]);
   
   // ✅ Bien - solo si propiedad específica cambia
   useEffect(() => {
     doSomething(obj);
   }, [obj.id]);
   ```

**Soluciones:**
- Mover setState a evento o useEffect
- Usar useCallback/useMemo para estabilizar referencias
- Verificar dependencias de useEffect

---

## 🤖 Errores de IA

### Error: "Gemini API quota exceeded"

**Síntomas:**
- Error 429 en /api/chat
- "Quota exceeded" en logs
- IA no responde

**Diagnóstico:**
1. Verificar API key:
   ```typescript
   console.log('API Key exists:', !!apiKey);
   ```
2. Verificar cuota en Google AI Studio
3. Verificar logs de aiLogger

**Soluciones:**
- **Si cuota excedida:** Esperar reset diario o upgrade plan
- **Si API key inválida:** Rotar key
- **Si necesita más:** Implementar cola de requests
- **Si es usuario personal:** Pedir que configure su propia key

---

### Error: "AI response timeout"

**Síntomas:**
- Request a IA se cuelga
- Timeout después de 30s
- Error 504

**Diagnóstico:**
1. Verificar tiempo de respuesta:
   ```typescript
   const start = Date.now();
   const response = await model.generateContent(prompt);
   const duration = Date.now() - start;
   console.log('AI duration:', duration);
   ```
2. Verificar complejidad del prompt

**Soluciones:**
- Reducir longitud del prompt
- Implementar timeout manual
- Usar modelo más rápido (gemini-1.5-flash)
- Implementar streaming de respuesta

---

## 💳 Errores de Pagos

### Error: "Payment method not found"

**Síntomas:**
- Checkout no muestra métodos de pago
- Error al cargar métodos del vendedor
- "No payment methods configured"

**Diagnóstico:**
1. Verificar tabla seller_payment_methods:
   ```sql
   SELECT * FROM seller_payment_methods WHERE seller_id = 'user-id';
   ```
2. Verificar políticas RLS:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'seller_payment_methods';
   ```

**Soluciones:**
- **Si no hay métodos:** Pedir al vendedor que configure
- **Si RLS bloquea:** Corregir política
- **Si datos corruptos:** Reinsertar métodos

---

### Error: "Invoice generation failed"

**Síntomas:**
- Orden creada pero no factura
- Error en logs de facturación
- PDF no se genera

**Diagnóstico:**
1. Verificar bucket invoices en Storage:
   ```typescript
   const { data, error } = await supabase.storage.from('invoices').list();
   console.log('Storage error:', error);
   ```
2. Verificar datos de factura:
   ```typescript
   console.log('Invoice data:', { buyer, seller, amount });
   ```

**Soluciones:**
- **Si bucket no existe:** Crear bucket invoices
- **Si RLS bloquea:** Corregir política de Storage
- **Si datos inválidos:** Validar antes de generar
- **Si PDF falla:** Verificar generador de PDF

---

## 🔐 Errores de Seguridad

### Error: "Suspicious activity detected"

**Síntomas:**
- Usuario bloqueado temporalmente
- "Suspicious activity" en logs
- CAPTCHA requerido

**Diagnóstico:**
1. Verificar logs de securityLogger:
   ```typescript
   import { securityLogger } from '@/src/lib/logger';
   // Buscar "Suspicious activity"
   ```
2. Verificar patrón de actividad

**Soluciones:**
- **Si es falso positivo:** Desbloquear manualmente
- **Si es ataque:** Mantener bloqueo
- **Si necesita desbloqueo:** Contactar a dueño

---

### Error: "Invalid input detected"

**Síntomas:**
- Formulario rechaza input
- "Invalid input" en logs
- Sanitización bloquea datos

**Diagnóstico:**
1. Verificar sanitización:
   ```typescript
   import { detectMaliciousContent } from '@/src/lib/sanitizer';
   const isMalicious = detectMaliciousContent(input);
   console.log('Malicious:', isMalicious);
   ```

**Soluciones:**
- **Si es falso positivo:** Ajustar sanitización
- **Si es malicioso:** Bloquear y notificar
- **Si es error de validación:** Corregir validación

---

## 📊 Errores de Performance

### Error: "Slow page load"

**Síntomas:**
- Page load > 3s
- Lighthouse score bajo
- Users reportan lentitud

**Diagnóstico:**
1. Usar Lighthouse:
   ```bash
   npx lighthouse https://ion-max.app --view
   ```
2. Verificar bundle size:
   ```bash
   npx next build --analyze
   ```
3. Verificar Supabase queries:
   ```sql
   SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
   ```

**Soluciones:**
- **Frontend:** Optimizar imágenes, lazy loading, code splitting
- **Backend:** Agregar índices, optimizar queries, caching
- **Network:** Configurar CDN, cache headers

---

### Error: "Memory leak"

**Síntomas:**
- Uso de memoria crece indefinidamente
- Browser se congela después de tiempo
- Server crashes periódicamente

**Diagnóstico:**
1. Usar Chrome DevTools Memory profiler
2. Verificar event listeners no removidos
3. Verificar closures no liberadas

**Soluciones:**
- Remover event listeners en cleanup
- Usar useEffect cleanup
- Verificar referencias circulares
- Implementar pagination en lugar de cargar todo

---

## 🛠️ Herramientas de Debugging

### Vercel Logs
```bash
# Ver logs en tiempo real
vercel logs --follow

# Ver logs de deployment específico
vercel logs [deployment-url]
```

### Supabase Logs
```sql
-- Ver queries lentas
SELECT * FROM pg_stat_statements 
WHERE mean_exec_time > 100 
ORDER BY mean_exec_time DESC;

-- Ver conexiones activas
SELECT * FROM pg_stat_activity;
```

### Browser DevTools
```javascript
// Console logging
console.log('Debug:', data);
console.error('Error:', error);
console.table(array);

// Performance
performance.mark('start');
// ... código ...
performance.mark('end');
performance.measure('duration', 'start', 'end');
```

---

## 📞 Cuándo Escalar

**Escalar a dueño si:**
- Error crítico no resuelto en 1 hora
- Security incidente confirmado
- Data loss o corruption
- Servicio down > 30 minutos

**No escalar si:**
- Error de desarrollo local
- Documentación existe para el problema
- Puedes resolver con runbooks

---

## ✅ Checklist de Troubleshooting

**Antes de debuggear:**
- [ ] Revisar logs recientes
- [ ] Verificar variables de entorno
- [ ] Verificar status de servicios externos
- [ ] Reproducir el error localmente
- [ ] Buscar en issues existentes

**Durante debug:**
- [ ] Documentar pasos tomados
- [ ] Usar logging extensivo
- [ ] Testear soluciones
- [ ] Verificar que no rompa nada más

**Después de resolver:**
- [ ] Documentar solución
- [ ] Agregar a runbooks si es recurrente
- [ ] Implementar prevención
- [ ] Compartir aprendizaje

---

**Última actualización:** Julio 2026
**Versión:** 1.0
