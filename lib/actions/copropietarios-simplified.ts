'use server'

import { createClient } from '@/lib/supabase/server'
import { UnidadFormData, UnidadImportData, ValidationError } from '@/lib/types/copropietarios-simplified'

// Crear una nueva unidad con estructura simplificada
export async function createUnidadSimplified(condoId: string, data: UnidadFormData) {
  const supabase = await createClient()
  
  try {
    console.log(`createUnidadSimplified: Creando unidad ${data.unidad_codigo} para condominio ${condoId}`)
    
    // Validar alícuota (opcional)
    if (data.alicuota !== null && data.alicuota !== undefined && data.alicuota > 0) {
      const alicuotaStr = data.alicuota.toString()
      const digitsOnly = alicuotaStr.replace('.', '')
      if (digitsOnly.length > 10) {
        console.error(`createUnidadSimplified: Alícuota excede formato DECIMAL(10,6): ${data.alicuota} (${digitsOnly.length} dígitos)`)
        throw new Error(`Alícuota excede formato permitido: ${data.alicuota}`)
      }
      console.log(`createUnidadSimplified: Alícuota válida: ${data.alicuota} (${digitsOnly.length} dígitos)`)
    }

    // Validar co-titulares
    if (data.co_titulares && data.co_titulares.length > 0) {
      data.co_titulares.forEach((co, index) => {
        if (co.porcentaje !== undefined && co.porcentaje !== null) {
          const porcentajeStr = co.porcentaje.toString()
          const digitsOnly = porcentajeStr.replace('.', '')
          if (digitsOnly.length > 10) {
            console.error(`createUnidadSimplified: Porcentaje de co-titular ${index} excede formato DECIMAL(10,6): ${co.porcentaje} (${digitsOnly.length} dígitos)`)
            throw new Error(`Porcentaje de co-titular excede formato permitido: ${co.porcentaje}`)
          }
          console.log(`createUnidadSimplified: Co-titular ${index} porcentaje válido: ${co.porcentaje} (${digitsOnly.length} dígitos)`)
        }
      })
    }

    // Obtener el usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Usuario no autenticado')
    }

    const insertData = {
      condo_id: condoId,
      user_id: user.id, // Agregar user_id requerido
      unidad_codigo: data.unidad_codigo,
      alicuota: data.alicuota,
      titular_tipo: data.titular_tipo,
      nombre_razon_social: data.nombre_razon_social,
      tipo_uso: data.tipo_uso,
      roles: data.roles,
      co_titulares: data.co_titulares,
      contacto: data.contacto,
      observaciones: data.observaciones
    }

    console.log(`createUnidadSimplified: Datos a insertar:`, {
      unidad_codigo: insertData.unidad_codigo,
      alicuota: insertData.alicuota,
      roles: insertData.roles,
      co_titulares: insertData.co_titulares,
      contacto: insertData.contacto
    })

    const { data: newUnidad, error: createError } = await supabase
      .from('unidades_simplified')
      .insert(insertData)
      .select()
      .single()

    if (createError) {
      console.error(`createUnidadSimplified: Error de Supabase:`, createError)
      
      if (createError.message.includes('numeric field overflow')) {
        console.error(`createUnidadSimplified: NUMERIC FIELD OVERFLOW DETECTADO`)
        console.error(`createUnidadSimplified: Unidad código: ${insertData.unidad_codigo}`)
        console.error(`createUnidadSimplified: Alícuota: ${insertData.alicuota}`)
        
        if (insertData.co_titulares && insertData.co_titulares.length > 0) {
          insertData.co_titulares.forEach((co, index) => {
            console.error(`createUnidadSimplified: Co-titular ${index}: ${co.nombre} - Porcentaje: ${co.porcentaje}`)
          })
        }
      }
      
      throw new Error(`Error al crear la unidad: ${createError.message}`)
    }

    // Registrar en historial
    try {
      await supabase.rpc('log_copropietarios_change', {
        p_condo_id: condoId,
        p_action: 'create',
        p_details: `Unidad ${data.unidad_codigo} - ${data.nombre_razon_social}`,
        p_data: {
          unidad_codigo: data.unidad_codigo,
          nombre_razon_social: data.nombre_razon_social,
          tipo_uso: data.tipo_uso,
          alicuota: data.alicuota,
          titular_tipo: data.titular_tipo
        },
        p_user_id: user.id
      })
    } catch (historyError) {
      console.warn('createUnidadSimplified: Error al registrar en historial:', historyError)
      // No fallar la operación principal por error de historial
    }

    console.log(`createUnidadSimplified: Unidad creada exitosamente:`, newUnidad)
    return { success: true, data: newUnidad }
  } catch (error) {
    console.error(`createUnidadSimplified: Error general:`, error)
    throw error
  }
}

// Obtener todas las unidades de un condominio
export async function getUnidadesSimplified(condoId: string) {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('unidades_simplified')
      .select('*')
      .eq('condo_id', condoId)
      .order('unidad_codigo')

    if (error) {
      console.error('Error al obtener unidades:', error)
      throw new Error(`Error al obtener unidades: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Error en getUnidadesSimplified:', error)
    throw error
  }
}

// Actualizar una unidad
export async function updateUnidadSimplified(unidadId: string, data: Partial<UnidadFormData>) {
  const supabase = await createClient()
  
  try {
    // Obtener datos actuales para comparación
    const { data: currentUnidad } = await supabase
      .from('unidades_simplified')
      .select('*')
      .eq('id', unidadId)
      .single()

    const { data: updatedUnidad, error } = await supabase
      .from('unidades_simplified')
      .update(data)
      .eq('id', unidadId)
      .select()
      .single()

    if (error) {
      console.error('Error al actualizar unidad:', error)
      throw new Error(`Error al actualizar unidad: ${error.message}`)
    }

    // Registrar en historial
    try {
      // Obtener el usuario actual para el historial
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (!userError && user) {
        await supabase.rpc('log_copropietarios_change', {
          p_condo_id: updatedUnidad.condo_id,
          p_action: 'update',
          p_details: `Unidad ${updatedUnidad.unidad_codigo} - ${updatedUnidad.nombre_razon_social}`,
          p_data: {
            old: currentUnidad,
            new: updatedUnidad
          },
          p_user_id: user.id
        })
      }
    } catch (historyError) {
      console.warn('updateUnidadSimplified: Error al registrar en historial:', historyError)
      // No fallar la operación principal por error de historial
    }

    return { success: true, data: updatedUnidad }
  } catch (error) {
    console.error('Error en updateUnidadSimplified:', error)
    throw error
  }
}

// Eliminar una unidad
export async function deleteUnidadSimplified(unidadId: string) {
  const supabase = await createClient()
  
  try {
    console.log(`deleteUnidadSimplified: Eliminando unidad ${unidadId}`)
    
    // Obtener datos de la unidad antes de eliminar para el historial
    const { data: unidadToDelete } = await supabase
      .from('unidades_simplified')
      .select('*')
      .eq('id', unidadId)
      .single()
    
    // SOLUCIÓN ROBUSTA: Intentar CASCADE DELETE primero, luego fallback manual
    try {
      const { error } = await supabase
        .from('unidades_simplified')
        .delete()
        .eq('id', unidadId)

      if (error) {
        throw error // Forzar el fallback
      }

      // Registrar en historial
      if (unidadToDelete) {
        try {
          // Obtener el usuario actual para el historial
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          if (!userError && user) {
            await supabase.rpc('log_copropietarios_change', {
              p_condo_id: unidadToDelete.condo_id,
              p_action: 'delete',
              p_details: `Unidad ${unidadToDelete.unidad_codigo} - ${unidadToDelete.nombre_razon_social}`,
              p_data: unidadToDelete,
              p_user_id: user.id
            })
          }
        } catch (historyError) {
          console.warn('deleteUnidadSimplified: Error al registrar en historial:', historyError)
        }
      }

      console.log(`deleteUnidadSimplified: CASCADE DELETE exitoso para unidad ${unidadId}`)
      return { success: true }
      
    } catch (cascadeError) {
      console.warn('CASCADE DELETE falló, usando eliminación manual:', cascadeError)
      
      // FALLBACK: Eliminación manual en orden correcto
      console.log(`deleteUnidadSimplified: Usando eliminación manual para unidad ${unidadId}`)
      
      // 1. Eliminar historial primero
      const { error: histError } = await supabase
        .from('unidades_historial_simplified')
        .delete()
        .eq('unidad_id', unidadId)

      if (histError) {
        console.warn('Error al eliminar historial (continuando):', histError)
      } else {
        console.log(`deleteUnidadSimplified: Historial eliminado para unidad ${unidadId}`)
      }

      // 2. Eliminar archivos CBR
      const { error: archError } = await supabase
        .from('archivos_cbr_simplified')
        .delete()
        .eq('unidad_id', unidadId)

      if (archError) {
        console.warn('Error al eliminar archivos CBR (continuando):', archError)
      } else {
        console.log(`deleteUnidadSimplified: Archivos CBR eliminados para unidad ${unidadId}`)
      }

      // 3. Eliminar unidad principal
      const { error: deleteError } = await supabase
        .from('unidades_simplified')
        .delete()
        .eq('id', unidadId)

      if (deleteError) {
        console.error('Error al eliminar unidad principal:', deleteError)
        throw new Error(`Error al eliminar unidad: ${deleteError.message}`)
      }

      console.log(`deleteUnidadSimplified: Eliminación manual exitosa para unidad ${unidadId}`)
      return { success: true }
    }
  } catch (error) {
    console.error('Error en deleteUnidadSimplified:', error)
    throw error
  }
}

// Limpiar todas las unidades de un condominio
export async function clearAllUnidadesSimplified(condoId: string) {
  const supabase = await createClient()
  
  try {
    console.log(`clearAllUnidadesSimplified: Iniciando limpieza para condominio ${condoId}`)
    
    // Obtener todas las unidades del condominio
    const { data: unidades, error: fetchError } = await supabase
      .from('unidades_simplified')
      .select('id, unidad_codigo')
      .eq('condo_id', condoId)

    if (fetchError) {
      console.error('Error al obtener unidades para limpiar:', fetchError)
      throw new Error(`Error al obtener unidades: ${fetchError.message}`)
    }

    if (!unidades || unidades.length === 0) {
      console.log('clearAllUnidadesSimplified: No hay unidades para eliminar')
      return { 
        success: true, 
        deletedCount: 0, 
        errorCount: 0,
        message: 'No hay unidades para eliminar' 
      }
    }

    console.log(`clearAllUnidadesSimplified: Encontradas ${unidades.length} unidades para eliminar`)
    const unidadIds = unidades.map(u => u.id)
    let deletedCount = 0
    let errorCount = 0
    const errors: string[] = []

    // SOLUCIÓN AGRESIVA: Usar función SQL que maneja restricciones FK
    console.log('clearAllUnidadesSimplified: Usando función SQL agresiva...')
    
    try {
      const { data, error: functionError } = await supabase.rpc('clear_all_unidades_aggressive', {
        p_condo_id: condoId
      })

      if (functionError) {
        console.error('Error al ejecutar función agresiva:', functionError)
        throw new Error(`Error al eliminar unidades: ${functionError.message}`)
      }

      if (!data.success) {
        throw new Error(data.message || 'Error desconocido en función SQL')
      }

      deletedCount = data.deleted_count || 0
      console.log(`clearAllUnidadesSimplified: Función agresiva exitosa - ${deletedCount} unidades eliminadas`)
      console.log(`clearAllUnidadesSimplified: ${data.hist_count || 0} registros de historial eliminados`)
      console.log(`clearAllUnidadesSimplified: ${data.arch_count || 0} archivos CBR eliminados`)
      
    } catch (functionError) {
      console.warn('Función agresiva falló, usando eliminación manual de emergencia:', functionError)
      
      // FALLBACK DE EMERGENCIA: Eliminación manual sin restricciones
      console.log('clearAllUnidadesSimplified: Usando eliminación manual de emergencia...')
      
      // 1. Eliminar historial primero
      console.log('clearAllUnidadesSimplified: Eliminando historial...')
      const { error: histError, count: histCount } = await supabase
        .from('unidades_historial_simplified')
        .delete()
        .in('unidad_id', unidadIds)
        .select('id', { count: 'exact' })

      if (histError) {
        console.error('Error al eliminar historial:', histError)
        // Continuar aunque falle el historial
      } else {
        console.log(`clearAllUnidadesSimplified: Eliminados ${histCount || 0} registros de historial`)
      }

      // 2. Eliminar archivos CBR
      console.log('clearAllUnidadesSimplified: Eliminando archivos CBR...')
      const { error: archError, count: archCount } = await supabase
        .from('archivos_cbr_simplified')
        .delete()
        .in('unidad_id', unidadIds)
        .select('id', { count: 'exact' })

      if (archError) {
        console.error('Error al eliminar archivos CBR:', archError)
        // Continuar aunque fallen los archivos
      } else {
        console.log(`clearAllUnidadesSimplified: Eliminados ${archCount || 0} archivos CBR`)
      }

      // 3. Eliminar unidades principales
      console.log('clearAllUnidadesSimplified: Eliminando unidades principales...')
      const { error: deleteError, count } = await supabase
        .from('unidades_simplified')
        .delete()
        .eq('condo_id', condoId)
        .select('id', { count: 'exact' })

      if (deleteError) {
        console.error('Error al eliminar unidades principales:', deleteError)
        throw new Error(`Error al eliminar unidades: ${deleteError.message}`)
      }

      deletedCount = count || 0
      console.log(`clearAllUnidadesSimplified: Eliminación manual de emergencia exitosa - ${deletedCount} unidades eliminadas`)
    }

    // Verificar que se eliminaron todas
    const { data: remainingUnits, error: verifyError } = await supabase
      .from('unidades_simplified')
      .select('id')
      .eq('condo_id', condoId)

    if (verifyError) {
      console.warn('Error al verificar eliminación:', verifyError)
    } else if (remainingUnits && remainingUnits.length > 0) {
      console.warn(`clearAllUnidadesSimplified: Quedan ${remainingUnits.length} unidades sin eliminar`)
      errorCount = remainingUnits.length
      errors.push(`${remainingUnits.length} unidades no se pudieron eliminar`)
    }

    const message = errorCount > 0 
      ? `Eliminadas ${deletedCount} unidades. ${errorCount} errores.`
      : `Eliminadas ${deletedCount} unidades correctamente`

    // Registrar en historial
    try {
      // Obtener el usuario actual para el historial
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (!userError && user) {
        await supabase.rpc('log_copropietarios_clear_all', {
          p_condo_id: condoId,
          p_total_before: unidades.length,
          p_total_after: 0,
          p_deleted_count: deletedCount,
          p_user_id: user.id
        })
      }
    } catch (historyError) {
      console.warn('clearAllUnidadesSimplified: Error al registrar en historial:', historyError)
      // No fallar la operación principal por error de historial
    }

    console.log(`clearAllUnidadesSimplified: Completado - ${message}`)

    return { 
      success: true, 
      deletedCount, 
      errorCount,
      errors,
      message
    }
  } catch (error) {
    console.error('Error en clearAllUnidadesSimplified:', error)
    throw error
  }
}

// Validar datos de importación
export async function validateUnidadSimplified(item: UnidadImportData, index: number): Promise<ValidationError> {
  const errores: string[] = []
  const numeroFila = index + 2 // +2 porque index es 0-based y la fila 1 son headers

  // Validar código de unidad
  if (!item.unidad_codigo || typeof item.unidad_codigo !== 'string' || !item.unidad_codigo.trim()) {
    errores.push('Código de unidad es obligatorio')
  }

  // Validar alícuota (opcional)
  if (item.alicuota !== null && item.alicuota !== undefined && item.alicuota !== '') {
    const alicuota = typeof item.alicuota === 'string' ? parseFloat(item.alicuota) : item.alicuota
    if (isNaN(alicuota) || alicuota <= 0 || alicuota > 100) {
      errores.push('Alícuota debe ser un número entre 0.001 y 100')
    }
  }

  // Validar tipo de titular
  if (!item.titular_tipo || !['PersonaNatural', 'PersonaJuridica'].includes(item.titular_tipo)) {
    errores.push('Tipo de titular debe ser "PersonaNatural" o "PersonaJuridica"')
  }

  // Validar nombre/razón social
  if (!item.nombre_razon_social || typeof item.nombre_razon_social !== 'string' || !item.nombre_razon_social.trim()) {
    errores.push('Nombre/razón social es obligatorio')
  }

  // Validar tipo de uso
  if (!item.tipo_uso || (Array.isArray(item.tipo_uso) && item.tipo_uso.length === 0)) {
    errores.push('Debe especificar al menos un tipo de uso')
  } else if (Array.isArray(item.tipo_uso)) {
    const tiposValidos = ['Departamento', 'Bodega', 'Estacionamiento']
    const tiposInvalidos = item.tipo_uso.filter(tipo => !tiposValidos.includes(tipo))
    if (tiposInvalidos.length > 0) {
      errores.push(`Tipos de uso inválidos: ${tiposInvalidos.join(', ')}`)
    }
  }

  // Validar co-titulares si se proporciona
  if (item.co_titulares && (typeof item.co_titulares === 'string' ? item.co_titulares.trim() : true)) {
    try {
      let coTitulares
      if (typeof item.co_titulares === 'string') {
        coTitulares = JSON.parse(item.co_titulares)
      } else {
        coTitulares = item.co_titulares
      }

      if (!Array.isArray(coTitulares)) {
        errores.push('co_titulares debe ser un array JSON')
      } else {
        const totalPorcentaje = coTitulares.reduce((sum: number, co: any) => sum + (co.porcentaje || 0), 0)
        if (Math.abs(totalPorcentaje - 100) > 0.01) {
          errores.push(`Co-titulares: suma de porcentajes debe ser 100%, actual: ${totalPorcentaje}%`)
        }
      }
    } catch (error) {
      errores.push('Formato JSON inválido en co_titulares')
    }
  }

  return {
    fila: numeroFila,
    unidad: item.unidad_codigo || 'Sin código',
    errores
  }
}

// Importar múltiples unidades
export async function importUnidadesSimplified(condoId: string, data: UnidadImportData[]) {
  const supabase = await createClient()
  
  try {
    console.log(`importUnidadesSimplified: Importando ${data.length} unidades para condominio ${condoId}`)
    
    const results = []
    const errors: ValidationError[] = []
    
    for (let i = 0; i < data.length; i++) {
      try {
        const item = data[i]
        
        // Validar la unidad
        const validation = await validateUnidadSimplified(item, i)
        if (validation.errores.length > 0) {
          errors.push(validation)
          continue
        }

        // Crear la unidad
        const unidadData: UnidadFormData = {
          unidad_codigo: item.unidad_codigo,
          alicuota: typeof item.alicuota === 'string' ? parseFloat(item.alicuota) : item.alicuota,
          titular_tipo: item.titular_tipo as 'PersonaNatural' | 'PersonaJuridica',
          nombre_razon_social: item.nombre_razon_social,
          tipo_uso: Array.isArray(item.tipo_uso) ? item.tipo_uso : [item.tipo_uso],
          roles: Array.isArray(item.roles) ? item.roles : [],
          co_titulares: Array.isArray(item.co_titulares) ? item.co_titulares : [],
          contacto: typeof item.contacto === 'object' ? item.contacto : undefined,
          observaciones: item.observaciones
        }

        const result = await createUnidadSimplified(condoId, unidadData)
        results.push(result)
        
        // Log cada 20 unidades
        if (i % 20 === 0) {
          console.log(`importUnidadesSimplified: Procesada unidad ${i + 1}/${data.length}: ${item.unidad_codigo}`)
        }
      } catch (error) {
        console.error(`importUnidadesSimplified: Error en unidad ${i + 1}:`, error)
        errors.push({
          fila: i + 2,
          unidad: data[i]?.unidad_codigo || 'Sin código',
          errores: [error instanceof Error ? error.message : 'Error desconocido']
        })
      }
    }

    return {
      success: true,
      total: data.length,
      imported: results.length,
      errors,
      message: `Importadas ${results.length} de ${data.length} unidades`
    }
  } catch (error) {
    console.error('Error en importUnidadesSimplified:', error)
    throw error
  }
}
