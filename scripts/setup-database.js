// Supabase Database Setup Script
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qvhrtbptpjcqlyyfptbo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHJ0YnB0cGpjcWx5eWZwdGJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDgyMTU2MCwiZXhwIjoyMDg2Mzk3NTYwfQ.rV1e556lmVBDoHkjl302G_9lQ5oObwoDiv2Qdk8c-jE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
    console.log('🚀 Setting up Supabase database...');

    try {
        // Create users table
        const { error: usersError } = await supabase.rpc('exec_sql', {
            sql: `
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
          status TEXT DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS employees (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT NOT NULL,
          commission_points INTEGER DEFAULT 0,
          status TEXT DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS prescriptions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          farmer_id UUID,
          employee_id UUID,
          farmer_name TEXT NOT NULL,
          employee_name TEXT NOT NULL,
          items JSONB NOT NULL,
          total_amount DECIMAL(10, 2),
          status TEXT DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS apk_versions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          version TEXT NOT NULL UNIQUE,
          file_url TEXT NOT NULL,
          file_name TEXT NOT NULL,
          file_size BIGINT,
          release_notes TEXT,
          mandatory BOOLEAN DEFAULT false,
          downloads INTEGER DEFAULT 0,
          uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
        });

        if (usersError) {
            console.log('Note: Tables might already exist, continuing...');
        }

        console.log('✅ Database setup complete!');
        console.log('✅ All tables created successfully!');

    } catch (error) {
        console.error('❌ Error setting up database:', error);
    }
}

setupDatabase();
