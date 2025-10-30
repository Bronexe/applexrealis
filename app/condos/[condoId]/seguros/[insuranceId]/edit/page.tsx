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

export default function EditInsurancePage({ params }: { params: Promise<{ condoId: string; insuranceId: string }> }) {
  const { condoId, insuranceId } = React.use(params)
  const [policyNumber, setPolicyNumber] = useState("")
  const [insurer, setInsurer] = useState("")
  const [validFrom, setValidFrom] = useState("")
  const [validTo, setValidTo] = useState("")
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchInsurance = async () => {
      const supabase = createClient()
      
      try {
        const { data: insurance, error } = await supabase
          .from("insurances")
          .select("*")
          .eq("id", insuranceId)
          .eq("condo_id", condoId)
          .single()

        if (error) throw error

        setPolicyNumber(insurance.policy_number || "")
        setInsurer(insurance.insurer || "")
        setValidFrom(insurance.valid_from || "")
        setValidTo(insurance.valid_to || "")
        setFileUrl(insurance.policy_file_url)
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : "Error al cargar el seguro")
        toast({
          title: "Error",
          description: "No se pudo cargar el seguro",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchInsurance()
  }, [insuranceId, condoId, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("insurances")
        .update({
          policy_number: policyNumber,
          insurer,
          valid_from: validFrom || null,
          valid_to: validTo || null,
          policy_file_url: fileUrl,
        })
        .eq("id", insuranceId)
        .eq("condo_id", condoId)

      if (error) throw error

      toast({
        title: "Seguro actualizado",
        description: "El seguro se ha actualizado correctamente",
      })

      router.push(`/condos/${condoId}/seguros`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al actualizar el seguro")
      toast({
        title: "Error",
        description: "No se pudo actualizar el seguro",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar este seguro? Esta acción no se puede deshacer.")) {
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

      // Then delete the insurance record
      const { error } = await supabase
        .from("insurances")
        .delete()
        .eq("id", insuranceId)
        .eq("condo_id", condoId)

      if (error) throw error

      toast({
        title: "Seguro eliminado",
        description: "El seguro se ha eliminado correctamente",
      })

      router.push(`/condos/${condoId}/seguros`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al eliminar el seguro")
      toast({
        title: "Error",
        description: "No se pudo eliminar el seguro",
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
            <Link href={`/condos/${condoId}/seguros`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Cargando...</h2>
            <p className="text-muted-foreground">Cargando datos del seguro</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="rounded-xl bg-transparent">
          <Link href={`/condos/${condoId}/seguros`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Editar Seguro</h2>
          <p className="text-muted-foreground">Modifica los datos del seguro</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Información del Seguro</CardTitle>
            <CardDescription>Modifica los datos de la póliza de seguro</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="policy_number">Número de Póliza</Label>
                <Input
                  id="policy_number"
                  type="text"
                  placeholder="Ej: POL-123456"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="insurer">Compañía Aseguradora</Label>
                <Input
                  id="insurer"
                  type="text"
                  placeholder="Nombre de la compañía"
                  value={insurer}
                  onChange={(e) => setInsurer(e.target.value)}
                  className="rounded-xl"
                />
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
                <Label>Póliza de Seguro</Label>
                <EvidenceUploader
                  condoId={condoId}
                  module="insurances"
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
                  <Link href={`/condos/${condoId}/seguros`}>Cancelar</Link>
                </Button>
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-xl"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? "Eliminando..." : "Eliminar Seguro"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
























