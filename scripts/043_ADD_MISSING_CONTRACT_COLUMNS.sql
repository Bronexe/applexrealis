-- =====================================================
-- AGREGAR COLUMNAS FALTANTES A LA TABLA CONTRACTS
-- =====================================================

-- Verificar si la tabla contracts existe
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contracts' AND table_schema = 'public') THEN
        RAISE NOTICE '=== TABLA CONTRACTS EXISTE - AGREGANDO COLUMNAS FALTANTES ===';
        
        -- Agregar columnas que podrían estar faltando
        -- (Solo se agregarán si no existen)
        
        -- Agregar columna provider_name si no existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'provider_name') THEN
            ALTER TABLE contracts ADD COLUMN provider_name TEXT;
            RAISE NOTICE 'Columna provider_name agregada';
        ELSE
            RAISE NOTICE 'Columna provider_name ya existe';
        END IF;
        
        -- Agregar columna contract_number si no existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'contract_number') THEN
            ALTER TABLE contracts ADD COLUMN contract_number TEXT;
            RAISE NOTICE 'Columna contract_number agregada';
        ELSE
            RAISE NOTICE 'Columna contract_number ya existe';
        END IF;
        
        -- Agregar columna start_date si no existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'start_date') THEN
            ALTER TABLE contracts ADD COLUMN start_date DATE;
            RAISE NOTICE 'Columna start_date agregada';
        ELSE
            RAISE NOTICE 'Columna start_date ya existe';
        END IF;
        
        -- Agregar columna end_date si no existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'end_date') THEN
            ALTER TABLE contracts ADD COLUMN end_date DATE;
            RAISE NOTICE 'Columna end_date agregada';
        ELSE
            RAISE NOTICE 'Columna end_date ya existe';
        END IF;
        
        -- Agregar columna amount si no existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'amount') THEN
            ALTER TABLE contracts ADD COLUMN amount DECIMAL(15,2);
            RAISE NOTICE 'Columna amount agregada';
        ELSE
            RAISE NOTICE 'Columna amount ya existe';
        END IF;
        
        -- Agregar columna currency si no existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'currency') THEN
            ALTER TABLE contracts ADD COLUMN currency TEXT DEFAULT 'CLP';
            RAISE NOTICE 'Columna currency agregada';
        ELSE
            RAISE NOTICE 'Columna currency ya existe';
        END IF;
        
        -- Agregar columna contract_file_url si no existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'contract_file_url') THEN
            ALTER TABLE contracts ADD COLUMN contract_file_url TEXT;
            RAISE NOTICE 'Columna contract_file_url agregada';
        ELSE
            RAISE NOTICE 'Columna contract_file_url ya existe';
        END IF;
        
        -- Agregar columna status si no existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'status') THEN
            ALTER TABLE contracts ADD COLUMN status TEXT DEFAULT 'active';
            RAISE NOTICE 'Columna status agregada';
        ELSE
            RAISE NOTICE 'Columna status ya existe';
        END IF;
        
        -- Agregar restricciones CHECK si no existen
        -- (Esto puede fallar si ya existen, pero no es crítico)
        BEGIN
            ALTER TABLE contracts ADD CONSTRAINT contracts_contract_type_check 
            CHECK (contract_type IN ('administracion', 'mantenimiento', 'limpieza', 'seguridad', 'jardineria', 'otros'));
            RAISE NOTICE 'Restricción contract_type_check agregada';
        EXCEPTION
            WHEN duplicate_object THEN
                RAISE NOTICE 'Restricción contract_type_check ya existe';
        END;
        
        BEGIN
            ALTER TABLE contracts ADD CONSTRAINT contracts_status_check 
            CHECK (status IN ('active', 'expired', 'terminated', 'pending'));
            RAISE NOTICE 'Restricción status_check agregada';
        EXCEPTION
            WHEN duplicate_object THEN
                RAISE NOTICE 'Restricción status_check ya existe';
        END;
        
        -- Verificar estructura final
        RAISE NOTICE '=== ESTRUCTURA FINAL DE LA TABLA CONTRACTS ===';
        FOR rec IN 
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'contracts' AND table_schema = 'public'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  %: % (nullable: %, default: %)', rec.column_name, rec.data_type, rec.is_nullable, rec.column_default;
        END LOOP;
        
    ELSE
        RAISE NOTICE '=== TABLA CONTRACTS NO EXISTE ===';
        RAISE NOTICE 'Ejecuta primero el script 042_RECREATE_CONTRACTS_TABLE.sql';
    END IF;
END $$;

-- =====================================================
-- COLUMNAS AGREGADAS EXITOSAMENTE
-- =====================================================






