import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Shield, AlertTriangle, Calendar } from "lucide-react"
import { RecalculateComplianceButton } from "@/components/recalculate-compliance-button"
import { ComplianceOverview } from "@/components/compliance-overview"
import { CopropietariosEditButton } from "@/components/copropietarios-edit-button"
import { QuorumRules } from "@/components/quorum-rules"

export default async function CondoDashboardPage({ params }: { params: Promise<{ condoId: string }> }) {
  const { condoId } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Get condo information and counts for each module
  const [condoResult, assembliesResult, plansResult, certificationsResult, insurancesResult, alertsResult] = await Promise.all([
    supabase.from("condos").select("id, name, comuna, cantidad_copropietarios, destino_uso").eq("id", condoId).single(),
    supabase.from("assemblies").select("id", { count: "exact" }).eq("condo_id", condoId),
    supabase.from("emergency_plans").select("id", { count: "exact" }).eq("condo_id", condoId),
    supabase.from("certifications").select("id", { count: "exact" }).eq("condo_id", condoId),
    supabase.from("insurances").select("id", { count: "exact" }).eq("condo_id", condoId),
    supabase
      .from("alerts")
      .select("id, rule_id, status, details, created_at")
      .eq("condo_id", condoId)
      .order("created_at", { ascending: false }),
  ])

  if (condoResult.error) {
    redirect("/dashboard")
  }

  const condo = condoResult.data

  const assembliesCount = assembliesResult.count || 0
  const plansCount = plansResult.count || 0
  const certificationsCount = certificationsResult.count || 0
  const insurancesCount = insurancesResult.count || 0
  const alerts = alertsResult.data || []
  const openAlerts = alerts.filter((alert) => alert.status === "open")

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
            <div className="text-2xl font-bold">{assembliesCount}</div>
            <p className="text-xs text-muted-foreground">registros totales</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planes de Emergencia</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plansCount}</div>
            <p className="text-xs text-muted-foreground">registros totales</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificaciones</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificationsCount}</div>
            <p className="text-xs text-muted-foreground">registros totales</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seguros</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insurancesCount}</div>
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
              <h4 className="font-medium text-sm text-muted-foreground">Comuna</h4>
              <p className="text-lg font-semibold">{condo.comuna || 'No especificada'}</p>
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
              condoId={condoId} 
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
              <RecalculateComplianceButton condoId={condoId} />
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
