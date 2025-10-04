import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, User, Building2, Clock, AlertTriangle, CheckCircle, XCircle, FileText, Tag } from "lucide-react"
import Link from "next/link"
import AppLayoutWithSidebar from "@/components/app-layout-with-sidebar"
import { getGestionById } from "@/lib/actions/gestiones"
import { getRegionById, getCommuneById } from "@/lib/data/chile-regions"

interface GestionPageProps {
  params: Promise<{ id: string }>
}

// Función para obtener el color del badge según el estado
function getEstadoBadgeVariant(estado: string) {
  switch (estado) {
    case 'borrador':
      return 'secondary'
    case 'en_gestion':
      return 'default'
    case 'pendiente':
      return 'outline'
    case 'resuelto':
      return 'default'
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

export default async function GestionPage({ params }: GestionPageProps) {
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

  // Obtener información del condominio
  const { data: condominio } = await supabase
    .from("condos")
    .select("id, name, comuna, region_id, commune_id")
    .eq("id", gestion.condominio_id)
    .single()

  const region = condominio?.region_id ? getRegionById(condominio.region_id) : null
  const commune = condominio?.region_id && condominio?.commune_id ? getCommuneById(condominio.region_id, condominio.commune_id) : null

  // Verificar si está vencida
  const isVencida = gestion.fecha_limite && 
    new Date(gestion.fecha_limite) < new Date() && 
    !['resuelto', 'cerrado'].includes(gestion.estado)

  return (
    <AppLayoutWithSidebar currentPath="/gestiones">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/gestiones">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{gestion.titulo}</h1>
              <p className="text-muted-foreground">Detalles de la gestión</p>
            </div>
          </div>
          <Button asChild>
            <Link href={`/gestiones/${id}/edit`}>
              Editar Gestión
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Descripción */}
            {gestion.descripcion && (
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle>Descripción</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {gestion.descripcion}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Estado y Prioridad */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Estado y Prioridad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getEstadoIcon(gestion.estado)}
                    <span className="text-sm font-medium">Estado:</span>
                    <Badge variant={getEstadoBadgeVariant(gestion.estado)} className="rounded-lg">
                      {gestion.estado.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Prioridad:</span>
                    <Badge variant={getPrioridadBadgeVariant(gestion.prioridad)} className="rounded-lg">
                      {gestion.prioridad}
                    </Badge>
                  </div>
                </div>
                
                {isVencida && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Esta gestión está vencida</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            {gestion.tags && gestion.tags.length > 0 && (
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {gestion.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="rounded-lg">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Información Lateral */}
          <div className="space-y-6">
            {/* Información del Condominio */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Condominio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">{condominio?.name || 'Condominio no encontrado'}</div>
                  {commune && <div className="text-sm text-muted-foreground">{commune.name}</div>}
                  {region && <div className="text-sm text-muted-foreground">{region.name}</div>}
                </div>
              </CardContent>
            </Card>

            {/* Fechas */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fechas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium">Fecha de Creación</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(gestion.fecha_creacion).toLocaleDateString('es-CL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                
                {gestion.fecha_limite && (
                  <div>
                    <div className="text-sm font-medium">Fecha Límite</div>
                    <div className={`text-sm ${isVencida ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                      {new Date(gestion.fecha_limite).toLocaleDateString('es-CL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                )}
                
                {gestion.fecha_cierre && (
                  <div>
                    <div className="text-sm font-medium">Fecha de Cierre</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(gestion.fecha_cierre).toLocaleDateString('es-CL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información del Responsable */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Responsable
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  ID: {gestion.responsable_id.slice(0, 8)}...
                </div>
              </CardContent>
            </Card>

            {/* Tipo */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Tipo de Gestión</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="rounded-lg">
                  {gestion.tipo}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayoutWithSidebar>
  )
}





