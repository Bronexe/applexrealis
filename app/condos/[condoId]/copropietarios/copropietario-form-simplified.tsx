'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, X, Upload, FileText, Loader2 } from 'lucide-react'
import { UnidadFormData, RolCBRSimplified, CoTitularSimplified, Contacto } from '@/lib/types/copropietarios-simplified'
import FileUploadField from './file-upload-field'
import { uploadFileWithRetryAPI } from '@/lib/actions/upload-api'

interface CopropietarioFormSimplifiedProps {
  initialData?: Partial<UnidadFormData>
  onSubmit: (data: UnidadFormData) => void
  onCancel: () => void
  isLoading?: boolean
  condoId: string
}

export default function CopropietarioFormSimplified({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  condoId
}: CopropietarioFormSimplifiedProps) {
  const [formData, setFormData] = useState<UnidadFormData>({
    unidad_codigo: initialData?.unidad_codigo || '',
    alicuota: initialData?.alicuota || 0,
    titular_tipo: initialData?.titular_tipo || 'PersonaNatural',
    nombre_razon_social: initialData?.nombre_razon_social || '',
    tipo_uso: initialData?.tipo_uso || [],
    roles: initialData?.roles || [],
    archivo_inscripcion_cbr: initialData?.archivo_inscripcion_cbr,
    archivo_vigencia_cbr: initialData?.archivo_vigencia_cbr,
    co_titulares: initialData?.co_titulares || [],
    contacto: initialData?.contacto || {},
    observaciones: initialData?.observaciones || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [archivoInscripcion, setArchivoInscripcion] = useState<File | null>(null)
  const [archivoVigencia, setArchivoVigencia] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Cargar archivos existentes cuando se está editando
  useEffect(() => {
    if (initialData) {
      // Inicializar estados de archivos nuevos
      setArchivoInscripcion(null)
      setArchivoVigencia(null)
    }
  }, [initialData])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validar código de unidad
    if (!formData.unidad_codigo.trim()) {
      newErrors.unidad_codigo = 'El código de unidad es obligatorio'
    }

    // Validar alícuota (opcional)
    if (formData.alicuota && (formData.alicuota <= 0 || formData.alicuota > 100)) {
      newErrors.alicuota = 'La alícuota debe estar entre 0.001 y 100'
    }

    // Validar nombre/razón social
    if (!formData.nombre_razon_social.trim()) {
      newErrors.nombre_razon_social = 'El nombre/razón social es obligatorio'
    }

    // Validar tipo de uso
    if (formData.tipo_uso.length === 0) {
      newErrors.tipo_uso = 'Debe seleccionar al menos un tipo de uso'
    }

    // Validar co-titulares
    if (formData.co_titulares && formData.co_titulares.length > 0) {
      const totalPorcentaje = formData.co_titulares.reduce((sum, co) => sum + (co.porcentaje || 0), 0)
      if (Math.abs(totalPorcentaje - 100) > 0.01) {
        newErrors.co_titulares = "La suma de porcentajes de co-titulares debe ser 100%"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm() && !isUploading) {
      setIsUploading(true)
      try {
        console.log('Estado de archivos antes del envío:')
        console.log('archivoInscripcion:', archivoInscripcion)
        console.log('archivoVigencia:', archivoVigencia)
        
        let archivoInscripcionUrl = formData.archivo_inscripcion_cbr?.url || null
        let archivoVigenciaUrl = formData.archivo_vigencia_cbr?.url || null

        // Subir archivos a Supabase Storage si hay archivos nuevos
        if (archivoInscripcion) {
          console.log('Subiendo archivo de Inscripción CBR:', archivoInscripcion.name)
          try {
            const formDataInscripcion = new FormData()
            formDataInscripcion.append("file", archivoInscripcion)
            formDataInscripcion.append("condoId", condoId)
            formDataInscripcion.append("module", "copropietarios")
            
            const result = await uploadFileWithRetryAPI(formDataInscripcion, 2)
            console.log('Resultado de subida Inscripción CBR:', result)
            archivoInscripcionUrl = result.url
          } catch (error) {
            console.error('Error subiendo archivo de Inscripción CBR:', error)
            throw new Error(`Error al subir archivo de Inscripción CBR: ${error instanceof Error ? error.message : 'Error desconocido'}`)
          }
        }

        if (archivoVigencia) {
          console.log('Subiendo archivo de Vigencia CBR:', archivoVigencia.name)
          try {
            const formDataVigencia = new FormData()
            formDataVigencia.append("file", archivoVigencia)
            formDataVigencia.append("condoId", condoId)
            formDataVigencia.append("module", "copropietarios")
            
            const result = await uploadFileWithRetryAPI(formDataVigencia, 2)
            console.log('Resultado de subida Vigencia CBR:', result)
            archivoVigenciaUrl = result.url
          } catch (error) {
            console.error('Error subiendo archivo de Vigencia CBR:', error)
            throw new Error(`Error al subir archivo de Vigencia CBR: ${error instanceof Error ? error.message : 'Error desconocido'}`)
          }
        }

        // Incluir archivos CBR en el formData con URLs de Supabase Storage
        const formDataWithFiles = {
          ...formData,
          archivo_inscripcion_cbr: archivoInscripcionUrl ? {
            nombre: archivoInscripcion?.name || formData.archivo_inscripcion_cbr?.nombre,
            url: archivoInscripcionUrl,
            tamaño: archivoInscripcion?.size || formData.archivo_inscripcion_cbr?.tamaño,
            fecha_subida: new Date().toISOString(),
            tipo: archivoInscripcion?.type || formData.archivo_inscripcion_cbr?.tipo
          } : null,
          archivo_vigencia_cbr: archivoVigenciaUrl ? {
            nombre: archivoVigencia?.name || formData.archivo_vigencia_cbr?.nombre,
            url: archivoVigenciaUrl,
            tamaño: archivoVigencia?.size || formData.archivo_vigencia_cbr?.tamaño,
            fecha_subida: new Date().toISOString(),
            tipo: archivoVigencia?.type || formData.archivo_vigencia_cbr?.tipo
          } : null
        }
        onSubmit(formDataWithFiles)
      } catch (error) {
        console.error('Error al subir archivos:', error)
        // Mostrar error al usuario
        setErrors(prev => ({ ...prev, archivos: 'Error al subir archivos' }))
      } finally {
        setIsUploading(false)
      }
    }
  }

  const updateRol = (index: number, field: keyof RolCBRSimplified, value: any) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.map((rol, i) => 
        i === index ? { ...rol, [field]: value } : rol
      )
    }))
  }

  const addRol = () => {
    setFormData(prev => ({
      ...prev,
      roles: [...(prev.roles || []), { fojas: "", numero: "", año: "", aplicaA: [] }]
    }))
  }

  const removeRol = (index: number) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.filter((_, i) => i !== index)
    }))
  }

  const updateCoTitular = (index: number, field: keyof CoTitularSimplified, value: any) => {
    setFormData(prev => ({
      ...prev,
      co_titulares: prev.co_titulares.map((co, i) => 
        i === index ? { ...co, [field]: value } : co
      )
    }))
  }

  const addCoTitular = () => {
    setFormData(prev => ({
      ...prev,
      co_titulares: [...(prev.co_titulares || []), { nombre: "", porcentaje: 0 }]
    }))
  }

  const removeCoTitular = (index: number) => {
    setFormData(prev => ({
      ...prev,
      co_titulares: prev.co_titulares.filter((_, i) => i !== index)
    }))
  }

  const updateContacto = (field: keyof Contacto, value: string) => {
    setFormData(prev => ({
      ...prev,
      contacto: { ...prev.contacto, [field]: value }
    }))
  }

  const totalPorcentajeCoTitulares = (formData.co_titulares || []).reduce((sum, co) => sum + (co.porcentaje || 0), 0)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>
              {initialData ? 'Editar Unidad' : 'Nueva Unidad'}
            </CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unidad_codigo">Código de Unidad *</Label>
                <Input
                  id="unidad_codigo"
                  placeholder="Ej: A-101, B-201"
                  value={formData.unidad_codigo}
                  onChange={(e) => setFormData(prev => ({ ...prev, unidad_codigo: e.target.value }))}
                />
                {errors.unidad_codigo && <p className="text-sm text-red-500 mt-1">{errors.unidad_codigo}</p>}
              </div>

              <div>
                <Label htmlFor="alicuota">Alícuota (%)</Label>
                <Input
                  id="alicuota"
                  type="text"
                  placeholder="Ej: 0.0113 o 0,0113 (opcional)"
                  value={formData.alicuota ? formData.alicuota.toString() : ""}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === "") {
                      setFormData(prev => ({ ...prev, alicuota: null }))
                    } else {
                      // Reemplazar coma por punto para parsing
                      const normalizedValue = value.replace(',', '.')
                      const parsedValue = parseFloat(normalizedValue)
                      if (!isNaN(parsedValue)) {
                        setFormData(prev => ({ ...prev, alicuota: parsedValue }))
                      }
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Formato decimal: 0.0113 = 1.13%. Puede usar coma o punto decimal.
                </p>
                {errors.alicuota && <p className="text-sm text-red-500 mt-1">{errors.alicuota}</p>}
              </div>

              <div>
                <Label htmlFor="titular_tipo">Tipo de Titular *</Label>
                <Select
                  value={formData.titular_tipo}
                  onValueChange={(value: 'PersonaNatural' | 'PersonaJuridica') => 
                    setFormData(prev => ({ ...prev, titular_tipo: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PersonaNatural">Persona Natural</SelectItem>
                    <SelectItem value="PersonaJuridica">Persona Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="nombre_razon_social">
                  {formData.titular_tipo === 'PersonaNatural' ? 'Nombre Completo *' : 'Razón Social *'}
                </Label>
                <Input
                  id="nombre_razon_social"
                  placeholder={formData.titular_tipo === 'PersonaNatural' ? 'Juan Pérez' : 'Empresa S.A.'}
                  value={formData.nombre_razon_social}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre_razon_social: e.target.value }))}
                />
                {errors.nombre_razon_social && <p className="text-sm text-red-500 mt-1">{errors.nombre_razon_social}</p>}
              </div>
            </div>

            {/* Tipo de Uso */}
            <div>
              <Label>Tipo de Uso *</Label>
              <div className="flex flex-wrap gap-4 mt-2">
                {['Departamento', 'Bodega', 'Estacionamiento'].map(tipo => (
                  <div key={tipo} className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.tipo_uso.includes(tipo)}
                      onCheckedChange={(checked) => {
                        const newTipoUso = checked 
                          ? [...formData.tipo_uso, tipo]
                          : formData.tipo_uso.filter(t => t !== tipo)
                        setFormData(prev => ({ ...prev, tipo_uso: newTipoUso }))
                      }}
                    />
                    <Label className="text-sm">{tipo}</Label>
                  </div>
                ))}
              </div>
              {errors.tipo_uso && <p className="text-sm text-red-500 mt-1">{errors.tipo_uso}</p>}
            </div>

            {/* Roles CBR */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Roles CBR</Label>
                <Button type="button" variant="outline" size="sm" onClick={addRol}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Rol
                </Button>
              </div>
              
              {formData.roles.map((rol, index) => (
                <Card key={index} className="mb-4">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Rol {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRol(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label>Fojas</Label>
                        <Input
                          placeholder="Ej: 123"
                          value={rol.fojas}
                          onChange={(e) => updateRol(index, 'fojas', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label>Número</Label>
                        <Input
                          placeholder="Ej: 456"
                          value={rol.numero}
                          onChange={(e) => updateRol(index, 'numero', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label>Año</Label>
                        <Input
                          placeholder="Ej: 2024"
                          value={rol.año}
                          onChange={(e) => updateRol(index, 'año', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Aplica a:</Label>
                      <div className="flex flex-wrap gap-4 mt-2">
                        {['Departamento', 'Bodega', 'Estacionamiento'].map(tipo => (
                          <div key={tipo} className="flex items-center space-x-2">
                            <Checkbox
                              checked={rol.aplicaA.includes(tipo)}
                              onCheckedChange={(checked) => {
                                const newAplicaA = checked 
                                  ? [...rol.aplicaA, tipo]
                                  : rol.aplicaA.filter(t => t !== tipo)
                                updateRol(index, 'aplicaA', newAplicaA)
                              }}
                            />
                            <Label className="text-sm">{tipo}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Co-titulares */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Co-titulares</Label>
                <Button type="button" variant="outline" size="sm" onClick={addCoTitular}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Co-titular
                </Button>
              </div>
              
              {formData.co_titulares.map((co, index) => (
                <Card key={index} className="mb-4">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Co-titular {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCoTitular(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nombre</Label>
                        <Input
                          placeholder="Nombre completo"
                          value={co.nombre}
                          onChange={(e) => updateCoTitular(index, 'nombre', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label>Porcentaje (%)</Label>
                        <Input
                          type="text"
                          placeholder="Ej: 25.5 o 25,5"
                          value={co.porcentaje ? co.porcentaje.toString() : ""}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value === "") {
                              updateCoTitular(index, 'porcentaje', 0)
                            } else {
                              // Reemplazar coma por punto para parsing
                              const normalizedValue = value.replace(',', '.')
                              const parsedValue = parseFloat(normalizedValue)
                              if (!isNaN(parsedValue)) {
                                updateCoTitular(index, 'porcentaje', parsedValue)
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {formData.co_titulares.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="font-medium">Total co-titulares:</span>
                  <Badge variant={Math.abs(totalPorcentajeCoTitulares - 100) < 0.01 ? "default" : "destructive"}>
                    {totalPorcentajeCoTitulares.toFixed(2)}%
                  </Badge>
                </div>
              )}
              {errors.co_titulares && <p className="text-sm text-red-500 mt-1">{errors.co_titulares}</p>}
            </div>

            {/* Documentos CBR */}
            <div>
              <Label className="flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4" />
                Documentos CBR
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <FileUploadField
                    id="archivo_inscripcion_cbr"
                    label="Archivo de Inscripción CBR"
                    accept=".pdf"
                    maxSize={20 * 1024 * 1024} // 20MB
                    value={archivoInscripcion}
                    onChange={setArchivoInscripcion}
                  />
                  {isUploading && archivoInscripcion && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Subiendo...</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <FileUploadField
                    id="archivo_vigencia_cbr"
                    label="Archivo de Vigencia CBR"
                    accept=".pdf"
                    maxSize={20 * 1024 * 1024} // 20MB
                    value={archivoVigencia}
                    onChange={setArchivoVigencia}
                  />
                  {isUploading && archivoVigencia && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Subiendo...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div>
              <Label>Datos de Contacto</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@ejemplo.com"
                    value={formData.contacto?.email || ""}
                    onChange={(e) => updateContacto('email', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    placeholder="+56912345678"
                    value={formData.contacto?.telefono || ""}
                    onChange={(e) => updateContacto('telefono', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                placeholder="Observaciones adicionales..."
                value={formData.observaciones}
                onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Mensaje de progreso */}
            {isUploading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Subiendo archivos...</p>
                    <p className="text-xs text-blue-600">Por favor espera mientras se suben los archivos al servidor</p>
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo archivos...
                  </>
                ) : isLoading ? (
                  'Guardando...'
                ) : (
                  initialData ? 'Actualizar' : 'Crear'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
