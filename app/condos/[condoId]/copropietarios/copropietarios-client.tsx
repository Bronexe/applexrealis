"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Eye, 
  Edit, 
  Trash2, 
  Copy,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Building2,
  Users,
  Percent,
  RefreshCw
} from "lucide-react"
import Link from "next/link"
import { CopropietarioForm } from "./copropietario-form"
import { CopropietarioDetail } from "./copropietario-detail"
import { ImportExport } from "./import-export"
import { ImportErrorsDialog } from "./import-errors-dialog"
import { PaginationControls } from "./pagination-controls"
import * as XLSX from 'xlsx'
import { deleteUnidad, duplicateUnidad, createUnidad, getUnidades, clearAllUnidades } from "@/lib/actions/copropietarios"

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
  fecha_ultima_actualizacion: string
  created_at: string
  updated_at: string
}

interface Condo {
  id: string
  name: string
  comuna?: string
  address?: string
  region_id?: string
  commune_id?: string
}

interface CopropietariosClientProps {
  condo: Condo
  unidades: Unidad[]
  totalAlicuota: number
}

export function CopropietariosClient({ condo, unidades: initialUnidades, totalAlicuota: initialTotalAlicuota }: CopropietariosClientProps) {
  const [unidades, setUnidades] = useState<Unidad[]>(initialUnidades)
  const [totalAlicuota, setTotalAlicuota] = useState(initialTotalAlicuota)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTipo, setFilterTipo] = useState<string[]>([])
  const [filterArchivos, setFilterArchivos] = useState<string>("all")
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showImportExport, setShowImportExport] = useState(false)
  const [selectedUnidad, setSelectedUnidad] = useState<Unidad | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showImportErrors, setShowImportErrors] = useState(false)
  const [importErrors, setImportErrors] = useState<{unidad: string, error: string}[]>([])
  
  // Estados para selección masiva
  const [selectedUnidades, setSelectedUnidades] = useState<Set<string>>(new Set())
  const [isDeletingBulk, setIsDeletingBulk] = useState(false)
  const [importStats, setImportStats] = useState({imported: 0, attempted: 0})
  const [importProgress, setImportProgress] = useState({current: 0, total: 0})
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [totalPages, setTotalPages] = useState(1)
  
  const { toast } = useToast()

  // Función para refrescar datos desde el servidor
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      console.log(`handleRefresh: Iniciando actualización para condominio ${condo.id}`)
      const refreshedUnidades = await getUnidades(condo.id)
      console.log(`handleRefresh: Recibidas ${refreshedUnidades?.length || 0} unidades del servidor`)
      
      setUnidades(refreshedUnidades || [])
      console.log(`handleRefresh: Estado de unidades actualizado con ${refreshedUnidades?.length || 0} unidades`)
      
      // Recalcular total de alícuotas
      const total = refreshedUnidades?.reduce((sum, unidad) => sum + (Number(unidad.alicuota) || 0), 0) || 0
      setTotalAlicuota(total)
      
      toast({
        title: "Datos actualizados",
        description: `${refreshedUnidades?.length || 0} unidades cargadas`,
      })
    } catch (error) {
      console.error("Error al refrescar unidades:", error)
      toast({
        title: "Error al actualizar",
        description: error instanceof Error ? error.message : "No se pudieron cargar los datos actualizados",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Filtrar unidades
  const filteredUnidades = unidades.filter(unidad => {
    const matchesSearch = 
      unidad.unidad_codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unidad.nombre_razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unidad.roles.some(rol => rol.rolCBR.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesTipo = filterTipo.length === 0 || 
      filterTipo.some(tipo => unidad.tipo_uso.includes(tipo))

    const matchesArchivos = filterArchivos === "all" ||
      (filterArchivos === "with" && (unidad.archivo_inscripcion_cbr || unidad.archivo_vigencia_cbr)) ||
      (filterArchivos === "without" && !unidad.archivo_inscripcion_cbr && !unidad.archivo_vigencia_cbr)

    return matchesSearch && matchesTipo && matchesArchivos
  })

  // Calcular paginación
  const totalFilteredUnidades = filteredUnidades.length
  const totalPagesCalculated = Math.ceil(totalFilteredUnidades / pageSize)
  
  // Actualizar totalPages cuando cambien los filtros
  React.useEffect(() => {
    setTotalPages(totalPagesCalculated)
    // Si la página actual es mayor que el total de páginas, ir a la primera página
    if (currentPage > totalPagesCalculated && totalPagesCalculated > 0) {
      setCurrentPage(1)
    }
  }, [totalPagesCalculated, currentPage])

  // Obtener unidades para la página actual
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedUnidades = filteredUnidades.slice(startIndex, endIndex)

  // Funciones de paginación
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Volver a la primera página
  }

  // Función de diagnóstico para verificar el estado
  const handleDiagnostico = async () => {
    try {
      console.log("=== DIAGNÓSTICO DE UNIDADES ===")
      console.log(`Condominio ID: ${condo.id}`)
      console.log(`Unidades en estado local: ${unidades.length}`)
      console.log(`Unidades filtradas: ${filteredUnidades.length}`)
      console.log(`Unidades paginadas: ${paginatedUnidades.length}`)
      console.log(`Página actual: ${currentPage} de ${totalPages}`)
      console.log(`Tamaño de página: ${pageSize}`)
      console.log(`Filtros activos:`, {
        searchTerm,
        filterTipo,
        filterArchivos
      })
      
      // Obtener datos frescos del servidor
      const unidadesServidor = await getUnidades(condo.id)
      console.log(`Unidades en servidor: ${unidadesServidor.length}`)
      
      // Verificar si hay diferencias
      if (unidades.length !== unidadesServidor.length) {
        console.warn(`⚠️ DISCREPANCIA: Local (${unidades.length}) vs Servidor (${unidadesServidor.length})`)
      }
      
      // Mostrar primeras 5 unidades del servidor
      console.log("Primeras 5 unidades del servidor:", unidadesServidor.slice(0, 5))
      
      // Mostrar primeras 5 unidades locales
      console.log("Primeras 5 unidades locales:", unidades.slice(0, 5))
      
      // Verificar si hay filtros aplicados
      if (filteredUnidades.length < unidades.length) {
        console.log(`🔍 Filtros aplicados: ${unidades.length} → ${filteredUnidades.length}`)
        console.log("Unidades filtradas:", filteredUnidades.slice(0, 5))
      }
      
      // Verificar paginación
      if (paginatedUnidades.length < filteredUnidades.length) {
        console.log(`📄 Paginación: ${filteredUnidades.length} → ${paginatedUnidades.length}`)
        console.log("Unidades en página actual:", paginatedUnidades)
      }
      
      toast({
        title: "Diagnóstico completado",
        description: `Local: ${unidades.length}, Servidor: ${unidadesServidor.length}, Filtradas: ${filteredUnidades.length}`,
      })
    } catch (error) {
      console.error("Error en diagnóstico:", error)
      toast({
        title: "Error en diagnóstico",
        description: "Revisar consola para detalles",
        variant: "destructive",
      })
    }
  }

  const handleCreateUnidad = () => {
    setSelectedUnidad(null)
    setShowForm(true)
  }

  const handleEditUnidad = (unidad: Unidad) => {
    setSelectedUnidad(unidad)
    setShowForm(true)
  }

  const handleViewUnidad = (unidad: Unidad) => {
    setSelectedUnidad(unidad)
    setShowDetail(true)
  }

  const handleDeleteUnidad = async (unidad: Unidad) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la unidad "${unidad.unidad_codigo}"?`)) {
      return
    }

    try {
      setIsLoading(true)
      await deleteUnidad(condo.id, unidad.id)
      toast({
        title: "Unidad eliminada",
        description: `La unidad ${unidad.unidad_codigo} ha sido eliminada exitosamente`,
      })
      // Actualizar lista local
      setUnidades(prev => prev.filter(u => u.id !== unidad.id))
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar la unidad",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDuplicateUnidad = async (unidad: Unidad) => {
    const nuevoCodigo = `${unidad.unidad_codigo}-COPIA`
    
    try {
      setIsLoading(true)
      const unidadDuplicada = await duplicateUnidad(condo.id, unidad.id, nuevoCodigo)
      toast({
        title: "Unidad duplicada",
        description: `La unidad ${unidad.unidad_codigo} ha sido duplicada como ${nuevoCodigo}`,
      })
      // Actualizar lista local
      setUnidades(prev => [...prev, unidadDuplicada])
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al duplicar la unidad",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Funciones para selección masiva
  const handleSelectUnidad = (unidadId: string, checked: boolean) => {
    setSelectedUnidades(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(unidadId)
      } else {
        newSet.delete(unidadId)
      }
      return newSet
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUnidades(new Set(paginatedUnidades.map(u => u.id)))
    } else {
      setSelectedUnidades(new Set())
    }
  }

  const handleBulkDelete = async () => {
    if (selectedUnidades.size === 0) {
      toast({
        title: "Nada seleccionado",
        description: "Selecciona al menos una unidad para eliminar",
        variant: "destructive",
      })
      return
    }

    const selectedUnidadesList = unidades.filter(u => selectedUnidades.has(u.id))
    const confirmMessage = `¿Estás seguro de que quieres eliminar ${selectedUnidades.size} unidades?\n\nUnidades: ${selectedUnidadesList.map(u => u.unidad_codigo).join(', ')}`
    
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      setIsDeletingBulk(true)
      let successCount = 0
      let errorCount = 0
      const errors: string[] = []

      for (const unidadId of selectedUnidades) {
        try {
          await deleteUnidad(condo.id, unidadId)
          successCount++
        } catch (error) {
          errorCount++
          const unidad = unidades.find(u => u.id === unidadId)
          errors.push(`${unidad?.unidad_codigo}: ${error instanceof Error ? error.message : 'Error desconocido'}`)
        }
      }

      // Actualizar lista local y forzar actualización del servidor
      setUnidades(prev => prev.filter(u => !selectedUnidades.has(u.id)))
      setSelectedUnidades(new Set())
      
      // Forzar actualización desde el servidor para sincronizar
      setTimeout(async () => {
        try {
          const unidadesActualizadas = await getUnidades(condo.id)
          setUnidades(unidadesActualizadas)
          console.log(`Eliminación masiva: Lista actualizada desde servidor - ${unidadesActualizadas.length} unidades`)
        } catch (error) {
          console.error("Error actualizando lista después de eliminación masiva:", error)
        }
      }, 1000)

      if (successCount > 0) {
        toast({
          title: "Eliminación masiva completada",
          description: `${successCount} unidades eliminadas exitosamente${errorCount > 0 ? `, ${errorCount} errores` : ''}`,
          variant: errorCount > 0 ? "destructive" : "default",
        })
      }

      if (errors.length > 0) {
        console.error("Errores en eliminación masiva:", errors)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error durante la eliminación masiva",
        variant: "destructive",
      })
    } finally {
      setIsDeletingBulk(false)
    }
  }

  const handleClearAll = async () => {
    if (unidades.length === 0) {
      toast({
        title: "No hay unidades",
        description: "No hay unidades para eliminar",
        variant: "destructive",
      })
      return
    }

    const confirmMessage = `¿Estás seguro de que quieres eliminar TODAS las unidades (${unidades.length})?\n\nEsta acción no se puede deshacer.`
    
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      setIsLoading(true)
      const result = await clearAllUnidades(condo.id)
      
      toast({
        title: "Limpieza completada",
        description: `${result.deletedCount} unidades eliminadas exitosamente${result.errorCount > 0 ? `, ${result.errorCount} con advertencias` : ''}${result.remainingInServer > 0 ? `, ${result.remainingInServer} no eliminadas del servidor` : ''}`,
        variant: result.errorCount > 0 || result.remainingInServer > 0 ? "destructive" : "default",
      })
      
      // Actualizar lista local
      setUnidades([])
      setSelectedUnidades(new Set())
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al limpiar las unidades",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para validar una unidad individual
  const validateUnidad = (item: any, index: number) => {
    const errores: string[] = []
    const numeroFila = index + 2 // +2 porque index es 0-based y la fila 1 son headers

    // Log de debug para las primeras 3 unidades
    if (index < 3) {
      console.log(`validateUnidad: Validando unidad ${index + 1}:`, {
        unidad_codigo: item.unidad_codigo,
        titular_tipo: item.titular_tipo,
        nombre_razon_social: item.nombre_razon_social,
        tipo_uso: item.tipo_uso,
        alicuota: item.alicuota
      })
    }

    // Validar campos obligatorios
    if (!item.unidad_codigo?.trim()) {
      errores.push("Código de unidad es obligatorio")
    }
    if (!item.titular_tipo?.trim()) {
      errores.push("Tipo de titular es obligatorio")
    }
    if (!item.nombre_razon_social?.trim()) {
      errores.push("Nombre/razón social es obligatorio")
    }
    if (!item.tipo_uso || (typeof item.tipo_uso === 'string' && !item.tipo_uso.trim()) || (Array.isArray(item.tipo_uso) && item.tipo_uso.length === 0)) {
      errores.push("Tipo de uso es obligatorio")
    }

    // Validar formato de titular_tipo
    if (item.titular_tipo && !['PersonaNatural', 'PersonaJuridica'].includes(item.titular_tipo)) {
      errores.push("Tipo de titular debe ser 'PersonaNatural' o 'PersonaJuridica'")
    }

    // Validar alícuota si se proporciona
    if (item.alicuota !== undefined && item.alicuota !== '') {
      const alicuota = parseFloat(item.alicuota)
      if (isNaN(alicuota) || alicuota < 0 || alicuota > 100) {
        errores.push("Alícuota debe ser un número entre 0 y 100")
      }
    }

    // Validar tipo_uso
    if (item.tipo_uso) {
      // Log de debug para las primeras 3 unidades
      if (index < 3) {
        console.log(`validateUnidad: tipo_uso para unidad ${index + 1}:`, item.tipo_uso, 'tipo:', typeof item.tipo_uso)
      }
      
      const tiposValidos = ['Departamento', 'Bodega', 'Estacionamiento']
      
      // Si tipo_uso es un array, usarlo directamente
      let tipos: string[]
      if (Array.isArray(item.tipo_uso)) {
        tipos = item.tipo_uso
      } else {
        // Si es string, dividir por ;
        tipos = item.tipo_uso.split(';').map((t: string) => t.trim())
      }
      
      const tiposInvalidos = tipos.filter((t: string) => !tiposValidos.includes(t))
      if (tiposInvalidos.length > 0) {
        errores.push(`Tipos de uso inválidos: ${tiposInvalidos.join(', ')}. Válidos: ${tiposValidos.join(', ')}`)
      }
    }

    // Validar roles si se proporciona
    if (item.roles) {
      // Log de debug para las primeras 3 unidades
      if (index < 3) {
        console.log(`validateUnidad: roles para unidad ${index + 1}:`, item.roles, 'tipo:', typeof item.roles)
      }
      
      try {
        // Si roles es un array, no validar formato de string
        if (Array.isArray(item.roles)) {
          // Los roles ya están procesados como array, no validar formato
        } else {
          const rolesArray = item.roles.split('|').map((r: string) => {
            const [rolCBR, aplicaA] = r.split(':')
            if (!rolCBR?.trim() || !aplicaA?.trim()) {
              throw new Error("Formato de rol inválido")
            }
            return { rolCBR: rolCBR.trim(), aplicaA: aplicaA.split(',').map((a: string) => a.trim()) }
          })
        }
      } catch (error) {
        errores.push("Formato de roles inválido. Use: rol:aplicaA|rol:aplicaA")
      }
    }

    // Validar co_titulares si se proporciona
    if (item.co_titulares && (typeof item.co_titulares === 'string' ? item.co_titulares.trim() : true)) {
      // Log de debug para las primeras 3 unidades
      if (index < 3) {
        console.log(`validateUnidad: co_titulares para unidad ${index + 1}:`, item.co_titulares, 'tipo:', typeof item.co_titulares)
      }
      
      try {
        // Si co_titulares ya es un objeto/array, no parsear
        let coTitulares
        if (typeof item.co_titulares === 'object') {
          coTitulares = item.co_titulares
        } else {
          coTitulares = JSON.parse(item.co_titulares)
        }
        
        if (!Array.isArray(coTitulares)) {
          errores.push("co_titulares debe ser un array JSON")
        } else {
          const totalPorcentaje = coTitulares.reduce((sum: number, co: any) => sum + (co.porcentaje || 0), 0)
          if (Math.abs(totalPorcentaje - 100) > 0.01) {
            errores.push(`Co-titulares: suma de porcentajes debe ser 100%, actual: ${totalPorcentaje}%`)
          }
        }
      } catch (error) {
        errores.push("Formato JSON inválido en co_titulares")
      }
    }

    // Validar contacto si se proporciona
    if (item.contacto && (typeof item.contacto === 'string' ? item.contacto.trim() : true)) {
      // Log de debug para las primeras 3 unidades
      if (index < 3) {
        console.log(`validateUnidad: contacto para unidad ${index + 1}:`, item.contacto, 'tipo:', typeof item.contacto)
      }
      
      try {
        // Si contacto ya es un objeto, no parsear
        if (typeof item.contacto === 'object') {
          // Ya es un objeto, no validar
        } else {
          JSON.parse(item.contacto)
        }
      } catch (error) {
        errores.push("Formato JSON inválido en contacto")
      }
    }

    // Log de debug para las primeras 3 unidades si hay errores
    if (index < 3 && errores.length > 0) {
      console.log(`validateUnidad: Errores en unidad ${index + 1}:`, errores)
    }

    // Log de debug para las primeras 3 unidades (siempre)
    if (index < 3) {
      console.log(`validateUnidad: Unidad ${index + 1} validada exitosamente, errores: ${errores.length}`)
    }

    return {
      fila: numeroFila,
      unidad: item.unidad_codigo || 'Sin código',
      errores
    }
  }

  const handleImport = async (data: any[]) => {
    console.log(`handleImport: Recibidas ${data.length} unidades del componente ImportExport`)
    console.log(`handleImport: Primeras 3 unidades recibidas:`, data.slice(0, 3))
    
    setIsLoading(true)
    try {
      // FASE 1: Validar toda la planilla antes de importar
      console.log(`handleImport: Iniciando validación de ${data.length} unidades...`)
      const erroresValidacion = []
      const codigosUnidad = new Set<string>()

      for (let i = 0; i < data.length; i++) {
        try {
          const item = data[i]
          const validacion = validateUnidad(item, i)
          
          if (validacion.errores.length > 0) {
            console.log(`handleImport: Error en fila ${validacion.fila} (${validacion.unidad}):`, validacion.errores)
            erroresValidacion.push({
              fila: validacion.fila,
              unidad: validacion.unidad,
              errores: validacion.errores
            })
          }
          
          // Log cada 20 unidades para no saturar la consola
          if (i % 20 === 0) {
            console.log(`handleImport: Validando unidad ${i + 1}/${data.length}: ${item.unidad_codigo}`)
          }
          
          // Log detallado para las primeras 5 unidades
          if (i < 5) {
            console.log(`handleImport: Validación completada para unidad ${i + 1}: ${item.unidad_codigo}, errores: ${validacion.errores.length}`)
          }

          // Verificar códigos duplicados en el archivo
          if (item.unidad_codigo) {
            if (codigosUnidad.has(item.unidad_codigo)) {
              erroresValidacion.push({
                fila: i + 2,
                unidad: item.unidad_codigo,
                errores: ['Código de unidad duplicado en el archivo']
              })
            }
            codigosUnidad.add(item.unidad_codigo)
          }
        } catch (error) {
          console.error(`handleImport: Error validando unidad ${i + 1}:`, error)
          erroresValidacion.push({
            fila: i + 2,
            unidad: data[i]?.unidad_codigo || 'Sin código',
            errores: [`Error de validación: ${error instanceof Error ? error.message : 'Error desconocido'}`]
          })
        }
      }

      // Verificar códigos duplicados con unidades existentes
      const codigosExistentes = unidades.map(u => u.unidad_codigo)
      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        if (item.unidad_codigo && codigosExistentes.includes(item.unidad_codigo)) {
          erroresValidacion.push({
            fila: i + 2,
            unidad: item.unidad_codigo,
            errores: ['Código de unidad ya existe en el sistema']
          })
        }
      }

      console.log(`handleImport: Bucle de validación completado. Errores encontrados: ${erroresValidacion.length}`)
      console.log(`handleImport: Total de unidades validadas: ${data.length}`)
      if (erroresValidacion.length > 0) {
        console.log(`handleImport: Primeros 5 errores:`, erroresValidacion.slice(0, 5))
      }

      // Si hay errores de validación, mostrar y no importar
      if (erroresValidacion.length > 0) {
        const erroresPlana = erroresValidacion.flatMap(e => 
          e.errores.map(error => ({
            unidad: e.unidad,
            error: `Fila ${e.fila}: ${error}`
          }))
        )
        
        setImportErrors(erroresPlana)
        setImportStats({imported: 0, attempted: data.length})
        setShowImportErrors(true)
        
        toast({
          title: "Errores en la planilla",
          description: `Se encontraron ${erroresValidacion.length} filas con errores. Corrija la planilla antes de importar.`,
          variant: "destructive",
        })
        
        setIsLoading(false)
        return
      }

      console.log(`handleImport: Validación exitosa, procediendo con importación de ${data.length} unidades...`)

      // FASE 2: Si no hay errores, proceder con la importación
      const nuevasUnidades = []
      const erroresImportacion = []
      const batchSize = 10 // Procesar en lotes de 10 unidades
      
      console.log(`handleImport: Iniciando importación de ${data.length} unidades en lotes de ${batchSize}...`)
      setImportProgress({current: 0, total: data.length})
      
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize)
        console.log(`handleImport: Procesando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(data.length / batchSize)} (unidades ${i + 1} a ${Math.min(i + batchSize, data.length)})`)
        
        for (let j = 0; j < batch.length; j++) {
          const item = batch[j]
          const globalIndex = i + j
          
          try {
            console.log(`handleImport: Procesando unidad ${globalIndex + 1}/${data.length}: ${item.unidad_codigo}`)
            
            const unidad = await createUnidad(condo.id, {
              unidad_codigo: item.unidad_codigo,
              alicuota: item.alicuota,
              titular_tipo: item.titular_tipo,
              nombre_razon_social: item.nombre_razon_social,
              tipo_uso: item.tipo_uso || [],
              roles: item.roles || [],
              co_titulares: item.co_titulares || [],
              contacto: item.contacto || {},
              observaciones: item.observaciones
            })
            nuevasUnidades.push(unidad)
            console.log(`handleImport: Unidad ${item.unidad_codigo} importada exitosamente`)
          } catch (error) {
            console.error(`handleImport: Error en unidad ${item.unidad_codigo}:`, error)
            // Continuar con la siguiente unidad en lugar de detener
            erroresImportacion.push({
              unidad: item.unidad_codigo || 'Sin código',
              error: `Fila ${globalIndex + 2}: ${error instanceof Error ? error.message : 'Error desconocido durante la importación'}`
            })
          }
          
          // Actualizar progreso
          setImportProgress({current: globalIndex + 1, total: data.length})
        }
        
        // Pequeña pausa entre lotes para evitar sobrecarga
        if (i + batchSize < data.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      console.log(`handleImport: Importación completada. Exitosas: ${nuevasUnidades.length}, Errores: ${erroresImportacion.length}`)
      
      // Mostrar resultados de la importación
      if (erroresImportacion.length > 0) {
        setImportErrors(erroresImportacion)
        setImportStats({imported: nuevasUnidades.length, attempted: data.length})
        setShowImportErrors(true)
        
        toast({
          title: "Importación parcial",
          description: `${nuevasUnidades.length} de ${data.length} unidades importadas. ${erroresImportacion.length} errores.`,
          variant: "destructive",
        })
      }
      
      // Refrescar datos desde el servidor para obtener la lista completa
      console.log(`handleImport: Importadas ${nuevasUnidades.length} unidades, refrescando datos...`)
      await handleRefresh()
      console.log(`handleImport: Refresco completado`)
      
      console.log(`handleImport: IMPORTACIÓN COMPLETADA - ${nuevasUnidades.length} unidades importadas exitosamente`)
      
      toast({
        title: "Importación exitosa",
        description: `${nuevasUnidades.length} unidades importadas correctamente`,
      })
    } catch (error) {
      toast({
        title: "Error en importación",
        description: "Error al procesar los datos importados",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    // Implementar lógica de exportación
    toast({
      title: "Exportación iniciada",
      description: `Exportando datos en formato ${format.toUpperCase()}`,
    })
  }

  const handleDownloadExample = (format: 'csv' | 'excel') => {
    // Datos de ejemplo que coinciden EXACTAMENTE con el formato aceptado
    const exampleData = [
      {
        unidad_codigo: "A-101",
        titular_tipo: "PersonaNatural",
        nombre_razon_social: "Juan Pérez Silva",
        tipo_uso: "Departamento",
        alicuota: "15.5000",
        roles: "Propietario:Departamento",
        co_titulares: '[{"nombre":"María González","identificacion":"12345678-9","porcentaje":50}]',
        contacto: '{"email":"juan@email.com","telefono":"+56912345678"}',
        observaciones: "Unidad principal"
      },
      {
        unidad_codigo: "A-102",
        titular_tipo: "PersonaJuridica",
        nombre_razon_social: "Inmobiliaria ABC Ltda",
        tipo_uso: "Departamento;Estacionamiento",
        alicuota: "12.2500",
        roles: "Propietario:Departamento,Estacionamiento",
        co_titulares: '[{"nombre":"Carlos López","identificacion":"98765432-1","porcentaje":100}]',
        contacto: '{"email":"contacto@abc.cl","telefono":"+56987654321"}',
        observaciones: "Empresa propietaria"
      },
      {
        unidad_codigo: "B-201",
        titular_tipo: "PersonaNatural",
        nombre_razon_social: "Ana Rodríguez",
        tipo_uso: "Departamento;Bodega",
        alicuota: "18.7500",
        roles: "Propietario:Departamento|Arrendatario:Bodega",
        co_titulares: "",
        contacto: '{"email":"ana@email.com"}',
        observaciones: "Sin co-titulares"
      },
      {
        unidad_codigo: "B-202",
        titular_tipo: "PersonaNatural",
        nombre_razon_social: "Pedro Martínez",
        tipo_uso: "Estacionamiento",
        alicuota: "5.0000",
        roles: "Propietario:Estacionamiento",
        co_titulares: "",
        contacto: '{"telefono":"+56955555555"}',
        observaciones: "Solo estacionamiento"
      },
      {
        unidad_codigo: "C-301",
        titular_tipo: "PersonaJuridica",
        nombre_razon_social: "Constructora XYZ S.A.",
        tipo_uso: "Departamento",
        alicuota: "20.0000",
        roles: "Propietario:Departamento",
        co_titulares: '[{"nombre":"Luis Fernández","identificacion":"11111111-1","porcentaje":60},{"nombre":"Carmen Ruiz","identificacion":"22222222-2","porcentaje":40}]',
        contacto: '{"email":"info@xyz.cl"}',
        observaciones: "Múltiples co-titulares"
      }
    ]

    if (format === 'csv') {
      // Generar CSV con formato exacto
      const headers = Object.keys(exampleData[0])
      const csvContent = [
        headers.join(','),
        ...exampleData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row]
            // Escapar comillas y envolver en comillas si contiene comas
            return value.includes(',') || value.includes('"') ? `"${value.replace(/"/g, '""')}"` : value
          }).join(',')
        )
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'ejemplo_copropietarios.csv'
      link.click()
    } else {
      // Generar Excel con formato exacto - SIN instrucciones adicionales
      const worksheet = XLSX.utils.json_to_sheet(exampleData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Copropietarios')
      
      // Configurar ancho de columnas para mejor visualización
      const colWidths = [
        { wch: 15 }, // unidad_codigo
        { wch: 15 }, // titular_tipo
        { wch: 25 }, // nombre_razon_social
        { wch: 20 }, // tipo_uso
        { wch: 12 }, // alicuota
        { wch: 30 }, // roles
        { wch: 50 }, // co_titulares
        { wch: 40 }, // contacto
        { wch: 20 }  // observaciones
      ]
      worksheet['!cols'] = colWidths
      
      XLSX.writeFile(workbook, 'ejemplo_copropietarios.xlsx')
    }
  }

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

  const getRolesChips = (roles: Array<{rolCBR: string, aplicaA: string[]}>) => {
    return roles.map((rol, index) => (
      <div key={index} className="flex items-center gap-1">
        <Badge variant="outline" className="text-xs">
          {rol.rolCBR}
        </Badge>
        <span className="text-xs text-muted-foreground">
          ({rol.aplicaA.join(', ')})
        </span>
      </div>
    ))
  }

  const getArchivoStatus = (archivo: any) => {
    if (!archivo) {
      return <XCircle className="h-4 w-4 text-red-500" title="Sin archivo" />
    }
    
    const fechaArchivo = new Date(archivo.fechaSubida)
    const unAnoAtras = new Date()
    unAnoAtras.setFullYear(unAnoAtras.getFullYear() - 1)
    
    if (fechaArchivo < unAnoAtras) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" title="Archivo desactualizado" />
    }
    
    return <CheckCircle className="h-4 w-4 text-green-500" title="Archivo actualizado" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Copropietarios
          </h2>
          <p className="text-muted-foreground">
            Gestiona las unidades y copropietarios del condominio
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDiagnostico}
            className="bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
          >
            🔍 Diagnóstico
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowImportExport(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Importar/Exportar
          </Button>
          {unidades.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearAll}
              disabled={isLoading}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isLoading ? 'Limpiando...' : 'Limpiar Todo'}
            </Button>
          )}
          {selectedUnidades.size > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleBulkDelete}
              disabled={isDeletingBulk}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeletingBulk ? 'Eliminando...' : `Eliminar (${selectedUnidades.size})`}
            </Button>
          )}
          <Button onClick={handleCreateUnidad} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Unidad
          </Button>
        </div>
      </div>

      {/* Resumen de Alícuotas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Resumen de Alícuotas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold">
                {totalAlicuota.toFixed(4)}%
              </div>
              <div className="flex items-center gap-2">
                {totalAlicuota === 100 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
                <span className="text-sm text-muted-foreground">
                  {totalAlicuota === 100 ? "Completo" : "Incompleto"}
                </span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {unidades.length} unidades registradas
            </div>
          </div>
          {totalAlicuota !== 100 && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ La suma de alícuotas debe ser exactamente 100%. 
                Actual: {totalAlicuota.toFixed(4)}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Búsqueda</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Unidad, nombre, rol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Uso</label>
              <div className="space-y-2">
                {['Departamento', 'Bodega', 'Estacionamiento'].map(tipo => (
                  <div key={tipo} className="flex items-center space-x-2">
                    <Checkbox
                      id={tipo}
                      checked={filterTipo.includes(tipo)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilterTipo(prev => [...prev, tipo])
                        } else {
                          setFilterTipo(prev => prev.filter(t => t !== tipo))
                        }
                      }}
                    />
                    <label htmlFor={tipo} className="text-sm">{tipo}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Archivos CBR</label>
              <Select value={filterArchivos} onValueChange={setFilterArchivos}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="with">Con archivos</SelectItem>
                  <SelectItem value="without">Sin archivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Acciones</label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setSearchTerm("")
                    setFilterTipo([])
                    setFilterArchivos("all")
                  }}
                >
                  Limpiar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Unidades */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Unidades</CardTitle>
              <CardDescription>
                {totalFilteredUnidades} de {unidades.length} unidades
                {totalPages > 1 && ` • Página ${currentPage} de ${totalPages}`}
                {selectedUnidades.size > 0 && (
                  <span className="ml-2 text-blue-600 font-medium">
                    • {selectedUnidades.size} seleccionadas
                  </span>
                )}
              </CardDescription>
            </div>
            {selectedUnidades.size > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUnidades(new Set())}
                >
                  Limpiar selección
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedUnidades.size > 0 && selectedUnidades.size === paginatedUnidades.length}
                      onCheckedChange={handleSelectAll}
                      aria-label="Seleccionar todas las unidades"
                    />
                  </TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Alícuota</TableHead>
                  <TableHead>Nombre/Razón Social</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Inscripción CBR</TableHead>
                  <TableHead>Vigencia CBR</TableHead>
                  <TableHead>Últ. Actualización</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUnidades.map((unidad) => (
                  <TableRow key={unidad.id} className={selectedUnidades.has(unidad.id) ? "bg-muted/50" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUnidades.has(unidad.id)}
                        onCheckedChange={(checked) => handleSelectUnidad(unidad.id, checked as boolean)}
                        aria-label={`Seleccionar unidad ${unidad.unidad_codigo}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {unidad.unidad_codigo}
                    </TableCell>
                    <TableCell>
                      {unidad.alicuota ? `${unidad.alicuota.toFixed(4)}%` : 'Sin alícuota'}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{unidad.nombre_razon_social}</div>
                        <div className="text-sm text-muted-foreground">
                          {unidad.titular_tipo === 'PersonaNatural' ? 'Persona Natural' : 'Persona Jurídica'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {getTipoUsoBadges(unidad.tipo_uso)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getRolesChips(unidad.roles)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getArchivoStatus(unidad.archivo_inscripcion_cbr)}
                    </TableCell>
                    <TableCell>
                      {getArchivoStatus(unidad.archivo_vigencia_cbr)}
                    </TableCell>
                    <TableCell>
                      {new Date(unidad.fecha_ultima_actualizacion).toLocaleDateString('es-CL')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUnidad(unidad)}
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUnidad(unidad)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicateUnidad(unidad)}
                          title="Duplicar"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUnidad(unidad)}
                          title="Eliminar"
                          className="text-destructive hover:text-destructive"
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
          
          {/* Controles de Paginación */}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalFilteredUnidades}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={goToPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>

      {/* Formularios Modales */}
      {showForm && (
        <CopropietarioForm
          unidad={selectedUnidad}
          condoId={condo.id}
          onClose={() => {
            setShowForm(false)
            setSelectedUnidad(null)
          }}
          onSave={(nuevaUnidad) => {
            if (selectedUnidad?.id) {
              // Actualizar unidad existente
              setUnidades(prev => prev.map(u => u.id === selectedUnidad.id ? nuevaUnidad : u))
            } else {
              // Agregar nueva unidad
              setUnidades(prev => [...prev, nuevaUnidad])
            }
            setShowForm(false)
            setSelectedUnidad(null)
          }}
        />
      )}

      {showDetail && selectedUnidad && (
        <CopropietarioDetail
          unidad={selectedUnidad}
          onClose={() => {
            setShowDetail(false)
            setSelectedUnidad(null)
          }}
        />
      )}

      {showImportExport && (
        <ImportExport
          onClose={() => setShowImportExport(false)}
          onImport={handleImport}
          onExport={handleExport}
          onDownloadExample={handleDownloadExample}
        />
      )}

      <ImportErrorsDialog
        isOpen={showImportErrors}
        onClose={() => setShowImportErrors(false)}
        errors={importErrors}
        totalImported={importStats.imported}
        totalAttempted={importStats.attempted}
      />

      {/* Indicador de Progreso de Importación */}
      {isLoading && importProgress.total > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Importando Unidades</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Progreso</span>
                  <span>{importProgress.current} de {importProgress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {Math.round((importProgress.current / importProgress.total) * 100)}% completado
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
