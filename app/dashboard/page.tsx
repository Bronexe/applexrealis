import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Building2, FileText, Shield, Home, ClipboardList, AlertTriangle } from "lucide-react"
import Link from "next/link"
import AppLayoutWithSidebar from "@/components/app-layout-with-sidebar"
import { getRegionById, getCommuneById } from "@/lib/data/chile-regions"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get condos count - Condominios propios + asignados
  // Primero obtener condominios propios
  const { data: ownCondos, error: ownCondosError } = await supabase
    .from("condos")
    .select("id, name, comuna, address, region_id, commune_id, user_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Obtener condominios asignados
  const { data: assignedCondos, error: assignedCondosError } = await supabase
    .from("condo_assignments")
    .select(`
      condos (
        id,
        name,
        comuna,
        address,
        region_id,
        commune_id,
        user_id
      )
    `)
    .eq("user_id", user.id)

  // Combinar ambos resultados
  let condos: any[] = []
  let condosError = null

  if (ownCondosError && assignedCondosError) {
    condosError = ownCondosError
  } else {
    const ownCondosList = ownCondos || []
    const assignedCondosList = (assignedCondos || [])
      .map((a: any) => a.condos)
      .filter((c: any) => c !== null)
    
    // Eliminar duplicados basándose en el ID
    const allCondos = [...ownCondosList, ...assignedCondosList]
    const uniqueCondosMap = new Map()
    allCondos.forEach(condo => {
      if (condo && !uniqueCondosMap.has(condo.id)) {
        uniqueCondosMap.set(condo.id, condo)
      }
    })
    condos = Array.from(uniqueCondosMap.values())
  }

  if (condosError) {
    console.error("Error fetching condos:", condosError)
  }

  // Get total units count from all condos managed by the user
  let totalUnits = 0
  if (condos && condos.length > 0) {
    const condoIds = condos.map(condo => condo.id)
    
    const { data: units, error: unitsError } = await supabase
      .from("unidades_simplified")
      .select("id")
      .in("condo_id", condoIds)

    if (unitsError) {
      console.error("Error fetching units:", unitsError)
    } else {
      totalUnits = units?.length || 0
    }
  }

  // Get gestiones statistics
  let totalGestiones = 0
  let gestionesPorVencer = 0
  
  if (condos && condos.length > 0) {
    const condoIds = condos.map(condo => condo.id)
    
    // Get all gestiones for user's condos
    const { data: gestiones, error: gestionesError } = await supabase
      .from("gestiones")
      .select("id, estado, fecha_limite")
      .in("condominio_id", condoIds)

    if (gestionesError) {
      console.error("Error fetching gestiones:", gestionesError)
    } else {
      totalGestiones = gestiones?.length || 0
      
      // Count gestiones por vencer (not resuelto and with fecha_limite in the future)
      const today = new Date()
      gestionesPorVencer = gestiones?.filter(gestion => 
        gestion.estado !== 'resuelto' && 
        gestion.fecha_limite && 
        new Date(gestion.fecha_limite) > today
      ).length || 0
    }
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
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
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
              <CardTitle className="text-sm font-medium">Total Gestiones</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGestiones}</div>
              <p className="text-xs text-muted-foreground">realizadas</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Por Vencer</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{gestionesPorVencer}</div>
              <p className="text-xs text-muted-foreground">gestiones</p>
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
              <CardTitle className="text-sm font-medium">Cantidad de Unidades</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUnits}</div>
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
                {condos.map((condo) => {
                  const region = condo.region_id ? getRegionById(condo.region_id) : null
                  const commune = condo.region_id && condo.commune_id ? getCommuneById(condo.region_id, condo.commune_id) : null
                  
                  return (
                    <Card key={condo.id} className="rounded-xl hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{condo.name}</CardTitle>
                        <CardDescription className="space-y-1">
                          {condo.address && <div className="text-sm">{condo.address}</div>}
                          {commune && <div className="text-sm">{commune.name}</div>}
                          {region && <div className="text-sm">{region.name}</div>}
                          {!condo.address && !commune && !region && condo.comuna && (
                            <div className="text-sm">{condo.comuna}</div>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button asChild className="w-full rounded-xl bg-transparent" variant="outline">
                          <Link href={`/condos/${condo.id}/dashboard`}>Ver Dashboard</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
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
