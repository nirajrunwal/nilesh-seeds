-- ============================================
-- Nilesh Seeds Database Setup
-- Copy this ENTIRE file and paste into Supabase SQL Editor
-- ============================================

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee', 'farmer')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create farmers table
CREATE TABLE IF NOT EXISTS farmers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  village TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  crops TEXT,
  land_size TEXT,
  assigned_employee_id UUID,
  ledger_link TEXT,
  whatsapp_link TEXT,
  phone_link TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  commission_points INTEGER DEFAULT 0,
  assigned_farmers JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id TEXT,
  employee_id TEXT,
  farmer_name TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10, 2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create APK versions table
CREATE TABLE IF NOT EXISTS apk_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL UNIQUE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  release_notes TEXT,
  mandatory BOOLEAN DEFAULT false,
  downloads INTEGER DEFAULT 0,
  uploaded_by TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create location tracking table (optional for future use)
CREATE TABLE IF NOT EXISTS location_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_farmers_employee ON farmers(assigned_employee_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_farmer ON prescriptions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_employee ON prescriptions(employee_id);
CREATE INDEX IF NOT EXISTS idx_location_user ON location_tracking(user_id);

-- Insert default admin user (password: admin123)
INSERT INTO users (email, phone, name, password_hash, role, status)
VALUES (
  'admin@nileshseeds.com',
  '+919876543210',
  'Admin',
  '$2a$10$rWqZxJwl7xGKX.4EH8V0IOxJZBzS.kqJZONvFjKZnXGOYgzk5z9ry',
  'admin',
  'active'
) ON CONFLICT (email) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Database setup complete!';
  RAISE NOTICE '✅ All tables created successfully!';
  RAISE NOTICE '✅ Default admin user created (email: admin@nileshseeds.com, password: admin123)';
END $$;
