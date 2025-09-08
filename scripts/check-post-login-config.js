require('dotenv').config({ path: '.env.local' });

console.log('🔍 VERIFICANDO CONFIGURACIÓN POST-LOGIN...');
console.log('============================================================');

// 1. Verificar variables de entorno relacionadas con redirección
console.log('\n1. 📋 VARIABLES DE ENTORNO:');
console.log(`   NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL || 'NO CONFIGURADA'}`);
console.log(`   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL: ${process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || 'NO CONFIGURADA'}`);

// 2. Verificar archivos de autenticación
const fs = require('fs');
const path = require('path');

console.log('\n2. 📁 VERIFICANDO ARCHIVOS DE AUTENTICACIÓN:');

const authFiles = [
  'app/auth/login/page.tsx',
  'app/auth/signup/page.tsx',
  'app/auth/callback/page.tsx'
];

authFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const hasLocalhost = content.includes('localhost:3000');
    const hasRedirectUrl = content.includes('NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL');
    
    console.log(`   ${file}:`);
    console.log(`     ❌ Contiene localhost:3000: ${hasLocalhost}`);
    console.log(`     🔗 Usa NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL: ${hasRedirectUrl}`);
    
    if (hasLocalhost) {
      console.log(`     🚨 PROBLEMA: Este archivo contiene referencias a localhost`);
    }
  } else {
    console.log(`   ${file}: ❌ NO EXISTE`);
  }
});

// 3. Verificar configuración de Supabase
console.log('\n3. 🔧 VERIFICANDO CONFIGURACIÓN DE SUPABASE:');

const supabaseFiles = [
  'lib/supabase/client.ts',
  'lib/supabase/server.ts',
  'lib/supabase/middleware.ts'
];

supabaseFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const hasLocalhost = content.includes('localhost:3000');
    
    console.log(`   ${file}:`);
    console.log(`     ❌ Contiene localhost:3000: ${hasLocalhost}`);
    
    if (hasLocalhost) {
      console.log(`     🚨 PROBLEMA: Este archivo contiene referencias a localhost`);
    }
  } else {
    console.log(`   ${file}: ❌ NO EXISTE`);
  }
});

// 4. Verificar middleware
console.log('\n4. 🛡️ VERIFICANDO MIDDLEWARE:');

if (fs.existsSync('middleware.ts')) {
  const content = fs.readFileSync('middleware.ts', 'utf8');
  const hasLocalhost = content.includes('localhost:3000');
  
  console.log(`   middleware.ts:`);
  console.log(`     ❌ Contiene localhost:3000: ${hasLocalhost}`);
  
  if (hasLocalhost) {
    console.log(`     🚨 PROBLEMA: Middleware contiene referencias a localhost`);
  }
} else {
  console.log(`   middleware.ts: ❌ NO EXISTE`);
}

// 5. Verificar configuración de Next.js
console.log('\n5. ⚙️ VERIFICANDO CONFIGURACIÓN DE NEXT.JS:');

if (fs.existsSync('next.config.mjs')) {
  const content = fs.readFileSync('next.config.mjs', 'utf8');
  const hasLocalhost = content.includes('localhost:3000');
  
  console.log(`   next.config.mjs:`);
  console.log(`     ❌ Contiene localhost:3000: ${hasLocalhost}`);
  
  if (hasLocalhost) {
    console.log(`     🚨 PROBLEMA: Next.js config contiene referencias a localhost`);
  }
} else {
  console.log(`   next.config.mjs: ❌ NO EXISTE`);
}

console.log('\n============================================================');
console.log('✅ VERIFICACIÓN COMPLETADA');

// 6. Resumen de problemas
console.log('\n🎯 RESUMEN DE PROBLEMAS ENCONTRADOS:');

const problems = [];

if (process.env.NEXT_PUBLIC_APP_URL?.includes('localhost:3000')) {
  problems.push('NEXT_PUBLIC_APP_URL está configurada para localhost');
}

if (process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL?.includes('localhost:3000')) {
  problems.push('NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL está configurada para localhost');
}

if (problems.length === 0) {
  console.log('   ✅ No se encontraron problemas en las variables de entorno');
} else {
  problems.forEach(problem => {
    console.log(`   ❌ ${problem}`);
  });
}

console.log('\n🔧 SOLUCIONES RECOMENDADAS:');
console.log('1. Actualizar NEXT_PUBLIC_APP_URL en Vercel a: https://applexrealis.vercel.app');
console.log('2. Actualizar NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL en Vercel a: https://applexrealis.vercel.app/dashboard');
console.log('3. Hacer redeploy de la aplicación');
console.log('4. Limpiar cache del navegador');
