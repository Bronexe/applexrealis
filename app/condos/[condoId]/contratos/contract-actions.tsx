"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Edit, Trash2, Eye, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getSignedUrl } from "@/lib/actions/storage"

interface ContractActionsProps {
  contract: {
    id: string
    contract_number: string
    contract_type: string
    provider_name: string
    status: string
    contract_file_url?: string
  }
  condoId: string
}

export function ContractActions({ contract, condoId }: ContractActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleEdit = () => {
    router.push(`/condos/${condoId}/contratos/${contract.id}/edit`)
  }

  const handleView = () => {
    router.push(`/condos/${condoId}/contratos/${contract.id}`)
  }

  const handleDownload = async () => {
    if (!contract.contract_file_url) {
      toast({
        title: "Error",
        description: "No hay archivo adjunto para descargar",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await getSignedUrl(contract.contract_file_url)
      window.open(result.signedUrl, "_blank")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al descargar el archivo"
      console.error("Error downloading file:", error)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      const supabase = createClient()
      
      // Verificar autenticación
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error("No estás autenticado")
      }

      // Eliminar el contrato
      const { error } = await supabase
        .from("contracts")
        .delete()
        .eq("id", contract.id)

      if (error) throw error

      toast({
        title: "Contrato eliminado",
        description: `El contrato ${contract.contract_number} ha sido eliminado correctamente`,
      })

      // Recargar la página
      router.refresh()
    } catch (error) {
      console.error("Error deleting contract:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el contrato",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleView}>
            <Eye className="mr-2 h-4 w-4" />
            Ver detalles
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          {contract.contract_file_url && (
            <DropdownMenuItem onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Descargar archivo
            </DropdownMenuItem>
          )}
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el contrato{" "}
              <strong>{contract.contract_number}</strong> con{" "}
              <strong>{contract.provider_name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

