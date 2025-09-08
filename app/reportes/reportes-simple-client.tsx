"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { ReportAnalytics, Download, FileText, Building, Calendar, Shield, FileCheck, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Condo {
  id: string
  name: string
  comuna?: string
}

interface ReportData {
  condo_id: string
  include_assemblies: boolean
  include_plans: boolean
  include_certifications: boolean
  include_insurances: boolean
  date_from: string
  date_to: string
  custom_title: string
  custom_description: string
  include_expired: boolean
  include_expiring_soon: boolean
  expiring_days: number
}

interface ReportesSimpleClientProps {
  condos: Condo[]
  hasError: boolean
}

export function ReportesSimpleClient({ condos, hasError }: ReportesSimpleClientProps) {
  const [reportData, setReportData] = useState<ReportData>({
    condo_id: "",
    include_assemblies: true,
    include_plans: true,
    include_certifications: true,
    include_insurances: true,
    date_from: "",
    date_to: "",
    custom_title: "",
    custom_description: "",
    include_expired: true,
    include_expiring_soon: true,
    expiring_days: 30
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validaciones
      if (!reportData.condo_id) {
        throw new Error("Debe seleccionar un condominio")
      }

      if (!reportData.include_assemblies && !reportData.include_plans && 
          !reportData.include_certifications && !reportData.include_insurances) {
        throw new Error("Debe seleccionar al menos un tipo de documento")
      }

      // Generar el reporte
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      })

      if (!response.ok) {
        throw new Error("Error al generar el reporte")
      }

      // Descargar el archivo PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `reporte-condominio-${reportData.condo_id}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Reporte generado",
        description: "El reporte se ha generado y descargado correctamente",
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al generar el reporte"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateReportData = (key: keyof ReportData, value: any) => {
    setReportData(prev => ({ ...prev, [key]: value }))
  }

  const selectedCondo = condos.find(c => c.id === reportData.condo_id)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reportes</h2>
        <p className="text-muted-foreground">Genera reportes personalizados en PDF con la información de cada condominio</p>
      </div>

      {/* Mensaje de error si hay problemas con la base de datos */}
      {hasError && (
        <Card className="rounded-2xl border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <h3 className="font-semibold">Problema con la base de datos</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              No se pudieron cargar los condominios. Esto puede deberse a:
            </p>
            <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
              <li>La tabla 'condos' no existe en la base de datos</li>
              <li>No hay permisos para acceder a los datos</li>
              <li>Problemas de conectividad con la base de datos</li>
            </ul>
            <div className="mt-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">
                  Ir al Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="max-w-4xl">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ReportAnalytics className="h-5 w-5" />
              Generador de Reportes
            </CardTitle>
            <CardDescription>
              Configura y genera reportes personalizados con la información del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selección de Condominio */}
              <div className="grid gap-2">
                <Label htmlFor="condo">Condominio *</Label>
                <Select
                  value={reportData.condo_id}
                  onValueChange={(value) => updateReportData("condo_id", value)}
                  disabled={condos.length === 0}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder={condos.length === 0 ? "No hay condominios disponibles" : "Selecciona un condominio"} />
                  </SelectTrigger>
                  <SelectContent>
                    {condos.length > 0 ? (
                      condos.map((condo) => (
                        <SelectItem key={condo.id} value={condo.id}>
                          {condo.name} - {condo.comuna || 'Sin comuna'}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-condos" disabled>
                        No hay condominios disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {condos.length === 0 && (
                  <div className="p-3 border rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      No hay condominios registrados. 
                      <Link href="/condos/new" className="text-primary hover:underline ml-1">
                        Crea un condominio primero
                      </Link> para generar reportes.
                    </p>
                  </div>
                )}
              </div>

              {/* Tipos de Documentos */}
              <div className="grid gap-2">
                <Label>Tipos de Documentos a Incluir *</Label>
                <div className="grid grid-cols-2 gap-4 p-4 border rounded-xl bg-muted/50">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="assemblies"
                      checked={reportData.include_assemblies}
                      onCheckedChange={(checked) => updateReportData("include_assemblies", checked)}
                    />
                    <Label htmlFor="assemblies" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Asambleas
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="plans"
                      checked={reportData.include_plans}
                      onCheckedChange={(checked) => updateReportData("include_plans", checked)}
                    />
                    <Label htmlFor="plans" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Planes de Emergencia
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="certifications"
                      checked={reportData.include_certifications}
                      onCheckedChange={(checked) => updateReportData("include_certifications", checked)}
                    />
                    <Label htmlFor="certifications" className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4" />
                      Certificaciones
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="insurances"
                      checked={reportData.include_insurances}
                      onCheckedChange={(checked) => updateReportData("include_insurances", checked)}
                    />
                    <Label htmlFor="insurances" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Seguros
                    </Label>
                  </div>
                </div>
              </div>

              {/* Rango de Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date_from">Fecha Desde</Label>
                  <Input
                    id="date_from"
                    type="date"
                    value={reportData.date_from}
                    onChange={(e) => updateReportData("date_from", e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="date_to">Fecha Hasta</Label>
                  <Input
                    id="date_to"
                    type="date"
                    value={reportData.date_to}
                    onChange={(e) => updateReportData("date_to", e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Filtros de Vencimiento */}
              <div className="space-y-4">
                <Label>Filtros de Vencimiento</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-xl bg-muted/50">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="expired"
                      checked={reportData.include_expired}
                      onCheckedChange={(checked) => updateReportData("include_expired", checked)}
                    />
                    <Label htmlFor="expired">Incluir documentos vencidos</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="expiring"
                      checked={reportData.include_expiring_soon}
                      onCheckedChange={(checked) => updateReportData("include_expiring_soon", checked)}
                    />
                    <Label htmlFor="expiring">Incluir documentos próximos a vencer</Label>
                  </div>
                </div>

                {reportData.include_expiring_soon && (
                  <div className="grid gap-2">
                    <Label htmlFor="expiring_days">Días para considerar "próximo a vencer"</Label>
                    <Select
                      value={reportData.expiring_days.toString()}
                      onValueChange={(value) => updateReportData("expiring_days", parseInt(value))}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 días</SelectItem>
                        <SelectItem value="15">15 días</SelectItem>
                        <SelectItem value="30">30 días</SelectItem>
                        <SelectItem value="60">60 días</SelectItem>
                        <SelectItem value="90">90 días</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Personalización del Reporte */}
              <div className="space-y-4">
                <Label>Personalización del Reporte</Label>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="custom_title">Título Personalizado</Label>
                    <Input
                      id="custom_title"
                      type="text"
                      placeholder="Ej: Reporte de Cumplimiento - Enero 2024"
                      value={reportData.custom_title}
                      onChange={(e) => updateReportData("custom_title", e.target.value)}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="custom_description">Descripción Personalizada</Label>
                    <Textarea
                      id="custom_description"
                      placeholder="Descripción adicional del reporte..."
                      value={reportData.custom_description}
                      onChange={(e) => updateReportData("custom_description", e.target.value)}
                      className="rounded-xl"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Vista Previa */}
              {selectedCondo && (
                <div className="p-4 border rounded-xl bg-muted/50">
                  <h4 className="font-medium mb-2">Vista Previa del Reporte</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Condominio:</strong> {selectedCondo.name}</p>
                    <p><strong>Comuna:</strong> {selectedCondo.comuna || 'Sin comuna'}</p>
                    <p><strong>Documentos incluidos:</strong> {
                      [
                        reportData.include_assemblies && "Asambleas",
                        reportData.include_plans && "Planes de Emergencia",
                        reportData.include_certifications && "Certificaciones",
                        reportData.include_insurances && "Seguros"
                      ].filter(Boolean).join(", ")
                    }</p>
                    {reportData.date_from && reportData.date_to && (
                      <p><strong>Período:</strong> {new Date(reportData.date_from).toLocaleDateString("es-CL")} - {new Date(reportData.date_to).toLocaleDateString("es-CL")}</p>
                    )}
                    {reportData.custom_title && (
                      <p><strong>Título:</strong> {reportData.custom_title}</p>
                    )}
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading || !reportData.condo_id || condos.length === 0} className="rounded-xl">
                  <Download className="mr-2 h-4 w-4" />
                  {isLoading ? "Generando..." : "Generar Reporte PDF"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
