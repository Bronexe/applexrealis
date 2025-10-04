// =====================================================
// SCRIPT PARA ACTUALIZAR COMUNAS EN CONDOMINIOS EXISTENTES
// =====================================================

const { createClient } = require('@supabase/supabase-js')
const { chileData, getCommuneById } = require('../lib/data/chile-regions.ts')

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas')
  console.error('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateCondosCommune() {
  try {
    console.log('🔄 Iniciando actualización de comunas en condominios...')
    console.log('📝 Nota: Límite por defecto de condominios establecido en 1')
    
    // 1. Obtener condominios que necesitan actualización
    console.log('📋 Obteniendo condominios que necesitan actualización...')
    const { data: condos, error: fetchError } = await supabase
      .from('condos')
      .select('id, name, region_id, commune_id, comuna')
      .not('commune_id', 'is', null)
      .or('comuna.is.null,comuna.eq.')
    
    if (fetchError) {
      throw new Error(`Error obteniendo condominios: ${fetchError.message}`)
    }
    
    console.log(`📊 Encontrados ${condos.length} condominios que necesitan actualización`)
    
    if (condos.length === 0) {
      console.log('✅ No hay condominios que necesiten actualización')
      return
    }
    
    // 2. Actualizar cada condominio
    let updatedCount = 0
    let errorCount = 0
    
    for (const condo of condos) {
      try {
        console.log(`\n🔄 Procesando: ${condo.name} (ID: ${condo.id})`)
        console.log(`   Region ID: ${condo.region_id}, Commune ID: ${condo.commune_id}`)
        
        // Obtener el nombre de la comuna usando la función getCommuneById
        const commune = getCommuneById(condo.region_id, condo.commune_id)
        
        if (!commune) {
          console.log(`   ⚠️  No se encontró comuna para region_id: ${condo.region_id}, commune_id: ${condo.commune_id}`)
          errorCount++
          continue
        }
        
        console.log(`   📍 Comuna encontrada: ${commune.name}`)
        
        // Actualizar el condominio
        const { error: updateError } = await supabase
          .from('condos')
          .update({ comuna: commune.name })
          .eq('id', condo.id)
        
        if (updateError) {
          console.log(`   ❌ Error actualizando: ${updateError.message}`)
          errorCount++
        } else {
          console.log(`   ✅ Actualizado exitosamente: ${condo.name} -> ${commune.name}`)
          updatedCount++
        }
        
      } catch (error) {
        console.log(`   ❌ Error procesando ${condo.name}: ${error.message}`)
        errorCount++
      }
    }
    
    // 3. Mostrar resumen
    console.log('\n' + '='.repeat(50))
    console.log('📊 RESUMEN DE ACTUALIZACIÓN')
    console.log('='.repeat(50))
    console.log(`✅ Condominios actualizados exitosamente: ${updatedCount}`)
    console.log(`❌ Errores encontrados: ${errorCount}`)
    console.log(`📋 Total procesados: ${condos.length}`)
    
    if (updatedCount > 0) {
      console.log('\n🎉 ¡Actualización completada exitosamente!')
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    process.exit(1)
  }
}

// Ejecutar el script
updateCondosCommune()
  .then(() => {
    console.log('\n✅ Script completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error.message)
    process.exit(1)
  })
