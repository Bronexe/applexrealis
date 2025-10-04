import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/actions/super-admin"
import SuperAdminClient from "./super-admin-client"

export default async function SuperAdminPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Verificación específica para sebaleon@gmail.com
  if (user.email !== 'sebaleon@gmail.com') {
    redirect("/dashboard")
  }

  // Verificación adicional con isSuperAdmin
  const isSuper = await isSuperAdmin()
  if (!isSuper) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <SuperAdminClient />
    </div>
  )
}





