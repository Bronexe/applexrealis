import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Building2, Search, Filter } from "lucide-react"
import Link from "next/link"
import AppLayoutWithSidebar from "@/components/app-layout-with-sidebar"
import { isSuperAdmin } from "@/lib/actions/super-admin"
import { getRegionById, getCommuneById } from "@/lib/data/chile-regions"

export default async function CondosPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Verificar si es super administrador
  const isSuperAdminUser = await isSuperAdmin()

  let condos: any[] = []
  let condosError = null

  if (isSuperAdminUser) {
    // Super admin ve todos los condominios
    const { data, error } = await supabase
      .from("condos")
      .select(`
        id, 
        name, 
        comuna, 
        address,
        region_id,
        commune_id,
        created_at,
        user_id
      `)
      .order("created_at", { ascending: false })
    
    condos = data || []
    condosError = error
  } else {
    // Usuario regular ve sus propios condominios + asignados
    // Obtener condominios propios
    const { data: ownCondos, error: ownCondosError } = await supabase
      .from("condos")
      .select(`
        id, 
        name, 
        comuna, 
        address,
        region_id,
        commune_id,
        created_at,
        user_id
      `)
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
          created_at,
          user_id
        )
      `)
      .eq("user_id", user.id)

    if (ownCondosError && assignedCondosError) {
      condosError = ownCondosError
    } else {
      const ownCondosList = ownCondos || []
      const assignedCondosList = (assignedCondos || [])
        .map((a: any) => a.condos)
        .filter((c: any) => c !== null)
      
      // Combinar y eliminar duplicados
      const allCondos = [...ownCondosList, ...assignedCondosList]
      const uniqueCondosMap = new Map()
      allCondos.forEach(condo => {
        if (condo && !uniqueCondosMap.has(condo.id)) {
          uniqueCondosMap.set(condo.id, condo)
        }
      })
      condos = Array.from(uniqueCondosMap.values())
    }
  }

  if (condosError) {
    console.error("Error fetching condos:", condosError)
  }

  // Obtener información de usuarios si es super admin y hay condominios
  let userEmails: Record<string, string> = {}
  if (isSuperAdminUser && condos && condos.length > 0) {
    const userIds = [...new Set(condos.map(c => c.user_id).filter(Boolean))]
    if (userIds.length > 0) {
      const { data: usersData } = await supabase
        .from('administrators')
        .select('user_id, full_name')
        .in('user_id', userIds)
      
      if (usersData) {
        userEmails = usersData.reduce((acc, user) => {
          acc[user.user_id] = user.full_name
          return acc
        }, {} as Record<string, string>)
      }
    }
  }

  return (
    <AppLayoutWithSidebar currentPath="/condos">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isSuperAdminUser ? "Todos los Condominios" : "Condominios Accesibles"}
            </h1>
            <p className="text-muted-foreground">
              {isSuperAdminUser 
                ? "Gestiona todos los condominios del sistema" 
                : "Gestiona tus condominios propios y asignados"
              }
            </p>
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
              <CardTitle className="text-sm font-medium">Total Condominios</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{condos?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {isSuperAdminUser ? "en el sistema" : "registrados"}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Condominios Activos</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{condos?.length || 0}</div>
              <p className="text-xs text-muted-foreground">con datos</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Último Registro</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {condos && condos.length > 0 
                  ? new Date(condos[0].created_at).toLocaleDateString('es-CL')
                  : "-"
                }
              </div>
              <p className="text-xs text-muted-foreground">fecha</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comunas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {condos ? [...new Set(condos.map(c => c.comuna).filter(Boolean))].length : 0}
              </div>
              <p className="text-xs text-muted-foreground">diferentes</p>
            </CardContent>
          </Card>
        </div>

        {/* Condos List */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>
              {isSuperAdminUser ? "Lista de Todos los Condominios" : "Condominios Accesibles"}
            </CardTitle>
            <CardDescription>
              {isSuperAdminUser 
                ? "Lista completa de condominios registrados en el sistema" 
                : "Condominios propios y asignados a tu cuenta"
              }
            </CardDescription>
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
                          {isSuperAdminUser && userEmails[condo.user_id] && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Propietario: {userEmails[condo.user_id]}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Creado: {new Date(condo.created_at).toLocaleDateString('es-CL')}
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button asChild className="flex-1 rounded-xl bg-transparent" variant="outline">
                            <Link href={`/condos/${condo.id}/dashboard`}>
                              Ver Dashboard
                            </Link>
                          </Button>
                          {isSuperAdminUser && (
                            <Button asChild className="flex-1 rounded-xl" size="sm">
                              <Link href={`/condos/${condo.id}/dashboard`}>
                                Gestionar
                              </Link>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {isSuperAdminUser ? "No hay condominios en el sistema" : "No hay condominios registrados"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {isSuperAdminUser 
                    ? "Los condominios aparecerán aquí cuando los usuarios los registren"
                    : "Comienza creando tu primer condominio para gestionar su cumplimiento"
                  }
                </p>
                <Button asChild className="rounded-xl">
                  <Link href="/condos/new">
                    <Plus className="mr-2 h-4 w-4" />
                    {isSuperAdminUser ? "Crear Condominio de Prueba" : "Crear Primer Condominio"}
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
