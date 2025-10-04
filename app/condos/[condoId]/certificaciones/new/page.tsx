"use client"

import React from "react"

import { useState } from "react"
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

export default function NewCertificationPage({ params }: { params: Promise<{ condoId: string }> }) {
  const { condoId } = React.use(params)
  const [kind, setKind] = useState<"gas" | "ascensor" | "otros">("gas")
  const [validFrom, setValidFrom] = useState("")
  const [validTo, setValidTo] = useState("")
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    console.log('=== INICIO DEL PROCESO DE CREACIÓN ===')
    console.log('Datos del formulario:', { kind, validFrom, validTo, fileUrl, condoId })

    // Validaciones básicas
    if (!kind) {
      setError("Debes seleccionar un tipo de certificación")
      setIsLoading(false)
      return
    }

    if (!condoId) {
      setError("Error: ID del condominio no válido")
      setIsLoading(false)
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

      // Preparar datos para inserción
      const certificationData = {
        condo_id: condoId,
        user_id: user.id, // Agregar user_id requerido
        kind,
        valid_from: validFrom || null,
        valid_to: validTo || null,
        cert_file_url: fileUrl || null,
      }

      console.log('Datos preparados para inserción:', certificationData)
      console.log('Usuario autenticado:', user.id)

      // Verificar que el condominio existe
      console.log('Verificando que el condominio existe...')
      const { data: condoData, error: condoError } = await supabase
        .from("condos")
        .select("id, name")
        .eq("id", condoId)
        .single()

      console.log('Resultado de verificación de condominio:', { condoData, condoError })

      if (condoError) {
        throw new Error(`El condominio no existe: ${condoError.message}`)
      }

      // Intentar la inserción
      console.log('Intentando insertar certificación...')
      const { data, error } = await supabase.from("certifications").insert([certificationData]).select()

      console.log('Resultado de inserción:', { data, error })

      if (error) {
        console.error('Error detallado de Supabase:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      console.log('✅ Certificación creada exitosamente:', data)
      router.push(`/condos/${condoId}/certificaciones`)
    } catch (error: unknown) {
      console.error('=== ERROR CAPTURADO ===')
      console.error('Error completo al crear certificación:', error)
      console.error('Tipo de error:', typeof error)
      console.error('Constructor del error:', error?.constructor?.name)
      
      let errorMessage = "Error al crear la certificación"
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
          errorMessage = "No tienes permisos para crear certificaciones"
        } else if (error.message.includes('foreign key')) {
          errorMessage = "Error de referencia: el condominio no existe"
        } else if (error.message.includes('not null')) {
          errorMessage = "Faltan campos requeridos"
        } else if (error.message.includes('unique')) {
          errorMessage = "Ya existe una certificación con estos datos"
        } else if (error.message.includes('JWT')) {
          errorMessage = "Error de autenticación. Por favor, inicia sesión nuevamente"
        } else if (error.message.includes('RLS')) {
          errorMessage = "Error de permisos. Verifica que tienes acceso a este condominio"
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
        errorMessage = "Error desconocido al crear la certificación"
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
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="rounded-xl bg-transparent">
          <Link href={`/condos/${condoId}/certificaciones`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Nueva Certificación</h2>
          <p className="text-muted-foreground">Registra una nueva certificación</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Información de la Certificación</CardTitle>
            <CardDescription>Completa los datos de la certificación</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="kind">Tipo de Certificación *</Label>
                <Select value={kind} onValueChange={(value: "gas" | "ascensor" | "otros") => setKind(value)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gas">Gas</SelectItem>
                    <SelectItem value="ascensor">Ascensor</SelectItem>
                    <SelectItem value="otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="valid_from">Vigente Desde</Label>
                  <Input
                    id="valid_from"
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="valid_to">Vigente Hasta</Label>
                  <Input
                    id="valid_to"
                    type="date"
                    value={validTo}
                    onChange={(e) => setValidTo(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Certificado</Label>
                <EvidenceUploader
                  condoId={condoId}
                  module="certifications"
                  onUploadComplete={(url) => setFileUrl(url)}
                  currentFileUrl={fileUrl}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="rounded-xl">
                  {isLoading ? "Guardando..." : "Guardar Certificación"}
                </Button>
                <Button type="button" variant="outline" asChild className="rounded-xl bg-transparent">
                  <Link href={`/condos/${condoId}/certificaciones`}>Cancelar</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
