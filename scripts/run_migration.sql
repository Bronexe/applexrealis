-- Migration script to add new tables for Administrators, Notification Settings
-- Run this script in your Supabase SQL editor

-- Create tables for new modules: Administrators, Notification Settings
-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Administrators table
CREATE TABLE IF NOT EXISTS administrators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  rut TEXT NOT NULL,
  registration_date DATE NOT NULL,
  regions TEXT[] NOT NULL DEFAULT '{}',
  certification_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Notification Settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expiration_notifications_enabled BOOLEAN DEFAULT TRUE,
  expiration_days_before INTEGER DEFAULT 30,
  expiration_email_enabled BOOLEAN DEFAULT TRUE,
  expiration_sms_enabled BOOLEAN DEFAULT FALSE,
  assembly_reminders_enabled BOOLEAN DEFAULT TRUE,
  assembly_reminder_days_before INTEGER DEFAULT 7,
  assembly_reminder_email_enabled BOOLEAN DEFAULT TRUE,
  assembly_reminder_sms_enabled BOOLEAN DEFAULT FALSE,
  general_notifications_enabled BOOLEAN DEFAULT TRUE,
  general_email_enabled BOOLEAN DEFAULT TRUE,
  general_sms_enabled BOOLEAN DEFAULT FALSE,
  notification_time TIME DEFAULT '09:00',
  timezone TEXT DEFAULT 'America/Santiago',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own administrator data" ON administrators;
DROP POLICY IF EXISTS "Users can insert own administrator data" ON administrators;
DROP POLICY IF EXISTS "Users can update own administrator data" ON administrators;
DROP POLICY IF EXISTS "Users can delete own administrator data" ON administrators;

DROP POLICY IF EXISTS "Users can view own notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Users can insert own notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Users can update own notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Users can delete own notification settings" ON notification_settings;

-- RLS Policies for administrators
CREATE POLICY "Users can view own administrator data" ON administrators 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own administrator data" ON administrators 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own administrator data" ON administrators 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own administrator data" ON administrators 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for notification_settings
CREATE POLICY "Users can view own notification settings" ON notification_settings 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings" ON notification_settings 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings" ON notification_settings 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notification settings" ON notification_settings 
  FOR DELETE USING (auth.uid() = user_id);

-- Add address field to condos table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'condos' AND column_name = 'address') THEN
        ALTER TABLE condos ADD COLUMN address TEXT;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_administrators_user_id ON administrators(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);

-- Add some sample data for testing (optional)
-- You can uncomment these lines if you want to add sample data

-- INSERT INTO administrators (user_id, full_name, rut, registration_date, regions) 
-- VALUES (
--   (SELECT id FROM auth.users LIMIT 1), 
--   'Administrador de Prueba', 
--   '12.345.678-9', 
--   '2024-01-01', 
--   ARRAY['Metropolitana', 'Valparaíso']
-- ) ON CONFLICT (user_id) DO NOTHING;

-- INSERT INTO notification_settings (user_id) 
-- VALUES ((SELECT id FROM auth.users LIMIT 1)) 
-- ON CONFLICT (user_id) DO NOTHING;

-- Success message
SELECT 'Migration completed successfully! New tables created: administrators, notification_settings' as result;

