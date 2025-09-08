"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { EvidenceUploader } from "@/components/evidence-uploader"
import { useToast } from "@/hooks/use-toast"
import { getSignedUrl, deleteFile } from "@/lib/actions/storage"
import Link from "next/link"

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

interface AdministratorData {
  id?: string
  full_name: string
  rut: string
  registration_date: string
  regions: string[]
  certification_file_url: string | null
}

export default function AdministradorPageFallback() {
  const [formData, setFormData] = useState<AdministratorData>({
    full_name: "",
    rut: "",
    registration_date: "",
    regions: [],
    certification_file_url: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [hasTableError, setHasTableError] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchAdministratorData = async () => {
      const supabase = createClient()
      
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push("/auth/login")
          return
        }

        // Intentar acceder a la tabla administrators
        const { data: adminData, error } = await supabase
          .from("administrators")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (error) {
          console.error("Error accessing administrators table:", error)
          setHasTableError(true)
        } else if (adminData) {
          setFormData({
            id: adminData.id,
            full_name: adminData.full_name || "",
            rut: adminData.rut || "",
            registration_date: adminData.registration_date || "",
            regions: adminData.regions || [],
            certification_file_url: adminData.certification_file_url
          })
          setIsEditing(true)
        }
      } catch (error: unknown) {
        console.error("Error fetching administrator data:", error)
        setHasTableError(true)
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchAdministratorData()
  }, [router])

  const handleRegionChange = (region: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      regions: checked 
        ? [...prev.regions, region]
        : prev.regions.filter(r => r !== region)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const dataToSubmit = {
        user_id: user.id,
        full_name: formData.full_name,
        rut: formData.rut,
        registration_date: formData.registration_date,
        regions: formData.regions,
        certification_file_url: formData.certification_file_url
      }

      if (isEditing && formData.id) {
        // Actualizar registro existente
        const { error } = await supabase
          .from("administrators")
          .update(dataToSubmit)
          .eq("id", formData.id)

        if (error) throw error

        toast({
          title: "Datos actualizados",
          description: "La información del administrador se ha actualizado correctamente",
        })
      } else {
        // Crear nuevo registro
        const { error } = await supabase
          .from("administrators")
          .insert([dataToSubmit])

        if (error) throw error

        toast({
          title: "Datos guardados",
          description: "La información del administrador se ha guardado correctamente",
        })
        setIsEditing(true)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al guardar los datos"
      setError(errorMessage)
      toast({
        title: "Error",
        description: "No se pudieron guardar los datos del administrador",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Cargando...</h2>
          <p className="text-muted-foreground">Cargando datos del administrador</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Administrador</h2>
        <p className="text-muted-foreground">Gestiona tu información personal y certificación profesional</p>
      </div>

      {/* Mensaje de error si hay problemas con la base de datos */}
      {hasTableError && (
        <Card className="rounded-2xl border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive mb-4">
              <span className="text-2xl">⚠️</span>
              <h3 className="font-semibold">Problema con la Base de Datos</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              No se pudo acceder a la tabla de administradores. Esto puede deberse a:
            </p>
            <ul className="list-disc list-inside mb-4 text-sm text-muted-foreground space-y-1">
              <li>La tabla 'administrators' no existe en la base de datos</li>
              <li>No hay permisos para acceder a los datos</li>
              <li>Problemas de conectividad con la base de datos</li>
              <li>Políticas RLS (Row Level Security) mal configuradas</li>
            </ul>
            
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Soluciones:</h4>
              <div className="space-y-2">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/dashboard">
                    <span className="mr-2">🏠</span>
                    Ir al Dashboard
                  </Link>
                </Button>
              </div>
              
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <span>🔧</span>
                  Para Desarrolladores:
                </h5>
                <p className="text-xs text-muted-foreground">
                  Ejecuta el script <code className="bg-muted px-1 rounded">scripts/005_complete_migration.sql</code> en Supabase SQL Editor para crear las tablas necesarias.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="max-w-4xl">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">👤</span>
              Información del Administrador
            </CardTitle>
            <CardDescription>
              Completa tu información profesional y sube tu certificación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="full_name">Nombre Completo o Razón Social *</Label>
                  <Input
                    id="full_name"
                    type="text"
                    required
                    placeholder="Ej: Juan Pérez o Empresa Administradora SPA"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="rounded-xl"
                    disabled={hasTableError}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="rut">RUT *</Label>
                  <Input
                    id="rut"
                    type="text"
                    required
                    placeholder="Ej: 12.345.678-9"
                    value={formData.rut}
                    onChange={(e) => setFormData(prev => ({ ...prev, rut: e.target.value }))}
                    className="rounded-xl"
                    disabled={hasTableError}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="registration_date">Fecha de Inscripción *</Label>
                <Input
                  id="registration_date"
                  type="date"
                  required
                  value={formData.registration_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, registration_date: e.target.value }))}
                  className="rounded-xl"
                  disabled={hasTableError}
                />
              </div>

              <div className="grid gap-2">
                <Label>Regiones donde Presta Servicios *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-xl bg-muted/50">
                  {CHILEAN_REGIONS.map((region) => (
                    <div key={region} className="flex items-center space-x-2">
                      <Checkbox
                        id={region}
                        checked={formData.regions.includes(region)}
                        onCheckedChange={(checked) => handleRegionChange(region, checked as boolean)}
                        disabled={hasTableError}
                      />
                      <Label htmlFor={region} className="text-sm font-normal">
                        {region}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.regions.length === 0 && (
                  <p className="text-sm text-destructive">Debe seleccionar al menos una región</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Certificación Profesional</Label>
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
                          <span className="text-lg">📥</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleDelete}
                          className="rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Eliminar certificación"
                        >
                          <span className="text-lg">🗑️</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={isLoading || formData.regions.length === 0 || hasTableError} 
                  className="rounded-xl"
                >
                  {isLoading ? "Guardando..." : isEditing ? "Actualizar Datos" : "Guardar Datos"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

