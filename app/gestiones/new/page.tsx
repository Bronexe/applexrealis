import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AppLayoutWithSidebar from "@/components/app-layout-with-sidebar"
import { GestionForm } from "./gestion-form"

export default async function NewGestionPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  return (
    <AppLayoutWithSidebar currentPath="/gestiones">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nueva Gestión</h1>
          <p className="text-muted-foreground">
            Crea una nueva gestión o trámite para seguimiento
          </p>
        </div>

        <GestionForm />
      </div>
    </AppLayoutWithSidebar>
  )
}





