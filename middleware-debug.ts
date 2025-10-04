import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  console.log('🔍 Middleware ejecutándose para:', request.nextUrl.pathname)
  
  try {
    const response = await updateSession(request)
    console.log('✅ Middleware completado exitosamente')
    return response
  } catch (error) {
    console.error('❌ Error en middleware:', error)
    
    // En caso de error, permitir el acceso sin autenticación
    return new Response('Error en middleware', { status: 500 })
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/cron (cron jobs)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/cron|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}


















