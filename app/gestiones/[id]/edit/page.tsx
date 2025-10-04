import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AppLayoutWithSidebar from "@/components/app-layout-with-sidebar"
import { getGestionById } from "@/lib/actions/gestiones"
import { EditGestionForm } from "./edit-gestion-form"

interface EditGestionPageProps {
  params: Promise<{ id: string }>
}

export default async function EditGestionPage({ params }: EditGestionPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Obtener la gestión
  const { gestion, error } = await getGestionById(id)

  if (error || !gestion) {
    notFound()
  }

  return (
    <AppLayoutWithSidebar currentPath="/gestiones">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Editar Gestión</h1>
          <p className="text-muted-foreground">
            Modifica los datos de la gestión: {gestion.titulo}
          </p>
        </div>

        <EditGestionForm gestion={gestion} />
      </div>
    </AppLayoutWithSidebar>
  )
}





