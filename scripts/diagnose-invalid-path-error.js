require('dotenv').config({ path: '.env.local' });

console.log('🔍 DIAGNÓSTICO: "requested path is invalid"');
console.log('============================================================');

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://applexrealis.vercel.app';
const redirectUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${appUrl}/dashboard`;

console.log('\n📋 CONFIGURACIÓN ACTUAL:');
console.log(`   App URL: ${appUrl}`);
console.log(`   Redirect URL: ${redirectUrl}`);

console.log('\n🔍 POSIBLES CAUSAS DEL ERROR:');
console.log('============================================================');

console.log('\n1. 🚨 CONFIGURACIÓN DE SUPABASE:');
console.log('   ❌ Site URL incorrecta en Supabase');
console.log('   ❌ Redirect URLs no configuradas correctamente');
console.log('   ❌ URLs con espacios o caracteres especiales');

console.log('\n2. 🚨 CONFIGURACIÓN DE VERCEL:');
console.log('   ❌ Variables de entorno no actualizadas en Vercel');
console.log('   ❌ NEXT_PUBLIC_APP_URL incorrecta en producción');
console.log('   ❌ Deployment no actualizado');

console.log('\n3. 🚨 CONFIGURACIÓN DE RUTAS:');
console.log('   ❌ Ruta /auth/callback no existe');
console.log('   ❌ Middleware bloqueando la ruta');
console.log('   ❌ Configuración de Next.js incorrecta');

console.log('\n4. 🚨 CONFIGURACIÓN DE AUTENTICACIÓN:');
console.log('   ❌ Supabase client mal configurado');
console.log('   ❌ API keys incorrectas');
console.log('   ❌ Dominio no autorizado');

console.log('\n🔧 SOLUCIONES PASO A PASO:');
console.log('============================================================');

console.log('\n✅ PASO 1: Verificar configuración de Supabase');
console.log('1. Ve a https://supabase.com/dashboard');
console.log('2. Selecciona tu proyecto');
console.log('3. Ve a Authentication → URL Configuration');
console.log('4. Verifica que Site URL sea:');
console.log(`   ${appUrl}`);
console.log('5. Verifica que Redirect URLs incluyan:');
console.log(`   ${appUrl}/auth/callback`);
console.log(`   ${redirectUrl}`);
console.log('   http://localhost:3000/auth/callback');
console.log('   http://localhost:3000/dashboard');

console.log('\n✅ PASO 2: Verificar variables de entorno en Vercel');
console.log('1. Ve a https://vercel.com/dashboard');
console.log('2. Selecciona tu proyecto applexrealis');
console.log('3. Ve a Settings → Environment Variables');
console.log('4. Verifica que estas variables estén configuradas:');
console.log(`   NEXT_PUBLIC_APP_URL=${appUrl}`);
console.log(`   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=${redirectUrl}`);
console.log('   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase');
console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key');

console.log('\n✅ PASO 3: Verificar que la ruta /auth/callback existe');
console.log('1. Verifica que existe el archivo: app/auth/callback/page.tsx');
console.log('2. Verifica que el middleware no bloquea /auth/callback');

console.log('\n✅ PASO 4: Hacer redeploy completo');
console.log('1. En Vercel, ve a Deployments');
console.log('2. Haz clic en "Redeploy" en el último deployment');
console.log('3. O ejecuta: vercel --prod');

console.log('\n✅ PASO 5: Verificar logs de error');
console.log('1. Ve a Vercel Dashboard → Functions → Logs');
console.log('2. Busca errores relacionados con /auth/callback');
console.log('3. Revisa los logs de Supabase en Authentication → Logs');

console.log('\n🔍 VERIFICACIÓN RÁPIDA:');
console.log('============================================================');

// Verificar si existe el archivo de callback
const fs = require('fs');
const callbackPath = 'app/auth/callback/page.tsx';

if (fs.existsSync(callbackPath)) {
  console.log('✅ Archivo /auth/callback/page.tsx existe');
} else {
  console.log('❌ Archivo /auth/callback/page.tsx NO existe');
  console.log('   Esto es probablemente la causa del error');
}

// Verificar middleware
const middlewarePath = 'middleware.ts';
if (fs.existsSync(middlewarePath)) {
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
  if (middlewareContent.includes('/auth/callback')) {
    console.log('✅ Middleware incluye /auth/callback');
  } else {
    console.log('⚠️  Middleware no menciona /auth/callback');
  }
} else {
  console.log('❌ Archivo middleware.ts NO existe');
}

console.log('\n🎯 ACCIÓN INMEDIATA RECOMENDADA:');
console.log('============================================================');
console.log('1. Verifica que /auth/callback/page.tsx existe');
console.log('2. Actualiza las variables de entorno en Vercel');
console.log('3. Configura correctamente las URLs en Supabase');
console.log('4. Haz redeploy de la aplicación');
console.log('5. Prueba el login nuevamente');

console.log('\n============================================================');
console.log('✅ DIAGNÓSTICO COMPLETADO');
