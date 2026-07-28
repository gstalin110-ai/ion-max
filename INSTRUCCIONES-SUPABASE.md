# 🚀 Instrucciones de Configuración - IÓN MAX

## ⚠️ PASOS OBLIGATORIOS ANTES DE LANZAR

### 1. Ejecutar Scripts SQL en Supabase

**Paso 1:** Ingresa a tu dashboard de Supabase: https://supabase.com/dashboard

**Paso 2:** Selecciona tu proyecto de IÓN MAX

**Paso 3:** Ve a "SQL Editor" en el menú lateral izquierdo

**Paso 4:** Crea una nueva consulta y ejecuta el siguiente script en orden:

#### Script 1: Pagos y Facturación
Copia y pega el contenido de `supabase-payments-invoicing.sql` y ejecútalo.

Este script crea:
- Tabla `seller_payment_methods` (métodos de pago del vendedor)
- Tabla `invoices` (facturas simples sin IVA)
- Índices y políticas RLS

#### Script 2: Tickets y Quejas
Copia y pega el contenido de `supabase-tickets.sql` y ejecútalo.

Este script crea:
- Tabla `support_tickets` (tickets de soporte)
- Tabla `ticket_messages` (mensajes de chat)
- Índices y políticas RLS

**Verificación:** Deberías ver mensajes de éxito como:
```
"Sistema de pagos y facturación creado exitosamente."
"Sistema de tickets y quejas creado exitosamente."
```

---

### 2. Crear Bucket 'invoices' en Supabase Storage

**Paso 1:** En el dashboard de Supabase, ve a "Storage" en el menú lateral

**Paso 2:** Haz clic en "Create a new bucket"

**Paso 3:** Configura el bucket con estos datos:
- **Name:** `invoices` (exactamente en minúsculas)
- **Public bucket:** ❌ NO marcar (debe ser privado)
- **File size limit:** 50MB (o el que prefieras)
- **Allowed MIME types:** `application/pdf`, `text/html`

**Paso 4:** Haz clic en "Create bucket"

**Paso 5:** Configura políticas RLS para el bucket:
1. Selecciona el bucket `invoices`
2. Ve a "Policies"
3. Crea una política para lectura:
   - Name: `Usuarios pueden leer sus facturas`
   - Allowed operation: `SELECT`
   - Target role: `authenticated`
   - USING: `bucket_id = 'invoices'`
4. Crea una política para escritura:
   - Name: `Usuarios pueden subir facturas`
   - Allowed operation: `INSERT`
   - Target role: `authenticated`
   - WITH CHECK: `bucket_id = 'invoices'`

---

## ✅ Verificación de Configuración

### Verificar Tablas
En SQL Editor, ejecuta:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('seller_payment_methods', 'invoices', 'support_tickets', 'ticket_messages');
```

Deberías ver las 4 tablas listadas.

### Verificar Bucket
En Storage, deberías ver el bucket `invoices` en la lista.

---

## 🎯 Sistema Implementado

### ✅ Facturación Simple (Sin IVA)
- **Formato:** Solo datos esenciales
- **Datos:** Quién compra, quién vende, hora exacta, nombre, ID único de cuenta
- **Número único:** `ION-YYYYMMDD-XXXXX`
- **Diseño:** IÓN MAX premium con gradiente amarillo

### ✅ Checkout Funcional
- **Flujo real:** Crea orden en BD + genera factura
- **Métodos de pago:** Enlaces y QR del vendedor
- **Datos del comprador:** Nombre, teléfono, email
- **Sin IVA:** Monto simple directo

### ✅ Panel del Dueño
- **Gestión de tickets:** Ver, responder, cambiar estado
- **Notas internas:** Para el dueño
- **Filtros:** Por estado (abierto, en progreso, resuelto)
- **Dashboard:** Métricas en tiempo real (usuarios, listings, órdenes, tickets, ingresos)

### ✅ AI Marketing
- **Optimización de listings:** Títulos, descripciones, tags
- **Contenido social:** Posts para red social
- **Recomendaciones:** Productos similares
- **Soporte:** Respuestas automáticas

---

## 📋 Scripts SQL Disponibles

1. **supabase-payments-invoicing.sql** - Pagos y facturación simple
2. **supabase-tickets.sql** - Sistema de tickets y quejas
3. **supabase-fix-tables.sql** - Correcciones de tablas (si es necesario)
4. **supabase-cleanup.sql** - Limpieza de datos (opcional)
5. **supabase-check-tables.sql** - Verificación de tablas

---

## 🚀 Listo para Lanzar

Una vez completados estos pasos:
1. ✅ Scripts SQL ejecutados
2. ✅ Bucket `invoices` creado
3. ✅ Políticas RLS configuradas

**IÓN MAX estará listo para funcionar:**
- Usuarios pueden configurar métodos de pago
- Compradores pueden pagar con métodos del vendedor
- Facturas se generan automáticamente
- Tickets de soporte funcionan
- Dueño puede gestionar todo desde `/admin`

---

## 📞 Soporte

Si encuentras algún error:
1. Verifica que los scripts SQL se ejecutaron sin errores
2. Confirma que el bucket `invoices` existe
3. Revisa las políticas RLS en Storage
4. Revisa las políticas RLS en las tablas

**Repositorio:** https://github.com/gstalin110-ai/ion-max
