"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Loader2, Upload, CheckCircle, XCircle } from "lucide-react"

interface UploadProgressProps {
  isUploading: boolean
  fileName?: string
  fileSize?: number
  progress?: number
  error?: string
  onRetry?: () => void
}

export function UploadProgress({ 
  isUploading, 
  fileName, 
  fileSize, 
  progress = 0, 
  error, 
  onRetry 
}: UploadProgressProps) {
  const [estimatedTime, setEstimatedTime] = useState<string>("")
  const [uploadSpeed, setUploadSpeed] = useState<number>(0)

  // Simular cálculo de tiempo estimado y velocidad
  useEffect(() => {
    if (isUploading && fileSize && progress > 0) {
      const uploadedBytes = (progress / 100) * fileSize
      const remainingBytes = fileSize - uploadedBytes
      
      // Simular velocidad de subida (esto se podría mejorar con datos reales)
      const estimatedSpeed = 500 * 1024 // 500 KB/s estimado
      const remainingTime = remainingBytes / estimatedSpeed
      
      if (remainingTime < 60) {
        setEstimatedTime(`${Math.round(remainingTime)}s restantes`)
      } else {
        setEstimatedTime(`${Math.round(remainingTime / 60)}m restantes`)
      }
      
      setUploadSpeed(estimatedSpeed / 1024) // KB/s
    }
  }, [isUploading, fileSize, progress])

  if (!isUploading && !error) {
    return null
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-3">
        {error ? (
          <XCircle className="h-5 w-5 text-red-600" />
        ) : progress === 100 ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        )}
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-800">
              {error ? "Error al subir archivo" : "Subiendo archivo..."}
            </p>
            {!error && progress > 0 && (
              <span className="text-xs text-blue-600">{progress}%</span>
            )}
          </div>
          
          {fileName && (
            <p className="text-xs text-blue-600 mb-2 truncate">
              {fileName} {fileSize && `(${Math.round(fileSize / 1024 / 1024)}MB)`}
            </p>
          )}
          
          {!error && progress > 0 && (
            <div className="space-y-1">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-blue-600">
                <span>{estimatedTime}</span>
                <span>{Math.round(uploadSpeed)} KB/s</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="space-y-2">
              <p className="text-sm text-red-600">{error}</p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Reintentar subida
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}













