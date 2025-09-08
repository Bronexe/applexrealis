// Script para verificar y corregir la API Key de Resend
// Ejecutar con: node scripts/fix-resend-api-key.js

const { Resend } = require('resend')
require('dotenv').config({ path: '.env.local' })

async function fixResendApiKey() {
  console.log('🔧 Verificando y corrigiendo la API Key de Resend...\n')

  // Verificar la API Key actual
  const currentApiKey = process.env.RESEND_API_KEY
  console.log('📋 API Key actual:')
  console.log(`Formato: ${currentApiKey ? currentApiKey.substring(0, 10) + '...' : 'NO CONFIGURADA'}`)
  console.log(`Longitud: ${currentApiKey ? currentApiKey.length : 0} caracteres`)
  console.log(`Empieza con 're_': ${currentApiKey ? currentApiKey.startsWith('re_') : false}`)

  if (!currentApiKey) {
    console.log('❌ RESEND_API_KEY no está configurada')
    console.log('💡 Solución:')
    console.log('   1. Ir a https://resend.com/api-keys')
    console.log('   2. Crear una nueva API Key')
    console.log('   3. Copiar la API Key')
    console.log('   4. Actualizar el archivo .env.local')
    return
  }

  // Probar con la API Key actual
  console.log('\n🔑 Probando API Key actual...')
  const resend = new Resend(currentApiKey)

  try {
    const testResponse = await resend.domains.list()
    console.log('✅ API Key válida')
    console.log(`📧 Dominios: ${testResponse.data?.length || 0}`)
  } catch (error) {
    console.log('❌ API Key inválida:', error.message)
    
    if (error.message.includes('Invalid API key')) {
      console.log('\n💡 SOLUCIÓN:')
      console.log('1. Ve a https://resend.com/api-keys')
      console.log('2. Verifica que la API Key sea correcta')
      console.log('3. Si es incorrecta, crea una nueva API Key')
      console.log('4. Actualiza el archivo .env.local con la nueva API Key')
      
      console.log('\n📋 Formato correcto de API Key:')
      console.log('- Debe empezar con "re_"')
      console.log('- Debe tener aproximadamente 40-50 caracteres')
      console.log('- Ejemplo: re_1234567890abcdef_1234567890abcdef')
    }
  }

  // Mostrar instrucciones para obtener una nueva API Key
  console.log('\n' + '='.repeat(50) + '\n')
  console.log('📋 INSTRUCCIONES PARA OBTENER UNA NUEVA API KEY:')
  console.log('1. Ve a https://resend.com')
  console.log('2. Inicia sesión en tu cuenta')
  console.log('3. Ve a "API Keys" en el menú')
  console.log('4. Haz clic en "Create API Key"')
  console.log('5. Dale un nombre (ej: "Lex Realis App")')
  console.log('6. Selecciona "Full Access"')
  console.log('7. Copia la API Key generada')
  console.log('8. Actualiza el archivo .env.local:')
  console.log('   RESEND_API_KEY=tu_nueva_api_key_aqui')

  console.log('\n📋 Para actualizar el archivo .env.local:')
  console.log('1. Abre el archivo .env.local')
  console.log('2. Busca la línea RESEND_API_KEY=...')
  console.log('3. Reemplaza el valor con tu nueva API Key')
  console.log('4. Guarda el archivo')
  console.log('5. Reinicia el servidor (npm run dev)')

  console.log('\n⚠️  IMPORTANTE:')
  console.log('- La API Key se muestra solo una vez')
  console.log('- Guárdala en un lugar seguro')
  console.log('- No la compartas públicamente')
}

// Ejecutar la verificación
fixResendApiKey().catch(console.error)
