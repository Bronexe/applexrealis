import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/actions/super-admin"
import CopropietariosSimplifiedClient from "./copropietarios-simplified-client"

export default async function CopropietariosPage({ params }: { params: Promise<{ condoId: string }> }) {
  const { condoId } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Verificar si es super administrador
  const isSuperAdminUser = await isSuperAdmin()

  // Get condo information
  let condoQuery = supabase.from("condos").select("id, name, comuna, address, region_id, commune_id, user_id").eq("id", condoId)
  
  // Si no es super admin, verificar que el condominio pertenece al usuario
  if (!isSuperAdminUser) {
    condoQuery = condoQuery.eq("user_id", user.id)
  }

  const condoResult = await condoQuery.single()

  if (condoResult.error) {
    redirect("/dashboard")
  }

  return (
    <CopropietariosSimplifiedClient 
      condoId={condoId}
    />
  )
}

