const fs = require('fs');
const path = require('path');

console.log('🔧 ACTUALIZANDO VARIABLES DE ENTORNO PARA PRODUCCIÓN...');
console.log('============================================================');

const envPath = '.env.local';

if (!fs.existsSync(envPath)) {
  console.log('❌ No se encontró el archivo .env.local');
  process.exit(1);
}

// Leer el archivo actual
let content = fs.readFileSync(envPath, 'utf8');

console.log('\n📋 Variables actuales:');
const lines = content.split('\n');
lines.forEach(line => {
  if (line.includes('NEXT_PUBLIC_APP_URL') || line.includes('NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL')) {
    console.log(`   ${line}`);
  }
});

// Actualizar las variables
let updated = false;

// Actualizar NEXT_PUBLIC_APP_URL
if (content.includes('NEXT_PUBLIC_APP_URL=http://localhost:3000')) {
  content = content.replace(
    'NEXT_PUBLIC_APP_URL=http://localhost:3000',
    'NEXT_PUBLIC_APP_URL=https://applexrealis.vercel.app'
  );
  updated = true;
  console.log('\n✅ Actualizado: NEXT_PUBLIC_APP_URL');
}

// Agregar NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL si no existe
if (!content.includes('NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL')) {
  content += '\nNEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://applexrealis.vercel.app/dashboard\n';
  updated = true;
  console.log('✅ Agregado: NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL');
} else if (content.includes('NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000')) {
  content = content.replace(
    'NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000',
    'NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://applexrealis.vercel.app/dashboard'
  );
  updated = true;
  console.log('✅ Actualizado: NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL');
}

if (updated) {
  // Escribir el archivo actualizado
  fs.writeFileSync(envPath, content);
  
  console.log('\n📋 Variables actualizadas:');
  const newLines = content.split('\n');
  newLines.forEach(line => {
    if (line.includes('NEXT_PUBLIC_APP_URL') || line.includes('NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL')) {
      console.log(`   ${line}`);
    }
  });
  
  console.log('\n🎯 PRÓXIMOS PASOS:');
  console.log('1. Hacer commit y push de los cambios:');
  console.log('   git add .env.local');
  console.log('   git commit -m "Update environment variables for production"');
  console.log('   git push');
  console.log('');
  console.log('2. Actualizar variables en Vercel Dashboard:');
  console.log('   - Ve a https://vercel.com/dashboard');
  console.log('   - Selecciona tu proyecto applexrealis');
  console.log('   - Settings > Environment Variables');
  console.log('   - Actualiza NEXT_PUBLIC_APP_URL a: https://applexrealis.vercel.app');
  console.log('   - Actualiza NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL a: https://applexrealis.vercel.app/dashboard');
  console.log('');
  console.log('3. Hacer redeploy:');
  console.log('   vercel --prod');
  console.log('');
  console.log('4. Limpiar cache del navegador');
} else {
  console.log('\n✅ No se necesitaron cambios. Las variables ya están configuradas correctamente.');
}

console.log('\n============================================================');
console.log('✅ PROCESO COMPLETADO');
