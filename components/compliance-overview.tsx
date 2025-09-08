"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react"

interface ComplianceOverviewProps {
  alerts: Array<{
    id: string
    rule_id: string
    status: "open" | "ok"
    details: any
    created_at: string
  }>
}

export function ComplianceOverview({ alerts }: ComplianceOverviewProps) {
  const totalRules = alerts.length
  const compliantRules = alerts.filter((alert) => alert.status === "ok").length
  const nonCompliantRules = alerts.filter((alert) => alert.status === "open").length
  const compliancePercentage = totalRules > 0 ? Math.round((compliantRules / totalRules) * 100) : 0

  const getComplianceStatus = () => {
    if (compliancePercentage === 100) return { label: "Excelente", color: "text-green-600", icon: CheckCircle }
    if (compliancePercentage >= 75) return { label: "Bueno", color: "text-blue-600", icon: Clock }
    if (compliancePercentage >= 50) return { label: "Regular", color: "text-yellow-600", icon: AlertTriangle }
    return { label: "Crítico", color: "text-red-600", icon: XCircle }
  }

  const status = getComplianceStatus()
  const StatusIcon = status.icon

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className={`h-5 w-5 ${status.color}`} />
          Resumen de Cumplimiento
        </CardTitle>
        <CardDescription>Estado general del cumplimiento normativo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-2xl font-bold">{compliancePercentage}%</p>
            <p className="text-sm text-muted-foreground">Nivel de cumplimiento</p>
          </div>
          <Badge variant={compliancePercentage >= 75 ? "default" : "destructive"} className="rounded-lg">
            {status.label}
          </Badge>
        </div>

        <Progress value={compliancePercentage} className="h-2" />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span>{compliantRules} Cumpliendo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span>{nonCompliantRules} Incumpliendo</span>
          </div>
        </div>

        {nonCompliantRules > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium text-destructive mb-2">Acciones Requeridas:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {alerts
                .filter((alert) => alert.status === "open")
                .map((alert) => (
                  <li key={alert.id} className="flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
                    <span>
                      {alert.details && typeof alert.details === "object" && "message" in alert.details
                        ? String(alert.details.message)
                        : `Revisar ${alert.rule_id}`}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
