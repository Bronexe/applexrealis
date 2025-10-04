# 🏗️ Implementación de Estructura Simplificada de Copropietarios

## 📋 Resumen de Cambios

Se ha creado una nueva estructura simplificada para el módulo de copropietarios que incluye los siguientes cambios:

### ✅ **Cambios Implementados:**

1. **Roles CBR**: Cambiado de `{rolCBR, aplicaA}` a `{fojas, numero, año, aplicaA}`
2. **Co-titulares**: Eliminado campo `identificacion`, manteniendo solo `{nombre, porcentaje}`
3. **Mantener**: Código unidad, alícuota, tipo titular, nombre/razón social, tipo uso, documentos CBR, contacto

## 🗄️ **Archivos de Base de Datos**

### 1. **Nuevo Esquema Simplificado**
```sql
-- Ejecutar en Supabase SQL Editor
scripts/simplify_copropietarios_schema.sql
```

**Tablas creadas:**
- `unidades_simplified` - Tabla principal con nueva estructura
- `unidades_historial_simplified` - Historial de cambios
- `archivos_cbr_simplified` - Archivos CBR (sin cambios)

### 2. **Migración de Datos Existentes**
```sql
-- Ejecutar después del esquema
scripts/migrate_to_simplified_schema.sql
```

**Transformaciones:**
- **Roles**: `{rolCBR, aplicaA}` → `{fojas, numero, año, aplicaA}`
- **Co-titulares**: `{nombre, identificacion, porcentaje}` → `{nombre, porcentaje}`

## 🎨 **Componentes de UI**

### 1. **Tipos TypeScript**
```typescript
// lib/types/copropietarios-simplified.ts
export interface RolCBRSimplified {
  fojas: string
  numero: string
  año: string
  aplicaA: string[]
}

export interface CoTitularSimplified {
  nombre: string
  porcentaje: number
}
```

### 2. **Componentes Principales**
- `copropietarios-simplified-client.tsx` - Componente principal
- `copropietario-form-simplified.tsx` - Formulario de creación/edición
- `copropietario-detail-simplified.tsx` - Vista de detalles
- `import-export-simplified.tsx` - Importación/exportación

### 3. **Acciones del Servidor**
```typescript
// lib/actions/copropietarios-simplified.ts
- createUnidadSimplified()
- getUnidadesSimplified()
- updateUnidadSimplified()
- deleteUnidadSimplified()
- clearAllUnidadesSimplified()
- importUnidadesSimplified()
```

## 🔄 **Formato de Importación Simplificado**

### **Campos de Importación:**
- **Obligatorios**: `unidad_codigo`, `nombre_completo`, `tipo_uso`
- **Opcionales**: `alicuota`, `tipo_titular`, `email`, `telefono`, `observaciones`

### **Ejemplo de CSV:**
```csv
unidad_codigo,nombre_completo,tipo_uso,alicuota,tipo_titular,email,telefono,observaciones
A-101,Juan Pérez,Departamento,15.5,PersonaNatural,juan@email.com,+56912345678,Unidad principal
B-201,María González,Departamento;Estacionamiento,12.25,PersonaNatural,maria@email.com,,
```

### **Características:**
- ✅ **Se detiene en el primer error** - no continúa importando
- ✅ **Validación estricta** de campos obligatorios
- ✅ **Soporte para Excel y CSV**
- ✅ **Mapeo automático** de encabezados variados
- ✅ **Tipo de uso múltiple** separado por punto y coma (;)

## 🚀 **Pasos para Implementar**

### **Paso 1: Crear Nuevo Esquema**
```bash
# En Supabase SQL Editor
1. Ejecutar: scripts/simplify_copropietarios_schema.sql
2. Verificar que las tablas se crearon correctamente
```

### **Paso 2: Migrar Datos Existentes**
```bash
# En Supabase SQL Editor
1. Ejecutar: scripts/migrate_to_simplified_schema.sql
2. Verificar que los datos se migraron correctamente
```

### **Paso 3: Actualizar Componentes**
```bash
# Reemplazar archivos existentes con versiones simplificadas
1. Copiar componentes simplificados a la carpeta de copropietarios
2. Actualizar imports en archivos principales
3. Probar funcionalidad
```

### **Paso 4: Actualizar Página Principal**
```typescript
// En app/condos/[condoId]/copropietarios/page.tsx
import CopropietariosSimplifiedClient from './copropietarios-simplified-client'

export default function CopropietariosPage() {
  return <CopropietariosSimplifiedClient condoId={params.condoId} />
}
```

## 📊 **Estructura de Datos**

### **Antes (Estructura Original):**
```json
{
  "roles": [
    {
      "rolCBR": "Propietario",
      "aplicaA": ["Departamento", "Estacionamiento"]
    }
  ],
  "co_titulares": [
    {
      "nombre": "Juan Pérez",
      "identificacion": "12345678-9",
      "porcentaje": 50
    }
  ]
}
```

### **Después (Estructura Simplificada):**
```json
{
  "roles": [
    {
      "fojas": "123",
      "numero": "456",
      "año": "2024",
      "aplicaA": ["Departamento", "Estacionamiento"]
    }
  ],
  "archivo_inscripcion_cbr": {
    "nombre": "inscripcion_a101.pdf",
    "url": "https://ejemplo.com/inscripcion_a101.pdf",
    "tamaño": 1024000,
    "fecha_subida": "2024-01-15T10:30:00Z"
  },
  "archivo_vigencia_cbr": {
    "nombre": "vigencia_a101.pdf",
    "url": "https://ejemplo.com/vigencia_a101.pdf",
    "tamaño": 2048000,
    "fecha_subida": "2024-01-15T10:35:00Z"
  },
  "co_titulares": [
    {
      "nombre": "Juan Pérez",
      "porcentaje": 50
    }
  ]
}
```

## 🔧 **Validaciones**

### **Campos Obligatorios:**
- `unidad_codigo`: Texto obligatorio
- `nombre_razon_social`: Texto obligatorio  
- `tipo_uso`: Array con al menos un elemento

### **Campos Opcionales:**
- `alicuota`: Número opcional entre 0.001-100
- `titular_tipo`: PersonaNatural o PersonaJuridica (opcional)
- `roles`: Array opcional
- `archivo_inscripcion_cbr`: Objeto JSON opcional
- `archivo_vigencia_cbr`: Objeto JSON opcional
- `co_titulares`: Array opcional
- `contacto`: Objeto JSON opcional
- `observaciones`: Texto opcional

### **Roles CBR:**
- `fojas`: Texto opcional
- `numero`: Texto opcional  
- `año`: Texto opcional
- `aplicaA`: Array de strings válidos

### **Co-titulares:**
- `nombre`: Texto obligatorio (si se proporciona)
- `porcentaje`: Número entre 0-100
- Suma total debe ser 100% (si se proporcionan)

### **Archivos CBR:**
- `archivo_inscripcion_cbr`: Objeto JSON opcional con información del archivo
- `archivo_vigencia_cbr`: Objeto JSON opcional con información del archivo
- Estructura: `{nombre, url, tamaño, fecha_subida}`

### **Alícuota:**
- **Campo opcional** - no es obligatorio
- Número entre 0.001 y 100 (si se proporciona)
- Formato DECIMAL(5,4) en base de datos
- Soporte para coma como separador decimal

## 📝 **Notas Importantes**

1. **Compatibilidad**: La nueva estructura es completamente independiente de la anterior
2. **Migración**: Los datos existentes se transforman automáticamente
3. **Validación**: Se mantienen todas las validaciones existentes
4. **UI**: Interfaz más limpia y fácil de usar
5. **Importación**: Formato de archivo actualizado con nueva estructura

## 🧪 **Pruebas Recomendadas**

1. **Crear nueva unidad** con roles CBR y co-titulares
2. **Importar archivo Excel** con nuevo formato
3. **Editar unidad existente** y verificar cambios
4. **Exportar datos** y verificar formato
5. **Eliminar unidades** individual y masivamente

## 📞 **Soporte**

Si encuentras algún problema durante la implementación:

1. Verificar logs de la consola del navegador
2. Revisar logs de Supabase
3. Confirmar que las tablas se crearon correctamente
4. Verificar que los datos se migraron sin errores

---

**✅ Estructura simplificada lista para implementar**
