import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ArrowLeft, Building2 } from "lucide-react"
import Link from "next/link"
import AppLayoutWithSidebar from "@/components/app-layout-with-sidebar"
import { CondoTabsSimple } from "@/components/condo-tabs-simple"
import { isSuperAdmin } from "@/lib/actions/super-admin"

export default async function CondoLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ condoId: string }>
}) {
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

  // Get condo details
  const { data: condo, error: condoError } = await supabase
    .from("condos")
    .select("id, name, comuna, user_id")
    .eq("id", condoId)
    .single()

  if (condoError || !condo) {
    redirect("/dashboard")
  }

  // Verificar acceso: propietario, asignado o super admin
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

  return (
    <AppLayoutWithSidebar currentPath={`/condos/${condoId}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link 
            href="/condos"
            className="inline-flex items-center justify-center rounded-xl border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">{condo.name}</h1>
              {condo.comuna && <p className="text-muted-foreground">{condo.comuna}</p>}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div>
          <CondoTabsSimple condoId={condoId} />
        </div>

        {/* Content */}
        {children}
      </div>
    </AppLayoutWithSidebar>
  )
}
