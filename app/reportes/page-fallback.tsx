import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ReportesFallbackClient } from "./reportes-fallback-client"

export default async function ReportesPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Try to get condos, but don't fail if it doesn't work
  let condos: any[] = []
  let hasError = false
  
  try {
    const { data: condosData, error: condosError } = await supabase
      .from("condos")
      .select("id, name, comuna")
      .order("name")

    if (condosError) {
      console.error("Error fetching condos:", condosError)
      hasError = true
    } else {
      condos = condosData || []
    }
  } catch (error) {
    console.error("Unexpected error fetching condos:", error)
    hasError = true
  }

  return <ReportesFallbackClient condos={condos} hasError={hasError} />
}





















