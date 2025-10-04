'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, User, Building, FileText, Users, Phone, Mail } from 'lucide-react'
import { UnidadSimplified } from '@/lib/types/copropietarios-simplified'

interface CopropietarioDetailSimplifiedProps {
  unidad: UnidadSimplified
  onClose: () => void
}

export default function CopropietarioDetailSimplified({ 
  unidad, 
  onClose 
}: CopropietarioDetailSimplifiedProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Unidad {unidad.unidad_codigo}
            </CardTitle>
            <p className="text-muted-foreground">
              Detalles completos de la unidad
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Código de Unidad</label>
                  <p className="text-lg font-semibold">{unidad.unidad_codigo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Alícuota (%)</label>
                  <p className="text-lg font-semibold">{unidad.alicuota ? (unidad.alicuota * 100).toFixed(2) + '%' : 'Sin alícuota'}</p>
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
                <div className="flex flex-wrap gap-2 mt-2">
                  {unidad.tipo_uso.map(tipo => (
                    <Badge key={tipo} variant="secondary">
                      {tipo}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Roles CBR */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Roles CBR
              </CardTitle>
            </CardHeader>
            <CardContent>
              {unidad.roles.length > 0 ? (
                <div className="space-y-4">
                  {unidad.roles.map((rol, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Rol {index + 1}</h4>
                        <Badge variant="outline">Rol CBR</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Fojas</label>
                          <p className="font-medium">{rol.fojas || 'No especificado'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Número</label>
                          <p className="font-medium">{rol.numero || 'No especificado'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Año</label>
                          <p className="font-medium">{rol.año || 'No especificado'}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Aplica a:</label>
                        <div className="flex flex-wrap gap-2 mt-2">
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
                <p className="text-muted-foreground">No hay roles CBR registrados</p>
              )}
            </CardContent>
          </Card>

          {/* Documentos CBR */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documentos CBR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Archivo de Inscripción CBR</label>
                  {unidad.archivo_inscripcion_cbr ? (
                    <div className="mt-2">
                      <a 
                        href={unidad.archivo_inscripcion_cbr.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {unidad.archivo_inscripcion_cbr.nombre}
                      </a>
                      <p className="text-xs text-muted-foreground">
                        Subido: {new Date(unidad.archivo_inscripcion_cbr.fecha_subida).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground mt-2">No hay archivo de inscripción</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Archivo de Vigencia CBR</label>
                  {unidad.archivo_vigencia_cbr ? (
                    <div className="mt-2">
                      <a 
                        href={unidad.archivo_vigencia_cbr.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {unidad.archivo_vigencia_cbr.nombre}
                      </a>
                      <p className="text-xs text-muted-foreground">
                        Subido: {new Date(unidad.archivo_vigencia_cbr.fecha_subida).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground mt-2">No hay archivo de vigencia</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Co-titulares */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Co-titulares
              </CardTitle>
            </CardHeader>
            <CardContent>
              {unidad.co_titulares.length > 0 ? (
                <div className="space-y-4">
                  {unidad.co_titulares.map((co, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{co.nombre}</h4>
                      </div>
                      <Badge variant="outline">
                        {co.porcentaje.toFixed(2)}%
                      </Badge>
                    </div>
                  ))}
                  
                  <div className="flex items-center justify-between font-medium p-3 bg-muted rounded-lg">
                    <span>Total co-titulares:</span>
                    <Badge variant={unidad.co_titulares.reduce((sum, co) => sum + co.porcentaje, 0) === 100 ? "default" : "destructive"}>
                      {unidad.co_titulares.reduce((sum, co) => sum + co.porcentaje, 0).toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No hay co-titulares registrados</p>
              )}
            </CardContent>
          </Card>

          {/* Contacto */}
          {unidad.contacto && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Datos de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unidad.contacto.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{unidad.contacto.email}</span>
                    </div>
                  )}
                  {unidad.contacto.telefono && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{unidad.contacto.telefono}</span>
                    </div>
                  )}
                  {unidad.contacto.direccion && (
                    <div className="flex items-center gap-3">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{unidad.contacto.direccion}</span>
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
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Observaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{unidad.observaciones}</p>
              </CardContent>
            </Card>
          )}

          {/* Información del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-muted-foreground">Creado:</label>
                  <p>{new Date(unidad.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Última actualización:</label>
                  <p>{new Date(unidad.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botón de cerrar */}
          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
