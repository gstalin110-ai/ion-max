import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          res.cookies.delete({ name, ...options })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Rutas protegidas que requieren autenticación
  const protectedPaths = ['/dashboard', '/profile', '/wallet', '/messages', '/settings', '/publish']
  const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))

  // Rutas de administrador que requieren rol admin
  const adminPaths = ['/admin']
  const isAdminPath = adminPaths.some(path => req.nextUrl.pathname.startsWith(path))

  // Rutas de autenticación (redirigir si ya está logueado)
  const authPaths = ['/login', '/register']
  const isAuthPath = authPaths.some(path => req.nextUrl.pathname.startsWith(path))

  // Si no hay sesión y ruta está protegida
  if (!session && (isProtectedPath || isAdminPath)) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Si hay sesión y está en ruta de auth
  if (session && isAuthPath) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Verificar rol admin para rutas de administrador
  if (session && isAdminPath) {
    const { data: userRole } = await supabase
      .from('user_roles')
      .select(`
        roles (
          name
        )
      `)
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (!userRole || !(userRole.roles as any)?.name || (userRole.roles as any).name !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
