"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, Edit, FileText, Download, Calendar, User, Building2, Percent, Mail, Phone } from "lucide-react"

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
  fecha_ultima_actualizacion: string
  created_at: string
  updated_at: string
}

interface CopropietarioDetailProps {
  unidad: Unidad
  onClose: () => void
}

export function CopropietarioDetail({ unidad, onClose }: CopropietarioDetailProps) {
  const getTipoUsoBadges = (tipos: string[]) => {
    const colors = {
      'Departamento': 'bg-blue-100 text-blue-800',
      'Bodega': 'bg-green-100 text-green-800',
      'Estacionamiento': 'bg-purple-100 text-purple-800'
    }
    
    return tipos.map(tipo => (
      <Badge key={tipo} variant="secondary" className={`text-xs ${colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {tipo}
      </Badge>
    ))
  }

  const getArchivoStatus = (archivo: any) => {
    if (!archivo) {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <FileText className="h-4 w-4" />
          <span className="text-sm">Sin archivo</span>
        </div>
      )
    }
    
    const fechaArchivo = new Date(archivo.fechaSubida)
    const unAnoAtras = new Date()
    unAnoAtras.setFullYear(unAnoAtras.getFullYear() - 1)
    
    const isDesactualizado = fechaArchivo < unAnoAtras
    
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium">Archivo cargado</span>
          {isDesactualizado && (
            <Badge variant="destructive" className="text-xs">Desactualizado</Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Subido: {fechaArchivo.toLocaleDateString('es-CL')}
        </div>
        <Button variant="outline" size="sm" className="w-full">
          <Download className="h-3 w-3 mr-1" />
          Descargar
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Unidad {unidad.unidad_codigo}
            </CardTitle>
            <CardDescription>
              Detalles completos de la unidad y copropietarios
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información Principal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Principal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Código de Unidad</label>
                  <p className="text-lg font-semibold">{unidad.unidad_codigo}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Alícuota</label>
                  <p className="text-lg font-semibold flex items-center gap-1">
                    <Percent className="h-4 w-4" />
                    {unidad.alicuota ? `${unidad.alicuota.toFixed(4)}%` : 'Sin alícuota'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo de Titular</label>
                  <p className="text-lg font-semibold">
                    {unidad.titular_tipo === 'PersonaNatural' ? 'Persona Natural' : 'Persona Jurídica'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nombre/Razón Social</label>
                  <p className="text-lg font-semibold">{unidad.nombre_razon_social}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tipo de Uso</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {getTipoUsoBadges(unidad.tipo_uso)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Roles CBR */}
          <Card>
            <CardHeader>
              <CardTitle>Roles CBR</CardTitle>
              <CardDescription>
                Roles registrados en el Conservador de Bienes Raíces
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unidad.roles.length > 0 ? (
                <div className="space-y-3">
                  {unidad.roles.map((rol, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{rol.rolCBR}</h4>
                        <Badge variant="outline">Rol {index + 1}</Badge>
                      </div>
                      <div className="mt-2">
                        <span className="text-sm text-muted-foreground">Aplica a: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {rol.aplicaA.map(tipo => (
                            <Badge key={tipo} variant="secondary" className="text-xs">
                              {tipo}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No hay roles registrados</p>
              )}
            </CardContent>
          </Card>

          {/* Co-titulares */}
          {unidad.co_titulares && unidad.co_titulares.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Co-titulares</CardTitle>
                <CardDescription>
                  Personas que comparten la titularidad de la unidad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unidad.co_titulares.map((co, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{co.nombre}</h4>
                          <p className="text-sm text-muted-foreground">{co.identificacion}</p>
                        </div>
                        <Badge variant="outline">
                          {co.porcentaje.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between font-medium">
                    <span>Total co-titulares:</span>
                    <Badge variant={unidad.co_titulares.reduce((sum, co) => sum + co.porcentaje, 0) === 100 ? "default" : "destructive"}>
                      {unidad.co_titulares.reduce((sum, co) => sum + co.porcentaje, 0).toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documentos CBR */}
          <Card>
            <CardHeader>
              <CardTitle>Documentos CBR</CardTitle>
              <CardDescription>
                Archivos del Conservador de Bienes Raíces
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Inscripción CBR</h4>
                  {getArchivoStatus(unidad.archivo_inscripcion_cbr)}
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Vigencia CBR</h4>
                  {getArchivoStatus(unidad.archivo_vigencia_cbr)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contacto */}
          {unidad.contacto && (unidad.contacto.email || unidad.contacto.telefono) && (
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unidad.contacto.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{unidad.contacto.email}</span>
                    </div>
                  )}
                  
                  {unidad.contacto.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{unidad.contacto.telefono}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observaciones */}
          {unidad.observaciones && (
            <Card>
              <CardHeader>
                <CardTitle>Observaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{unidad.observaciones}</p>
              </CardContent>
            </Card>
          )}

          {/* Metadatos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Información del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-muted-foreground">Creado:</label>
                  <p>{new Date(unidad.created_at).toLocaleString('es-CL')}</p>
                </div>
                
                <div>
                  <label className="font-medium text-muted-foreground">Última actualización:</label>
                  <p>{new Date(unidad.fecha_ultima_actualizacion).toLocaleString('es-CL')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
