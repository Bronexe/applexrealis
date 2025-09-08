"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { EvidenceUploader } from "@/components/evidence-uploader"

export default function NewPlanPage({ params }: { params: Promise<{ condoId: string }> }) {
  const { condoId } = React.use(params)
  const [version, setVersion] = useState("")
  const [professionalName, setProfessionalName] = useState("")
  const [updatedAt, setUpdatedAt] = useState("")
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
      const { error } = await supabase.from("emergency_plans").insert([
        {
          condo_id: condoId,
          version,
          professional_name: professionalName,
          updated_at: updatedAt,
          plan_file_url: fileUrl,
        },
      ])

      if (error) throw error

      router.push(`/condos/${condoId}/planes`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al crear el plan")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="rounded-xl bg-transparent">
          <Link href={`/condos/${condoId}/planes`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Nuevo Plan de Emergencia</h2>
          <p className="text-muted-foreground">Registra un nuevo plan de evacuación</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Información del Plan</CardTitle>
            <CardDescription>Completa los datos del plan de emergencia</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="version">Versión</Label>
                <Input
                  id="version"
                  type="text"
                  placeholder="Ej: v2.1"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="professional">Profesional Responsable</Label>
                <Input
                  id="professional"
                  type="text"
                  placeholder="Nombre del profesional"
                  value={professionalName}
                  onChange={(e) => setProfessionalName(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="updated_at">Fecha de Actualización *</Label>
                <Input
                  id="updated_at"
                  type="date"
                  required
                  value={updatedAt}
                  onChange={(e) => setUpdatedAt(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="grid gap-2">
                <Label>Plan de Emergencia</Label>
                <EvidenceUploader
                  condoId={condoId}
                  module="emergency_plans"
                  onUploadComplete={(url) => setFileUrl(url)}
                  currentFileUrl={fileUrl}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="rounded-xl">
                  {isLoading ? "Guardando..." : "Guardar Plan"}
                </Button>
                <Button type="button" variant="outline" asChild className="rounded-xl bg-transparent">
                  <Link href={`/condos/${condoId}/planes`}>Cancelar</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
