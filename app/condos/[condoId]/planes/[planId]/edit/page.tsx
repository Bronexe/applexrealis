"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"
import { EvidenceUploader } from "@/components/evidence-uploader"
import { useToast } from "@/hooks/use-toast"

export default function EditPlanPage({ params }: { params: Promise<{ condoId: string; planId: string }> }) {
  const { condoId, planId } = React.use(params)
  const [version, setVersion] = useState("")
  const [professionalName, setProfessionalName] = useState("")
  const [updatedAt, setUpdatedAt] = useState("")
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchPlan = async () => {
      const supabase = createClient()
      
      try {
        const { data: plan, error } = await supabase
          .from("emergency_plans")
          .select("*")
          .eq("id", planId)
          .eq("condo_id", condoId)
          .single()

        if (error) throw error

        setVersion(plan.version || "")
        setProfessionalName(plan.professional_name || "")
        setUpdatedAt(plan.updated_at || "")
        setFileUrl(plan.plan_file_url)
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : "Error al cargar el plan")
        toast({
          title: "Error",
          description: "No se pudo cargar el plan de emergencia",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchPlan()
  }, [planId, condoId, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("emergency_plans")
        .update({
          version,
          professional_name: professionalName,
          updated_at: updatedAt,
          plan_file_url: fileUrl,
        })
        .eq("id", planId)
        .eq("condo_id", condoId)

      if (error) throw error

      toast({
        title: "Plan actualizado",
        description: "El plan de emergencia se ha actualizado correctamente",
      })

      router.push(`/condos/${condoId}/planes`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al actualizar el plan")
      toast({
        title: "Error",
        description: "No se pudo actualizar el plan de emergencia",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar este plan de emergencia? Esta acción no se puede deshacer.")) {
      return
    }

    setIsDeleting(true)
    setError(null)

    const supabase = createClient()

    try {
      // First delete the file if it exists
      if (fileUrl) {
        const { deleteFile } = await import("@/lib/actions/storage")
        await deleteFile(fileUrl)
      }

      // Then delete the plan record
      const { error } = await supabase
        .from("emergency_plans")
        .delete()
        .eq("id", planId)
        .eq("condo_id", condoId)

      if (error) throw error

      toast({
        title: "Plan eliminado",
        description: "El plan de emergencia se ha eliminado correctamente",
      })

      router.push(`/condos/${condoId}/planes`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al eliminar el plan")
      toast({
        title: "Error",
        description: "No se pudo eliminar el plan de emergencia",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-xl bg-transparent">
            <Link href={`/condos/${condoId}/planes`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Cargando...</h2>
            <p className="text-muted-foreground">Cargando datos del plan de emergencia</p>
          </div>
        </div>
      </div>
    )
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
          <h2 className="text-2xl font-bold">Editar Plan de Emergencia</h2>
          <p className="text-muted-foreground">Modifica los datos del plan de emergencia</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Información del Plan</CardTitle>
            <CardDescription>Modifica los datos del plan de emergencia</CardDescription>
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
                  {isLoading ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Button type="button" variant="outline" asChild className="rounded-xl bg-transparent">
                  <Link href={`/condos/${condoId}/planes`}>Cancelar</Link>
                </Button>
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-xl"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? "Eliminando..." : "Eliminar Plan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
























