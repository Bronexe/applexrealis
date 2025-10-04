import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/actions/super-admin"
import { CondoDashboardClient } from "./condo-dashboard-client"

export default async function CondoDashboardPage({ params }: { params: Promise<{ condoId: string }> }) {
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

  // Get condo information and counts for each module
  let condoQuery = supabase.from("condos").select("id, name, comuna, address, region_id, commune_id, cantidad_copropietarios, destino_uso, user_id").eq("id", condoId)
  
  // Si no es super admin, verificar que el condominio pertenece al usuario
  if (!isSuperAdminUser) {
    condoQuery = condoQuery.eq("user_id", user.id)
  }

  const [condoResult, assembliesResult, plansResult, certificationsResult, insurancesResult, alertsResult] = await Promise.all([
    condoQuery.single(),
    supabase.from("assemblies").select("id", { count: "exact" }).eq("condo_id", condoId),
    supabase.from("emergency_plans").select("id", { count: "exact" }).eq("condo_id", condoId),
    supabase.from("certifications").select("id", { count: "exact" }).eq("condo_id", condoId),
    supabase.from("insurances").select("id", { count: "exact" }).eq("condo_id", condoId),
    supabase
      .from("alerts")
      .select("id, rule_id, status, details, created_at")
      .eq("condo_id", condoId)
      .order("created_at", { ascending: false }),
  ])

  if (condoResult.error) {
    redirect("/dashboard")
  }

  const condo = condoResult.data

  const counts = {
    assemblies: assembliesResult.count || 0,
    plans: plansResult.count || 0,
    certifications: certificationsResult.count || 0,
    insurances: insurancesResult.count || 0,
  }
  
  const alerts = alertsResult.data || []

  return (
    <CondoDashboardClient 
      condo={condo}
      counts={counts}
      alerts={alerts}
    />
  )
}
