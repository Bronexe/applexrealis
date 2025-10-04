"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, FileText, X, Download, Loader2 } from "lucide-react"
import { uploadFileWithRetryAPI } from "@/lib/actions/upload-api"
import { deleteFile, getSignedUrl } from "@/lib/actions/storage-direct"
import { useToast } from "@/hooks/use-toast"

interface EvidenceUploaderProps {
  condoId: string
  module: string
  onUploadComplete: (url: string) => void
  currentFileUrl?: string | null
}

export function EvidenceUploader({ condoId, module, onUploadComplete, currentFileUrl }: EvidenceUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("condoId", condoId)
      formData.append("module", module)

      const result = await uploadFileWithRetryAPI(formData, 2)
      onUploadComplete(result.url)

      // NO registrar la subida en el historial aquí
      // Se registrará automáticamente cuando se guarde el registro principal
      // await logFileUpload(condoId, file.name, file.size, file.type)

      toast({
        title: "Archivo subido",
        description: "El archivo se ha subido correctamente",
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al subir el archivo"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset the input
      event.target.value = ""
    }
  }

  const handleRemoveFile = async () => {
    if (!currentFileUrl) return

    try {
      await deleteFile(currentFileUrl)
      onUploadComplete("")
      toast({
        title: "Archivo eliminado",
        description: "El archivo se ha eliminado correctamente",
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar el archivo"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleDownload = async () => {
    if (!currentFileUrl) return

    try {
      const result = await getSignedUrl(currentFileUrl)
      window.open(result.signedUrl, "_blank")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al descargar el archivo"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      {currentFileUrl ? (
        <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/50">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm">Archivo PDF adjunto</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleDownload} className="rounded-lg">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRemoveFile} className="rounded-lg">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative border-2 border-dashed border-border rounded-xl p-6 text-center">
          {isUploading ? (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm font-medium">Subiendo archivo...</span>
              </div>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Arrastra un archivo PDF aquí o haz clic para seleccionar</p>
                <p className="text-xs text-muted-foreground">Máximo 20MB</p>
              </div>
              <Input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="mt-4 rounded-xl"
              />
            </>
          )}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
