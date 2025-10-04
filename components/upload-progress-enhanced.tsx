"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Loader2, Upload, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface UploadProgressEnhancedProps {
  isUploading: boolean
  fileName?: string
  fileSize?: number
  progress?: number
  error?: string
  uploadSpeed?: number
  estimatedTime?: string
  onRetry?: () => void
  onCancel?: () => void
}

export function UploadProgressEnhanced({ 
  isUploading, 
  fileName, 
  fileSize, 
  progress = 0, 
  error, 
  uploadSpeed,
  estimatedTime,
  onRetry,
  onCancel
}: UploadProgressEnhancedProps) {
  const [showDetails, setShowDetails] = useState(false)

  if (!isUploading && !error) {
    return null
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusIcon = () => {
    if (error) {
      return <XCircle className="h-5 w-5 text-red-600" />
    } else if (progress === 100) {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    } else {
      return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
    }
  }

  const getStatusColor = () => {
    if (error) return 'border-red-200 bg-red-50'
    if (progress === 100) return 'border-green-200 bg-green-50'
    return 'border-blue-200 bg-blue-50'
  }

  const getStatusText = () => {
    if (error) return 'Error al subir archivo'
    if (progress === 100) return 'Archivo subido exitosamente'
    return 'Subiendo archivo...'
  }

  return (
    <Card className={`border-2 ${getStatusColor()} transition-all duration-300`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-800 truncate">
                {getStatusText()}
              </p>
              {!error && progress > 0 && (
                <span className="text-xs text-gray-600 font-mono">
                  {progress}%
                </span>
              )}
            </div>
            
            {fileName && (
              <p className="text-xs text-gray-600 mb-2 truncate">
                {fileName} {fileSize && `(${formatFileSize(fileSize)})`}
              </p>
            )}
            
            {!error && progress > 0 && progress < 100 && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{estimatedTime || 'Calculando...'}</span>
                  {uploadSpeed && (
                    <span>{Math.round(uploadSpeed)} KB/s</span>
                  )}
                </div>
              </div>
            )}
            
            {error && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
                <div className="flex gap-2">
                  {onRetry && (
                    <button
                      onClick={onRetry}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Reintentar subida
                    </button>
                  )}
                  {onCancel && (
                    <button
                      onClick={onCancel}
                      className="text-xs text-gray-600 hover:text-gray-800 underline"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {progress === 100 && !error && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Archivo disponible para descarga</span>
              </div>
            )}
          </div>
          
          {!error && progress > 0 && progress < 100 && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              {showDetails ? 'Ocultar' : 'Detalles'}
            </button>
          )}
        </div>
        
        {showDetails && !error && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div>
                <span className="font-medium">Tamaño:</span>
                <br />
                {fileSize ? formatFileSize(fileSize) : 'Desconocido'}
              </div>
              <div>
                <span className="font-medium">Velocidad:</span>
                <br />
                {uploadSpeed ? `${Math.round(uploadSpeed)} KB/s` : 'Calculando...'}
              </div>
              <div>
                <span className="font-medium">Tiempo restante:</span>
                <br />
                {estimatedTime || 'Calculando...'}
              </div>
              <div>
                <span className="font-medium">Progreso:</span>
                <br />
                {progress.toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}













