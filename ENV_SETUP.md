# Variables de Entorno para Vercel

Estas son las variables de entorno que necesitas configurar en Vercel para el despliegue de ION MAX:

## Variables Requeridas

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL` - URL de tu proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clave anónima de Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Clave de servicio de Supabase (para operaciones de servidor)

### Stripe (Opcional - para pagos reales)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Clave pública de Stripe
- `STRIPE_SECRET_KEY` - Clave secreta de Stripe
- `STRIPE_WEBHOOK_SECRET` - Secreto del webhook de Stripe

### Configuración de la App
- `NEXT_PUBLIC_APP_URL` - URL de producción (ej: https://ion-max.vercel.app)

## Configuración en Vercel

1. Ve a tu proyecto en Vercel
2. Navega a Settings > Environment Variables
3. Agrega cada variable con su valor correspondiente
4. Re-deploya el proyecto después de agregar las variables

## Seguridad

- Nunca commits las claves privadas en el repositorio
- Usa variables de entorno para datos sensibles
- Las variables con `NEXT_PUBLIC_` son accesibles en el cliente
- Las variables sin `NEXT_PUBLIC_` solo son accesibles en el servidor
