    -- Script para configurar el sistema de notificaciones automáticas
    -- Ejecutar en Supabase SQL Editor

    -- 1. Crear tabla de tipos de notificaciones
    CREATE TABLE IF NOT EXISTS notification_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    template_subject TEXT NOT NULL,
    template_body TEXT NOT NULL,
    days_before INTEGER DEFAULT 0, -- Días antes del evento para enviar
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 2. Crear tabla de configuración de notificaciones por usuario
    CREATE TABLE IF NOT EXISTS user_notification_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type_id UUID NOT NULL REFERENCES notification_types(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT true,
    days_before INTEGER DEFAULT 0, -- Personalización por usuario
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, notification_type_id)
    );

    -- 3. Crear tabla de historial de notificaciones enviadas
    CREATE TABLE IF NOT EXISTS notification_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type_id UUID NOT NULL REFERENCES notification_types(id) ON DELETE CASCADE,
    related_entity_type VARCHAR(50), -- 'condo', 'document', 'assembly', etc.
    related_entity_id UUID,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'failed', 'pending'
    error_message TEXT,
    email_id VARCHAR(100) -- ID del email de Resend
    );

    -- 4. Crear tabla de eventos de notificaciones
    CREATE TABLE IF NOT EXISTS notification_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL, -- 'document_expiring', 'assembly_reminder', 'compliance_alert'
    entity_type VARCHAR(50) NOT NULL, -- 'condo', 'document', 'assembly'
    entity_id UUID NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notification_type_id UUID NOT NULL REFERENCES notification_types(id),
    is_processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 5. Insertar tipos de notificaciones por defecto
    INSERT INTO notification_types (name, description, template_subject, template_body, days_before) VALUES
    (
    'document_expiring',
    'Documento próximo a vencer',
    '📄 Documento próximo a vencer - {{condo_name}}',
    '<h1>📄 Documento próximo a vencer</h1><p>El documento <strong>{{document_name}}</strong> del condominio <strong>{{condo_name}}</strong> vence el {{expiry_date}}.</p><p>Por favor, renueva el documento a la brevedad.</p>',
    30
    ),
    (
    'document_expired',
    'Documento vencido',
    '⚠️ Documento vencido - {{condo_name}}',
    '<h1>⚠️ Documento vencido</h1><p>El documento <strong>{{document_name}}</strong> del condominio <strong>{{condo_name}}</strong> venció el {{expiry_date}}.</p><p>Es urgente renovar este documento.</p>',
    0
    ),
    (
    'assembly_reminder',
    'Recordatorio de asamblea',
    '🏢 Recordatorio de asamblea - {{condo_name}}',
    '<h1>🏢 Recordatorio de asamblea</h1><p>Se recuerda que el {{assembly_date}} se realizará la asamblea <strong>{{assembly_type}}</strong> del condominio <strong>{{condo_name}}</strong>.</p><p>Hora: {{assembly_time}}</p><p>Lugar: {{assembly_location}}</p>',
    7
    ),
    (
    'compliance_alert',
    'Alerta de cumplimiento',
    '🚨 Alerta de cumplimiento - {{condo_name}}',
    '<h1>🚨 Alerta de cumplimiento</h1><p>El condominio <strong>{{condo_name}}</strong> tiene pendientes los siguientes requisitos de cumplimiento:</p><ul>{{compliance_items}}</ul><p>Por favor, revisa y completa los requisitos pendientes.</p>',
    0
    ),
    (
    'insurance_expiring',
    'Seguro próximo a vencer',
    '🛡️ Seguro próximo a vencer - {{condo_name}}',
    '<h1>🛡️ Seguro próximo a vencer</h1><p>El seguro <strong>{{insurance_type}}</strong> del condominio <strong>{{condo_name}}</strong> vence el {{expiry_date}}.</p><p>Por favor, renueva el seguro a la brevedad.</p>',
    30
    );

    -- 6. Crear índices para optimizar consultas
    CREATE INDEX IF NOT EXISTS idx_user_notification_settings_user_id ON user_notification_settings(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_notification_settings_type_id ON user_notification_settings(notification_type_id);
    CREATE INDEX IF NOT EXISTS idx_notification_history_user_id ON notification_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_notification_history_sent_at ON notification_history(sent_at);
    CREATE INDEX IF NOT EXISTS idx_notification_events_event_date ON notification_events(event_date);
    CREATE INDEX IF NOT EXISTS idx_notification_events_processed ON notification_events(is_processed);

    -- 7. Crear función para actualizar updated_at
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- 8. Crear triggers para updated_at
    CREATE TRIGGER update_notification_types_updated_at BEFORE UPDATE ON notification_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_user_notification_settings_updated_at BEFORE UPDATE ON user_notification_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- 9. Configurar RLS (Row Level Security)
    ALTER TABLE notification_types ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;
    ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;
    ALTER TABLE notification_events ENABLE ROW LEVEL SECURITY;

    -- 10. Crear políticas RLS
    -- Políticas para notification_types (lectura pública)
    CREATE POLICY "Notification types are viewable by everyone" ON notification_types FOR SELECT USING (true);

    -- Políticas para user_notification_settings
    CREATE POLICY "Users can view their own notification settings" ON user_notification_settings FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert their own notification settings" ON user_notification_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update their own notification settings" ON user_notification_settings FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete their own notification settings" ON user_notification_settings FOR DELETE USING (auth.uid() = user_id);

    -- Políticas para notification_history
    CREATE POLICY "Users can view their own notification history" ON notification_history FOR SELECT USING (auth.uid() = user_id);

    -- Políticas para notification_events (solo para service role)
    CREATE POLICY "Service role can manage notification events" ON notification_events FOR ALL USING (auth.role() = 'service_role');

    -- 11. Crear función para obtener configuración de notificaciones de un usuario
    CREATE OR REPLACE FUNCTION get_user_notification_settings(user_uuid UUID)
    RETURNS TABLE (
    notification_type_id UUID,
    notification_name VARCHAR(100),
    is_enabled BOOLEAN,
    email_enabled BOOLEAN,
    days_before INTEGER,
    template_subject TEXT,
    template_body TEXT
    ) AS $$
    BEGIN
    RETURN QUERY
    SELECT 
        nt.id,
        nt.name,
        COALESCE(uns.is_enabled, true) as is_enabled,
        COALESCE(uns.email_enabled, true) as email_enabled,
        COALESCE(uns.days_before, nt.days_before) as days_before,
        nt.template_subject,
        nt.template_body
    FROM notification_types nt
    LEFT JOIN user_notification_settings uns ON nt.id = uns.notification_type_id AND uns.user_id = user_uuid
    WHERE nt.is_active = true;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- 12. Crear función para registrar evento de notificación
    CREATE OR REPLACE FUNCTION create_notification_event(
    p_event_type VARCHAR(50),
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    p_event_date TIMESTAMP WITH TIME ZONE,
    p_notification_type_name VARCHAR(100)
    )
    RETURNS UUID AS $$
    DECLARE
    v_notification_type_id UUID;
    v_event_id UUID;
    BEGIN
    -- Obtener ID del tipo de notificación
    SELECT id INTO v_notification_type_id 
    FROM notification_types 
    WHERE name = p_notification_type_name AND is_active = true;
    
    IF v_notification_type_id IS NULL THEN
        RAISE EXCEPTION 'Notification type % not found', p_notification_type_name;
    END IF;
    
    -- Crear evento
    INSERT INTO notification_events (
        event_type,
        entity_type,
        entity_id,
        event_date,
        notification_type_id
    ) VALUES (
        p_event_type,
        p_entity_type,
        p_entity_id,
        p_event_date,
        v_notification_type_id
    ) RETURNING id INTO v_event_id;
    
    RETURN v_event_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- 13. Crear función para marcar evento como procesado
    CREATE OR REPLACE FUNCTION mark_notification_event_processed(event_uuid UUID)
    RETURNS VOID AS $$
    BEGIN
    UPDATE notification_events 
    SET is_processed = true, processed_at = NOW()
    WHERE id = event_uuid;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- 14. Crear función para obtener eventos pendientes
    CREATE OR REPLACE FUNCTION get_pending_notification_events()
    RETURNS TABLE (
    event_id UUID,
    event_type VARCHAR(50),
    entity_type VARCHAR(50),
    entity_id UUID,
    event_date TIMESTAMP WITH TIME ZONE,
    notification_type_id UUID,
    notification_name VARCHAR(100),
    template_subject TEXT,
    template_body TEXT
    ) AS $$
    BEGIN
    RETURN QUERY
    SELECT 
        ne.id,
        ne.event_type,
        ne.entity_type,
        ne.entity_id,
        ne.event_date,
        ne.notification_type_id,
        nt.name,
        nt.template_subject,
        nt.template_body
    FROM notification_events ne
    JOIN notification_types nt ON ne.notification_type_id = nt.id
    WHERE ne.is_processed = false 
        AND ne.event_date <= NOW() + INTERVAL '1 day'
        AND nt.is_active = true
    ORDER BY ne.event_date ASC;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- 15. Comentarios para documentación
    COMMENT ON TABLE notification_types IS 'Tipos de notificaciones disponibles en el sistema';
    COMMENT ON TABLE user_notification_settings IS 'Configuración de notificaciones por usuario';
    COMMENT ON TABLE notification_history IS 'Historial de notificaciones enviadas';
    COMMENT ON TABLE notification_events IS 'Eventos que requieren notificaciones';
    COMMENT ON FUNCTION get_user_notification_settings(UUID) IS 'Obtiene la configuración de notificaciones de un usuario';
    COMMENT ON FUNCTION create_notification_event(VARCHAR, VARCHAR, UUID, TIMESTAMP WITH TIME ZONE, VARCHAR) IS 'Crea un nuevo evento de notificación';
    COMMENT ON FUNCTION mark_notification_event_processed(UUID) IS 'Marca un evento de notificación como procesado';
    COMMENT ON FUNCTION get_pending_notification_events() IS 'Obtiene eventos de notificación pendientes';

    -- 16. Mensaje de confirmación
    DO $$
    BEGIN
    RAISE NOTICE 'Sistema de notificaciones configurado exitosamente';
    RAISE NOTICE 'Tablas creadas: notification_types, user_notification_settings, notification_history, notification_events';
    RAISE NOTICE 'Funciones creadas: get_user_notification_settings, create_notification_event, mark_notification_event_processed, get_pending_notification_events';
    RAISE NOTICE 'Tipos de notificaciones insertados: document_expiring, document_expired, assembly_reminder, compliance_alert, insurance_expiring';
    END $$;
