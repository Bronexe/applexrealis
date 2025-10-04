"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { EvidenceUploader } from "@/components/evidence-uploader"

interface EditContractPageProps {
  params: Promise<{ condoId: string; contractId: string }>
}

export default function EditContractPage({ params }: EditContractPageProps) {
  const { condoId, contractId } = React.use(params)
  const [contract, setContract] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Form state
  const [contractNumber, setContractNumber] = useState("")
  const [contractType, setContractType] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [durationType, setDurationType] = useState<"renovacion_automatica" | "termino_definido">("termino_definido")
  const [currency, setCurrency] = useState("CLP")
  const [totalAmount, setTotalAmount] = useState("")
  const [taxAmount, setTaxAmount] = useState("")
  const [netAmount, setNetAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [providerName, setProviderName] = useState("")
  const [providerRut, setProviderRut] = useState("")
  const [providerAddress, setProviderAddress] = useState("")
  const [providerPhone, setProviderPhone] = useState("")
  const [providerEmail, setProviderEmail] = useState("")
  const [status, setStatus] = useState<"vigente" | "vencido" | "suspendido" | "finalizado" | "cancelado">("vigente")
  const [fileUrl, setFileUrl] = useState<string | null>(null)

  const contractTypes = [
    { value: "mantenimiento_ascensores", label: "Mantenimiento de ascensores" },
    { value: "mantenimiento_calderas", label: "Mantenimiento de calderas y calefacción" },
    { value: "mantenimiento_generadores", label: "Mantenimiento de grupos electrógenos / generadores" },
    { value: "mantenimiento_bombas", label: "Mantenimiento de bombas de agua / hidroneumáticos" },
    { value: "mantenimiento_incendios", label: "Mantenimiento de sistemas contra incendios" },
    { value: "mantenimiento_portones", label: "Mantenimiento de portones automáticos y barreras" },
    { value: "mantenimiento_jardines", label: "Mantenimiento de jardines y áreas verdes" },
    { value: "mantenimiento_piscinas", label: "Mantenimiento de piscinas" },
    { value: "limpieza_comunes", label: "Limpieza de espacios comunes" },
    { value: "limpieza_vidrios", label: "Limpieza de vidrios en altura" },
    { value: "control_plagas", label: "Control de plagas y desratización" },
    { value: "servicios_conserjeria", label: "Servicios de conserjería" },
    { value: "seguridad_privada", label: "Seguridad privada / guardias" },
    { value: "monitoreo_cctv", label: "Monitoreo CCTV y alarmas" },
    { value: "internet_redes", label: "Internet y redes de comunicación" },
    { value: "plataforma_admin", label: "Plataforma de administración de edificios" },
    { value: "mantenimiento_antenas", label: "Mantenimiento de antenas o satélites" },
    { value: "auditoria_contable", label: "Auditoría contable" },
    { value: "asesoria_legal", label: "Asesoría legal" },
    { value: "gestion_seguros", label: "Gestión de seguros" },
    { value: "compra_insumos", label: "Compra de insumos de aseo" },
    { value: "compra_repuestos", label: "Compra de repuestos técnicos" },
    { value: "abastecimiento_gas", label: "Abastecimiento de gas o combustible" },
    { value: "reparacion_cubiertas", label: "Reparación de cubiertas, techos o filtraciones" },
    { value: "pintura_fachadas", label: "Pintura de fachadas y áreas comunes" },
    { value: "obras_accesibilidad", label: "Obras de accesibilidad" },
    { value: "eventos_decoracion", label: "Eventos y decoración de temporada" },
    { value: "paneles_solares", label: "Instalación de paneles solares o eficiencia energética" }
  ]

  const paymentMethods = [
    { value: "pago_unico", label: "Pago único" },
    { value: "mensual", label: "Mensual" },
    { value: "contra_entrega", label: "Contra entrega" },
    { value: "otros", label: "Otros" }
  ]

  const currencies = [
    { value: "CLP", label: "Peso Chileno (CLP)" },
    { value: "USD", label: "Dólar Americano (USD)" }
  ]

  const statusOptions = [
    { value: "vigente", label: "Vigente" },
    { value: "vencido", label: "Vencido" },
    { value: "suspendido", label: "Suspendido" },
    { value: "finalizado", label: "Finalizado" },
    { value: "cancelado", label: "Cancelado" }
  ]

  // Función para validar RUT chileno
  const validateRut = (rut: string): boolean => {
    if (!/^[0-9]+-[0-9kK]{1}$/.test(rut)) return false
    
    const [body, dv] = rut.split('-')
    const bodyArray = body.split('').reverse().map(Number)
    
    let sum = 0
    let multiplier = 2
    
    for (const digit of bodyArray) {
      sum += digit * multiplier
      multiplier = multiplier === 7 ? 2 : multiplier + 1
    }
    
    const remainder = sum % 11
    const calculatedDv = remainder === 0 ? '0' : remainder === 1 ? 'K' : (11 - remainder).toString()
    
    return dv.toUpperCase() === calculatedDv
  }

  // Cargar datos del contrato
  useEffect(() => {
    const loadContract = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("contracts")
          .select("*")
          .eq("id", contractId)
          .eq("condo_id", condoId)
          .single()

        if (error) throw error

        setContract(data)
        
        // Llenar el formulario con los datos existentes (solo campos que existen en la tabla)
        setContractNumber(data.contract_number || "")
        setContractType(data.contract_type || "")
        setStartDate(data.start_date || "")
        setEndDate(data.end_date || "")
        setCurrency(data.currency || "CLP")
        setTotalAmount(data.amount?.toString() || "") // Usar 'amount' en lugar de 'total_amount'
        setProviderName(data.provider_name || "")
        setStatus(data.status || "vigente")
        setFileUrl(data.contract_file_url || null)
      } catch (error) {
        console.error("Error loading contract:", error)
        setError("No se pudo cargar el contrato")
      } finally {
        setIsLoading(false)
      }
    }

    loadContract()
  }, [contractId, condoId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    console.log('=== INICIO DEL PROCESO DE ACTUALIZACIÓN DE CONTRATO ===')
    console.log('Datos del formulario:', { 
      contractNumber, contractType, startDate, endDate,
      currency, totalAmount, providerName, status, fileUrl, contractId, condoId 
    })

    // Validaciones básicas
    if (!contractNumber) {
      setError("El número de contrato es requerido")
      setIsSaving(false)
      return
    }

    if (!contractType) {
      setError("Debes seleccionar un tipo de contrato")
      setIsSaving(false)
      return
    }

    if (!startDate) {
      setError("La fecha de inicio es requerida")
      setIsSaving(false)
      return
    }

    if (!providerName) {
      setError("El nombre del proveedor es requerido")
      setIsSaving(false)
      return
    }

    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      setError("El monto total debe ser mayor a 0")
      setIsSaving(false)
      return
    }

    try {
      const supabase = createClient()
      console.log('Cliente de Supabase creado correctamente')

      // Verificar autenticación antes de proceder
      console.log('Verificando autenticación...')
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      console.log('Resultado de autenticación:', { user: user?.id, authError })
      
      if (authError) {
        console.error('Error de autenticación:', authError)
        throw new Error(`Error de autenticación: ${authError.message}`)
      }
      
      if (!user) {
        throw new Error("No estás autenticado. Por favor, inicia sesión nuevamente")
      }

      // Preparar datos para actualización (solo campos que existen en la tabla)
      const contractData = {
        contract_number: contractNumber,
        contract_type: contractType,
        start_date: startDate,
        end_date: endDate || null,
        amount: parseFloat(totalAmount),
        currency: currency,
        provider_name: providerName,
        status: status,
        contract_file_url: fileUrl || null,
      }

      console.log('Datos preparados para actualización:', contractData)
      console.log('Usuario autenticado:', user.id)
      console.log('ID del contrato a actualizar:', contractId)
      console.log('ID del condominio:', condoId)

      // Verificar que el contrato existe y pertenece al usuario
      console.log('Verificando que el contrato existe...')
      const { data: existingContract, error: contractError } = await supabase
        .from("contracts")
        .select("id, contract_number, user_id")
        .eq("id", contractId)
        .eq("condo_id", condoId)
        .eq("user_id", user.id)
        .single()

      console.log('Resultado de verificación de contrato:', { existingContract, contractError })

      if (contractError) {
        throw new Error(`El contrato no existe o no tienes permisos para editarlo: ${contractError.message}`)
      }

      // Intentar la actualización
      console.log('Intentando actualizar contrato...')
      const result = await supabase
        .from("contracts")
        .update(contractData)
        .eq("id", contractId)
        .eq("condo_id", condoId)
        .eq("user_id", user.id)
        .select()

      // Capturar datos y error inmediatamente
      const { data, error } = result

      console.log('Resultado completo de actualización:', result)
      console.log('Resultado de actualización:', { data, error })
      console.log('Tipo de error:', typeof error)
      console.log('Error es null/undefined:', error === null || error === undefined)
      console.log('Error keys:', error ? Object.keys(error) : 'N/A')

      // Capturar el error como string inmediatamente para evitar serialización vacía
      const errorString = JSON.stringify(error, null, 2)
      console.log('Error serializado inmediatamente:', errorString)

      // Verificar si hay error usando diferentes métodos
      const hasError = error !== null && error !== undefined
      console.log('¿Hay error?', hasError)
      console.log('Error truthy?', !!error)
      console.log('Error length:', error ? Object.keys(error).length : 'N/A')

      if (hasError) {
        // Logging más detallado
        console.error('=== ANÁLISIS DETALLADO DEL ERROR ===')
        console.error('Error object:', error)
        console.error('Error type:', typeof error)
        console.error('Error constructor:', error?.constructor?.name)
        
        // Verificar si el objeto está realmente vacío
        const errorKeys = Object.keys(error)
        console.error('Error keys:', errorKeys)
        console.error('Error values:', errorKeys.map(key => ({ key, value: error[key] })))
        
        // Intentar acceder a propiedades comunes
        console.error('error.message:', error.message)
        console.error('error.details:', error.details)
        console.error('error.hint:', error.hint)
        console.error('error.code:', error.code)
        
        // Intentar serialización manual
        try {
          console.error('JSON.stringify(error):', JSON.stringify(error, null, 2))
        } catch (e) {
          console.error('Error al serializar:', e)
        }
        
        // Si el objeto está vacío, intentar acceder a propiedades internas
        if (errorKeys.length === 0) {
          console.error('=== OBJETO ERROR VACÍO ===')
          console.error('Intentando acceder a propiedades internas...')
          for (const prop in error) {
            console.error(`error.${prop}:`, error[prop])
          }
        }
        
        // Crear mensaje de error más robusto
        let errorMessage = 'Error desconocido de Supabase'
        let errorDetails = ''
        
        if (error.message) {
          errorMessage = error.message
        } else if (errorKeys.length === 0) {
          errorMessage = 'Error de Supabase con objeto vacío'
          errorDetails = 'El objeto de error está completamente vacío, posible problema de serialización'
        }
        
        if (error.details) {
          errorDetails = `Detalles: ${error.details}`
        } else if (error.hint) {
          errorDetails = `Hint: ${error.hint}`
        } else if (error.code) {
          errorDetails = `Código: ${error.code}`
        }
        
        console.error('=== FIN DEL ANÁLISIS ===')
        
        throw new Error(`Supabase Error: ${errorMessage}. ${errorDetails}`)
      }

      console.log('✅ Contrato actualizado exitosamente:', data)
      router.push(`/condos/${condoId}/contratos/${contractId}`)
    } catch (error: unknown) {
      console.error('=== ERROR CAPTURADO ===')
      console.error('Error completo al actualizar contrato:', error)
      console.error('Tipo de error:', typeof error)
      console.error('Constructor del error:', error?.constructor?.name)
      
      let errorMessage = "Error al actualizar el contrato"
      let errorDetails = ""
      
      // Manejo más robusto de errores
      if (error instanceof Error) {
        errorMessage = error.message
        errorDetails = `Error: ${error.message}`
        console.log('Error message:', error.message)
        console.log('Error stack:', error.stack)
        console.log('Error name:', error.name)
        
        // Proporcionar mensajes más específicos
        if (error.message.includes('permission denied')) {
          errorMessage = "No tienes permisos para actualizar este contrato"
        } else if (error.message.includes('foreign key')) {
          errorMessage = "Error de referencia: el contrato o condominio no existe"
        } else if (error.message.includes('not null')) {
          errorMessage = "Faltan campos requeridos"
        } else if (error.message.includes('unique')) {
          errorMessage = "Ya existe un contrato con este número"
        } else if (error.message.includes('JWT')) {
          errorMessage = "Error de autenticación. Por favor, inicia sesión nuevamente"
        } else if (error.message.includes('RLS')) {
          errorMessage = "Error de permisos. Verifica que tienes acceso a este contrato"
        } else if (error.message.includes('bucket')) {
          errorMessage = "Error del sistema de almacenamiento. Contacta al administrador"
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Error de conexión. Verifica tu conexión a internet"
        }
      } else if (error && typeof error === 'object') {
        // Manejar errores de Supabase que no son instancias de Error
        console.log('Error es un objeto:', error)
        
        try {
          const errorObj = error as any
          console.log('Propiedades del error:', Object.keys(errorObj))
          
          if (errorObj.message) {
            errorMessage = String(errorObj.message)
            errorDetails = `Error object: ${errorObj.message}`
            console.log('Error object message:', errorObj.message)
          } else if (errorObj.error) {
            errorMessage = String(errorObj.error)
            errorDetails = `Error nested: ${errorObj.error}`
            console.log('Error nested:', errorObj.error)
          } else if (errorObj.details) {
            errorMessage = String(errorObj.details)
            errorDetails = `Error details: ${errorObj.details}`
            console.log('Error details:', errorObj.details)
          } else {
            // Intentar serializar el objeto completo
            errorDetails = JSON.stringify(error, null, 2)
            errorMessage = "Error de base de datos. Verifica los datos ingresados"
            console.log('Error serializado:', errorDetails)
          }
        } catch (serializeError) {
          console.error('Error al serializar:', serializeError)
          errorMessage = "Error al procesar la respuesta del servidor"
          errorDetails = "No se pudo serializar el error"
        }
      } else {
        // Si el error es completamente desconocido
        errorMessage = "Error desconocido al actualizar el contrato"
        errorDetails = `Tipo: ${typeof error}, Valor: ${String(error)}`
        console.log('Error desconocido:', error)
      }
      
      // Log adicional para debug
      console.error('=== RESUMEN DEL ERROR ===')
      console.error('Error details:', errorDetails)
      console.error('Final error message:', errorMessage)
      console.error('=== FIN DEL ERROR ===')
      
      setError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

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

  if (!contract) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Contrato no encontrado</h2>
        <p className="text-muted-foreground mb-4">El contrato que buscas no existe o no tienes permisos para verlo</p>
        <Button asChild className="rounded-xl">
          <Link href={`/condos/${condoId}/contratos`}>Volver a Contratos</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="rounded-xl bg-transparent">
          <Link href={`/condos/${condoId}/contratos/${contractId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Editar Contrato</h2>
          <p className="text-muted-foreground">Modifica los datos del contrato {contract.contract_number}</p>
        </div>
      </div>

      <div className="max-w-4xl">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Información del Contrato</CardTitle>
            <CardDescription>Modifica los datos del contrato con el proveedor</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información del Contrato */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información del Contrato</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contract_number">Número de Contrato *</Label>
                    <Input
                      id="contract_number"
                      type="text"
                      placeholder="CON-0001"
                      value={contractNumber}
                      onChange={(e) => setContractNumber(e.target.value)}
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="contract_type">Tipo de Contrato *</Label>
                    <Select value={contractType} onValueChange={setContractType} required>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {contractTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start_date">Fecha de Inicio *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="end_date">Fecha de Término</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Información Financiera */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Financiera</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="currency">Moneda *</Label>
                    <Select value={currency} onValueChange={setCurrency} required>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Selecciona la moneda" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((curr) => (
                          <SelectItem key={curr.value} value={curr.value}>
                            {curr.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="total_amount">Monto Total *</Label>
                    <Input
                      id="total_amount"
                      type="number"
                      placeholder="1000000"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      className="rounded-xl"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Datos del Proveedor */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Datos del Proveedor</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="provider_name">Razón Social / Nombre Completo *</Label>
                    <Input
                      id="provider_name"
                      type="text"
                      placeholder="Empresa de Servicios S.A."
                      value={providerName}
                      onChange={(e) => setProviderName(e.target.value)}
                      className="rounded-xl"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Seguimiento y Control */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Seguimiento y Control</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="status">Estado del Contrato *</Label>
                    <Select value={status} onValueChange={(value: "vigente" | "vencido" | "suspendido" | "finalizado" | "cancelado") => setStatus(value)} required>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Selecciona el estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Archivo del Contrato</Label>
                  <EvidenceUploader
                    condoId={condoId}
                    module="contracts"
                    onUploadComplete={(url) => setFileUrl(url)}
                    currentFileUrl={fileUrl}
                  />
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-4">
                <Button type="submit" disabled={isSaving} className="rounded-xl">
                  {isSaving ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Button type="button" variant="outline" asChild className="rounded-xl bg-transparent">
                  <Link href={`/condos/${condoId}/contratos/${contractId}`}>Cancelar</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
