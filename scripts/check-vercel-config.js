// Script para verificar la configuración de Vercel
// Ejecutar con: node scripts/check-vercel-config.js

require('dotenv').config({ path: '.env.local' })

function checkVercelConfig() {
  console.log('🔍 Verificando configuración para Vercel...\n')

  const config = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
    'RESEND_API_KEY': process.env.RESEND_API_KEY,
    'EMAIL_FROM': process.env.EMAIL_FROM,
    'NEXT_PUBLIC_APP_URL': process.env.NEXT_PUBLIC_APP_URL,
    'CRON_SECRET': process.env.CRON_SECRET
  }

  console.log('📋 Variables de entorno actuales:')
  Object.entries(config).forEach(([key, value]) => {
    if (value) {
      if (key.includes('KEY') || key.includes('SECRET')) {
        console.log(`${key}: ${value.substring(0, 20)}...`)
      } else {
        console.log(`${key}: ${value}`)
      }
    } else {
      console.log(`${key}: ❌ NO CONFIGURADA`)
    }
  })

  console.log('\n🚨 PROBLEMA IDENTIFICADO:')
  if (config.NEXT_PUBLIC_APP_URL === 'http://localhost:3000') {
    console.log('❌ NEXT_PUBLIC_APP_URL está configurada para localhost')
    console.log('   Esto causará que la app redirija a localhost en producción')
  }

  console.log('\n✅ SOLUCIÓN:')
  console.log('1. Ve a tu dashboard de Vercel')
  console.log('2. Selecciona tu proyecto')
  console.log('3. Ve a Settings > Environment Variables')
  console.log('4. Actualiza NEXT_PUBLIC_APP_URL con la URL de tu app en Vercel')
  console.log('   Ejemplo: https://tu-app.vercel.app')
  console.log('5. Haz redeploy de la aplicación')

  console.log('\n📋 Variables que necesitas configurar en Vercel:')
  Object.entries(config).forEach(([key, value]) => {
    if (value) {
      console.log(`✅ ${key}: Configurada`)
    } else {
      console.log(`❌ ${key}: Necesita configuración`)
    }
  })

  console.log('\n🔧 Comando para obtener la URL de Vercel:')
  console.log('vercel ls')
  console.log('vercel inspect [deployment-url]')
}

checkVercelConfig()
