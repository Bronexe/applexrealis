'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Upload, X, FileText, AlertCircle, Download } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { UnidadImportDataSimplified, ImportResult } from '@/lib/types/copropietarios-simplified'
import * as XLSX from 'xlsx'

interface ImportSimplifiedProps {
  onImport: (data: UnidadImportDataSimplified[]) => void
  onClose: () => void
}

export default function ImportSimplified({
  onImport,
  onClose
}: ImportSimplifiedProps) {
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Mapeo de encabezados variados a campos estándar
  const headerMapping: Record<string, string> = {
    'codigo': 'unidad_codigo',
    'código': 'unidad_codigo',
    'codigo_unidad': 'unidad_codigo',
    'código_unidad': 'unidad_codigo',
    'unidad': 'unidad_codigo',
    'alicuota': 'alicuota',
    'alícuota': 'alicuota',
    'porcentaje': 'alicuota',
    'nombre': 'nombre_completo',
    'nombre_completo': 'nombre_completo',
    'nombre_razon_social': 'nombre_completo',
    'razon_social': 'nombre_completo',
    'razón_social': 'nombre_completo',
    'titular_tipo': 'tipo_titular',
    'tipo_titular': 'tipo_titular',
    'tipo': 'tipo_titular',
    'tipo_uso': 'tipo_uso',
    'uso': 'tipo_uso',
    'email': 'email',
    'correo': 'email',
    'e-mail': 'email',
    'telefono': 'telefono',
    'teléfono': 'telefono',
    'fono': 'telefono',
    'phone': 'telefono',
    'observaciones': 'observaciones',
    'obs': 'observaciones',
    'comentarios': 'observaciones'
  }

  const cleanValue = (v: any) => (v == null ? '' : String(v).trim())

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImportFile(file)
    }
  }

  const handleImport = async () => {
    if (!importFile) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const data = await importFile.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      if (jsonData.length < 2) {
        throw new Error('El archivo debe tener al menos una fila de encabezados y una fila de datos')
      }

      const headers = (jsonData[0] as string[]).map(h => 
        headerMapping[h?.toLowerCase()?.replace(/\s+/g, '_')] || h
      )

      const processed: UnidadImportDataSimplified[] = []
      
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[]
        const rowData: any = {}
        
        headers.forEach((header, colIndex) => {
          rowData[header] = row[colIndex]
        })

        // Validar campos obligatorios
        if (!rowData.unidad_codigo || !cleanValue(rowData.unidad_codigo)) {
          throw new Error(`Fila ${i + 1}: El código de unidad es obligatorio`)
        }

        if (!rowData.nombre_completo || !cleanValue(rowData.nombre_completo)) {
          throw new Error(`Fila ${i + 1}: El nombre completo es obligatorio`)
        }

        if (!rowData.tipo_uso || !cleanValue(rowData.tipo_uso)) {
          throw new Error(`Fila ${i + 1}: El tipo de uso es obligatorio`)
        }

        // Procesar datos
        const processedRow: UnidadImportDataSimplified = {
          unidad_codigo: cleanValue(rowData.unidad_codigo),
          nombre_completo: cleanValue(rowData.nombre_completo),
          tipo_uso: cleanValue(rowData.tipo_uso).split(';').map((t: string) => t.trim()).filter(Boolean)
        }

        // Campos opcionales
        if (rowData.alicuota && cleanValue(rowData.alicuota)) {
          let alicuotaStr = cleanValue(rowData.alicuota)
            .replace(',', '.') // Convertir coma a punto
            .replace(/\s/g, '') // Eliminar espacios
          
          const n = Number(alicuotaStr)
          
          if (!isNaN(n) && n >= 0 && n <= 100) {
            processedRow.alicuota = Math.round(n * 10000) / 10000 // Limitar a 4 decimales
          } else {
            throw new Error(`Fila ${i + 1}: Alícuota inválida: ${rowData.alicuota}`)
          }
        }

        if (rowData.tipo_titular && cleanValue(rowData.tipo_titular)) {
          const tipoTitular = cleanValue(rowData.tipo_titular)
          if (!['PersonaNatural', 'PersonaJuridica'].includes(tipoTitular)) {
            throw new Error(`Fila ${i + 1}: Tipo de titular inválido: ${tipoTitular}. Debe ser "PersonaNatural" o "PersonaJuridica"`)
          }
          processedRow.tipo_titular = tipoTitular
        }

        if (rowData.email && cleanValue(rowData.email)) {
          processedRow.email = cleanValue(rowData.email)
        }

        if (rowData.telefono && cleanValue(rowData.telefono)) {
          processedRow.telefono = cleanValue(rowData.telefono)
        }

        if (rowData.observaciones && cleanValue(rowData.observaciones)) {
          processedRow.observaciones = cleanValue(rowData.observaciones)
        }

        processed.push(processedRow)
      }

      const total = processed.length

      console.log(`ImportSimplified: Procesadas ${total} unidades`)
      console.log(`ImportSimplified: Primeras 3 unidades:`, processed.slice(0, 3))

      onImport(processed)

      toast({
        title: "Importación exitosa",
        description: `${total} unidades procesadas correctamente`,
      })

      onClose()
    } catch (error) {
      console.error('Error en importación:', error)
      toast({
        title: "Error en importación",
        description: error instanceof Error ? error.message : "Error al procesar el archivo",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Importar Copropietarios
            </CardTitle>
            <CardDescription>
              Importa datos de copropietarios desde Excel o CSV con validación estricta
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Área de carga de archivo */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                <div>
                  <Label htmlFor="import-file" className="cursor-pointer">
                    <span className="text-sm font-medium text-gray-900">
                      Selecciona un archivo Excel o CSV
                    </span>
                    <Input
                      id="import-file"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Soporta archivos .xlsx, .xls, .csv
                  </p>
                </div>
              </div>
            </div>
            
            {importFile && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">{importFile.name}</p>
                  <p className="text-xs text-green-700">
                    {(importFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setImportFile(null)}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Información del formato */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Campos obligatorios */}
            <div className="space-y-3">
              <h4 className="font-semibold text-green-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Campos Obligatorios
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">unidad_codigo</code>
                  <span className="text-gray-600">Código de la Unidad</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">nombre_completo</code>
                  <span className="text-gray-600">Nombre Completo</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">tipo_uso</code>
                  <span className="text-gray-600">Tipo de Uso</span>
                </div>
              </div>
            </div>

            {/* Campos opcionales */}
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Campos Opcionales
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">alicuota</code>
                  <span className="text-gray-600">Alícuota (%)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">tipo_titular</code>
                  <span className="text-gray-600">Tipo de Titular</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">email</code>
                  <span className="text-gray-600">Email</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">telefono</code>
                  <span className="text-gray-600">Teléfono</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">observaciones</code>
                  <span className="text-gray-600">Observaciones</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ejemplo de formato */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Ejemplo de Formato
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="text-xs font-mono space-y-1">
                <div className="text-gray-500">// Encabezados</div>
                <div className="text-gray-800">unidad_codigo,nombre_completo,tipo_uso,alicuota,tipo_titular,email,telefono,observaciones</div>
                <div className="text-gray-500">// Datos</div>
                <div className="text-gray-800">A-101,Juan Pérez,Departamento,15.5,PersonaNatural,juan@email.com,+56912345678,Unidad principal</div>
                <div className="text-gray-800">B-201,María González,Departamento;Estacionamiento,12.25,PersonaNatural,maria@email.com,,</div>
              </div>
            </div>
          </div>

          {/* Descargar ejemplo */}
          <div className="space-y-3">
            <h4 className="font-medium text-blue-900">¿Necesitas un ejemplo?</h4>
            <p className="text-sm text-blue-700">Descarga los archivos de ejemplo para ver el formato correcto</p>
            <div className="flex gap-3">
              <a 
                href="/ejemplo_importacion_simplificada.xlsx" 
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Download className="h-4 w-4" />
                Ejemplo Excel
              </a>
              <a 
                href="/ejemplo_importacion_simplificada.csv" 
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Download className="h-4 w-4" />
                Ejemplo CSV
              </a>
            </div>
          </div>

          {/* Notas importantes */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              Notas Importantes
            </h4>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <ul className="space-y-2 text-sm text-amber-800">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Validación estricta:</strong> Si hay un error en cualquier fila, la importación se detiene completamente</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Tipo de uso múltiple:</strong> Separa con punto y coma (;) para múltiples tipos</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Alícuota:</strong> Formato decimal donde 1.0 = 100%. Puede usar coma o punto decimal (ej: 0.155 = 15.5%)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Tipo de titular:</strong> Debe ser "PersonaNatural" o "PersonaJuridica"</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Botón de importar */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!importFile || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Datos
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
