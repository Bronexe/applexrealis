"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { X } from "lucide-react"
import { type UserData } from "@/lib/actions/super-admin"
import { EvidenceUploader } from "@/components/evidence-uploader"
import { getSignedUrl, deleteFile } from "@/lib/actions/storage"
import { useToast } from "@/hooks/use-toast"

// Regiones de Chile
const CHILEAN_REGIONS = [
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "Metropolitana",
  "O'Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "La Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén",
  "Magallanes"
]

interface UserEditFormProps {
  user: UserData
  onClose: () => void
  onSubmit: (userData: any) => void
}

export function UserEditForm({ user, onClose, onSubmit }: UserEditFormProps) {
  const [formData, setFormData] = useState({
    full_name: user.full_name,
    rut: user.rut,
    registration_date: user.registration_date,
    regions: user.regions,
    certification_file_url: user.certification_file_url,
    role: user.role,
    is_active: user.is_active
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.full_name) {
      newErrors.full_name = "El nombre completo es requerido"
    }

    if (!formData.rut) {
      newErrors.rut = "El RUT es requerido"
    }

    if (!formData.registration_date) {
      newErrors.registration_date = "La fecha de inscripción es requerida"
    }

    if (formData.regions.length === 0) {
      newErrors.regions = "Debe seleccionar al menos una región"
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
      await onSubmit(formData)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegionChange = (region: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      regions: checked 
        ? [...prev.regions, region]
        : prev.regions.filter(r => r !== region)
    }))
  }

  const handleDownload = async () => {
    if (!formData.certification_file_url) {
      toast({
        title: "Sin archivo",
        description: "No hay certificación adjunta para descargar",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await getSignedUrl(formData.certification_file_url)
      window.open(result.signedUrl, "_blank")
      toast({
        title: "Descarga iniciada",
        description: "El archivo se está descargando",
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al descargar el archivo"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar la certificación? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      if (formData.certification_file_url) {
        await deleteFile(formData.certification_file_url)
      }

      setFormData(prev => ({
        ...prev,
        certification_file_url: null
      }))

      toast({
        title: "Certificación eliminada",
        description: "La certificación se ha eliminado correctamente",
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar la certificación"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const isSuperAdmin = user.role === 'super_admin'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Editar Usuario</CardTitle>
            <CardDescription>
              Modificar información del usuario: {user.email}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información de autenticación (solo lectura) */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información de Acceso</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={user.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">El email no se puede modificar</p>
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                      disabled={isSuperAdmin}
                    />
                    <Label className={isSuperAdmin ? "text-muted-foreground" : ""}>
                      {formData.is_active ? "Activo" : "Inactivo"}
                    </Label>
                  </div>
                  {isSuperAdmin && (
                    <p className="text-xs text-muted-foreground">Los super administradores no se pueden desactivar</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "super_admin" | "admin" | "user") => setFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="super_admin">Super Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Información personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Personal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nombre Completo o Razón Social *</Label>
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="Ej: Juan Pérez o Empresa Administradora SPA"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    className={errors.full_name ? "border-destructive" : ""}
                  />
                  {errors.full_name && <p className="text-sm text-destructive">{errors.full_name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rut">RUT *</Label>
                  <Input
                    id="rut"
                    type="text"
                    placeholder="Ej: 12.345.678-9"
                    value={formData.rut}
                    onChange={(e) => setFormData(prev => ({ ...prev, rut: e.target.value }))}
                    className={errors.rut ? "border-destructive" : ""}
                  />
                  {errors.rut && <p className="text-sm text-destructive">{errors.rut}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration_date">Fecha de Inscripción *</Label>
                <Input
                  id="registration_date"
                  type="date"
                  value={formData.registration_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, registration_date: e.target.value }))}
                  className={errors.registration_date ? "border-destructive" : ""}
                />
                {errors.registration_date && <p className="text-sm text-destructive">{errors.registration_date}</p>}
              </div>
            </div>

            {/* Regiones */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Regiones de Servicio *</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-xl bg-muted/50">
                {CHILEAN_REGIONS.map((region) => (
                  <div key={region} className="flex items-center space-x-2">
                    <Checkbox
                      id={region}
                      checked={formData.regions.includes(region)}
                      onCheckedChange={(checked) => handleRegionChange(region, checked as boolean)}
                    />
                    <Label htmlFor={region} className="text-sm font-normal">
                      {region}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.regions && <p className="text-sm text-destructive">{errors.regions}</p>}
              
              {formData.regions.length > 0 && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Regiones seleccionadas:</p>
                  <div className="flex flex-wrap gap-1">
                    {formData.regions.map((region, index) => (
                      <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                        {region}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Certificación Profesional */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Certificación Profesional</h3>
              <div className="space-y-4">
                <EvidenceUploader
                  condoId="administrator" // Usamos un ID fijo para administradores
                  module="administrator_certifications"
                  onUploadComplete={(url) => setFormData(prev => ({ ...prev, certification_file_url: url }))}
                  currentFileUrl={formData.certification_file_url}
                />
                
                {formData.certification_file_url && (
                  <div className="flex items-center gap-2 p-3 border rounded-xl bg-muted/50">
                    <span className="text-2xl">📄</span>
                    <span className="text-sm flex-1">Certificación adjunta</span>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleDownload}
                        className="rounded-lg"
                        title="Descargar certificación"
                      >
                        <span className="mr-1">⬇️</span>
                        Descargar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleDelete}
                        className="rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Eliminar certificación"
                      >
                        <span className="mr-1">🗑️</span>
                        Eliminar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Información adicional */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Adicional</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">ID de Usuario</Label>
                  <p className="font-mono text-xs">{user.user_id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Último Acceso</Label>
                  <p>{user.last_login ? new Date(user.last_login).toLocaleString('es-CL') : 'Nunca'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fecha de Creación</Label>
                  <p>{new Date(user.created_at).toLocaleString('es-CL')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Última Actualización</Label>
                  <p>{new Date(user.updated_at).toLocaleString('es-CL')}</p>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Actualizando..." : "Actualizar Usuario"}
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





