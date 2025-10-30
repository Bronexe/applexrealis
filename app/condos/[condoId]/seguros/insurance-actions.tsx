"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Download, Trash2, Edit } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { getSignedUrl, deleteFile } from "@/lib/actions/storage"

interface Insurance {
  id: string
  policy_number: string | null
  insurer: string | null
  valid_from: string | null
  valid_to: string | null
  policy_file_url: string | null
}

interface InsuranceActionsProps {
  insurance: Insurance
  condoId: string
}

export function InsuranceActions({ insurance, condoId }: InsuranceActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDownload = async () => {
    if (!insurance.policy_file_url) {
      toast({
        title: "Sin archivo",
        description: "No hay archivo adjunto para descargar",
        variant: "destructive",
      })
      return
    }

    setIsDownloading(true)
    try {
      const result = await getSignedUrl(insurance.policy_file_url)
      window.open(result.signedUrl, "_blank")
      toast({
        title: "Descarga iniciada",
        description: "El archivo se está descargando",
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al descargar el archivo"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar este seguro? Esta acción no se puede deshacer.")) {
      return
    }

    setIsDeleting(true)
    const supabase = createClient()

    try {
      // First delete the file if it exists
      if (insurance.policy_file_url) {
        await deleteFile(insurance.policy_file_url)
      }

      // Then delete the insurance record
      const { error } = await supabase
        .from("insurances")
        .delete()
        .eq("id", insurance.id)
        .eq("condo_id", condoId)

      if (error) throw error

      toast({
        title: "Seguro eliminado",
        description: "El seguro se ha eliminado correctamente",
      })

      // Refresh the page to update the list
      router.refresh()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar el seguro"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" asChild className="rounded-lg bg-transparent">
        <Link href={`/condos/${condoId}/seguros/${insurance.id}/edit`}>
          <Edit className="h-4 w-4" />
        </Link>
      </Button>
      
      {insurance.policy_file_url && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownload}
          disabled={isDownloading}
          className="rounded-lg bg-transparent"
          title="Descargar archivo"
        >
          <Download className="h-4 w-4" />
        </Button>
      )}
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleDelete}
        disabled={isDeleting}
        className="rounded-lg bg-transparent text-destructive hover:text-destructive hover:bg-destructive/10"
        title="Eliminar seguro"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
























