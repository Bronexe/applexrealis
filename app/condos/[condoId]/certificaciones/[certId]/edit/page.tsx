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
import { ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"
import { EvidenceUploader } from "@/components/evidence-uploader"
import { useToast } from "@/hooks/use-toast"

export default function EditCertificationPage({ params }: { params: Promise<{ condoId: string; certId: string }> }) {
  const { condoId, certId } = React.use(params)
  const [kind, setKind] = useState<"gas" | "ascensor" | "otros">("gas")
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
    const fetchCertification = async () => {
      const supabase = createClient()
      
      try {
        const { data: cert, error } = await supabase
          .from("certifications")
          .select("*")
          .eq("id", certId)
          .eq("condo_id", condoId)
          .single()

        if (error) throw error

        setKind(cert.kind)
        setValidFrom(cert.valid_from || "")
        setValidTo(cert.valid_to || "")
        setFileUrl(cert.cert_file_url)
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : "Error al cargar la certificación")
        toast({
          title: "Error",
          description: "No se pudo cargar la certificación",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchCertification()
  }, [certId, condoId, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("certifications")
        .update({
          kind,
          valid_from: validFrom || null,
          valid_to: validTo || null,
          cert_file_url: fileUrl,
        })
        .eq("id", certId)
        .eq("condo_id", condoId)

      if (error) throw error

      toast({
        title: "Certificación actualizada",
        description: "La certificación se ha actualizado correctamente",
      })

      router.push(`/condos/${condoId}/certificaciones`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al actualizar la certificación")
      toast({
        title: "Error",
        description: "No se pudo actualizar la certificación",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta certificación? Esta acción no se puede deshacer.")) {
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

      // Then delete the certification record
      const { error } = await supabase
        .from("certifications")
        .delete()
        .eq("id", certId)
        .eq("condo_id", condoId)

      if (error) throw error

      toast({
        title: "Certificación eliminada",
        description: "La certificación se ha eliminado correctamente",
      })

      router.push(`/condos/${condoId}/certificaciones`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al eliminar la certificación")
      toast({
        title: "Error",
        description: "No se pudo eliminar la certificación",
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
            <Link href={`/condos/${condoId}/certificaciones`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Cargando...</h2>
            <p className="text-muted-foreground">Cargando datos de la certificación</p>
          </div>
        </div>
      </div>
    )
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
          <h2 className="text-2xl font-bold">Editar Certificación</h2>
          <p className="text-muted-foreground">Modifica los datos de la certificación</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Información de la Certificación</CardTitle>
            <CardDescription>Modifica los datos de la certificación</CardDescription>
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
                  {isLoading ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Button type="button" variant="outline" asChild className="rounded-xl bg-transparent">
                  <Link href={`/condos/${condoId}/certificaciones`}>Cancelar</Link>
                </Button>
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-xl"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? "Eliminando..." : "Eliminar Certificación"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
























