// Script para diagnosticar por qué la app sigue usando localhost:3000
// Ejecutar con: node scripts/diagnose-localhost-issue.js

require('dotenv').config({ path: '.env.local' })

function diagnoseLocalhostIssue() {
  console.log('🔍 DIAGNÓSTICO: ¿Por qué la app sigue usando localhost:3000?')
  console.log('='.repeat(60))

  // 1. Verificar variables de entorno
  console.log('\n1. 📋 VERIFICANDO VARIABLES DE ENTORNO:')
  const envVars = {
    'NEXT_PUBLIC_APP_URL': process.env.NEXT_PUBLIC_APP_URL,
    'VERCEL_URL': process.env.VERCEL_URL,
    'NODE_ENV': process.env.NODE_ENV,
    'VERCEL_ENV': process.env.VERCEL_ENV
  }

  Object.entries(envVars).forEach(([key, value]) => {
    if (value) {
      console.log(`   ✅ ${key}: ${value}`)
    } else {
      console.log(`   ❌ ${key}: NO CONFIGURADA`)
    }
  })

  // 2. Verificar archivos de configuración
  console.log('\n2. 📁 VERIFICANDO ARCHIVOS DE CONFIGURACIÓN:')
  
  const fs = require('fs')
  const path = require('path')

  // Verificar next.config.mjs
  try {
    const nextConfig = fs.readFileSync('next.config.mjs', 'utf8')
    if (nextConfig.includes('localhost:3000')) {
      console.log('   ❌ next.config.mjs contiene localhost:3000')
    } else {
      console.log('   ✅ next.config.mjs no contiene localhost:3000')
    }
  } catch (error) {
    console.log('   ⚠️  No se pudo leer next.config.mjs')
  }

  // Verificar middleware.ts
  try {
    const middleware = fs.readFileSync('middleware.ts', 'utf8')
    if (middleware.includes('localhost:3000')) {
      console.log('   ❌ middleware.ts contiene localhost:3000')
    } else {
      console.log('   ✅ middleware.ts no contiene localhost:3000')
    }
  } catch (error) {
    console.log('   ⚠️  No se pudo leer middleware.ts')
  }

  // 3. Buscar referencias hardcodeadas
  console.log('\n3. 🔍 BUSCANDO REFERENCIAS HARDCODEADAS:')
  
  const searchPatterns = [
    'localhost:3000',
    'http://localhost:3000',
    'https://localhost:3000',
    '127.0.0.1:3000'
  ]

  searchPatterns.forEach(pattern => {
    try {
      const { execSync } = require('child_process')
      const result = execSync(`grep -r "${pattern}" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.log"`, { encoding: 'utf8' })
      if (result.trim()) {
        console.log(`   ❌ Encontrado "${pattern}" en:`)
        result.split('\n').forEach(line => {
          if (line.trim()) {
            console.log(`      ${line}`)
          }
        })
      } else {
        console.log(`   ✅ No se encontró "${pattern}"`)
      }
    } catch (error) {
      console.log(`   ✅ No se encontró "${pattern}"`)
    }
  })

  // 4. Verificar configuración de Supabase
  console.log('\n4. 🔧 VERIFICANDO CONFIGURACIÓN DE SUPABASE:')
  
  try {
    const supabaseClient = fs.readFileSync('lib/supabase/client.ts', 'utf8')
    if (supabaseClient.includes('localhost:3000')) {
      console.log('   ❌ lib/supabase/client.ts contiene localhost:3000')
    } else {
      console.log('   ✅ lib/supabase/client.ts no contiene localhost:3000')
    }
  } catch (error) {
    console.log('   ⚠️  No se pudo leer lib/supabase/client.ts')
  }

  // 5. Verificar configuración de autenticación
  console.log('\n5. 🔐 VERIFICANDO CONFIGURACIÓN DE AUTENTICACIÓN:')
  
  try {
    const authCallback = fs.readFileSync('app/auth/callback/page.tsx', 'utf8')
    if (authCallback.includes('localhost:3000')) {
      console.log('   ❌ app/auth/callback/page.tsx contiene localhost:3000')
    } else {
      console.log('   ✅ app/auth/callback/page.tsx no contiene localhost:3000')
    }
  } catch (error) {
    console.log('   ⚠️  No se pudo leer app/auth/callback/page.tsx')
  }

  // 6. Verificar configuración de redirects
  console.log('\n6. 🔄 VERIFICANDO CONFIGURACIÓN DE REDIRECTS:')
  
  try {
    const middleware = fs.readFileSync('middleware.ts', 'utf8')
    if (middleware.includes('redirect') || middleware.includes('rewrite')) {
      console.log('   ⚠️  middleware.ts contiene redirects/rewrites - revisar configuración')
    } else {
      console.log('   ✅ middleware.ts no contiene redirects problemáticos')
    }
  } catch (error) {
    console.log('   ⚠️  No se pudo leer middleware.ts')
  }

  // 7. Verificar configuración de Vercel
  console.log('\n7. ⚙️ VERIFICANDO CONFIGURACIÓN DE VERCEL:')
  
  try {
    const vercelConfig = fs.readFileSync('vercel.json', 'utf8')
    if (vercelConfig.includes('localhost:3000')) {
      console.log('   ❌ vercel.json contiene localhost:3000')
    } else {
      console.log('   ✅ vercel.json no contiene localhost:3000')
    }
  } catch (error) {
    console.log('   ⚠️  No se pudo leer vercel.json')
  }

  // 8. Posibles causas adicionales
  console.log('\n8. 🤔 POSIBLES CAUSAS ADICIONALES:')
  console.log('   • Cache del navegador')
  console.log('   • Service Workers')
  console.log('   • Configuración de Supabase Auth')
  console.log('   • Variables de entorno no actualizadas en Vercel')
  console.log('   • Deployment no actualizado')
  console.log('   • Configuración de dominio personalizado')

  // 9. Soluciones recomendadas
  console.log('\n9. 💡 SOLUCIONES RECOMENDADAS:')
  console.log('   1. Verificar variables de entorno en Vercel Dashboard')
  console.log('   2. Hacer redeploy completo')
  console.log('   3. Limpiar cache del navegador')
  console.log('   4. Verificar configuración de Supabase Auth')
  console.log('   5. Revisar logs de Vercel para errores')
  console.log('   6. Verificar que no hay redirects hardcodeados')

  console.log('\n' + '='.repeat(60))
  console.log('✅ DIAGNÓSTICO COMPLETADO')
}

diagnoseLocalhostIssue()
