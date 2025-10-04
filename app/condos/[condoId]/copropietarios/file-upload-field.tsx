'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, FileText, X, CheckCircle } from 'lucide-react'

interface FileUploadFieldProps {
  id: string
  label: string
  accept?: string
  maxSize?: number
  onChange?: (file: File | null) => void
  value?: File | null
  required?: boolean
}

export default function FileUploadField({
  id,
  label,
  accept = ".pdf",
  maxSize = 20 * 1024 * 1024, // 20MB por defecto
  onChange,
  value,
  required = false
}: FileUploadFieldProps) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (file: File | null) => {
    setError(null)
    
    if (file) {
      // Validar tamaño
      if (file.size > maxSize) {
        setError(`El archivo es demasiado grande. Máximo ${Math.round(maxSize / (1024 * 1024))}MB`)
        return
      }
      
      // Validar tipo
      if (accept && !file.type.match(accept.replace('*', '.*'))) {
        setError(`Tipo de archivo no válido. Solo se permiten archivos ${accept}`)
        return
      }
    }
    
    onChange?.(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2">
        <Upload className="h-4 w-4 text-blue-600" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-4 transition-colors
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${error ? 'border-red-500 bg-red-50' : ''}
          ${value ? 'border-green-500 bg-green-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          id={id}
          type="file"
          accept={accept}
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="text-center">
          {value ? (
            <div className="flex items-center justify-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="text-left">
                <p className="font-medium text-green-800">{value.name}</p>
                <p className="text-sm text-green-600">{formatFileSize(value.size)}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleFileSelect(null)
                }}
                className="text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-gray-100 rounded-full">
                <FileText className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Arrastra y suelta tu archivo aquí
                </p>
                <p className="text-xs text-gray-500">
                  o haz clic para seleccionar
                </p>
              </div>
              <p className="text-xs text-gray-400">
                Solo archivos {accept}, máximo {Math.round(maxSize / (1024 * 1024))}MB
              </p>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <X className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  )
}













