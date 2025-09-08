import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AppLayoutWithSidebar from "@/components/app-layout-with-sidebar"
import AdministradorClient from "./administrador-client"

export default async function AdministradorPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  return (
    <AppLayoutWithSidebar currentPath="/administrador">
      <AdministradorClient />
    </AppLayoutWithSidebar>
  )
}
