import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Building2, FileText, Shield, AlertTriangle } from "lucide-react"
import Link from "next/link"
import AppLayoutWithSidebar from "@/components/app-layout-with-sidebar"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get condos count - Solo condominios del usuario actual
  const { data: condos, error: condosError } = await supabase
    .from("condos")
    .select("id, name, comuna")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (condosError) {
    console.error("Error fetching condos:", condosError)
  }

  return (
    <AppLayoutWithSidebar currentPath="/dashboard">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Gestiona el cumplimiento de tus copropiedades</p>
          </div>
          <Button asChild className="rounded-xl">
            <Link href="/condos/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Condominio
            </Link>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Condominios</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{condos?.length || 0}</div>
              <p className="text-xs text-muted-foreground">registrados</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Asambleas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">total sistema</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Seguros Vigentes</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">total sistema</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">total sistema</p>
            </CardContent>
          </Card>
        </div>

        {/* Condos List */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Mis Condominios</CardTitle>
            <CardDescription>Lista de condominios registrados en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {condos && condos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {condos.map((condo) => (
                  <Card key={condo.id} className="rounded-xl hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{condo.name}</CardTitle>
                      {condo.comuna && <CardDescription>{condo.comuna}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                      <Button asChild className="w-full rounded-xl bg-transparent" variant="outline">
                        <Link href={`/condos/${condo.id}/dashboard`}>Ver Dashboard</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay condominios registrados</h3>
                <p className="text-muted-foreground mb-4">
                  Comienza creando tu primer condominio para gestionar su cumplimiento
                </p>
                <Button asChild className="rounded-xl">
                  <Link href="/condos/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Primer Condominio
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayoutWithSidebar>
  )
}
