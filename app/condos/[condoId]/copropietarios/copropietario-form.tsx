"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { X, Plus, Trash2, FileText, Upload, Percent } from "lucide-react"
import { EvidenceUploader } from "@/components/evidence-uploader"
import { createUnidad, updateUnidad } from "@/lib/actions/copropietarios"

interface Unidad {
  id: string
  unidad_codigo: string
  alicuota: number
  titular_tipo: 'PersonaNatural' | 'PersonaJuridica'
  nombre_razon_social: string
  tipo_uso: string[]
  roles: Array<{
    rolCBR: string
    aplicaA: string[]
  }>
  archivo_inscripcion_cbr?: any
  archivo_vigencia_cbr?: any
  co_titulares?: Array<{
    nombre: string
    identificacion: string
    porcentaje: number
  }>
  contacto?: {
    email?: string
    telefono?: string
  }
  observaciones?: string
}

interface CopropietarioFormProps {
  unidad: Unidad | null
  condoId: string
  onClose: () => void
  onSave: (unidad: Unidad) => void
}

export function CopropietarioForm({ unidad, condoId, onClose, onSave }: CopropietarioFormProps) {
  const [formData, setFormData] = useState<Partial<Unidad>>({
    unidad_codigo: "",
    alicuota: 0,
    titular_tipo: 'PersonaNatural',
    nombre_razon_social: "",
    tipo_uso: [],
    roles: [],
    co_titulares: [],
    contacto: {},
    observaciones: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const isEditing = !!unidad?.id

  useEffect(() => {
    if (unidad) {
      setFormData({
        ...unidad,
        co_titulares: unidad.co_titulares || [],
        contacto: unidad.contacto || {}
      })
    }
  }, [unidad])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.unidad_codigo?.trim()) {
      newErrors.unidad_codigo = "El código de unidad es requerido"
    }

    if (formData.alicuota !== undefined && formData.alicuota < 0) {
      newErrors.alicuota = "La alícuota no puede ser negativa"
    }

    if (formData.alicuota !== undefined && formData.alicuota > 100) {
      newErrors.alicuota = "La alícuota no puede ser mayor a 100%"
    }

    if (!formData.nombre_razon_social?.trim()) {
      newErrors.nombre_razon_social = "El nombre/razón social es requerido"
    }

    if (!formData.tipo_uso || formData.tipo_uso.length === 0) {
      newErrors.tipo_uso = "Debe seleccionar al menos un tipo de uso"
    }

    // Validar co-titulares
    if (formData.co_titulares && formData.co_titulares.length > 0) {
      const totalPorcentaje = formData.co_titulares.reduce((sum, co) => sum + (co.porcentaje || 0), 0)
      if (totalPorcentaje !== 100) {
        newErrors.co_titulares = "La suma de porcentajes de co-titulares debe ser 100%"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      let unidadData: Unidad

      if (isEditing && unidad?.id) {
        // Actualizar unidad existente
        unidadData = await updateUnidad(condoId, unidad.id, {
          unidad_codigo: formData.unidad_codigo!,
          alicuota: formData.alicuota!,
          titular_tipo: formData.titular_tipo!,
          nombre_razon_social: formData.nombre_razon_social!,
          tipo_uso: formData.tipo_uso!,
          roles: formData.roles || [],
          archivo_inscripcion_cbr: formData.archivo_inscripcion_cbr,
          archivo_vigencia_cbr: formData.archivo_vigencia_cbr,
          co_titulares: formData.co_titulares,
          contacto: formData.contacto,
          observaciones: formData.observaciones
        })
      } else {
        // Crear nueva unidad
        unidadData = await createUnidad(condoId, {
          unidad_codigo: formData.unidad_codigo!,
          alicuota: formData.alicuota!,
          titular_tipo: formData.titular_tipo!,
          nombre_razon_social: formData.nombre_razon_social!,
          tipo_uso: formData.tipo_uso!,
          roles: formData.roles || [],
          archivo_inscripcion_cbr: formData.archivo_inscripcion_cbr,
          archivo_vigencia_cbr: formData.archivo_vigencia_cbr,
          co_titulares: formData.co_titulares,
          contacto: formData.contacto,
          observaciones: formData.observaciones
        })
      }

      onSave(unidadData)
      
      toast({
        title: isEditing ? "Unidad actualizada" : "Unidad creada",
        description: `La unidad ${formData.unidad_codigo} ha sido ${isEditing ? 'actualizada' : 'creada'} exitosamente`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Error al ${isEditing ? 'actualizar' : 'crear'} la unidad`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTipoUsoChange = (tipo: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      tipo_uso: checked 
        ? [...(prev.tipo_uso || []), tipo]
        : (prev.tipo_uso || []).filter(t => t !== tipo)
    }))
  }

  const addRol = () => {
    setFormData(prev => ({
      ...prev,
      roles: [...(prev.roles || []), { rolCBR: "", aplicaA: [] }]
    }))
  }

  const updateRol = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      roles: (prev.roles || []).map((rol, i) => 
        i === index ? { ...rol, [field]: value } : rol
      )
    }))
  }

  const removeRol = (index: number) => {
    setFormData(prev => ({
      ...prev,
      roles: (prev.roles || []).filter((_, i) => i !== index)
    }))
  }

  const addCoTitular = () => {
    setFormData(prev => ({
      ...prev,
      co_titulares: [...(prev.co_titulares || []), { nombre: "", identificacion: "", porcentaje: 0 }]
    }))
  }

  const updateCoTitular = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      co_titulares: (prev.co_titulares || []).map((co, i) => 
        i === index ? { ...co, [field]: value } : co
      )
    }))
  }

  const removeCoTitular = (index: number) => {
    setFormData(prev => ({
      ...prev,
      co_titulares: (prev.co_titulares || []).filter((_, i) => i !== index)
    }))
  }

  const totalPorcentajeCoTitulares = (formData.co_titulares || []).reduce((sum, co) => sum + (co.porcentaje || 0), 0)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>
              {isEditing ? "Editar Unidad" : "Nueva Unidad"}
            </CardTitle>
            <CardDescription>
              {isEditing ? "Modifica los datos de la unidad" : "Registra una nueva unidad en el condominio"}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datos de la Unidad */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Datos de la Unidad</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unidad_codigo">Código de Unidad *</Label>
                  <Input
                    id="unidad_codigo"
                    placeholder="Ej: A-101, B-205"
                    value={formData.unidad_codigo || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, unidad_codigo: e.target.value }))}
                    className={errors.unidad_codigo ? "border-destructive" : ""}
                  />
                  {errors.unidad_codigo && <p className="text-sm text-destructive">{errors.unidad_codigo}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alicuota">Alícuota (%)</Label>
                  <div className="relative">
                    <Input
                      id="alicuota"
                      type="number"
                      step="0.0001"
                      min="0"
                      max="100"
                      placeholder="0.0000"
                      value={formData.alicuota || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, alicuota: e.target.value ? parseFloat(e.target.value) : undefined }))}
                      className={errors.alicuota ? "border-destructive" : ""}
                    />
                    <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  {errors.alicuota && <p className="text-sm text-destructive">{errors.alicuota}</p>}
                </div>

                <div className="space-y-2">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre_razon_social">Nombre/Razón Social *</Label>
                <Input
                  id="nombre_razon_social"
                  placeholder={formData.titular_tipo === 'PersonaNatural' ? "Nombre y apellido" : "Razón social"}
                  value={formData.nombre_razon_social || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre_razon_social: e.target.value }))}
                  className={errors.nombre_razon_social ? "border-destructive" : ""}
                />
                {errors.nombre_razon_social && <p className="text-sm text-destructive">{errors.nombre_razon_social}</p>}
              </div>

              <div className="space-y-2">
                <Label>Tipo de Uso *</Label>
                <div className="flex gap-4">
                  {['Departamento', 'Bodega', 'Estacionamiento'].map(tipo => (
                    <div key={tipo} className="flex items-center space-x-2">
                      <Checkbox
                        id={tipo}
                        checked={(formData.tipo_uso || []).includes(tipo)}
                        onCheckedChange={(checked) => handleTipoUsoChange(tipo, checked as boolean)}
                      />
                      <Label htmlFor={tipo}>{tipo}</Label>
                    </div>
                  ))}
                </div>
                {errors.tipo_uso && <p className="text-sm text-destructive">{errors.tipo_uso}</p>}
              </div>
            </div>

            {/* Roles CBR */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Roles CBR</h3>
                <Button type="button" variant="outline" size="sm" onClick={addRol}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Rol
                </Button>
              </div>
              
              {(formData.roles || []).map((rol, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Rol {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRol(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Rol CBR</Label>
                    <Input
                      placeholder="Ej: Propietario, Arrendatario"
                      value={rol.rolCBR}
                      onChange={(e) => updateRol(index, 'rolCBR', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Aplica a</Label>
                    <div className="flex gap-4">
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
                </div>
              ))}
            </div>

            {/* Co-titulares */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Co-titulares</h3>
                <Button type="button" variant="outline" size="sm" onClick={addCoTitular}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Co-titular
                </Button>
              </div>
              
              {(formData.co_titulares || []).map((co, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Co-titular {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCoTitular(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre</Label>
                      <Input
                        placeholder="Nombre completo"
                        value={co.nombre}
                        onChange={(e) => updateCoTitular(index, 'nombre', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Identificación</Label>
                      <Input
                        placeholder="RUT, DNI, etc."
                        value={co.identificacion}
                        onChange={(e) => updateCoTitular(index, 'identificacion', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Porcentaje (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="0.00"
                        value={co.porcentaje || ""}
                        onChange={(e) => updateCoTitular(index, 'porcentaje', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {(formData.co_titulares || []).length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Total co-titulares:</span>
                  <Badge variant={totalPorcentajeCoTitulares === 100 ? "default" : "destructive"}>
                    {totalPorcentajeCoTitulares.toFixed(2)}%
                  </Badge>
                  {totalPorcentajeCoTitulares !== 100 && (
                    <span className="text-sm text-destructive">
                      (Debe ser 100%)
                    </span>
                  )}
                </div>
              )}
              
              {errors.co_titulares && <p className="text-sm text-destructive">{errors.co_titulares}</p>}
            </div>

            {/* Documentos CBR */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Documentos CBR</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Inscripción CBR</Label>
                  <EvidenceUploader
                    condoId={condoId}
                    module="cbr_inscripcion"
                    onUploadComplete={(url) => setFormData(prev => ({ 
                      ...prev, 
                      archivo_inscripcion_cbr: { url, fechaSubida: new Date().toISOString() }
                    }))}
                    currentFileUrl={formData.archivo_inscripcion_cbr?.url}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Vigencia CBR</Label>
                  <EvidenceUploader
                    condoId={condoId}
                    module="cbr_vigencia"
                    onUploadComplete={(url) => setFormData(prev => ({ 
                      ...prev, 
                      archivo_vigencia_cbr: { url, fechaSubida: new Date().toISOString() }
                    }))}
                    currentFileUrl={formData.archivo_vigencia_cbr?.url}
                  />
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contacto</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@ejemplo.com"
                    value={formData.contacto?.email || ""}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      contacto: { ...prev.contacto, email: e.target.value }
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    placeholder="+56 9 1234 5678"
                    value={formData.contacto?.telefono || ""}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      contacto: { ...prev.contacto, telefono: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                placeholder="Observaciones adicionales..."
                value={formData.observaciones || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Guardando..." : (isEditing ? "Actualizar" : "Crear")}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
