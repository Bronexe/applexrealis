'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, AlertTriangle, FileText } from 'lucide-react'
import { ValidationError } from '@/lib/types/copropietarios-simplified'

interface ImportErrorsDialogProps {
  errors: ValidationError[]
  onClose: () => void
}

export default function ImportErrorsDialog({ errors, onClose }: ImportErrorsDialogProps) {
  const getFieldBadgeColor = (field: string) => {
    switch (field) {
      case 'unidad_codigo':
        return 'bg-red-100 text-red-800'
      case 'nombre_completo':
        return 'bg-orange-100 text-orange-800'
      case 'tipo_uso':
        return 'bg-yellow-100 text-yellow-800'
      case 'alicuota':
        return 'bg-blue-100 text-blue-800'
      case 'tipo_titular':
        return 'bg-purple-100 text-purple-800'
      case 'email':
        return 'bg-green-100 text-green-800'
      case 'telefono':
        return 'bg-indigo-100 text-indigo-800'
      case 'observaciones':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getFieldLabel = (field: string) => {
    switch (field) {
      case 'unidad_codigo':
        return 'Código de Unidad'
      case 'nombre_completo':
        return 'Nombre Completo'
      case 'tipo_uso':
        return 'Tipo de Uso'
      case 'alicuota':
        return 'Alícuota (%)'
      case 'tipo_titular':
        return 'Tipo de Titular'
      case 'email':
        return 'Email'
      case 'telefono':
        return 'Teléfono'
      case 'observaciones':
        return 'Observaciones'
      default:
        return field
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Errores de Importación
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Se encontraron {errors.length} errores que impiden la importación
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Resumen de errores */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-900 mb-2">Resumen de Errores</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {Array.from(new Set(errors.flatMap(e => e.campos_con_error))).map(field => {
                const count = errors.filter(e => e.campos_con_error.includes(field)).length
                return (
                  <div key={field} className="flex items-center gap-2">
                    <Badge className={getFieldBadgeColor(field)}>
                      {getFieldLabel(field)}
                    </Badge>
                    <span className="text-red-700">({count})</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Lista detallada de errores */}
          <div className="space-y-3">
            <h3 className="font-medium">Errores por Fila</h3>
            {errors.map((error, index) => (
              <Card key={index} className="border-red-200">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-red-900">
                        Fila {error.fila} - {error.unidad}
                      </h4>
                      <p className="text-sm text-red-700">
                        {error.errores.length} error(es) encontrado(s)
                      </p>
                    </div>
                    <Badge variant="destructive">
                      {error.errores.length} error(es)
                    </Badge>
                  </div>

                  {/* Campos con error */}
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Campos con error:</p>
                    <div className="flex flex-wrap gap-2">
                      {error.campos_con_error.map(field => (
                        <Badge key={field} className={getFieldBadgeColor(field)}>
                          {getFieldLabel(field)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Errores específicos */}
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Errores encontrados:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {error.errores.map((err, errIndex) => (
                        <li key={errIndex} className="text-sm text-red-700">
                          {err}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Datos problemáticos */}
                  {Object.keys(error.datos_problematicos).length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Datos problemáticos:</p>
                      <div className="bg-gray-50 p-3 rounded border text-xs font-mono">
                        {Object.entries(error.datos_problematicos).map(([key, value]) => (
                          <div key={key} className="flex gap-2">
                            <span className="font-medium text-gray-600">{getFieldLabel(key)}:</span>
                            <span className="text-red-600">
                              {value === null || value === undefined ? 'vacío' : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Instrucciones */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">¿Cómo corregir los errores?</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Corrige los errores en tu archivo Excel/CSV</li>
              <li>Los campos obligatorios son: Código de Unidad, Nombre Completo y Tipo de Uso</li>
              <li>El Tipo de Uso debe ser: Departamento, Bodega o Estacionamiento</li>
              <li>La Alícuota debe ser un número entre 0 y 1.0 (formato decimal: 1.0 = 100%)</li>
              <li>El Tipo de Titular debe ser: PersonaNatural o PersonaJuridica</li>
              <li>El Email debe tener un formato válido</li>
            </ul>
          </div>

          {/* Botón de cerrar */}
          <div className="flex justify-end pt-4">
            <Button onClick={onClose} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Entendido
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}