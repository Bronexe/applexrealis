"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Download, Trash2, Edit } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { getSignedUrl, deleteFile } from "@/lib/actions/storage"

interface Assembly {
  id: string
  type: "ordinaria" | "extraordinaria"
  date: string
  act_file_url: string | null
}

interface AssemblyActionsProps {
  assembly: Assembly
  condoId: string
}

export function AssemblyActions({ assembly, condoId }: AssemblyActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDownload = async () => {
    if (!assembly.act_file_url) {
      toast({
        title: "Sin archivo",
        description: "No hay archivo adjunto para descargar",
        variant: "destructive",
      })
      return
    }

    setIsDownloading(true)
    try {
      const result = await getSignedUrl(assembly.act_file_url)
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
    if (!confirm("¿Estás seguro de que quieres eliminar esta asamblea? Esta acción no se puede deshacer.")) {
      return
    }

    setIsDeleting(true)
    const supabase = createClient()

    try {
      // First delete the file if it exists
      if (assembly.act_file_url) {
        await deleteFile(assembly.act_file_url)
      }

      // Then delete the assembly record
      const { error } = await supabase
        .from("assemblies")
        .delete()
        .eq("id", assembly.id)

      if (error) throw error

      toast({
        title: "Asamblea eliminada",
        description: "La asamblea se ha eliminado correctamente",
      })

      // Refresh the page to update the list
      router.refresh()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar la asamblea"
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
        <Link href={`/condos/${condoId}/asambleas/${assembly.id}/edit`}>
          <Edit className="h-4 w-4" />
        </Link>
      </Button>
      
      {assembly.act_file_url && (
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
        title="Eliminar asamblea"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}











