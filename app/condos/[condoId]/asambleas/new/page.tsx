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

export default function NewAssemblyPage({ params }: { params: Promise<{ condoId: string }> }) {
  const { condoId } = React.use(params)
  const [type, setType] = useState<"ordinaria" | "extraordinaria">("ordinaria")
  const [date, setDate] = useState("")
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // Obtener el usuario actual
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error("No se pudo obtener la información del usuario")
      }

      const { error } = await supabase.from("assemblies").insert([
        {
          condo_id: condoId,
          user_id: user.id,
          type,
          date,
          act_file_url: fileUrl,
        },
      ])

      if (error) throw error

      router.push(`/condos/${condoId}/asambleas`)
    } catch (error: unknown) {
      console.error('Error completo al crear asamblea:', error)
      console.error('Tipo de error:', typeof error)
      console.error('Error stringificado:', JSON.stringify(error, null, 2))
      
      let errorMessage = "Error al crear la asamblea"
      
      if (error instanceof Error) {
        errorMessage = error.message
        console.log('Error message:', error.message)
        
        // Proporcionar mensajes más específicos
        if (error.message.includes('permission denied')) {
          errorMessage = "No tienes permisos para crear asambleas"
        } else if (error.message.includes('foreign key')) {
          errorMessage = "Error de referencia: el condominio no existe"
        } else if (error.message.includes('not null')) {
          errorMessage = "Faltan campos requeridos"
        } else if (error.message.includes('unique')) {
          errorMessage = "Ya existe una asamblea con estos datos"
        } else if (error.message.includes('JWT')) {
          errorMessage = "Error de autenticación. Por favor, inicia sesión nuevamente"
        } else if (error.message.includes('RLS')) {
          errorMessage = "Error de permisos. Verifica que tienes acceso a este condominio"
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        // Manejar errores de Supabase que no son instancias de Error
        errorMessage = String(error.message)
        console.log('Error object message:', error.message)
      } else {
        // Si el error es completamente desconocido
        errorMessage = "Error desconocido al crear la asamblea"
        console.log('Error desconocido:', error)
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="rounded-xl bg-transparent">
          <Link href={`/condos/${condoId}/asambleas`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Nueva Asamblea</h2>
          <p className="text-muted-foreground">Registra una nueva asamblea</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Información de la Asamblea</CardTitle>
            <CardDescription>Completa los datos de la asamblea</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo de Asamblea *</Label>
                <Select value={type} onValueChange={(value: "ordinaria" | "extraordinaria") => setType(value)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ordinaria">Ordinaria</SelectItem>
                    <SelectItem value="extraordinaria">Extraordinaria</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="grid gap-2">
                <Label>Acta de la Asamblea</Label>
                <EvidenceUploader
                  condoId={condoId}
                  module="assemblies"
                  onUploadComplete={(url) => setFileUrl(url)}
                  currentFileUrl={fileUrl}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="rounded-xl">
                  {isLoading ? "Guardando..." : "Guardar Asamblea"}
                </Button>
                <Button type="button" variant="outline" asChild className="rounded-xl bg-transparent">
                  <Link href={`/condos/${condoId}/asambleas`}>Cancelar</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
