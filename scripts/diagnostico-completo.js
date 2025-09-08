// Script de diagnóstico completo para configuración limpia
// Ejecutar con: node scripts/diagnostico-completo.js

require('dotenv').config({ path: '.env.local' })

function diagnosticoCompleto() {
  console.log('🔍 DIAGNÓSTICO COMPLETO - CONFIGURACIÓN LIMPIA\n')
  console.log('='.repeat(60))

  // 1. Verificar archivo .env.local
  console.log('\n📋 1. VERIFICACIÓN DE ARCHIVO .env.local:')
  console.log('─'.repeat(40))
  
  const envVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
    'RESEND_API_KEY': process.env.RESEND_API_KEY,
    'EMAIL_FROM': process.env.EMAIL_FROM,
    'NEXT_PUBLIC_APP_URL': process.env.NEXT_PUBLIC_APP_URL,
    'CRON_SECRET': process.env.CRON_SECRET
  }

  Object.entries(envVars).forEach(([key, value]) => {
    const status = value ? '✅ CONFIGURADA' : '❌ NO CONFIGURADA'
    const preview = value ? (key.includes('KEY') ? value.substring(0, 20) + '...' : value) : 'N/A'
    console.log(`${key}: ${status}`)
    if (value) console.log(`   Valor: ${preview}`)
  })

  // 2. Verificar configuración de Supabase
  console.log('\n📋 2. CONFIGURACIÓN DE SUPABASE:')
  console.log('─'.repeat(40))
  
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const projectId = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
    console.log(`✅ URL: ${url}`)
    console.log(`✅ Project ID: ${projectId || 'No detectado'}`)
  } else {
    console.log('❌ NEXT_PUBLIC_SUPABASE_URL no configurada')
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('✅ Anon Key: Configurada')
  } else {
    console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY no configurada')
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('✅ Service Role Key: Configurada')
  } else {
    console.log('❌ SUPABASE_SERVICE_ROLE_KEY no configurada')
  }

  // 3. Verificar configuración de Resend
  console.log('\n📋 3. CONFIGURACIÓN DE RESEND:')
  console.log('─'.repeat(40))
  
  if (process.env.RESEND_API_KEY) {
    const apiKey = process.env.RESEND_API_KEY
    const isValidFormat = apiKey.startsWith('re_') && apiKey.length > 30
    console.log(`✅ API Key: ${isValidFormat ? 'Formato válido' : 'Formato inválido'}`)
    console.log(`   Longitud: ${apiKey.length} caracteres`)
    console.log(`   Empieza con 're_': ${apiKey.startsWith('re_')}`)
  } else {
    console.log('❌ RESEND_API_KEY no configurada')
  }

  if (process.env.EMAIL_FROM) {
    console.log(`✅ Email From: ${process.env.EMAIL_FROM}`)
  } else {
    console.log('❌ EMAIL_FROM no configurada')
  }

  // 4. Verificar configuración de la aplicación
  console.log('\n📋 4. CONFIGURACIÓN DE LA APLICACIÓN:')
  console.log('─'.repeat(40))
  
  if (process.env.NEXT_PUBLIC_APP_URL) {
    console.log(`✅ App URL: ${process.env.NEXT_PUBLIC_APP_URL}`)
  } else {
    console.log('❌ NEXT_PUBLIC_APP_URL no configurada')
  }

  if (process.env.CRON_SECRET) {
    console.log('✅ Cron Secret: Configurada')
  } else {
    console.log('❌ CRON_SECRET no configurada')
  }

  // 5. Resumen de problemas
  console.log('\n📋 5. RESUMEN DE PROBLEMAS:')
  console.log('─'.repeat(40))
  
  const problemas = []
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) problemas.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) problemas.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) problemas.push('SUPABASE_SERVICE_ROLE_KEY')
  if (!process.env.RESEND_API_KEY) problemas.push('RESEND_API_KEY')
  if (!process.env.EMAIL_FROM) problemas.push('EMAIL_FROM')
  if (!process.env.NEXT_PUBLIC_APP_URL) problemas.push('NEXT_PUBLIC_APP_URL')
  if (!process.env.CRON_SECRET) problemas.push('CRON_SECRET')

  if (problemas.length === 0) {
    console.log('✅ Todas las variables están configuradas')
  } else {
    console.log('❌ Variables faltantes:')
    problemas.forEach(problema => console.log(`   - ${problema}`))
  }

  // 6. Plan de acción
  console.log('\n📋 6. PLAN DE ACCIÓN:')
  console.log('─'.repeat(40))
  
  console.log('🔧 CONFIGURACIÓN LIMPIA DESDE CERO:')
  console.log('')
  console.log('1. 🗑️  LIMPIAR CONFIGURACIÓN ACTUAL:')
  console.log('   - Eliminar variables de entorno incorrectas')
  console.log('   - Limpiar archivos de prueba')
  console.log('   - Resetear configuración de Resend')
  console.log('')
  console.log('2. 🔑 CONFIGURAR RESEND DESDE CERO:')
  console.log('   - Crear nueva cuenta en Resend (si es necesario)')
  console.log('   - Generar nueva API Key')
  console.log('   - Configurar dominio lexrealis.cl')
  console.log('   - Verificar configuración')
  console.log('')
  console.log('3. 🏗️  CONFIGURAR SUPABASE:')
  console.log('   - Verificar configuración actual')
  console.log('   - Configurar Service Role Key')
  console.log('   - Crear Edge Function para emails')
  console.log('   - Configurar variables de entorno')
  console.log('')
  console.log('4. 🧪 PROBAR INTEGRACIÓN:')
  console.log('   - Probar envío de emails')
  console.log('   - Verificar entrega')
  console.log('   - Configurar sistema de notificaciones')
  console.log('')
  console.log('5. 🚀 DESPLEGAR:')
  console.log('   - Configurar cron jobs')
  console.log('   - Desplegar en Vercel')
  console.log('   - Activar notificaciones automáticas')

  console.log('\n' + '='.repeat(60))
  console.log('🎯 ¿QUÉ QUIERES HACER PRIMERO?')
  console.log('1. Limpiar configuración actual')
  console.log('2. Configurar Resend desde cero')
  console.log('3. Configurar Supabase')
  console.log('4. Probar integración')
  console.log('5. Ver guía completa')
}

// Ejecutar diagnóstico
diagnosticoCompleto()
