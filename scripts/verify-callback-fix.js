const fs = require('fs');

console.log('🔧 VERIFICANDO CORRECCIÓN DEL MIDDLEWARE PARA /auth/callback');
console.log('============================================================');

const middlewarePath = 'lib/supabase/middleware.ts';

if (fs.existsSync(middlewarePath)) {
  const content = fs.readFileSync(middlewarePath, 'utf8');
  
  console.log('\n📋 VERIFICACIÓN DEL MIDDLEWARE:');
  
  // Verificar que existe la condición para /auth/callback
  if (content.includes('request.nextUrl.pathname !== "/auth/callback"')) {
    console.log('✅ Middleware corregido: /auth/callback está excluido de la redirección');
  } else {
    console.log('❌ Middleware NO corregido: /auth/callback aún puede ser bloqueado');
  }
  
  // Verificar que existe la condición para /auth
  if (content.includes('!request.nextUrl.pathname.startsWith("/auth")')) {
    console.log('✅ Middleware incluye exclusión general para /auth');
  } else {
    console.log('❌ Middleware NO incluye exclusión general para /auth');
  }
  
  // Mostrar la sección relevante del código
  console.log('\n📝 CÓDIGO RELEVANTE DEL MIDDLEWARE:');
  const lines = content.split('\n');
  let inCondition = false;
  let conditionLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('if (') && line.includes('request.nextUrl.pathname')) {
      inCondition = true;
    }
    if (inCondition) {
      conditionLines.push(`${i + 1}: ${line}`);
      if (line.includes('}')) {
        break;
      }
    }
  }
  
  conditionLines.forEach(line => {
    console.log(`   ${line}`);
  });
  
} else {
  console.log('❌ Archivo middleware.ts no encontrado');
}

console.log('\n🎯 PRÓXIMOS PASOS:');
console.log('============================================================');
console.log('1. Hacer commit de la corrección:');
console.log('   git add lib/supabase/middleware.ts');
console.log('   git commit -m "Fix middleware to allow /auth/callback route"');
console.log('   git push');
console.log('');
console.log('2. Hacer redeploy en Vercel:');
console.log('   vercel --prod');
console.log('');
console.log('3. Probar el login nuevamente');
console.log('');
console.log('4. Verificar que ya no aparece el error "requested path is invalid"');

console.log('\n🔍 EXPLICACIÓN DEL PROBLEMA:');
console.log('============================================================');
console.log('El middleware estaba bloqueando la ruta /auth/callback porque:');
console.log('1. Cuando Supabase redirige después del login, va a /auth/callback');
console.log('2. En ese momento, el usuario aún no está "autenticado" en el middleware');
console.log('3. El middleware redirigía a /auth/login, causando el error');
console.log('4. Ahora /auth/callback está explícitamente excluido de la redirección');

console.log('\n============================================================');
console.log('✅ VERIFICACIÓN COMPLETADA');
