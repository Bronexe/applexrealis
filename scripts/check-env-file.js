// Script para verificar el archivo .env.local directamente
// Ejecutar con: node scripts/check-env-file.js

const fs = require('fs')
const path = require('path')

function checkEnvFile() {
  console.log('🔍 Verificando archivo .env.local directamente...\n')

  const envPath = path.join(process.cwd(), '.env.local')
  
  console.log(`📁 Ruta del archivo: ${envPath}`)
  console.log(`📋 Archivo existe: ${fs.existsSync(envPath) ? '✅ SÍ' : '❌ NO'}`)

  if (!fs.existsSync(envPath)) {
    console.log('❌ El archivo .env.local no existe')
    return
  }

  try {
    const envContent = fs.readFileSync(envPath, 'utf8')
    console.log('\n📋 Contenido del archivo .env.local:')
    console.log('─'.repeat(50))
    
    const lines = envContent.split('\n')
    lines.forEach((line, index) => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=')
        const value = valueParts.join('=')
        
        if (key && value) {
          const maskedValue = value.length > 20 ? 
            value.substring(0, 20) + '...' : 
            value
          console.log(`${index + 1}. ${key.trim()}: ${maskedValue}`)
        } else {
          console.log(`${index + 1}. ${line.trim()} (formato incorrecto)`)
        }
      }
    })
    
    console.log('─'.repeat(50))
    
    // Verificar variables específicas
    const envVars = {
      'NEXT_PUBLIC_SUPABASE_URL': envContent.includes('NEXT_PUBLIC_SUPABASE_URL'),
      'NEXT_PUBLIC_SUPABASE_ANON_KEY': envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
      'SUPABASE_SERVICE_ROLE_KEY': envContent.includes('SUPABASE_SERVICE_ROLE_KEY'),
      'RESEND_API_KEY': envContent.includes('RESEND_API_KEY'),
      'EMAIL_FROM': envContent.includes('EMAIL_FROM'),
      'NEXT_PUBLIC_APP_URL': envContent.includes('NEXT_PUBLIC_APP_URL'),
      'CRON_SECRET': envContent.includes('CRON_SECRET')
    }

    console.log('\n📋 Variables encontradas en el archivo:')
    Object.entries(envVars).forEach(([key, found]) => {
      console.log(`${key}: ${found ? '✅ ENCONTRADA' : '❌ NO ENCONTRADA'}`)
    })

    // Verificar formato de SUPABASE_SERVICE_ROLE_KEY
    const serviceRoleMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)
    if (serviceRoleMatch) {
      const serviceRoleKey = serviceRoleMatch[1].trim()
      console.log(`\n🔑 SUPABASE_SERVICE_ROLE_KEY:`)
      console.log(`   Longitud: ${serviceRoleKey.length} caracteres`)
      console.log(`   Empieza con 'eyJ': ${serviceRoleKey.startsWith('eyJ')}`)
      console.log(`   Formato JWT: ${serviceRoleKey.includes('.') ? '✅ SÍ' : '❌ NO'}`)
    }

  } catch (error) {
    console.error('❌ Error al leer el archivo .env.local:', error.message)
  }
}

// Ejecutar la verificación
checkEnvFile()
