'use server'

import { createClient } from '@/lib/supabase/server'
import { UnidadImportDataSimplified, ValidationError, ImportResult } from '@/lib/types/copropietarios-simplified'

// Crear una unidad desde datos de importación simplificados
export async function createUnidadFromImportSimplified(condoId: string, data: UnidadImportDataSimplified) {
  const supabase = await createClient()
  
  try {
    console.log(`createUnidadFromImportSimplified: Creando unidad ${data.unidad_codigo} para condominio ${condoId}`)
    
    // Validar y convertir alícuota si se proporciona
    let alicuotaFinal = null
    if (data.alicuota !== null && data.alicuota !== undefined && data.alicuota > 0) {
      let alicuota: number
      
      // Manejar diferentes formatos de entrada
      if (typeof data.alicuota === 'string') {
        // Reemplazar coma por punto para parsing (1,138 → 1.138)
        const alicuotaStr = data.alicuota.replace(',', '.')
        alicuota = parseFloat(alicuotaStr)
      } else {
        alicuota = data.alicuota
      }
      
      if (isNaN(alicuota)) {
        console.error(`createUnidadFromImportSimplified: Alícuota no es un número válido: ${data.alicuota}`)
        throw new Error(`Alícuota no es un número válido: ${data.alicuota}`)
      }
      
      if (alicuota > 100) {
        console.error(`createUnidadFromImportSimplified: Alícuota excede 100%: ${alicuota}`)
        throw new Error(`Alícuota excede 100%: ${alicuota} (máximo permitido: 100%)`)
      }
      
      // Manejar conversión de formato si es necesario
      if (alicuota > 1) {
        // Formato antiguo: 1.138 = 1.138%, convertir a nuevo formato
        alicuotaFinal = alicuota / 100
        console.log(`createUnidadFromImportSimplified: Convertido formato antiguo ${alicuota}% a nuevo formato ${alicuotaFinal} (${(alicuotaFinal * 100).toFixed(4)}%)`)
      } else {
        // Formato nuevo: 0.01138 = 1.138%
        alicuotaFinal = alicuota
        console.log(`createUnidadFromImportSimplified: Alícuota en formato decimal: ${alicuota} (${(alicuota * 100).toFixed(4)}%)`)
      }
      
      console.log(`createUnidadFromImportSimplified: Valor original: "${data.alicuota}", parseado: ${alicuota}, final: ${alicuotaFinal}`)
      
      // Verificar que no exceda 10 dígitos totales
      const alicuotaStr = alicuotaFinal.toString()
      const digitsOnly = alicuotaStr.replace('.', '')
      if (digitsOnly.length > 10) {
        console.error(`createUnidadFromImportSimplified: Alícuota excede formato DECIMAL(10,6): ${alicuotaFinal} (${digitsOnly.length} dígitos)`)
        throw new Error(`Alícuota excede formato permitido (máximo 10 dígitos): ${alicuotaFinal}`)
      }
    }

    // Preparar datos para inserción
    const insertData = {
      condo_id: condoId,
      unidad_codigo: data.unidad_codigo,
      alicuota: alicuotaFinal,
      titular_tipo: data.tipo_titular || 'PersonaNatural', // Default si no se especifica
      nombre_razon_social: data.nombre_completo,
      tipo_uso: data.tipo_uso,
      roles: [], // Vacío por defecto
      co_titulares: [], // Vacío por defecto
      contacto: data.email || data.telefono ? {
        email: data.email || undefined,
        telefono: data.telefono || undefined
      } : undefined,
      observaciones: data.observaciones || undefined
    }

    console.log(`createUnidadFromImportSimplified: Datos a insertar:`, {
      unidad_codigo: insertData.unidad_codigo,
      alicuota: insertData.alicuota,
      nombre_razon_social: insertData.nombre_razon_social,
      tipo_uso: insertData.tipo_uso,
      contacto: insertData.contacto
    })

    // Verificar si ya existe una unidad con el mismo código
    const { data: existingUnit, error: checkError } = await supabase
      .from('unidades_simplified')
      .select('id, unidad_codigo')
      .eq('condo_id', condoId)
      .eq('unidad_codigo', data.unidad_codigo)
      .single()

    let newUnidad
    let createError

    if (existingUnit) {
      // Actualizar unidad existente
      console.log(`createUnidadFromImportSimplified: Actualizando unidad existente ${data.unidad_codigo}`)
      const { data: updatedUnit, error: updateError } = await supabase
        .from('unidades_simplified')
        .update(insertData)
        .eq('id', existingUnit.id)
        .select()
        .single()
      
      newUnidad = updatedUnit
      createError = updateError
    } else {
      // Insertar nueva unidad
      console.log(`createUnidadFromImportSimplified: Insertando nueva unidad ${data.unidad_codigo}`)
      const { data: insertedUnit, error: insertError } = await supabase
        .from('unidades_simplified')
        .insert(insertData)
        .select()
        .single()
      
      newUnidad = insertedUnit
      createError = insertError
    }

    if (createError) {
      console.error(`createUnidadFromImportSimplified: Error de Supabase:`, createError)
      
      if (createError.message.includes('numeric field overflow')) {
        console.error(`createUnidadFromImportSimplified: NUMERIC FIELD OVERFLOW DETECTADO`)
        console.error(`createUnidadFromImportSimplified: Unidad código: ${insertData.unidad_codigo}`)
        console.error(`createUnidadFromImportSimplified: Alícuota: ${insertData.alicuota}`)
      }
      
      throw new Error(`Error al crear la unidad: ${createError.message}`)
    }

    const action = existingUnit ? 'actualizada' : 'creada'
    console.log(`createUnidadFromImportSimplified: Unidad ${action} exitosamente:`, newUnidad)
    return { success: true, data: newUnidad, action }
  } catch (error) {
    console.error(`createUnidadFromImportSimplified: Error general:`, error)
    throw error
  }
}

// Función de validación (no es Server Action)
function validateUnidadImportDataSimplified(item: UnidadImportDataSimplified, index: number): ValidationError {
  const errores: string[] = []
  const campos_con_error: string[] = []
  const datos_problematicos: Record<string, any> = {}
  const numeroFila = index + 2 // +2 porque index es 0-based y la fila 1 son headers

  // Validar código de unidad (obligatorio)
  if (!item.unidad_codigo || typeof item.unidad_codigo !== 'string' || !item.unidad_codigo.trim()) {
    errores.push('Código de unidad es obligatorio')
    campos_con_error.push('unidad_codigo')
    datos_problematicos.unidad_codigo = item.unidad_codigo
  }

  // Validar nombre completo (obligatorio)
  if (!item.nombre_completo || typeof item.nombre_completo !== 'string' || !item.nombre_completo.trim()) {
    errores.push('Nombre completo es obligatorio')
    campos_con_error.push('nombre_completo')
    datos_problematicos.nombre_completo = item.nombre_completo
  }

  // Validar tipo de uso (obligatorio)
  if (!item.tipo_uso || (Array.isArray(item.tipo_uso) && item.tipo_uso.length === 0)) {
    errores.push('Tipo de uso es obligatorio')
    campos_con_error.push('tipo_uso')
    datos_problematicos.tipo_uso = item.tipo_uso
  } else if (Array.isArray(item.tipo_uso)) {
    const tiposValidos = ['Departamento', 'Bodega', 'Estacionamiento']
    const tiposInvalidos = item.tipo_uso.filter(tipo => !tiposValidos.includes(tipo))
    if (tiposInvalidos.length > 0) {
      errores.push(`Tipos de uso inválidos: ${tiposInvalidos.join(', ')}`)
      campos_con_error.push('tipo_uso')
      datos_problematicos.tipo_uso = item.tipo_uso
    }
  }

  // Validar alícuota (opcional) - DECIMAL(10,6) = máximo 9999.999999
  if (item.alicuota !== null && item.alicuota !== undefined && item.alicuota !== '') {
    let alicuota: number
    
    // Manejar diferentes formatos de entrada
    if (typeof item.alicuota === 'string') {
      // Reemplazar coma por punto para parsing (1,138 → 1.138)
      const alicuotaStr = item.alicuota.replace(',', '.')
      alicuota = parseFloat(alicuotaStr)
    } else {
      alicuota = item.alicuota
    }
    
    if (isNaN(alicuota)) {
      errores.push('Alícuota debe ser un número válido')
      campos_con_error.push('alicuota')
      datos_problematicos.alicuota = item.alicuota
    } else if (alicuota < 0) {
      errores.push('Alícuota no puede ser negativa')
      campos_con_error.push('alicuota')
      datos_problematicos.alicuota = item.alicuota
    } else if (alicuota > 100) {
      errores.push(`Alícuota excede 100%: ${alicuota}% (máximo permitido: 100%)`)
      campos_con_error.push('alicuota')
      datos_problematicos.alicuota = item.alicuota
    } else {
      // Verificar que no exceda 10 dígitos totales
      const alicuotaStr = alicuota.toString()
      const digitsOnly = alicuotaStr.replace('.', '')
      if (digitsOnly.length > 10) {
        errores.push(`Alícuota excede formato DECIMAL(10,6): ${alicuota} (${digitsOnly.length} dígitos)`)
        campos_con_error.push('alicuota')
        datos_problematicos.alicuota = item.alicuota
      }
    }
  }

  // Validar tipo de titular (opcional)
  if (item.tipo_titular && !['PersonaNatural', 'PersonaJuridica'].includes(item.tipo_titular)) {
    errores.push('Tipo de titular debe ser "PersonaNatural" o "PersonaJuridica"')
    campos_con_error.push('tipo_titular')
    datos_problematicos.tipo_titular = item.tipo_titular
  }

  // Validar email (opcional)
  if (item.email && typeof item.email === 'string' && item.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(item.email.trim())) {
      errores.push('Formato de email inválido')
      campos_con_error.push('email')
      datos_problematicos.email = item.email
    }
  }

  return {
    fila: numeroFila,
    unidad: item.unidad_codigo || 'Sin código',
    errores,
    campos_con_error,
    datos_problematicos
  }
}

// Importar múltiples unidades con validación estricta (se detiene en el primer error)
export async function importUnidadesSimplified(condoId: string, data: UnidadImportDataSimplified[]): Promise<ImportResult> {
  const supabase = await createClient()
  
  try {
    console.log(`importUnidadesSimplified: Validando ${data.length} unidades para condominio ${condoId}`)
    
    // PRIMERA FASE: Validación completa de todos los datos
    const validationErrors: ValidationError[] = []
    
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      const validation = validateUnidadImportDataSimplified(item, i)
      
      if (validation.errores.length > 0) {
        validationErrors.push(validation)
      }
    }

    // Si hay errores de validación, detener completamente
    if (validationErrors.length > 0) {
      console.error(`importUnidadesSimplified: ${validationErrors.length} errores de validación encontrados`)
      return {
        success: false,
        total: data.length,
        imported: 0,
        errors: validationErrors,
        message: `Se encontraron ${validationErrors.length} errores de validación. No se importó ningún dato.`
      }
    }

    // SEGUNDA FASE: Importación transaccional
    console.log(`importUnidadesSimplified: Iniciando importación transaccional de ${data.length} unidades`)
    
    const results = []
    const importErrors: ValidationError[] = []
    
    // Procesar una por una para detenerse en el primer error
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      
      try {
        console.log(`importUnidadesSimplified: Procesando unidad ${i + 1}/${data.length}: ${item.unidad_codigo}`)
        
        // Crear la unidad
        const result = await createUnidadFromImportSimplified(condoId, item)
        results.push(result)
        
      } catch (error) {
        console.error(`importUnidadesSimplified: Error en unidad ${i + 1}:`, error)
        
        // Crear error detallado
        const errorDetail: ValidationError = {
          fila: i + 2,
          unidad: item.unidad_codigo || 'Sin código',
          errores: [error instanceof Error ? error.message : 'Error desconocido'],
          campos_con_error: ['importacion'],
          datos_problematicos: { error: error instanceof Error ? error.message : 'Error desconocido' }
        }
        
        importErrors.push(errorDetail)
        
        // Registrar en historial (importación con errores)
        try {
          await supabase.rpc('log_copropietarios_import', {
            p_condo_id: condoId,
            p_total_units: data.length,
            p_imported_units: results.length,
            p_errors: importErrors,
            p_file_name: null,
            p_file_size: null
          })
        } catch (historyError) {
          console.warn('importUnidadesSimplified: Error al registrar en historial:', historyError)
        }

        // Detener la importación en el primer error
        return {
          success: false,
          total: data.length,
          imported: results.length,
          errors: importErrors,
          message: `Error en fila ${i + 2}: ${error instanceof Error ? error.message : 'Error desconocido'}. Se importaron ${results.length} unidades antes del error.`
        }
      }
    }

    console.log(`importUnidadesSimplified: Importación exitosa - ${results.length} unidades importadas`)
    
    // Registrar en historial
    try {
      await supabase.rpc('log_copropietarios_import', {
        p_condo_id: condoId,
        p_total_units: data.length,
        p_imported_units: results.length,
        p_errors: null, // No hay errores en importación exitosa
        p_file_name: null, // Se puede agregar si se pasa como parámetro
        p_file_size: null
      })
    } catch (historyError) {
      console.warn('importUnidadesSimplified: Error al registrar en historial:', historyError)
      // No fallar la operación principal por error de historial
    }
    
    return {
      success: true,
      total: data.length,
      imported: results.length,
      errors: [],
      message: `Importadas ${results.length} unidades correctamente`
    }
  } catch (error) {
    console.error('Error en importUnidadesSimplified:', error)
    throw error
  }
}
