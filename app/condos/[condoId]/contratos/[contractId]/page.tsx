"use client"

import React, { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Edit, Download, Building, Calendar, DollarSign, FileText, Phone, Mail, MapPin } from "lucide-react"
import Link from "next/link"

interface ContractDetailsPageProps {
  params: Promise<{ condoId: string; contractId: string }>
}

export default function ContractDetailsPage({ params }: ContractDetailsPageProps) {
  const { condoId, contractId } = React.use(params)
  const [contract, setContract] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadContract = async () => {
      try {
        const supabase = createClient()
        
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          redirect("/auth/login")
          return
        }

        // Get contract details
        const { data: contractData, error: contractError } = await supabase
          .from("contracts")
          .select("*")
          .eq("id", contractId)
          .eq("condo_id", condoId)
          .single()

        if (contractError || !contractData) {
          redirect(`/condos/${condoId}/contratos`)
          return
        }

        setContract(contractData)
      } catch (err) {
        console.error("Error loading contract:", err)
        setError("Error al cargar el contrato")
      } finally {
        setIsLoading(false)
      }
    }

    loadContract()
  }, [condoId, contractId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando contrato...</p>
        </div>
      </div>
    )
  }

  if (error || !contract) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Error al cargar el contrato</h2>
        <p className="text-muted-foreground mb-4">{error || "El contrato no existe o no tienes permisos para verlo"}</p>
        <Button asChild className="rounded-xl">
          <Link href={`/condos/${condoId}/contratos`}>Volver a Contratos</Link>
        </Button>
      </div>
    )
  }

  const getContractTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'mantenimiento_ascensores': 'Mantenimiento de ascensores',
      'mantenimiento_calderas': 'Mantenimiento de calderas y calefacción',
      'mantenimiento_generadores': 'Mantenimiento de grupos electrógenos / generadores',
      'mantenimiento_bombas': 'Mantenimiento de bombas de agua / hidroneumáticos',
      'mantenimiento_incendios': 'Mantenimiento de sistemas contra incendios',
      'mantenimiento_portones': 'Mantenimiento de portones automáticos y barreras',
      'mantenimiento_jardines': 'Mantenimiento de jardines y áreas verdes',
      'mantenimiento_piscinas': 'Mantenimiento de piscinas',
      'limpieza_comunes': 'Limpieza de espacios comunes',
      'limpieza_vidrios': 'Limpieza de vidrios en altura',
      'control_plagas': 'Control de plagas y desratización',
      'servicios_conserjeria': 'Servicios de conserjería',
      'seguridad_privada': 'Seguridad privada / guardias',
      'monitoreo_cctv': 'Monitoreo CCTV y alarmas',
      'internet_redes': 'Internet y redes de comunicación',
      'plataforma_admin': 'Plataforma de administración de edificios',
      'mantenimiento_antenas': 'Mantenimiento de antenas o satélites',
      'auditoria_contable': 'Auditoría contable',
      'asesoria_legal': 'Asesoría legal',
      'gestion_seguros': 'Gestión de seguros',
      'compra_insumos': 'Compra de insumos de aseo',
      'compra_repuestos': 'Compra de repuestos técnicos',
      'abastecimiento_gas': 'Abastecimiento de gas o combustible',
      'reparacion_cubiertas': 'Reparación de cubiertas, techos o filtraciones',
      'pintura_fachadas': 'Pintura de fachadas y áreas comunes',
      'obras_accesibilidad': 'Obras de accesibilidad',
      'eventos_decoracion': 'Eventos y decoración de temporada',
      'paneles_solares': 'Instalación de paneles solares o eficiencia energética'
    }
    return types[type] || type
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vigente':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'vencido':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'en_renovacion':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'en_revision':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'vigente':
        return 'Vigente'
      case 'vencido':
        return 'Vencido'
      case 'en_renovacion':
        return 'En Renovación'
      case 'en_revision':
        return 'En Revisión'
      default:
        return status
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'pago_unico':
        return 'Pago único'
      case 'mensual':
        return 'Mensual'
      case 'contra_entrega':
        return 'Contra entrega'
      case 'otros':
        return 'Otros'
      default:
        return method
    }
  }

  const getDurationTypeLabel = (type: string) => {
    switch (type) {
      case 'renovacion_automatica':
        return 'Renovación automática'
      case 'termino_definido':
        return 'Término definido'
      default:
        return type
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency === 'CLP' ? 'CLP' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const handleDownload = async () => {
    if (!contract.contract_file_url) return

    try {
      const supabase = createClient()
      const { data, error } = await supabase.storage
        .from("evidence")
        .createSignedUrl(contract.contract_file_url, 3600)

      if (error) throw error

      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank")
      }
    } catch (error) {
      console.error("Error downloading file:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-xl bg-transparent">
            <Link href={`/condos/${condoId}/contratos`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Contrato {contract.contract_number}</h1>
            <p className="text-muted-foreground">Detalles del contrato con {contract.provider_name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href={`/condos/${condoId}/contratos/${contractId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          {contract.contract_file_url && (
            <Button onClick={handleDownload} variant="outline" className="rounded-xl">
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información del Contrato */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Información del Contrato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Número de Contrato</Label>
                  <p className="text-lg font-semibold">{contract.contract_number}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                  <div className="mt-1">
                    <Badge className={`rounded-lg ${getStatusColor(contract.status)}`}>
                      {getStatusLabel(contract.status)}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Tipo de Contrato</Label>
                <p className="text-lg font-semibold">{getContractTypeLabel(contract.contract_type)}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fecha de Inicio</Label>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(contract.start_date).toLocaleDateString("es-CL")}
                  </p>
                </div>
                {contract.end_date && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Fecha de Término</Label>
                    <p className="text-lg font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(contract.end_date).toLocaleDateString("es-CL")}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Duración / Vigencia</Label>
                <p className="text-lg font-semibold">{getDurationTypeLabel(contract.duration_type)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Información Financiera */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Información Financiera
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Monto Total</Label>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(contract.total_amount, contract.currency)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Impuestos</Label>
                  <p className="text-lg font-semibold">
                    {formatCurrency(contract.tax_amount, contract.currency)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Monto Neto</Label>
                  <p className="text-lg font-semibold">
                    {formatCurrency(contract.net_amount, contract.currency)}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Moneda</Label>
                  <p className="text-lg font-semibold">{contract.currency}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Forma de Pago</Label>
                  <p className="text-lg font-semibold">{getPaymentMethodLabel(contract.payment_method)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información del Proveedor */}
        <div className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Proveedor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Razón Social</Label>
                <p className="text-lg font-semibold">{contract.provider_name}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">RUT</Label>
                <p className="text-lg font-semibold">{contract.provider_rut}</p>
              </div>

              {contract.provider_address && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Domicilio
                  </Label>
                  <p className="text-sm">{contract.provider_address}</p>
                </div>
              )}

              {contract.provider_phone && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Teléfono
                  </Label>
                  <p className="text-sm">{contract.provider_phone}</p>
                </div>
              )}

              {contract.provider_email && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Correo
                  </Label>
                  <p className="text-sm">{contract.provider_email}</p>
                </div>
              )}

            </CardContent>
          </Card>

          {/* Metadatos */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Creado</Label>
                <p className="text-sm">{new Date(contract.created_at).toLocaleString("es-CL")}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Última actualización</Label>
                <p className="text-sm">{new Date(contract.updated_at).toLocaleString("es-CL")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
