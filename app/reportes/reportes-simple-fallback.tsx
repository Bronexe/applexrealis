"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts"
import { 
  FileText, 
  Users, 
  FileCheck, 
  Shield, 
  Calendar, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
  ClipboardList
} from "lucide-react"

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
  include_contracts: boolean
  include_copropietarios: boolean
  include_gestiones: boolean
  date_from: string
  date_to: string
  custom_title: string
  custom_description: string
  include_expired: boolean
  include_expiring_soon: boolean
  expiring_days: number
}

interface ComplianceStats {
  totalDocuments: number
  expiredDocuments: number
  expiringSoon: number
  compliantDocuments: number
  complianceRate: number
  contractsCount: number
  copropietariosCount: number
}

interface ChartData {
  name: string
  value: number
  color: string
}

interface ReportesSimpleFallbackProps {
  condos: Condo[]
  hasError: boolean
}

export function ReportesSimpleFallback({ condos, hasError }: ReportesSimpleFallbackProps) {
  const [reportData, setReportData] = useState<ReportData>({
    condo_id: "",
    include_assemblies: true,
    include_plans: true,
    include_certifications: true,
    include_insurances: true,
    include_contracts: true,
    include_copropietarios: true,
    include_gestiones: true,
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
  const [complianceStats, setComplianceStats] = useState<ComplianceStats | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const { toast } = useToast()

  // Colores del proyecto (dorado/amber)
  const COLORS = {
    primary: '#BF7F11',
    secondary: '#D4AF37',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6'
  }

  const pieColors = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.danger]

  // Cargar estadísticas de cumplimiento cuando se selecciona un condominio
  useEffect(() => {
    if (reportData.condo_id) {
      loadComplianceStats(reportData.condo_id)
    }
  }, [reportData.condo_id])

  const loadComplianceStats = async (condoId: string) => {
    try {
      const response = await fetch(`/api/reports/compliance-stats?condo_id=${condoId}`)
      if (response.ok) {
        const stats = await response.json()
        setComplianceStats(stats)
        
        // Preparar datos para gráficos
        const chartData = [
          { name: 'Documentos Válidos', value: stats.compliantDocuments, color: COLORS.success },
          { name: 'Vencidos', value: stats.expiredDocuments, color: COLORS.danger },
          { name: 'Próximos a Vencer', value: stats.expiringSoon, color: COLORS.warning }
        ]
        setChartData(chartData)
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    }
  }

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
          !reportData.include_certifications && !reportData.include_insurances &&
          !reportData.include_contracts && !reportData.include_copropietarios && 
          !reportData.include_gestiones) {
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

  const handleExamplePDF = async () => {
    try {
      // Descargar PDF de ejemplo
      const response = await fetch("/api/reports/example")
      
      if (!response.ok) {
        throw new Error("Error al generar el PDF de ejemplo")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "reporte-ejemplo-lex-realis.pdf"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "PDF de ejemplo descargado",
        description: "Se ha descargado un PDF de ejemplo para verificar la funcionalidad",
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al generar el PDF de ejemplo"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const updateReportData = (key: keyof ReportData, value: any) => {
    setReportData(prev => ({ ...prev, [key]: value }))
  }

  const selectedCondo = condos.find(c => c.id === reportData.condo_id)

  return (
    <div className="space-y-6">
      {/* Header mejorado con identidad visual */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 p-8 border border-primary/20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-primary">Reportes de Cumplimiento</h2>
              <p className="text-muted-foreground">Genera reportes personalizados en PDF con estadísticas visuales</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Badge variant="outline" className="border-primary/30 text-primary">
              <CheckCircle className="h-3 w-3 mr-1" />
              Incluye Gráficos
            </Badge>
            <Badge variant="outline" className="border-primary/30 text-primary">
              <Users className="h-3 w-3 mr-1" />
              Copropietarios
            </Badge>
            <Badge variant="outline" className="border-primary/30 text-primary">
              <FileText className="h-3 w-3 mr-1" />
              Contratos
            </Badge>
          </div>
        </div>
      </div>

      {/* Mensaje de error si hay problemas con la base de datos */}
      {hasError && (
        <Card className="rounded-2xl border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive mb-4">
              <span className="text-2xl">⚠️</span>
              <h3 className="font-semibold">Problema con la Base de Datos</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              No se pudieron cargar los condominios. Esto puede deberse a:
            </p>
            <ul className="list-disc list-inside mb-4 text-sm text-muted-foreground space-y-1">
              <li>La tabla 'condos' no existe en la base de datos</li>
              <li>No hay permisos para acceder a los datos</li>
              <li>Problemas de conectividad con la base de datos</li>
              <li>Políticas RLS (Row Level Security) mal configuradas</li>
            </ul>
            
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Soluciones:</h4>
              <div className="space-y-2">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/dashboard">
                    <span className="mr-2">🏠</span>
                    Ir al Dashboard
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/condos/new">
                    <span className="mr-2">🏢</span>
                    Crear Condominio
                  </Link>
                </Button>
              </div>
              
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <span>🔧</span>
                  Para Desarrolladores:
                </h5>
                <p className="text-xs text-muted-foreground">
                  Ejecuta el script <code className="bg-muted px-1 rounded">scripts/fix_database_issues.sql</code> en Supabase SQL Editor para diagnosticar y corregir problemas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="max-w-4xl">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
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

              {/* Estadísticas de Cumplimiento */}
              {complianceStats && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <Label className="text-lg font-semibold">Estadísticas de Cumplimiento</Label>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-success">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span className="text-sm font-medium">Documentos Válidos</span>
                        </div>
                        <p className="text-2xl font-bold text-success mt-1">{complianceStats.compliantDocuments}</p>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-danger">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-danger" />
                          <span className="text-sm font-medium">Vencidos</span>
                        </div>
                        <p className="text-2xl font-bold text-danger mt-1">{complianceStats.expiredDocuments}</p>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-warning">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-warning" />
                          <span className="text-sm font-medium">Próximos a Vencer</span>
                        </div>
                        <p className="text-2xl font-bold text-warning mt-1">{complianceStats.expiringSoon}</p>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">% Cumplimiento</span>
                        </div>
                        <p className="text-2xl font-bold text-primary mt-1">{complianceStats.complianceRate.toFixed(1)}%</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Gráficos */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gráfico de Barras */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart className="h-5 w-5 text-primary" />
                          Estado de Documentos
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="value" fill={COLORS.primary} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Gráfico Circular */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PieChart className="h-5 w-5 text-primary" />
                          Distribución de Cumplimiento
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}`}
                              >
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Información adicional */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Building className="h-4 w-4 text-primary" />
                          <span className="font-medium">Contratos Activos</span>
                        </div>
                        <p className="text-2xl font-bold text-primary">{complianceStats.contractsCount}</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="font-medium">Copropietarios</span>
                        </div>
                        <p className="text-2xl font-bold text-primary">{complianceStats.copropietariosCount}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Tipos de Documentos */}
              <div className="grid gap-2">
                <Label>Tipos de Documentos a Incluir *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6 border rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5">
                  <div className="flex items-center space-x-3 p-3 rounded-xl bg-background/80 hover:bg-primary/5 transition-colors">
                    <Checkbox
                      id="assemblies"
                      checked={reportData.include_assemblies}
                      onCheckedChange={(checked) => updateReportData("include_assemblies", checked)}
                      className="border-primary/30"
                    />
                    <Label htmlFor="assemblies" className="flex items-center gap-2 cursor-pointer">
                      <Calendar className="h-4 w-4 text-primary" />
                      Asambleas
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 rounded-xl bg-background/80 hover:bg-primary/5 transition-colors">
                    <Checkbox
                      id="plans"
                      checked={reportData.include_plans}
                      onCheckedChange={(checked) => updateReportData("include_plans", checked)}
                      className="border-primary/30"
                    />
                    <Label htmlFor="plans" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="h-4 w-4 text-primary" />
                      Planes de Emergencia
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 rounded-xl bg-background/80 hover:bg-primary/5 transition-colors">
                    <Checkbox
                      id="certifications"
                      checked={reportData.include_certifications}
                      onCheckedChange={(checked) => updateReportData("include_certifications", checked)}
                      className="border-primary/30"
                    />
                    <Label htmlFor="certifications" className="flex items-center gap-2 cursor-pointer">
                      <FileCheck className="h-4 w-4 text-primary" />
                      Certificaciones
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 rounded-xl bg-background/80 hover:bg-primary/5 transition-colors">
                    <Checkbox
                      id="insurances"
                      checked={reportData.include_insurances}
                      onCheckedChange={(checked) => updateReportData("include_insurances", checked)}
                      className="border-primary/30"
                    />
                    <Label htmlFor="insurances" className="flex items-center gap-2 cursor-pointer">
                      <Shield className="h-4 w-4 text-primary" />
                      Seguros
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-xl bg-background/80 hover:bg-primary/5 transition-colors">
                    <Checkbox
                      id="contracts"
                      checked={reportData.include_contracts}
                      onCheckedChange={(checked) => updateReportData("include_contracts", checked)}
                      className="border-primary/30"
                    />
                    <Label htmlFor="contracts" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="h-4 w-4 text-primary" />
                      Contratos
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-xl bg-background/80 hover:bg-primary/5 transition-colors">
                    <Checkbox
                      id="copropietarios"
                      checked={reportData.include_copropietarios}
                      onCheckedChange={(checked) => updateReportData("include_copropietarios", checked)}
                      className="border-primary/30"
                    />
                    <Label htmlFor="copropietarios" className="flex items-center gap-2 cursor-pointer">
                      <Users className="h-4 w-4 text-primary" />
                      Copropietarios
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-xl bg-background/80 hover:bg-primary/5 transition-colors">
                    <Checkbox
                      id="gestiones"
                      checked={reportData.include_gestiones}
                      onCheckedChange={(checked) => updateReportData("include_gestiones", checked)}
                      className="border-primary/30"
                    />
                    <Label htmlFor="gestiones" className="flex items-center gap-2 cursor-pointer">
                      <ClipboardList className="h-4 w-4 text-primary" />
                      Gestiones
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
                        reportData.include_insurances && "Seguros",
                        reportData.include_contracts && "Contratos",
                        reportData.include_copropietarios && "Copropietarios",
                        reportData.include_gestiones && "Gestiones"
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

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button 
                  type="submit" 
                  disabled={isLoading || !reportData.condo_id || condos.length === 0} 
                  className="flex-1 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold h-12"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  {isLoading ? "Generando Reporte..." : "Generar Reporte PDF"}
                </Button>
                <Button 
                  type="button" 
                  onClick={handleExamplePDF} 
                  variant="outline" 
                  className="rounded-2xl border-primary/30 text-primary hover:bg-primary/5 h-12"
                >
                  <FileCheck className="mr-2 h-5 w-5" />
                  PDF de Ejemplo
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}