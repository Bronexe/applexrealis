"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Upload, Download, FileSpreadsheet, FileText, X } from "lucide-react"
import * as XLSX from 'xlsx'

interface ImportExportProps {
  onClose: () => void
  onImport: (data: any[]) => void
  onExport: (format: 'csv' | 'excel' | 'pdf') => void
  onDownloadExample: (format: 'csv' | 'excel') => void
}

export function ImportExport({ onClose, onImport, onExport, onDownloadExample }: ImportExportProps) {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv')
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                     file.type === 'application/vnd.ms-excel' || 
                     file.name.endsWith('.xlsx') || 
                     file.name.endsWith('.xls')
      
      if (isCSV || isExcel) {
        setImportFile(file)
      } else {
        toast({
          title: "Error",
          description: "Solo se permiten archivos CSV o Excel (.xlsx, .xls)",
          variant: "destructive",
        })
      }
    }
  }

  // Helpers para importación segura
  const EXPECTED_HEADERS = [
    'unidad_codigo',
    'titular_tipo',
    'nombre_razon_social',
    'tipo_uso',
    'alicuota',
    'roles',
    'co_titulares',
    'contacto',
    'observaciones',
  ]

  const normalizeKey = (k: string) =>
    (k || '')
      .toString()
      .replace('\ufeff', '') // BOM
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')

  // Mapea encabezados "variantes" a los esperados
  const HEADER_ALIASES: Record<string, string> = {
    'unidad codigo': 'unidad_codigo',
    'unidad': 'unidad_codigo',
    'titular tipo': 'titular_tipo',
    'nombre y apellido / razón social': 'nombre_razon_social',
    'nombre y apellido/razón social': 'nombre_razon_social',
    'nombre_razon_social': 'nombre_razon_social',
    'tipo': 'tipo_uso',
    'tipo uso': 'tipo_uso',
    'alícuota': 'alicuota',
    'alicuota': 'alicuota',
    'co-titulares': 'co_titulares',
    'co titulares': 'co_titulares',
    'co_titulares': 'co_titulares',
    'contacto': 'contacto',
    'observaciones': 'observaciones',
  }

  const mapHeader = (raw: string) => {
    const n = normalizeKey(raw)
    return HEADER_ALIASES[n] || n
  }

  // Parse seguro de JSON en campos opcionales
  const safeParseJSON = (v: any) => {
    if (!v || typeof v !== 'string') return v
    const s = v.trim()
    if (!s) return s
    try {
      return JSON.parse(s)
    } catch {
      return v // deja tal cual si no es JSON válido
    }
  }

  const cleanUnidad = (v: any) => (v == null ? '' : String(v).trim())

  const handleImport = async () => {
    if (!importFile) {
      toast({
        title: "Error",
        description: "Selecciona un archivo CSV o Excel",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const name = importFile.name.toLowerCase()
      const isExcel = name.endsWith('.xlsx') || name.endsWith('.xls')
      const isCSV = name.endsWith('.csv')

      let worksheet: XLSX.WorkSheet
      if (isExcel) {
        const arrayBuffer = await importFile.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        worksheet = workbook.Sheets[sheetName]
      } else if (isCSV) {
        // Usa XLSX para parsear CSV con comillas/escapes correctamente
        const text = (await importFile.text()).replace('\ufeff', '')
        const wb = XLSX.read(text, { type: 'string' })
        const sheetName = wb.SheetNames[0]
        worksheet = wb.Sheets[sheetName]
      } else {
        throw new Error("Formato no soportado. Usa .csv, .xlsx o .xls")
      }

      // Convierte a objetos, conserva vacíos con defval:''
      // raw: false para que normalice tipos (opcional)
      let rows: any[] = XLSX.utils.sheet_to_json(worksheet, {
        defval: '',
        raw: false,
      })

      if (!rows.length) throw new Error("El archivo está vacío")

      // Normaliza encabezados y remapea a claves esperadas
      rows = rows.map((row) => {
        const mapped: any = {}
        Object.keys(row).forEach((key) => {
          const k = mapHeader(key)
          mapped[k] = row[key]
        })
        return mapped
      })

      // Valida encabezados requeridos (al menos presentes en alguna forma)
      const presentHeaders = new Set(
        Object.keys(rows[0] || {}).map((k) => k.toLowerCase())
      )
      const required = ['unidad_codigo', 'titular_tipo', 'nombre_razon_social', 'tipo_uso']
      const missing = required.filter((h) => !presentHeaders.has(h))
      if (missing.length) {
        throw new Error(`Faltan columnas requeridas: ${missing.join(', ')}`)
      }

      // Limpieza + transformaciones por fila
      const processed = rows
        .map((row) => {
          // unidad_codigo saneado
          row.unidad_codigo = cleanUnidad(row.unidad_codigo)

          // tipo_uso -> array
          if (row.tipo_uso) {
            row.tipo_uso = String(row.tipo_uso)
              .split(';')
              .map((t: string) => t.trim())
              .filter(Boolean)
          } else {
            row.tipo_uso = []
          }

          // roles: "rol:aplicaA|rol:aplicaA,aplicaB"
          if (row.roles) {
            row.roles = String(row.roles)
              .split('|')
              .map((r: string) => {
                const [rolCBR, aplicaA] = r.split(':')
                return {
                  rolCBR: (rolCBR || '').trim(),
                  aplicaA: aplicaA
                    ? aplicaA.split(',').map((a: string) => a.trim()).filter(Boolean)
                    : [],
                }
              })
              .filter((r: any) => r.rolCBR)
          } else {
            row.roles = []
          }

          // alicuota -> número (DECIMAL(5,4) en BD: 0.0000 a 100.0000)
          if (row.alicuota !== '' && row.alicuota !== null && row.alicuota !== undefined) {
            // Limpiar y normalizar el valor
            let alicuotaStr = String(row.alicuota)
              .replace(',', '.') // Convertir coma a punto
              .replace(/\s/g, '') // Eliminar espacios
              .trim()
            
            const n = Number(alicuotaStr)
            
            console.log(`Procesando alícuota para unidad ${row.unidad_codigo}:`, {
              original: row.alicuota,
              cleaned: alicuotaStr,
              parsed: n,
              isFinite: Number.isFinite(n)
            })
            
            if (Number.isFinite(n)) {
              // Validar rango exacto: 0 a 100 (inclusive)
              if (n >= 0 && n <= 100) {
                // DECIMAL(5,4) permite hasta 4 decimales
                // Redondear a 4 decimales máximo
                row.alicuota = Math.round(n * 10000) / 10000
                
              // Validar que no exceda 5 dígitos totales (DECIMAL(5,4))
              const finalStr = row.alicuota.toString()
              const digitsOnly = finalStr.replace('.', '')
              if (digitsOnly.length > 5) {
                console.warn(`Alícuota excede formato DECIMAL(5,4): ${row.alicuota} (${digitsOnly.length} dígitos) en unidad ${row.unidad_codigo}`)
                row.alicuota = null
              } else {
                console.log(`Alícuota procesada exitosamente: ${row.alicuota} (${digitsOnly.length} dígitos) para unidad ${row.unidad_codigo}`)
              }
              } else {
                console.warn(`Alícuota fuera de rango (0-100): ${n} en unidad ${row.unidad_codigo}`)
                row.alicuota = null
              }
            } else {
              console.warn(`Alícuota no es un número válido: ${row.alicuota} en unidad ${row.unidad_codigo}`)
              row.alicuota = null
            }
          } else {
            row.alicuota = null
          }

          // JSON opcionales
          row.co_titulares = safeParseJSON(row.co_titulares)
          row.contacto = safeParseJSON(row.contacto)

          // Validar y limpiar porcentajes de co-titulares
          if (row.co_titulares && Array.isArray(row.co_titulares)) {
            row.co_titulares = row.co_titulares.map((co: any) => ({
              ...co,
              porcentaje: co.porcentaje !== null && co.porcentaje !== undefined ? 
                Math.round(Number(co.porcentaje) * 10000) / 10000 : 0 // Limitar a 4 decimales
            }))
          }

          // recortes generales
          row.titular_tipo = row.titular_tipo ? String(row.titular_tipo).trim() : ''
          row.nombre_razon_social = row.nombre_razon_social ? String(row.nombre_razon_social).trim() : ''
          row.observaciones = row.observaciones ? String(row.observaciones).trim() : ''

          return row
        })
        // Filtra filas realmente vacías
        .filter((row) => row.unidad_codigo !== '')

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
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground">
                  Selecciona un archivo CSV o Excel (.xlsx, .xls) con los datos de las unidades
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownloadExample('csv')}
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Descargar Ejemplo CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownloadExample('excel')}
                  className="flex-1"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Descargar Ejemplo Excel
                </Button>
              </div>

              {importFile && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span className="text-sm font-medium">{importFile.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ({(importFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                </div>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">📋 Formato Requerido para Importación:</h4>
                <div className="text-sm text-blue-800 space-y-3">
                  <div className="bg-white p-3 rounded border">
                    <p className="font-medium text-blue-900 mb-2">📊 Estructura de Columnas (flexible):</p>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div>
                        <p className="font-semibold text-green-700">OBLIGATORIAS:</p>
                        <p>unidad_codigo</p>
                        <p>titular_tipo</p>
                        <p>nombre_razon_social</p>
                        <p>tipo_uso</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700">OPCIONALES:</p>
                        <p>alicuota</p>
                        <p>roles</p>
                        <p>co_titulares</p>
                        <p>contacto</p>
                        <p>observaciones</p>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      ✅ <strong>Flexible:</strong> Acepta variaciones como "unidad codigo", "nombre y apellido / razón social", etc.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium">📝 Ejemplos de Valores Válidos:</p>
                    <div className="bg-white p-2 rounded border text-xs font-mono space-y-1">
                      <p><strong>titular_tipo:</strong> PersonaNatural | PersonaJuridica</p>
                      <p><strong>tipo_uso:</strong> Departamento | Departamento;Bodega | Estacionamiento</p>
                      <p><strong>alicuota:</strong> 15.5000 (0-100, 4 decimales)</p>
                      <p><strong>roles:</strong> Propietario:Departamento | Propietario:Departamento,Estacionamiento</p>
                      <p><strong>roles múltiples:</strong> Propietario:Departamento|Arrendatario:Bodega</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium">🔧 Formato JSON (co_titulares y contacto):</p>
                    <div className="bg-white p-2 rounded border text-xs font-mono space-y-1">
                      <p><strong>co_titulares:</strong> [{"{"}"nombre":"Juan Pérez","identificacion":"12345678-9","porcentaje":50{"}"}]</p>
                      <p><strong>contacto:</strong> {"{"}"email":"juan@email.com","telefono":"+56912345678{"}"}</p>
                    </div>
                  </div>

                  <div className="bg-green-50 p-2 rounded border border-green-200">
                    <p className="font-medium text-green-800">✅ MEJORAS IMPLEMENTADAS:</p>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li>• <strong>Encabezados flexibles:</strong> Acepta variaciones de nombres de columnas</li>
                      <li>• <strong>Procesamiento robusto:</strong> Maneja archivos con BOM y caracteres especiales</li>
                      <li>• <strong>Validación mejorada:</strong> Detecta columnas requeridas automáticamente</li>
                      <li>• <strong>Limpieza automática:</strong> Normaliza espacios y caracteres especiales</li>
                      <li>• <strong>JSON seguro:</strong> Parsea JSON de forma segura sin fallar</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
                    <p className="font-medium text-yellow-800">⚠️ IMPORTANTE:</p>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      <li>• Descarga el ejemplo para ver el formato recomendado</li>
                      <li>• Las columnas pueden tener nombres variados (se mapean automáticamente)</li>
                      <li>• Los valores JSON deben ser válidos</li>
                      <li>• Co-titulares: suma de porcentajes = 100%</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleImport} 
                disabled={!importFile || isLoading}
                className="w-full"
              >
                {isLoading ? "Importando..." : "Importar Datos"}
              </Button>
            </div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Formato de exportación</Label>
                <Select value={exportFormat} onValueChange={(value: 'csv' | 'excel' | 'pdf') => setExportFormat(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4" />
                        CSV (Excel)
                      </div>
                    </SelectItem>
                    <SelectItem value="excel">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4" />
                        Excel (.xlsx)
                      </div>
                    </SelectItem>
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        PDF
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Información de exportación:</h4>
                <div className="text-sm text-green-800 space-y-1">
                  <p>• Se exportarán todas las unidades con filtros aplicados</p>
                  <p>• Incluye todos los datos: roles, co-titulares, documentos, etc.</p>
                  <p>• Los archivos se descargarán automáticamente</p>
                </div>
              </div>

              <Button onClick={handleExport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Exportar Datos
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
