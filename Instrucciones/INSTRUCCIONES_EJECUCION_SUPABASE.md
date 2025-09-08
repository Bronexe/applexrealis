# 🚀 INSTRUCCIONES COMPLETAS PARA EJECUTAR SCRIPTS EN SUPABASE

## 📋 **PASO A PASO DETALLADO**

### **PASO 1: Acceder a Supabase Dashboard**
1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto
4. En el menú lateral izquierdo, haz clic en **"SQL Editor"**

### **PASO 2: Abrir el Editor SQL**
1. Haz clic en **"New query"** (Nueva consulta)
2. Se abrirá un editor de texto donde puedes pegar el código SQL

### **PASO 3: Ejecutar el Script Maestro**
1. **Copia TODO el contenido** del archivo `scripts/MASTER_MIGRATION.sql`
2. **Pega el contenido** en el editor SQL de Supabase
3. Haz clic en **"Run"** (Ejecutar) o presiona `Ctrl+Enter`

### **PASO 4: Verificar la Ejecución**
- El script mostrará mensajes de progreso
- Al final verás: **"🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE 🎉"**
- Si hay errores, se mostrarán en rojo

## 📊 **SCRIPTS QUE SE EJECUTAN AUTOMÁTICAMENTE**

El script maestro incluye **TODOS** estos scripts en el orden correcto:

### ✅ **Scripts Incluidos:**
1. **`001_create_tables.sql`** - Tablas principales (condos, assemblies, etc.)
2. **`002_seed_rules.sql`** - Reglas de cumplimiento
3. **`003_create_storage_bucket.sql`** - Bucket para archivos
4. **`004_create_new_tables.sql`** - Tablas nuevas (administrators, notification_settings)
5. **`005_complete_migration.sql`** - Migración completa con verificaciones

### ❌ **Scripts NO Necesarios (ya incluidos en el maestro):**
- `run_migration.sql` - Reemplazado por el script maestro
- `diagnose_database.sql` - Solo para diagnóstico
- `fix_database_issues.sql` - Solo para corrección de problemas

## 🎯 **QUÉ CREA EL SCRIPT MAESTRO**

### **📋 Tablas Creadas:**
- ✅ `condos` - Condominios
- ✅ `assemblies` - Asambleas
- ✅ `emergency_plans` - Planes de emergencia
- ✅ `certifications` - Certificaciones
- ✅ `insurances` - Seguros
- ✅ `alerts` - Alertas de cumplimiento
- ✅ `rules` - Reglas de cumplimiento
- ✅ `administrators` - Administradores
- ✅ `notification_settings` - Configuraciones de notificación

### **🔒 Políticas RLS Creadas:**
- ✅ Políticas para todas las tablas
- ✅ Acceso restringido por usuario autenticado
- ✅ Políticas de INSERT, UPDATE, DELETE, SELECT

### **📁 Storage Configurado:**
- ✅ Bucket `evidence` para archivos
- ✅ Políticas de acceso a archivos
- ✅ Configuración de permisos

### **📊 Datos Iniciales:**
- ✅ Reglas de cumplimiento básicas
- ✅ Índices para mejor rendimiento

## ⚠️ **IMPORTANTE: ANTES DE EJECUTAR**

### **Verificaciones Previas:**
1. **¿Ya tienes datos importantes?** - El script es seguro, no elimina datos existentes
2. **¿Estás en el proyecto correcto?** - Verifica que estés en el proyecto correcto de Supabase
3. **¿Tienes permisos de administrador?** - Necesitas permisos para crear tablas

### **Si Ya Ejecutaste Scripts Parciales:**
- **No hay problema** - El script usa `CREATE TABLE IF NOT EXISTS`
- **No duplicará datos** - Usa `ON CONFLICT DO NOTHING`
- **Es seguro ejecutar** - No causará errores

## 🔍 **VERIFICACIÓN POST-EJECUCIÓN**

### **Paso 1: Verificar Tablas**
1. Ve a **"Table Editor"** en Supabase
2. Deberías ver todas las tablas listadas
3. Haz clic en cada tabla para verificar su estructura

### **Paso 2: Verificar Storage**
1. Ve a **"Storage"** en Supabase
2. Deberías ver el bucket `evidence`
3. Verifica que esté configurado como privado

### **Paso 3: Probar la Aplicación**
1. Ve a tu aplicación web
2. Navega a `/administrador` - debería funcionar sin errores
3. Navega a `/reportes` - debería funcionar sin errores
4. Navega a `/configuracion` - debería funcionar sin errores

## 🚨 **SI HAY ERRORES**

### **Error Común 1: "Permission denied"**
- **Solución**: Verifica que tengas permisos de administrador en Supabase

### **Error Común 2: "Table already exists"**
- **Solución**: Normal, el script continúa sin problemas

### **Error Común 3: "Policy already exists"**
- **Solución**: Normal, el script usa `DROP POLICY IF EXISTS`

### **Error Común 4: "Extension already exists"**
- **Solución**: Normal, el script usa `CREATE EXTENSION IF NOT EXISTS`

## 📞 **SOPORTE**

### **Si Necesitas Ayuda:**
1. **Copia el mensaje de error completo**
2. **Toma una captura de pantalla** del error
3. **Verifica que estés en el proyecto correcto**

### **Logs de Ejecución:**
- El script mostrará mensajes de progreso
- Al final verás un resumen de lo que se creó
- Si hay errores, se mostrarán en rojo

## 🎉 **RESULTADO ESPERADO**

Después de ejecutar el script maestro:

- ✅ **Todas las páginas funcionarán** sin errores
- ✅ **Formularios se llenarán** correctamente
- ✅ **Archivos se subirán** sin problemas
- ✅ **Reportes se generarán** correctamente
- ✅ **Base de datos estará** completamente configurada

## 📝 **RESUMEN DE ACCIÓN**

**SOLO NECESITAS HACER ESTO:**

1. **Abrir Supabase SQL Editor**
2. **Copiar y pegar** `scripts/MASTER_MIGRATION.sql`
3. **Ejecutar el script**
4. **Verificar que aparezca** "🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE 🎉"

**¡Eso es todo! Tu aplicación estará completamente funcional.**

