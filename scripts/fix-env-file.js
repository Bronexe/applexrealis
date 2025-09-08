// Script para corregir el archivo .env.local
// Ejecutar con: node scripts/fix-env-file.js

const fs = require('fs')
const path = require('path')

function fixEnvFile() {
  console.log('🔧 Corrigiendo archivo .env.local...\n')

  const envPath = path.join(process.cwd(), '.env.local')
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ El archivo .env.local no existe')
    return
  }

  try {
    const envContent = fs.readFileSync(envPath, 'utf8')
    
    // Descomentar la línea SUPABASE_SERVICE_ROLE_KEY
    const fixedContent = envContent.replace(
      '# SUPABASE_SERVICE_ROLE_KEY=',
      'SUPABASE_SERVICE_ROLE_KEY='
    )
    
    // Escribir el archivo corregido
    fs.writeFileSync(envPath, fixedContent, 'utf8')
    
    console.log('✅ Archivo .env.local corregido exitosamente')
    console.log('✅ Línea SUPABASE_SERVICE_ROLE_KEY descomentada')
    
    // Verificar que se corrigió
    const updatedContent = fs.readFileSync(envPath, 'utf8')
    const serviceRoleLines = updatedContent.split('\n').filter(line => 
      line.includes('SUPABASE_SERVICE_ROLE_KEY') && !line.startsWith('#')
    )
    
    if (serviceRoleLines.length > 0) {
      console.log('✅ Verificación exitosa: SUPABASE_SERVICE_ROLE_KEY está activa')
      console.log(`📋 Línea: ${serviceRoleLines[0].substring(0, 50)}...`)
    } else {
      console.log('❌ Error: SUPABASE_SERVICE_ROLE_KEY sigue comentada')
    }
    
  } catch (error) {
    console.error('❌ Error al corregir el archivo:', error.message)
  }
}

// Ejecutar la corrección
fixEnvFile()
