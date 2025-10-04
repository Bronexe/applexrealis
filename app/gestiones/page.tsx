import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Clock, AlertTriangle, CheckCircle, XCircle, FileText, Calendar, User, Building2, Download } from "lucide-react"
import Link from "next/link"
import AppLayoutWithSidebar from "@/components/app-layout-with-sidebar"
import { isSuperAdmin } from "@/lib/actions/super-admin"
import { getRegionById, getCommuneById } from "@/lib/data/chile-regions"
import ExportButton from "./export-button"

// Tipos para las gestiones
interface Gestion {
  id: string
  tipo: string
  titulo: string
  descripcion: string | null
  estado: string
  prioridad: string
  condominio_id: string
  unidad_id: string | null
  solicitante_id: string | null
  responsable_id: string
  fecha_creacion: string
  fecha_limite: string | null
  fecha_cierre: string | null
  tags: string[] | null
  condominio: {
    id: string
    name: string
    comuna: string | null
    region_id: string | null
    commune_id: string | null
  }
}

// Función para obtener el color del badge según el estado
function getEstadoBadgeVariant(estado: string) {
  switch (estado) {
    case 'borrador':
      return 'secondary'
    case 'en_gestion':
      return 'default'
    case 'pendiente':
      return 'destructive'
    case 'resuelto':
      return 'success'
    case 'cerrado':
      return 'secondary'
    default:
      return 'outline'
  }
}

// Función para obtener el color del badge según la prioridad
function getPrioridadBadgeVariant(prioridad: string) {
  switch (prioridad) {
    case 'baja':
      return 'secondary'
    case 'media':
      return 'default'
    case 'alta':
      return 'destructive'
    case 'critica':
      return 'destructive'
    default:
      return 'outline'
  }
}

// Función para obtener el icono según el estado
function getEstadoIcon(estado: string) {
  switch (estado) {
    case 'borrador':
      return <FileText className="h-4 w-4" />
    case 'en_gestion':
      return <Clock className="h-4 w-4" />
    case 'pendiente':
      return <AlertTriangle className="h-4 w-4" />
    case 'resuelto':
      return <CheckCircle className="h-4 w-4" />
    case 'cerrado':
      return <XCircle className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

export default async function GestionesPage() {
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

  // Obtener gestiones con información del condominio
  let gestionesQuery = supabase
    .from("gestiones")
    .select("*")
    .order("fecha_creacion", { ascending: false })

  // Si no es super admin, solo mostrar gestiones de sus condominios
  if (!isSuperAdminUser) {
    gestionesQuery = gestionesQuery.eq("responsable_id", user.id)
  }

  const { data: gestiones, error: gestionesError } = await gestionesQuery

  if (gestionesError) {
    console.error("Error fetching gestiones:", gestionesError)
    // Si hay error, mostrar mensaje más descriptivo
    console.error("Detalles del error:", JSON.stringify(gestionesError, null, 2))
  }

  // Obtener información de condominios por separado si hay gestiones
  let condosInfo: Record<string, any> = {}
  if (gestiones && gestiones.length > 0) {
    const condominioIds = [...new Set(gestiones.map(g => g.condominio_id))]
    const { data: condos } = await supabase
      .from("condos")
      .select("id, name, comuna, region_id, commune_id")
      .in("id", condominioIds)
    
    if (condos) {
      condosInfo = condos.reduce((acc, condo) => {
        acc[condo.id] = condo
        return acc
      }, {} as Record<string, any>)
    }
  }

  // Obtener estadísticas (solo si no hay error en gestiones)
  let statsData = {
    total_gestiones: 0,
    gestiones_borrador: 0,
    gestiones_en_gestion: 0,
    gestiones_pendiente: 0,
    gestiones_resuelto: 0,
    gestiones_cerrado: 0,
    gestiones_criticas: 0,
    gestiones_vencidas: 0
  }

  if (!gestionesError) {
    try {
      const { data: stats } = await supabase.rpc('get_gestiones_stats', {
        p_condominio_id: null
      })
      statsData = stats?.[0] || statsData
    } catch (statsError) {
      console.error("Error fetching stats:", statsError)
      // Usar estadísticas básicas basadas en los datos obtenidos
      if (gestiones && gestiones.length > 0) {
        statsData = {
          total_gestiones: gestiones.length,
          gestiones_borrador: gestiones.filter(g => g.estado === 'borrador').length,
          gestiones_en_gestion: gestiones.filter(g => g.estado === 'en_gestion').length,
          gestiones_pendiente: gestiones.filter(g => g.estado === 'pendiente').length,
          gestiones_resuelto: gestiones.filter(g => g.estado === 'resuelto').length,
          gestiones_cerrado: gestiones.filter(g => g.estado === 'cerrado').length,
          gestiones_criticas: gestiones.filter(g => g.prioridad === 'critica').length,
          gestiones_vencidas: gestiones.filter(g => 
            g.fecha_limite && 
            new Date(g.fecha_limite) < new Date() && 
            !['resuelto', 'cerrado'].includes(g.estado)
          ).length
        }
      }
    }
  }

  return (
    <AppLayoutWithSidebar currentPath="/gestiones">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isSuperAdminUser ? "Todas las Gestiones" : "Mis Gestiones"}
            </h1>
            <p className="text-muted-foreground">
              {isSuperAdminUser 
                ? "Seguimiento de trámites y gestiones del sistema" 
                : "Gestiona tus trámites y seguimiento de actividades"
              }
            </p>
          </div>
          <div className="flex gap-3">
            {gestiones && gestiones.length > 0 && (
              <ExportButton gestiones={gestiones} condosInfo={condosInfo} />
            )}
            <Button asChild className="rounded-xl">
              <Link href="/gestiones/new">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Gestión
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gestiones</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.total_gestiones}</div>
              <p className="text-xs text-muted-foreground">
                {isSuperAdminUser ? "en el sistema" : "asignadas"}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Gestión</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.gestiones_en_gestion}</div>
              <p className="text-xs text-muted-foreground">activas</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Críticas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.gestiones_criticas}</div>
              <p className="text-xs text-muted-foreground">prioridad alta</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.gestiones_vencidas}</div>
              <p className="text-xs text-muted-foreground">requieren atención</p>
            </CardContent>
          </Card>
        </div>

        {/* Gestiones List */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>
              {isSuperAdminUser ? "Lista de Todas las Gestiones" : "Mis Gestiones"}
            </CardTitle>
            <CardDescription>
              {isSuperAdminUser 
                ? "Lista completa de gestiones y trámites del sistema" 
                : "Lista de gestiones asignadas a tu cuenta"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {gestionesError ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error al cargar gestiones</h3>
                <p className="text-muted-foreground mb-4">
                  La tabla de gestiones no existe o no está configurada correctamente. 
                  Por favor, ejecuta el script de creación de la base de datos.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg text-left">
                  <p className="text-sm font-medium mb-2">Para solucionar:</p>
                  <ol className="text-sm text-muted-foreground space-y-1">
                    <li>1. Ve a Supabase SQL Editor</li>
                    <li>2. Ejecuta el script: <code className="bg-background px-1 rounded">scripts/087_CREATE_GESTIONES_TABLE.sql</code></li>
                    <li>3. Recarga esta página</li>
                  </ol>
                </div>
              </div>
            ) : gestiones && gestiones.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Condominio</TableHead>
                    <TableHead>Fecha Límite</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gestiones.map((gestion) => {
                    const condominio = condosInfo[gestion.condominio_id]
                    const region = condominio?.region_id ? getRegionById(condominio.region_id) : null
                    const commune = condominio?.region_id && condominio?.commune_id ? getCommuneById(condominio.region_id, condominio.commune_id) : null
                    
                    return (
                      <TableRow key={gestion.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getEstadoIcon(gestion.estado)}
                            <div className="font-medium">{gestion.titulo}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground max-w-xs">
                            {gestion.descripcion ? (
                              <div className="truncate" title={gestion.descripcion}>
                                {gestion.descripcion}
                              </div>
                            ) : (
                              <span className="text-muted-foreground/60">Sin descripción</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-lg">
                            {gestion.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getEstadoBadgeVariant(gestion.estado)} className="rounded-lg">
                            {gestion.estado.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPrioridadBadgeVariant(gestion.prioridad)} className="rounded-lg">
                            {gestion.prioridad}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{condominio?.name || 'Condominio no encontrado'}</div>
                              {commune && <div className="text-xs text-muted-foreground">{commune.name}</div>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {gestion.fecha_limite ? (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className={`text-sm ${
                                new Date(gestion.fecha_limite) < new Date() && !['resuelto', 'cerrado'].includes(gestion.estado)
                                  ? 'text-red-600 font-medium'
                                  : ''
                              }`}>
                                {new Date(gestion.fecha_limite).toLocaleDateString('es-CL')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Sin límite</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/gestiones/${gestion.id}`}>
                                Ver
                              </Link>
                            </Button>
                            <Button asChild size="sm">
                              <Link href={`/gestiones/${gestion.id}/edit`}>
                                Editar
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {isSuperAdminUser ? "No hay gestiones en el sistema" : "No hay gestiones asignadas"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {isSuperAdminUser 
                    ? "Las gestiones aparecerán aquí cuando los usuarios las creen"
                    : "Comienza creando tu primera gestión para organizar tus trámites"
                  }
                </p>
                <Button asChild className="rounded-xl">
                  <Link href="/gestiones/new">
                    <Plus className="mr-2 h-4 w-4" />
                    {isSuperAdminUser ? "Crear Gestión de Prueba" : "Crear Primera Gestión"}
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
