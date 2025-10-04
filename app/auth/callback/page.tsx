"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()
      
      try {
        // Obtener la sesión después de la redirección
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Error getting session:", error)
          router.push("/auth/login?error=auth_failed")
          return
        }

        if (session) {
          // Usuario autenticado exitosamente, redirigir al dashboard
          router.push("/dashboard")
        } else {
          // No hay sesión, redirigir al login
          router.push("/auth/login?error=no_session")
        }
      } catch (error) {
        console.error("Error in auth callback:", error)
        router.push("/auth/login?error=callback_failed")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Procesando autenticación...</p>
        </div>
      </div>
    </div>
  )
}





















