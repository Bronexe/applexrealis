// Script para verificar variables de entorno
// Ejecutar con: node scripts/check-env.js

require('dotenv').config({ path: '.env.local' })

console.log('🔍 Verificando variables de entorno...\n')

console.log('📋 Variables de entorno:')
console.log(`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurada' : 'NO CONFIGURADA'}`)
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurada' : 'NO CONFIGURADA'}`)
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configurada' : 'NO CONFIGURADA'}`)
console.log(`RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'Configurada' : 'NO CONFIGURADA'}`)
console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM || 'NO CONFIGURADA'}`)
console.log(`NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL || 'NO CONFIGURADA'}`)
console.log(`CRON_SECRET: ${process.env.CRON_SECRET ? 'Configurada' : 'NO CONFIGURADA'}`)

console.log('\n📋 Valores (parciales):')
console.log(`SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...' : 'NO CONFIGURADA'}`)
console.log(`RESEND_API_KEY: ${process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 10) + '...' : 'NO CONFIGURADA'}`)
console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM || 'NO CONFIGURADA'}`)

console.log('\n✅ Verificación completada')
