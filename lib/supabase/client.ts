import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  // Verificar si las variables de entorno están configuradas correctamente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Si no hay credenciales válidas, lanzar un error más descriptivo
  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl === "your_supabase_project_url_here" || 
      supabaseAnonKey === "your_supabase_anon_key_here") {
    throw new Error(
      "Supabase credentials not configured. Please update your .env.local file with valid Supabase URL and anon key."
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
