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

  // Verificar acceso: propietario, asignado o super admin
  const { data: condo, error: condoError } = await supabase
    .from("condos")
    .select("id, name, comuna, address, region_id, commune_id, cantidad_copropietarios, destino_uso, user_id")
    .eq("id", condoId)
    .single()

  if (condoError || !condo) {
    redirect("/dashboard")
  }

  const isOwner = condo.user_id === user.id
  
  // Verificar si está asignado
  const { data: assignment } = await supabase
    .from("condo_assignments")
    .select("id")
    .eq("condo_id", condoId)
    .eq("user_id", user.id)
    .maybeSingle()

  const hasAccess = isOwner || assignment !== null || isSuperAdminUser

  if (!hasAccess) {
    redirect("/dashboard")
  }

  const [assembliesResult, plansResult, certificationsResult, insurancesResult, alertsResult] = await Promise.all([
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
