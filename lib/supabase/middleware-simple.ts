import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  console.log('🔍 updateSession ejecutándose para:', request.nextUrl.pathname)
  
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Verificar si las variables de entorno están configuradas correctamente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('🔧 Supabase URL configurada:', !!supabaseUrl)
  console.log('🔧 Supabase Anon Key configurada:', !!supabaseAnonKey)

  // Si no hay credenciales válidas, permitir el acceso sin autenticación
  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl === "your_supabase_project_url_here" || 
      supabaseAnonKey === "your_supabase_anon_key_here") {
    console.warn("⚠️ Supabase credentials not configured. Running without authentication.")
    return supabaseResponse
  }

  try {
    // With Fluid compute, don't put this client in a global environment
    // variable. Always create a new one on each request.
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
          },
        },
      },
    )

    console.log('🔧 Cliente Supabase creado exitosamente')

    // Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: If you remove getUser() and you use server-side rendering
    // with the Supabase client, your users may be randomly logged out.
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError) {
      console.error('❌ Error obteniendo usuario:', userError)
    } else {
      console.log('👤 Usuario obtenido:', user ? user.email : 'No autenticado')
    }

    // Rutas que no requieren autenticación
    const publicPaths = [
      "/",
      "/auth/login",
      "/auth/signup", 
      "/auth/signup-success",
      "/auth/callback",
      "/auth/error"
    ]

    const isPublicPath = publicPaths.some(path => 
      request.nextUrl.pathname === path || 
      request.nextUrl.pathname.startsWith(path)
    )

    console.log('🛣️ Ruta actual:', request.nextUrl.pathname)
    console.log('🔓 Es ruta pública:', isPublicPath)
    console.log('👤 Usuario autenticado:', !!user)

    // Si no es una ruta pública y no hay usuario autenticado, redirigir a login
    if (!isPublicPath && !user) {
      console.log('🔄 Redirigiendo a login...')
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }

    console.log('✅ Middleware completado exitosamente')
    return supabaseResponse

  } catch (error) {
    console.error('❌ Error en updateSession:', error)
    
    // En caso de error, permitir el acceso
    return supabaseResponse
  }
}





















