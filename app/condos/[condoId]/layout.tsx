import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Building2 } from "lucide-react"
import Link from "next/link"
import AppLayoutWithSidebar from "@/components/app-layout-with-sidebar"
import { CondoTabsSimple } from "@/components/condo-tabs-simple"

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

  // Get condo details - Solo si pertenece al usuario actual
  const { data: condo, error: condoError } = await supabase
    .from("condos")
    .select("id, name, comuna")
    .eq("id", condoId)
    .eq("user_id", user.id)
    .single()

  if (condoError || !condo) {
    redirect("/dashboard")
  }

  return (
    <AppLayoutWithSidebar currentPath={`/condos/${condoId}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-xl bg-transparent">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
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
