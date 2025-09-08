// Script para debuggear la carga de variables de entorno
// Ejecutar con: node scripts/debug-env-loading.js

const fs = require('fs')
const path = require('path')

function debugEnvLoading() {
  console.log('🔍 Debuggeando carga de variables de entorno...\n')

  const envPath = path.join(process.cwd(), '.env.local')
  
  console.log(`📁 Ruta del archivo: ${envPath}`)
  console.log(`📋 Archivo existe: ${fs.existsSync(envPath) ? '✅ SÍ' : '❌ NO'}`)

  if (!fs.existsSync(envPath)) {
    console.log('❌ El archivo .env.local no existe')
    return
  }

  try {
    const envContent = fs.readFileSync(envPath, 'utf8')
    console.log('\n📋 Contenido completo del archivo:')
    console.log('─'.repeat(60))
    console.log(envContent)
    console.log('─'.repeat(60))
    
    // Buscar específicamente SUPABASE_SERVICE_ROLE_KEY
    const serviceRoleLines = envContent.split('\n').filter(line => 
      line.includes('SUPABASE_SERVICE_ROLE_KEY')
    )
    
    console.log('\n🔑 Líneas que contienen SUPABASE_SERVICE_ROLE_KEY:')
    serviceRoleLines.forEach((line, index) => {
      console.log(`${index + 1}. ${line}`)
    })

    // Probar diferentes métodos de carga
    console.log('\n🧪 Probando diferentes métodos de carga:')
    
    // Método 1: dotenv
    console.log('\n1. Método dotenv:')
    try {
      require('dotenv').config({ path: '.env.local' })
      console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ CARGADA' : '❌ NO CARGADA'}`)
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.log(`   Longitud: ${process.env.SUPABASE_SERVICE_ROLE_KEY.length} caracteres`)
      }
    } catch (error) {
      console.log(`   Error: ${error.message}`)
    }

    // Método 2: dotenv con override
    console.log('\n2. Método dotenv con override:')
    try {
      require('dotenv').config({ path: '.env.local', override: true })
      console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ CARGADA' : '❌ NO CARGADA'}`)
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.log(`   Longitud: ${process.env.SUPABASE_SERVICE_ROLE_KEY.length} caracteres`)
      }
    } catch (error) {
      console.log(`   Error: ${error.message}`)
    }

    // Método 3: Carga manual
    console.log('\n3. Método carga manual:')
    try {
      const lines = envContent.split('\n')
      let serviceRoleKey = null
      
      for (const line of lines) {
        if (line.trim().startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
          serviceRoleKey = line.split('=')[1]?.trim()
          break
        }
      }
      
      console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? '✅ ENCONTRADA' : '❌ NO ENCONTRADA'}`)
      if (serviceRoleKey) {
        console.log(`   Longitud: ${serviceRoleKey.length} caracteres`)
        console.log(`   Empieza con 'eyJ': ${serviceRoleKey.startsWith('eyJ')}`)
      }
    } catch (error) {
      console.log(`   Error: ${error.message}`)
    }

  } catch (error) {
    console.error('❌ Error al leer el archivo .env.local:', error.message)
  }
}

// Ejecutar el debug
debugEnvLoading()
