require('dotenv').config({ path: '.env.local' });

console.log('🔧 CONFIGURACIÓN DE AUTHORIZED REDIRECT URIs PARA SUPABASE');
console.log('============================================================');

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://applexrealis.vercel.app';
const redirectUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${appUrl}/dashboard`;

console.log('\n📋 URLs ACTUALES:');
console.log(`   App URL: ${appUrl}`);
console.log(`   Redirect URL: ${redirectUrl}`);

console.log('\n🎯 AUTHORIZED REDIRECT URIs PARA SUPABASE:');
console.log('============================================================');

console.log('\n✅ URLs QUE DEBES AGREGAR EN SUPABASE:');
console.log('');

// URLs de producción
console.log('1. 🌐 PRODUCCIÓN:');
console.log(`   ${appUrl}/auth/callback`);
console.log(`   ${redirectUrl}`);

// URLs de desarrollo local
console.log('\n2. 🛠️ DESARROLLO LOCAL:');
console.log('   http://localhost:3000/auth/callback');
console.log('   http://localhost:3000/dashboard');

// URLs adicionales que podrían ser necesarias
console.log('\n3. 🔄 URLs ADICIONALES (opcionales):');
console.log(`   ${appUrl}/auth/signup-success`);
console.log(`   ${appUrl}/auth/error`);
console.log('   http://localhost:3000/auth/signup-success');
console.log('   http://localhost:3000/auth/error');

console.log('\n📝 INSTRUCCIONES PARA CONFIGURAR EN SUPABASE:');
console.log('============================================================');
console.log('');
console.log('1. Ve a tu dashboard de Supabase:');
console.log('   https://supabase.com/dashboard');
console.log('');
console.log('2. Selecciona tu proyecto');
console.log('');
console.log('3. Ve a Authentication → URL Configuration');
console.log('');
console.log('4. En "Site URL" agrega:');
console.log(`   ${appUrl}`);
console.log('');
console.log('5. En "Redirect URLs" agrega TODAS estas URLs:');
console.log(`   ${appUrl}/auth/callback`);
console.log(`   ${redirectUrl}`);
console.log('   http://localhost:3000/auth/callback');
console.log('   http://localhost:3000/dashboard');
console.log('');
console.log('6. Haz clic en "Save"');
console.log('');
console.log('⚠️  IMPORTANTE:');
console.log('- Asegúrate de que NO haya espacios extra');
console.log('- Cada URL debe estar en una línea separada');
console.log('- Las URLs deben coincidir exactamente');
console.log('- Incluye tanto HTTP (localhost) como HTTPS (producción)');

console.log('\n🔍 VERIFICACIÓN:');
console.log('============================================================');
console.log('Después de configurar, puedes verificar que funciona:');
console.log('1. Intenta hacer login en tu app de producción');
console.log('2. Verifica que redirija correctamente al dashboard');
console.log('3. Revisa los logs de Supabase para errores de redirección');

console.log('\n============================================================');
console.log('✅ CONFIGURACIÓN COMPLETADA');
