'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Trash2, 
  Edit, 
  Eye,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calculator,
  Users,
  FileX,
  FileText
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { 
  getUnidadesSimplified, 
  deleteUnidadSimplified, 
  clearAllUnidadesSimplified,
  createUnidadSimplified,
  updateUnidadSimplified
} from '@/lib/actions/copropietarios-simplified'
import { importUnidadesSimplified } from '@/lib/actions/copropietarios-import-simplified'
import { UnidadSimplified, UnidadImportDataSimplified, ImportResult } from '@/lib/types/copropietarios-simplified'
import CopropietarioFormSimplified from './copropietario-form-simplified'
import ImportSimplified from './import-simplified'
import CopropietarioDetailSimplified from './copropietario-detail-simplified'
import ImportErrorsDialog from './import-errors-dialog'
import ExportButton from './export-button'

interface CopropietariosSimplifiedClientProps {
  condoId: string
}

export default function CopropietariosSimplifiedClient({ condoId }: CopropietariosSimplifiedClientProps) {
  const [unidades, setUnidades] = useState<UnidadSimplified[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipo, setFilterTipo] = useState<string[]>([])
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [showImportExport, setShowImportExport] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showImportErrors, setShowImportErrors] = useState(false)
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [editingUnit, setEditingUnit] = useState<UnidadSimplified | null>(null)
  const [viewingUnit, setViewingUnit] = useState<UnidadSimplified | null>(null)
  const [importErrors, setImportErrors] = useState<ValidationError[]>([])

  // Cargar unidades
  const loadUnidades = async () => {
    try {
      setIsLoading(true)
      const data = await getUnidadesSimplified(condoId)
      setUnidades(data)
    } catch (error) {
      console.error('Error al cargar unidades:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las unidades",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUnidades()
  }, [condoId])

  // Filtrar unidades
  const filteredUnidades = unidades.filter(unidad => {
    const matchesSearch = 
      unidad.unidad_codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unidad.nombre_razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unidad.roles.some(rol => rol.fojas.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesTipo = filterTipo.length === 0 || 
      filterTipo.some(tipo => unidad.tipo_uso.includes(tipo))

    return matchesSearch && matchesTipo
  })

  // Funciones de paginación
  const totalPages = Math.ceil(filteredUnidades.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUnidades = filteredUnidades.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterTipo])

  // Calcular sumatoria de alicuotas
  const totalAlicuota = filteredUnidades.reduce((sum, unidad) => {
    return sum + (unidad.alicuota || 0)
  }, 0)

  const totalAlicuotaPercentage = totalAlicuota * 100 // Convertir a porcentaje

  // Calcular cantidad total de copropietarios (titulares + co-titulares)
  const totalCopropietarios = filteredUnidades.reduce((sum, unidad) => {
    const titulares = 1 // Cada unidad tiene 1 titular
    const coTitulares = unidad.co_titulares?.length || 0
    return sum + titulares + coTitulares
  }, 0)

  // Calcular unidades sin archivos CBR
  const unidadesSinCBR = filteredUnidades.filter(unidad => {
    const sinInscripcion = !unidad.archivo_inscripcion_cbr || 
      (Array.isArray(unidad.archivo_inscripcion_cbr) && unidad.archivo_inscripcion_cbr.length === 0) ||
      (typeof unidad.archivo_inscripcion_cbr === 'object' && Object.keys(unidad.archivo_inscripcion_cbr).length === 0)
    
    const sinVigencia = !unidad.archivo_vigencia_cbr || 
      (Array.isArray(unidad.archivo_vigencia_cbr) && unidad.archivo_vigencia_cbr.length === 0) ||
      (typeof unidad.archivo_vigencia_cbr === 'object' && Object.keys(unidad.archivo_vigencia_cbr).length === 0)
    
    return sinInscripcion || sinVigencia
  }).length

  // Manejar selección individual
  const handleSelectUnit = (unitId: string) => {
    const newSelected = new Set(selectedUnits)
    if (newSelected.has(unitId)) {
      newSelected.delete(unitId)
    } else {
      newSelected.add(unitId)
    }
    setSelectedUnits(newSelected)
  }

  // Manejar selección masiva
  const handleSelectAll = () => {
    if (selectedUnits.size === filteredUnidades.length) {
      setSelectedUnits(new Set())
    } else {
      setSelectedUnits(new Set(filteredUnidades.map(u => u.id)))
    }
  }

  // Eliminar unidad individual
  const handleDeleteUnit = async (unitId: string) => {
    try {
      await deleteUnidadSimplified(unitId)
      await loadUnidades()
      toast({
        title: "Unidad eliminada",
        description: "La unidad se eliminó correctamente",
      })
    } catch (error) {
      console.error('Error al eliminar unidad:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la unidad",
        variant: "destructive",
      })
    }
  }

  // Eliminar unidades seleccionadas
  const handleBulkDelete = async () => {
    if (selectedUnits.size === 0) return

    try {
      const deletePromises = Array.from(selectedUnits).map(unitId => 
        deleteUnidadSimplified(unitId)
      )
      await Promise.all(deletePromises)
      
      setSelectedUnits(new Set())
      await loadUnidades()
      
      toast({
        title: "Unidades eliminadas",
        description: `${selectedUnits.size} unidades eliminadas correctamente`,
      })
    } catch (error) {
      console.error('Error al eliminar unidades:', error)
      toast({
        title: "Error",
        description: "No se pudieron eliminar todas las unidades",
        variant: "destructive",
      })
    }
  }

  // Limpiar todas las unidades
  const handleClearAll = async () => {
    const totalUnits = unidades.length
    
    if (totalUnits === 0) {
      toast({
        title: "No hay unidades",
        description: "No hay unidades para eliminar",
        variant: "destructive",
      })
      return
    }

    // Confirmación más detallada
    const confirmMessage = `¿Estás seguro de que quieres eliminar TODAS las ${totalUnits} unidades?\n\nEsta acción:\n• Eliminará ${totalUnits} unidades permanentemente\n• Eliminará todos los archivos CBR asociados\n• Eliminará todo el historial de cambios\n• NO se puede deshacer\n\nEscribe "ELIMINAR" para confirmar:`
    
    const userInput = prompt(confirmMessage)
    
    if (userInput !== "ELIMINAR") {
      toast({
        title: "Operación cancelada",
        description: "La eliminación fue cancelada",
      })
      return
    }

    try {
      toast({
        title: "Eliminando unidades...",
        description: `Eliminando ${totalUnits} unidades, por favor espera...`,
      })

      const result = await clearAllUnidadesSimplified(condoId)
      await loadUnidades()
      setSelectedUnits(new Set())
      
      if (result.errorCount > 0) {
        toast({
          title: "Limpieza completada con errores",
          description: result.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Limpieza completada",
          description: result.message,
        })
      }
    } catch (error) {
      console.error('Error al limpiar unidades:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudieron eliminar todas las unidades",
        variant: "destructive",
      })
    }
  }

  // Manejar importación simplificada
  const handleImport = async (data: UnidadImportDataSimplified[]) => {
    try {
      const result: ImportResult = await importUnidadesSimplified(condoId, data)
      
      if (result.success) {
        await loadUnidades()
        toast({
          title: "Importación exitosa",
          description: result.message,
        })
      } else {
        // Mostrar errores detallados en diálogo
        setImportErrors(result.errors)
        setShowImportErrors(true)
        
        toast({
          title: "Error en importación",
          description: result.message,
          variant: "destructive",
        })
        
        // También mostrar en consola para debugging
        console.error('Errores de importación detallados:', JSON.stringify(result.errors, null, 2))
      }
    } catch (error) {
      console.error('Error en importación:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      let errorMessage = "No se pudo completar la importación"
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error)
      }
      
      toast({
        title: "Error en importación",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  // Manejar exportación
  const handleExport = (format: 'excel' | 'csv') => {
    // Implementar lógica de exportación
    toast({
      title: "Exportación",
      description: `Exportando en formato ${format.toUpperCase()}`,
    })
  }

  // Función para descargar archivos CBR
  const handleDownloadFile = (archivo: any, nombreArchivo: string) => {
    if (!archivo || !archivo.url) {
      toast({
        title: "Error",
        description: "No se puede descargar el archivo",
        variant: "destructive"
      })
      return
    }

    try {
      // Crear un enlace temporal para descargar
      const link = document.createElement('a')
      link.href = archivo.url
      link.download = archivo.nombre || nombreArchivo
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Descarga iniciada",
        description: `Descargando ${archivo.nombre || nombreArchivo}`,
      })
    } catch (error) {
      console.error('Error al descargar archivo:', error)
      toast({
        title: "Error",
        description: "No se pudo descargar el archivo",
        variant: "destructive"
      })
    }
  }

  // Manejar envío del formulario
  const handleFormSubmit = async (data: any) => {
    try {
      if (editingUnit) {
        // Actualizar unidad existente
        await updateUnidadSimplified(editingUnit.id, data)
        toast({
          title: "Unidad actualizada",
          description: "Los cambios se guardaron correctamente",
        })
      } else {
        // Crear nueva unidad
        await createUnidadSimplified(condoId, data)
        toast({
          title: "Unidad creada",
          description: "La unidad se creó correctamente",
        })
      }
      
      setShowForm(false)
      setEditingUnit(null)
      await loadUnidades()
    } catch (error) {
      console.error('Error al guardar unidad:', error)
      toast({
        title: "Error",
        description: "No se pudo guardar la unidad",
        variant: "destructive",
      })
    }
  }

  // Obtener chips de roles
  const getRolesChips = (roles: any[]) => {
    return roles.map((rol, index) => (
      <div key={index} className="flex items-center gap-1">
        <Badge variant="outline" className="text-xs">
          {rol.fojas}-{rol.numero}-{rol.año}
        </Badge>
        <span className="text-xs text-muted-foreground">
          ({rol.aplicaA.join(', ')})
        </span>
      </div>
    ))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando unidades...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Copropietarios</h2>
          <p className="text-muted-foreground">
            Gestiona las unidades y copropietarios del condominio
          </p>
        </div>
        <div className="flex gap-3">
          <ExportButton copropietarios={filteredUnidades} />
          <Button
            variant="outline"
            onClick={() => setShowImportExport(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Importar Masivo
          </Button>
          <Button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nueva Unidad
          </Button>
        </div>
      </div>

      {/* Información de importación */}
      {unidades.length === 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Upload className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">Importación Masiva Disponible</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Puedes importar múltiples copropietarios desde un archivo Excel o CSV. 
                  Solo necesitas: código de unidad, nombre completo y tipo de uso.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por código, nombre o fojas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['Departamento', 'Bodega', 'Estacionamiento'].map(tipo => (
                <Button
                  key={tipo}
                  variant={filterTipo.includes(tipo) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilterTipo(prev => 
                      prev.includes(tipo) 
                        ? prev.filter(t => t !== tipo)
                        : [...prev, tipo]
                    )
                  }}
                >
                  {tipo}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Estadísticas */}
      {filteredUnidades.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Resumen de Derechos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Resumen de Derechos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-2">
                  {totalAlicuotaPercentage.toFixed(2)}%
                </div>
                <div className="text-sm text-muted-foreground mb-1">
                  Total de Derechos
                </div>
                <div className="text-xs text-muted-foreground">
                  {filteredUnidades.length} unidades
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total de Copropietarios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Copropietarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {totalCopropietarios}
                </div>
                <div className="text-sm text-muted-foreground mb-1">
                  Total de Copropietarios
                </div>
                <div className="text-xs text-muted-foreground">
                  Titulares + Co-titulares
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unidades sin Archivos CBR */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileX className="h-5 w-5" />
                Archivos CBR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className={`text-2xl font-bold mb-2 ${
                  unidadesSinCBR === 0 ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {unidadesSinCBR}
                </div>
                <div className="text-sm text-muted-foreground mb-1">
                  Sin Archivos CBR
                </div>
                <div className="text-xs text-muted-foreground">
                  {unidadesSinCBR === 0 ? 'Todos completos' : 'Requieren archivos'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Acciones masivas */}
      {selectedUnits.size > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedUnits.size} unidades seleccionadas
              </span>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Seleccionadas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de unidades */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Unidades ({filteredUnidades.length})
            </CardTitle>
            {unidades.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearAll}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar Todo ({unidades.length})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredUnidades.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {unidades.length === 0 
                  ? 'No hay unidades registradas' 
                  : 'No se encontraron unidades con los filtros aplicados'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedUnits.size === filteredUnidades.length && filteredUnidades.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Alícuota (%)</TableHead>
                    <TableHead>Titular</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Roles CBR</TableHead>
                    <TableHead>Co-titulares</TableHead>
                    <TableHead>Inscripción CBR</TableHead>
                    <TableHead>Vigencia CBR</TableHead>
                    <TableHead className="w-24">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUnidades.map((unidad) => (
                    <TableRow key={unidad.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUnits.has(unidad.id)}
                          onCheckedChange={() => handleSelectUnit(unidad.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {unidad.unidad_codigo}
                      </TableCell>
                      <TableCell>
                        {unidad.alicuota ? (unidad.alicuota * 100).toFixed(2) + '%' : 'Sin alícuota'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{unidad.nombre_razon_social}</p>
                          <p className="text-sm text-muted-foreground">
                            {unidad.titular_tipo === 'PersonaNatural' ? 'Persona Natural' : 'Persona Jurídica'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {unidad.tipo_uso.map(tipo => (
                            <Badge key={tipo} variant="secondary" className="text-xs">
                              {tipo}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getRolesChips(unidad.roles)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {unidad.co_titulares.length > 0 ? (
                          <div className="text-sm">
                            <p>{unidad.co_titulares.length} co-titular(es)</p>
                            <p className="text-muted-foreground">
                              Total: {unidad.co_titulares.reduce((sum, co) => sum + co.porcentaje, 0).toFixed(1)}%
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sin co-titulares</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {unidad.archivo_inscripcion_cbr && 
                         (Array.isArray(unidad.archivo_inscripcion_cbr) ? unidad.archivo_inscripcion_cbr.length > 0 : Object.keys(unidad.archivo_inscripcion_cbr).length > 0) ? (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">Adjunto</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadFile(unidad.archivo_inscripcion_cbr, 'inscripcion_cbr.pdf')}
                              className="h-6 w-6 p-0"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <FileX className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Sin archivo</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {unidad.archivo_vigencia_cbr && 
                         (Array.isArray(unidad.archivo_vigencia_cbr) ? unidad.archivo_vigencia_cbr.length > 0 : Object.keys(unidad.archivo_vigencia_cbr).length > 0) ? (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">Adjunto</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadFile(unidad.archivo_vigencia_cbr, 'vigencia_cbr.pdf')}
                              className="h-6 w-6 p-0"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <FileX className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Sin archivo</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setViewingUnit(unidad)
                              setShowDetail(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingUnit(unidad)
                              setShowForm(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUnit(unidad.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controles de paginación */}
      {filteredUnidades.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, filteredUnidades.length)} de {filteredUnidades.length} unidades
                </p>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">por página</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modales */}
      {showForm && (
        <CopropietarioFormSimplified
          initialData={editingUnit}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false)
            setEditingUnit(null)
          }}
          isLoading={false}
          condoId={condoId}
        />
      )}

      {showImportExport && (
        <ImportSimplified
          onImport={handleImport}
          onClose={() => setShowImportExport(false)}
        />
      )}

      {showDetail && viewingUnit && (
        <CopropietarioDetailSimplified
          unidad={viewingUnit}
          onClose={() => {
            setShowDetail(false)
            setViewingUnit(null)
          }}
        />
      )}

      {showImportErrors && (
        <ImportErrorsDialog
          errors={importErrors}
          onClose={() => {
            setShowImportErrors(false)
            setImportErrors([])
          }}
        />
      )}
    </div>
  )
}
