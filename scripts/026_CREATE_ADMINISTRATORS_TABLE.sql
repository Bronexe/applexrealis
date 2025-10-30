-- =====================================================
-- CREAR TABLA ADMINISTRATORS PARA SUPER-ADMIN
-- =====================================================

-- 1. CREAR TABLA ADMINISTRATORS
CREATE TABLE IF NOT EXISTS administrators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    rut TEXT NOT NULL UNIQUE,
    email TEXT,
    registration_date DATE NOT NULL,
    regions TEXT[] DEFAULT '{}',
    certification_file_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'user')) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_administrators_user_id ON administrators(user_id);
CREATE INDEX IF NOT EXISTS idx_administrators_rut ON administrators(rut);
CREATE INDEX IF NOT EXISTS idx_administrators_role ON administrators(role);
CREATE INDEX IF NOT EXISTS idx_administrators_is_active ON administrators(is_active);

-- 3. HABILITAR RLS
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;

-- 4. CREAR POLÍTICAS RLS
-- Solo super admins pueden ver todos los administradores
CREATE POLICY "Super admins can view all administrators" ON administrators
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM administrators a 
        WHERE a.user_id = auth.uid() 
        AND a.role = 'super_admin' 
        AND a.is_active = true
    )
);

-- Solo super admins pueden insertar administradores
CREATE POLICY "Super admins can insert administrators" ON administrators
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM administrators a 
        WHERE a.user_id = auth.uid() 
        AND a.role = 'super_admin' 
        AND a.is_active = true
    )
);

-- Solo super admins pueden actualizar administradores
CREATE POLICY "Super admins can update administrators" ON administrators
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM administrators a 
        WHERE a.user_id = auth.uid() 
        AND a.role = 'super_admin' 
        AND a.is_active = true
    )
);

-- Solo super admins pueden eliminar administradores
CREATE POLICY "Super admins can delete administrators" ON administrators
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM administrators a 
        WHERE a.user_id = auth.uid() 
        AND a.role = 'super_admin' 
        AND a.is_active = true
    )
);

-- 5. CREAR TRIGGER PARA ACTUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_administrators_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_administrators_updated_at
    BEFORE UPDATE ON administrators
    FOR EACH ROW
    EXECUTE FUNCTION update_administrators_updated_at();

-- 6. CREAR USUARIO SUPER ADMIN INICIAL (sebaleon@gmail.com)
-- Primero verificamos si ya existe
DO $$
DECLARE
    admin_user_id UUID;
    admin_exists BOOLEAN;
BEGIN
    -- Buscar el usuario en auth.users
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'sebaleon@gmail.com' 
    LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        -- Verificar si ya existe en administrators
        SELECT EXISTS(
            SELECT 1 FROM administrators 
            WHERE user_id = admin_user_id
        ) INTO admin_exists;
        
        IF NOT admin_exists THEN
            -- Crear registro en administrators
            INSERT INTO administrators (
                user_id,
                full_name,
                rut,
                email,
                registration_date,
                regions,
                role,
                is_active
            ) VALUES (
                admin_user_id,
                'Sebastián León',
                '12345678-9',
                'sebaleon@gmail.com',
                CURRENT_DATE,
                ARRAY['Metropolitana', 'Valparaíso'],
                'super_admin',
                true
            );
            
            RAISE NOTICE 'Usuario super admin creado en administrators: %', admin_user_id;
        ELSE
            RAISE NOTICE 'Usuario super admin ya existe en administrators';
        END IF;
    ELSE
        RAISE NOTICE 'Usuario sebaleon@gmail.com no encontrado en auth.users';
    END IF;
END $$;

-- 7. VERIFICAR CREACIÓN
SELECT 
    'Tabla administrators creada' as status,
    COUNT(*) as total_administrators
FROM administrators;

-- 8. MOSTRAR ADMINISTRADORES CREADOS
SELECT 
    id,
    full_name,
    email,
    role,
    is_active,
    created_at
FROM administrators
ORDER BY created_at DESC;

-- =====================================================
-- TABLA ADMINISTRATORS CREADA EXITOSAMENTE
-- =====================================================









