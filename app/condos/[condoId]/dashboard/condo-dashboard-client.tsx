"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Shield, AlertTriangle, Calendar, Users, Building2 } from "lucide-react"
import { RecalculateComplianceButton } from "@/components/recalculate-compliance-button"
import { ComplianceOverview } from "@/components/compliance-overview"
import { CopropietariosEditButton } from "@/components/copropietarios-edit-button"
import { QuorumRules } from "@/components/quorum-rules"
import { getRegionById, getCommuneById } from "@/lib/data/chile-regions"

interface CondoDashboardClientProps {
  condo: {
    id: string
    name: string
    comuna: string | null
    address: string | null
    region_id: string | null
    commune_id: string | null
    cantidad_copropietarios: number | null
    destino_uso: string | null
  }
  counts: {
    assemblies: number
    plans: number
    certifications: number
    insurances: number
  }
  alerts: Array<{
    id: string
    rule_id: string
    status: string
    details: any
    created_at: string
  }>
}

export function CondoDashboardClient({ condo, counts, alerts }: CondoDashboardClientProps) {
  const isMobile = useIsMobile()
  
  const region = condo.region_id ? getRegionById(condo.region_id) : null
  const commune = condo.region_id && condo.commune_id ? getCommuneById(condo.region_id, condo.commune_id) : null
  const openAlerts = alerts.filter((alert) => alert.status === "open")

  if (isMobile) {
    return (
      <div className="space-y-4 px-2">
        {/* Header con información del condominio */}
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" />
              {condo.name}
            </CardTitle>
            <CardDescription className="space-y-1">
              {condo.address && <div className="text-sm">{condo.address}</div>}
              {commune && <div className="text-sm">{commune.name}</div>}
              {region && <div className="text-sm">{region.name}</div>}
              {!condo.address && !commune && !region && condo.comuna && (
                <div className="text-sm">{condo.comuna}</div>
              )}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* KPIs - Grid de 2x2 para móviles */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="rounded-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium">Asambleas</CardTitle>
                <Calendar className="h-3 w-3 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl font-bold">{counts.assemblies}</div>
              <p className="text-xs text-muted-foreground">total</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium">Planes</CardTitle>
                <FileText className="h-3 w-3 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl font-bold">{counts.plans}</div>
              <p className="text-xs text-muted-foreground">total</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium">Certificaciones</CardTitle>
                <Shield className="h-3 w-3 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl font-bold">{counts.certifications}</div>
              <p className="text-xs text-muted-foreground">total</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium">Seguros</CardTitle>
                <Shield className="h-3 w-3 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl font-bold">{counts.insurances}</div>
              <p className="text-xs text-muted-foreground">total</p>
            </CardContent>
          </Card>
        </div>

        {/* Información del condominio - Compacta */}
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Destino/Uso</span>
                <span className="text-sm font-medium text-right">
                  {condo.destino_uso ? 
                    condo.destino_uso.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ') : 
                    'No especificado'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Copropietarios - Compacto */}
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Copropietarios
              </CardTitle>
              <CopropietariosEditButton 
                condoId={condo.id} 
                currentCount={condo.cantidad_copropietarios} 
                condoName={condo.name}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {condo.cantidad_copropietarios || 'No definido'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {condo.cantidad_copropietarios ? 
                    `Total registrados` : 
                    'No configurado'
                  }
                </p>
              </div>
              {condo.cantidad_copropietarios && (
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {Math.ceil(condo.cantidad_copropietarios * 0.33)}
                  </div>
                  <div className="text-xs text-muted-foreground">33% quórum</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quorum Rules - Compacto */}
        <QuorumRules cantidadCopropietarios={condo.cantidad_copropietarios} />

        {/* Compliance Overview - Compacto */}
        <ComplianceOverview alerts={alerts} />

        {/* Compliance Actions - Compacto */}
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Evaluación de Cumplimiento</CardTitle>
                <CardDescription className="text-xs">Ejecuta evaluación automática</CardDescription>
              </div>
              <RecalculateComplianceButton condoId={condo.id} />
            </div>
          </CardHeader>
          <CardContent>
            {alerts.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {openAlerts.length} alertas activas
                  </span>
                </div>
                <div className="space-y-2">
                  {alerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{alert.rule_id}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {alert.details && typeof alert.details === "object" && "message" in alert.details
                            ? String(alert.details.message)
                            : "Regla de cumplimiento"}
                        </div>
                      </div>
                      <Badge 
                        variant={alert.status === "open" ? "destructive" : "default"} 
                        className="ml-2 text-xs"
                      >
                        {alert.status === "open" ? "Incumplimiento" : "Cumple"}
                      </Badge>
                    </div>
                  ))}
                  {alerts.length > 3 && (
                    <div className="text-center text-xs text-muted-foreground py-2">
                      +{alerts.length - 3} alertas más
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                <h3 className="text-sm font-semibold mb-2">No hay evaluaciones</h3>
                <p className="text-xs text-muted-foreground">
                  Ejecuta la evaluación para ver resultados
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Versión desktop (original)
  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asambleas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.assemblies}</div>
            <p className="text-xs text-muted-foreground">registros totales</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planes de Emergencia</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.plans}</div>
            <p className="text-xs text-muted-foreground">registros totales</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificaciones</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.certifications}</div>
            <p className="text-xs text-muted-foreground">registros totales</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seguros</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.insurances}</div>
            <p className="text-xs text-muted-foreground">registros totales</p>
          </CardContent>
        </Card>
      </div>

      {/* Condo Information */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🏢</span>
            Información del Condominio
          </CardTitle>
          <CardDescription>Datos generales y configuración del condominio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Nombre</h4>
              <p className="text-lg font-semibold">{condo.name}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Ubicación</h4>
              <div className="space-y-1">
                {condo.address && <p className="text-sm">{condo.address}</p>}
                {commune && <p className="text-sm">{commune.name}</p>}
                {region && <p className="text-sm">{region.name}</p>}
                {!condo.address && !commune && !region && condo.comuna && (
                  <p className="text-sm">{condo.comuna}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Destino/Uso</h4>
              <p className="text-lg font-semibold">
                {condo.destino_uso ? 
                  condo.destino_uso.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ') : 
                  'No especificado'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Copropietarios Information */}
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span>👥</span>
                Copropietarios
              </CardTitle>
              <CardDescription>Gestión de copropietarios para cálculo de quórum</CardDescription>
            </div>
            <CopropietariosEditButton 
              condoId={condo.id} 
              currentCount={condo.cantidad_copropietarios} 
              condoName={condo.name}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-primary">
                {condo.cantidad_copropietarios || 'No definido'}
              </div>
              <p className="text-sm text-muted-foreground">
                {condo.cantidad_copropietarios ? 
                  `Total de copropietarios registrados` : 
                  'Cantidad no configurada'
                }
              </p>
            </div>
            {condo.cantidad_copropietarios && (
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Asamblea ordinaria</div>
                <div className="text-lg font-semibold">
                  {Math.ceil(condo.cantidad_copropietarios * 0.33)} copropietarios
                </div>
                <div className="text-xs text-muted-foreground">(33% para constituir sesión)</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quorum Rules */}
      <QuorumRules cantidadCopropietarios={condo.cantidad_copropietarios} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Compliance Overview */}
        <ComplianceOverview alerts={alerts} />

        {/* Compliance Actions */}
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Evaluación de Cumplimiento</CardTitle>
                <CardDescription>Ejecuta la evaluación automática de reglas</CardDescription>
              </div>
              <RecalculateComplianceButton condoId={condo.id} />
            </div>
          </CardHeader>
          <CardContent>
            {alerts.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  <span className="font-medium">
                    {openAlerts.length} alertas activas de {alerts.length} reglas evaluadas
                  </span>
                </div>
                <div className="grid gap-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{alert.rule_id}</span>
                          <span className="text-sm text-muted-foreground">
                            {alert.details && typeof alert.details === "object" && "message" in alert.details
                              ? String(alert.details.message)
                              : "Regla de cumplimiento"}
                          </span>
                        </div>
                      </div>
                      <Badge variant={alert.status === "open" ? "destructive" : "default"} className="rounded-lg">
                        {alert.status === "open" ? "Incumplimiento" : "Cumple"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay evaluaciones de cumplimiento</h3>
                <p className="text-muted-foreground mb-4">
                  Haz clic en "Recalcular Cumplimiento" para evaluar las reglas
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}














