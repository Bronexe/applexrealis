# 🔄 Instrucciones para Revertir Cambios en la Tabla Administrators

## ⚠️ **IMPORTANTE: REVERSIÓN DE CAMBIOS**

Has decidido revertir los cambios realizados por el script `update_administrators_table.sql`. Aquí están las instrucciones paso a paso para deshacer todos los cambios.

## 📋 **PASOS PARA LA REVERSIÓN**

### **PASO 1: Acceder a Supabase SQL Editor**
1. Ve a tu proyecto en Supabase
2. Navega a **SQL Editor** en el menú lateral
3. Haz clic en **"New query"**

### **PASO 2: Ejecutar el Script de Reversión**
1. Copia **TODO** el contenido del archivo `scripts/revert_administrators_table.sql`
2. Pégalo en el editor SQL de Supabase
3. Haz clic en **"Run"** para ejecutar el script

### **PASO 3: Verificar la Reversión**
El script incluye verificaciones automáticas que te mostrarán:
- ✅ Estructura de la tabla restaurada
- ✅ Políticas RLS restauradas
- ✅ Restricciones restauradas
- ✅ Mensaje de confirmación

## 🔧 **CAMBIOS QUE SE REVIERTEN**

### **✅ Índices Eliminados**
- `idx_administrators_user_id`
- `idx_administrators_rut`

### **✅ Políticas RLS Restauradas**
- **Antes**: Políticas que permitían acceso a todos los administradores
- **Después**: Políticas originales que restringen acceso por `user_id`

### **✅ Columnas Eliminadas**
- `admin_type` (tipo de administrador)
- `email` (email del administrador)
- `phone` (teléfono del administrador)

### **✅ Restricción UNIQUE Restaurada**
- Se restaura la restricción `administrators_user_id_key` en `user_id`
- Esto significa que **solo un administrador por usuario** (comportamiento original)

## 📊 **ESTADO DESPUÉS DE LA REVERSIÓN**

### **✅ Estructura de la Tabla**
```sql
administrators:
- id (uuid, primary key)
- user_id (uuid, unique) -- RESTAURADO
- full_name (text)
- rut (text)
- registration_date (date)
- regions (text[])
- certification_file_url (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### **✅ Políticas RLS**
- **SELECT**: Solo el usuario puede ver sus propios datos
- **INSERT**: Solo el usuario puede insertar sus propios datos
- **UPDATE**: Solo el usuario puede actualizar sus propios datos
- **DELETE**: Solo el usuario puede eliminar sus propios datos

## ⚠️ **CONSIDERACIONES IMPORTANTES**

### **🔴 Datos Perdidos**
Si tenías datos en las columnas eliminadas (`admin_type`, `email`, `phone`), **se perderán permanentemente**.

### **🔴 Múltiples Administradores**
Si tenías múltiples registros de administrador para el mismo usuario, **solo se mantendrá uno** debido a la restricción UNIQUE restaurada.

### **🔴 Aplicación**
La aplicación volverá al comportamiento original:
- Un administrador por usuario
- Sin campos adicionales
- Acceso restringido por usuario

## 🚀 **DESPUÉS DE LA REVERSIÓN**

### **✅ Verificaciones Recomendadas**
1. **Probar la página de administrador** en la aplicación
2. **Verificar que los datos existentes** se muestren correctamente
3. **Confirmar que no hay errores** en la consola del navegador
4. **Probar crear/editar** un administrador

### **✅ Si Hay Problemas**
Si encuentras problemas después de la reversión:
1. Ejecuta el script `scripts/debug_administrators_access.sql`
2. Revisa los logs de Supabase
3. Verifica que las políticas RLS estén correctas

## 📝 **SCRIPT DE REVERSIÓN**

El script `scripts/revert_administrators_table.sql` contiene:
- Eliminación de índices
- Restauración de políticas RLS originales
- Eliminación de columnas agregadas
- Restauración de restricción UNIQUE
- Verificaciones automáticas

## 🎯 **RESULTADO ESPERADO**

Después de ejecutar la reversión:
- ✅ La tabla `administrators` volverá a su estado original
- ✅ Solo un administrador por usuario
- ✅ Políticas RLS restrictivas por usuario
- ✅ Sin campos adicionales
- ✅ Comportamiento original de la aplicación

---

**⚠️ IMPORTANTE: Esta reversión es irreversible. Asegúrate de que realmente quieres deshacer estos cambios antes de ejecutar el script.**

