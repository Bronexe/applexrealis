import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AppLayoutWithSidebar from "@/components/app-layout-with-sidebar"
import { ReportesSimpleFallback } from "./reportes-simple-fallback"

export default async function ReportesPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Get condos with proper error handling
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

  return (
    <AppLayoutWithSidebar currentPath="/reportes">
      <ReportesSimpleFallback condos={condos} hasError={hasError} />
    </AppLayoutWithSidebar>
  )
}
