'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, Download, X, FileText, AlertCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { UnidadImportData, RolCBRSimplified, CoTitularSimplified, Contacto } from '@/lib/types/copropietarios-simplified'
import * as XLSX from 'xlsx'

interface ImportExportSimplifiedProps {
  onImport: (data: UnidadImportData[]) => void
  onExport: (format: 'excel' | 'csv') => void
  onClose: () => void
}

export default function ImportExportSimplified({
  onImport,
  onExport,
  onClose
}: ImportExportSimplifiedProps) {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv'>('excel')
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
    'titular_tipo': 'titular_tipo',
    'tipo_titular': 'titular_tipo',
    'tipo': 'titular_tipo',
    'nombre': 'nombre_razon_social',
    'nombre_razon_social': 'nombre_razon_social',
    'razon_social': 'nombre_razon_social',
    'razón_social': 'nombre_razon_social',
    'tipo_uso': 'tipo_uso',
    'uso': 'tipo_uso',
    'roles': 'roles',
    'roles_cbr': 'roles',
    'archivo_inscripcion_cbr': 'archivo_inscripcion_cbr',
    'inscripcion_cbr': 'archivo_inscripcion_cbr',
    'archivo_vigencia_cbr': 'archivo_vigencia_cbr',
    'vigencia_cbr': 'archivo_vigencia_cbr',
    'co_titulares': 'co_titulares',
    'co titulares': 'co_titulares',
    'co-titulares': 'co_titulares',
    'contacto': 'contacto',
    'observaciones': 'observaciones',
    'obs': 'observaciones'
  }

  // Parse seguro de JSON en campos opcionales
  const safeParseJSON = (v: any) => {
    if (!v || typeof v !== 'string') return v
    const s = v.trim()
    if (!s) return s
    try {
      return JSON.parse(s)
    } catch {
      return s
    }
  }

  const cleanUnidad = (v: any) => (v == null ? '' : String(v).trim())

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

      const processed = (jsonData.slice(1) as any[]).map((row, index) => {
        const rowData: any = {}
        headers.forEach((header, colIndex) => {
          rowData[header] = row[colIndex]
        })

        // Limpiar datos básicos
        rowData.unidad_codigo = cleanUnidad(rowData.unidad_codigo)
        rowData.titular_tipo = cleanUnidad(rowData.titular_tipo)
        rowData.nombre_razon_social = cleanUnidad(rowData.nombre_razon_social)
        rowData.observaciones = cleanUnidad(rowData.observaciones)

        // Procesar alícuota
        if (rowData.alicuota) {
          let alicuotaStr = String(rowData.alicuota)
            .replace(',', '.') // Convertir coma a punto
            .replace(/\s/g, '') // Eliminar espacios
            .trim()
          
          const n = Number(alicuotaStr)
          
          if (!isNaN(n) && n >= 0 && n <= 100) {
            rowData.alicuota = Math.round(n * 10000) / 10000 // Limitar a 4 decimales
            console.log(`Alícuota procesada: ${rowData.alicuota} para unidad ${rowData.unidad_codigo}`)
          } else {
            console.warn(`Alícuota inválida: ${rowData.alicuota} para unidad ${rowData.unidad_codigo}`)
            rowData.alicuota = null
          }
        }

        // Procesar tipo_uso
        if (rowData.tipo_uso) {
          rowData.tipo_uso = String(rowData.tipo_uso)
            .split(';')
            .map((t: string) => t.trim())
            .filter(Boolean)
        } else {
          rowData.tipo_uso = []
        }

        // Procesar roles CBR - Nueva estructura: fojas, numero, año, aplicaA
        if (rowData.roles) {
          rowData.roles = String(rowData.roles)
            .split('|')
            .map((r: string) => {
              // Formato: "fojas:numero:año:aplicaA" o "fojas,numero,año,aplicaA"
              const parts = r.includes(':') ? r.split(':') : r.split(',')
              if (parts.length >= 4) {
                return {
                  fojas: (parts[0] || '').trim(),
                  numero: (parts[1] || '').trim(),
                  año: (parts[2] || '').trim(),
                  aplicaA: parts[3] 
                    ? parts[3].split(',').map((a: string) => a.trim()).filter(Boolean)
                    : []
                }
              }
              return null
            })
            .filter(Boolean)
        } else {
          rowData.roles = []
        }

        // JSON opcionales
        rowData.archivo_inscripcion_cbr = safeParseJSON(rowData.archivo_inscripcion_cbr)
        rowData.archivo_vigencia_cbr = safeParseJSON(rowData.archivo_vigencia_cbr)
        rowData.co_titulares = safeParseJSON(rowData.co_titulares)
        rowData.contacto = safeParseJSON(rowData.contacto)

        // Validar y limpiar porcentajes de co-titulares (sin identificación)
        if (rowData.co_titulares && Array.isArray(rowData.co_titulares)) {
          rowData.co_titulares = rowData.co_titulares.map((co: any) => ({
            nombre: co.nombre || '',
            porcentaje: co.porcentaje !== null && co.porcentaje !== undefined ? 
              Math.round(Number(co.porcentaje) * 10000) / 10000 : 0 // Limitar a 4 decimales
          }))
        }

        return rowData
      }).filter(row => row.unidad_codigo) // Filtrar filas vacías

      const total = processed.length

      console.log(`ImportExport: Procesadas ${total} unidades, enviando al componente padre...`)
      console.log(`ImportExport: Primeras 3 unidades:`, processed.slice(0, 3))
      
      // Log de alícuotas para debugging
      const alicuotas = processed.map(u => ({ codigo: u.unidad_codigo, alicuota: u.alicuota })).slice(0, 10)
      console.log(`ImportExport: Primeras 10 alícuotas:`, alicuotas)

      onImport(processed)

      toast({
        title: "Importación exitosa",
        description: `${total} unidades procesadas correctamente`,
      })

      onClose()
    } catch (error) {
      toast({
        title: "Error en importación",
        description: error instanceof Error ? error.message : "Error al procesar el archivo",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = () => {
    onExport(exportFormat)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Importar / Exportar Copropietarios</CardTitle>
            <CardDescription>
              Gestiona la importación y exportación de datos de copropietarios
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tabs */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <Button
              variant={activeTab === 'import' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('import')}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
            <Button
              variant={activeTab === 'export' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('export')}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          {/* Import Tab */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="import-file">Archivo de Importación</Label>
                <Input
                  id="import-file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                />
                {importFile && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    {importFile.name}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-medium text-blue-900">Formato de Archivo</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p><strong>Columnas requeridas:</strong></p>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <p>unidad_codigo</p>
                        <p>alicuota</p>
                        <p>titular_tipo</p>
                        <p>nombre_razon_social</p>
                        <p>tipo_uso</p>
                        <p>roles</p>
                        <p>archivo_inscripcion_cbr</p>
                        <p>archivo_vigencia_cbr</p>
                        <p>co_titulares</p>
                        <p>contacto</p>
                        <p>observaciones</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-medium">🔧 Formato de Roles CBR:</p>
                  <div className="bg-white p-2 rounded border text-xs font-mono space-y-1">
                    <p><strong>Formato:</strong> fojas:numero:año:aplicaA|fojas:numero:año:aplicaA</p>
                    <p><strong>Ejemplo:</strong> 123:456:2024:Departamento,Estacionamiento|789:012:2023:Bodega</p>
                  </div>
                </div>

                <div>
                  <p className="font-medium">📄 Archivo de Ejemplo:</p>
                  <div className="bg-white p-2 rounded border text-xs">
                    <a 
                      href="/ejemplo_importacion_simplificada.csv" 
                      download
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Descargar ejemplo CSV simplificado
                    </a>
                  </div>
                </div>

                <div>
                  <p className="font-medium">🔧 Formato JSON (co_titulares y contacto):</p>
                  <div className="bg-white p-2 rounded border text-xs font-mono space-y-1">
                    <p><strong>co_titulares:</strong> [{"{"}"nombre":"Juan Pérez","porcentaje":50{"}"}]</p>
                    <p><strong>contacto:</strong> {"{"}"email":"juan@email.com","telefono":"+56912345678{"}"}</p>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Notas importantes:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>• Las columnas pueden tener nombres variados (se mapean automáticamente)</li>
                    <li>• Los valores JSON deben ser válidos</li>
                    <li>• Co-titulares: suma de porcentajes = 100%</li>
                    <li>• Alícuota: puede usar coma o punto como separador decimal</li>
                  </ul>
                </div>
              </div>

              <Button 
                onClick={handleImport} 
                disabled={!importFile || isLoading}
                className="w-full"
              >
                {isLoading ? 'Procesando...' : 'Importar Datos'}
              </Button>
            </div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Formato de Exportación</Label>
                <div className="flex space-x-2">
                  <Button
                    variant={exportFormat === 'excel' ? 'default' : 'outline'}
                    onClick={() => setExportFormat('excel')}
                    className="flex-1"
                  >
                    Excel (.xlsx)
                  </Button>
                  <Button
                    variant={exportFormat === 'csv' ? 'default' : 'outline'}
                    onClick={() => setExportFormat('csv')}
                    className="flex-1"
                  >
                    CSV (.csv)
                  </Button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Se exportarán todos los datos de copropietarios en el formato seleccionado.</p>
              </div>

              <Button onClick={handleExport} className="w-full">
                Exportar Datos
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
