// Script para corregir URLs de producción
// Ejecutar con: node scripts/fix-production-urls.js

const fs = require('fs')
const path = require('path')

function fixProductionUrls() {
  console.log('🔧 Corrigiendo URLs para producción...\n')

  const productionUrl = 'https://applexrealis.vercel.app'
  const localhostUrl = 'http://localhost:3000'

  // Archivos a verificar y corregir
  const filesToCheck = [
    'lib/services/email.ts',
    'scripts/test-email-sleon.js',
    'scripts/test-email-real.js',
    'scripts/test-email-sending.js'
  ]

  let filesUpdated = 0

  filesToCheck.forEach(filePath => {
    try {
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8')
        let updated = false

        // Reemplazar localhost:3000 con la URL de producción
        if (content.includes(localhostUrl)) {
          content = content.replace(new RegExp(localhostUrl, 'g'), productionUrl)
          updated = true
        }

        if (updated) {
          fs.writeFileSync(filePath, content, 'utf8')
          console.log(`✅ Actualizado: ${filePath}`)
          filesUpdated++
        } else {
          console.log(`✅ Sin cambios: ${filePath}`)
        }
      } else {
        console.log(`⚠️  No encontrado: ${filePath}`)
      }
    } catch (error) {
      console.log(`❌ Error en ${filePath}: ${error.message}`)
    }
  })

  console.log(`\n📊 Resumen: ${filesUpdated} archivos actualizados`)
  
  console.log('\n🎯 PRÓXIMOS PASOS:')
  console.log('1. Actualizar variables de entorno en Vercel:')
  console.log(`   NEXT_PUBLIC_APP_URL=${productionUrl}`)
  console.log('2. Hacer commit y push de los cambios:')
  console.log('   git add .')
  console.log('   git commit -m "Fix production URLs"')
  console.log('   git push')
  console.log('3. Hacer redeploy en Vercel')
  console.log('4. Limpiar cache del navegador')
}

fixProductionUrls()
