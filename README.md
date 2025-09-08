# Lex Realis - Administradores App

Sistema MVP para gestionar el cumplimiento normativo de copropiedades con Next.js 14, Supabase y TypeScript.

## Características

- 🔐 **Autenticación** con Supabase (email/password)
- 🏢 **Gestión de Condominios** (crear, editar, listar)
- 📋 **4 Módulos CRUD** con carga de PDFs:
  - Asambleas (ordinarias/extraordinarias)
  - Planes de Emergencia
  - Certificaciones (gas/ascensor/otros)
  - Seguros
- 📊 **Dashboard** con KPIs y alertas de cumplimiento
- ⚡ **Evaluación automática** de 4 reglas de cumplimiento
- 📁 **Storage privado** para evidencias PDF
- 🎨 **Diseño moderno** con color primario #BF7F11

## Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI**: shadcn/ui components
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **Validación**: React Hook Form + Zod
- **Iconos**: Lucide React

## Configuración Inicial

### 1. Configurar Supabase

1. Crea un nuevo proyecto en [Supabase](https://supabase.com)
2. Ve a Project Settings > API para obtener:
   - `Project URL`
   - `anon public key`
   - `service_role key` (solo para server-side)

### 2. Variables de Entorno

Crea un archivo `.env.local` con:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://applexrealis.vercel.app/dashboard
\`\`\`

### 3. Configurar Base de Datos

Ejecuta los siguientes scripts SQL en el editor SQL de Supabase:

1. **Crear tablas**: Ejecuta `scripts/001_create_tables.sql`
2. **Seed de reglas**: Ejecuta `scripts/002_seed_rules.sql`
3. **Configurar storage**: Ejecuta `scripts/003_create_storage_bucket.sql`

### 4. Configurar Storage

1. Ve a Storage en tu dashboard de Supabase
2. El bucket `evidence` debería haberse creado automáticamente
3. Verifica que las políticas RLS estén activas

### 5. Instalar y Ejecutar

\`\`\`bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
\`\`\`

## Estructura del Proyecto

\`\`\`
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   └── signup-success/
│   ├── dashboard/
│   ├── condos/
│   │   ├── new/
│   │   └── [condoId]/
│   │       ├── dashboard/
│   │       ├── asambleas/
│   │       ├── planes/
│   │       ├── certificaciones/
│   │       └── seguros/
│   └── layout.tsx
├── components/
│   ├── ui/
│   ├── evidence-uploader.tsx
│   ├── compliance-overview.tsx
│   └── recalculate-compliance-button.tsx
├── lib/
│   ├── supabase/
│   └── actions/
└── scripts/
    ├── 001_create_tables.sql
    ├── 002_seed_rules.sql
    └── 003_create_storage_bucket.sql
\`\`\`

## Funcionalidades Principales

### Autenticación
- Login/Signup con email y contraseña
- Confirmación por email requerida
- Middleware para proteger rutas

### Gestión de Condominios
- Crear nuevos condominios
- Dashboard individual por condominio
- Navegación por tabs entre módulos

### Módulos CRUD
Cada módulo incluye:
- Listado con tabla responsive
- Formularios de creación/edición
- Carga de archivos PDF
- Validación de datos

### Sistema de Cumplimiento
- **4 Reglas automáticas**:
  - `ASAMBLEA-ANUAL`: Asamblea ordinaria ≤ 365 días con acta
  - `PLAN-EVAC-ANUAL`: Plan de evacuación actualizado ≤ 365 días
  - `SEGURO-VIGENTE`: Al menos un seguro vigente
  - `CERTIF-VIGENTE`: Al menos una certificación vigente
- Botón "Recalcular Cumplimiento" ejecuta evaluación
- Dashboard con KPIs y alertas visuales

### Storage de Archivos
- Bucket privado `evidence`
- Rutas organizadas: `condoId/module/uuid.pdf`
- Enlaces firmados para descarga segura
- Validación: solo PDF, máx 20MB

## Criterios de Aceptación MVP

✅ Login funcional con Supabase  
✅ Crear condominio y acceder a `/[condoId]`  
✅ CRUD completo en los 4 módulos + carga PDF  
✅ Dashboard con conteos y lista de alertas  
✅ Botón "Recalcular Cumplimiento" actualiza alertas  
✅ Color primario #BF7F11 en CTAs, tabs y estados  

## Próximas Funcionalidades

- Comité de administración
- Módulos laborales y rendiciones
- Agendador automático (cron jobs)
- Multi-tenancy avanzado
- Notificaciones por email
- Reportes PDF

## Desarrollo

\`\`\`bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Ejecutar linting
npm run lint
\`\`\`

## Despliegue

El proyecto está optimizado para despliegue en Vercel:

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

## Soporte

Para problemas o preguntas sobre la implementación, revisa:
- Documentación de [Next.js](https://nextjs.org/docs)
- Documentación de [Supabase](https://supabase.com/docs)
- Documentación de [shadcn/ui](https://ui.shadcn.com)
