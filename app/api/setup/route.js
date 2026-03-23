import { getSupabaseAdmin } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = getSupabaseAdmin();

    // Create users table
    const { error: e1 } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          role VARCHAR(20) NOT NULL DEFAULT 'employee',
          status VARCHAR(20) NOT NULL DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Create market_evaluations table
    const { error: e2 } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS market_evaluations (
          id SERIAL PRIMARY KEY,
          state VARCHAR(100) NOT NULL,
          city VARCHAR(100) NOT NULL,
          population VARCHAR(50),
          avg_price VARCHAR(50),
          days_on_market INTEGER,
          crime_index VARCHAR(20),
          created_by INTEGER REFERENCES users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Create professionals table
    const { error: e3 } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS professionals (
          id SERIAL PRIMARY KEY,
          category VARCHAR(100) NOT NULL,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          email VARCHAR(255),
          company VARCHAR(255),
          city VARCHAR(100) NOT NULL,
          state VARCHAR(100),
          notes TEXT,
          created_by INTEGER REFERENCES users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Create contractors table
    const { error: e4 } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS contractors (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          company VARCHAR(255),
          phone VARCHAR(50),
          email VARCHAR(255),
          specialty VARCHAR(100) NOT NULL,
          city VARCHAR(100) NOT NULL,
          state VARCHAR(100),
          work_area VARCHAR(255),
          max_simultaneous_projects INTEGER,
          permit_days INTEGER,
          does_new_construction BOOLEAN DEFAULT FALSE,
          has_license BOOLEAN DEFAULT FALSE,
          has_insurance BOOLEAN DEFAULT FALSE,
          has_own_team BOOLEAN DEFAULT FALSE,
          notes TEXT,
          created_by INTEGER REFERENCES users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Seed admin user
    const adminHash = await hashPassword('admin123');
    const { error: e5 } = await supabase
      .from('users')
      .upsert({
        email: 'edwin@ecadino.com',
        name: 'Edwin',
        password_hash: adminHash,
        phone: '+1 (305) 555-0100',
        role: 'admin',
        status: 'active'
      }, { onConflict: 'email' });

    // Seed employee user
    const empHash = await hashPassword('emp123');
    const { error: e6 } = await supabase
      .from('users')
      .upsert({
        email: 'carlos@edwinllc.com',
        name: 'Carlos Mendoza',
        password_hash: empHash,
        phone: '+1 (305) 555-0101',
        role: 'employee',
        status: 'active'
      }, { onConflict: 'email' });

    // Seed market data
    const marketData = [
      { state: 'Florida', city: 'Miami', population: '450,000', avg_price: '$520,000', days_on_market: 32, crime_index: 'Moderado' },
      { state: 'Oregon', city: 'Coos Bay', population: '16,000', avg_price: '$285,000', days_on_market: 58, crime_index: 'Bajo' },
      { state: 'Florida', city: 'Orlando', population: '310,000', avg_price: '$370,000', days_on_market: 41, crime_index: 'Bajo' },
    ];
    for (const m of marketData) {
      await supabase.from('market_evaluations').upsert(m, { onConflict: 'city' }).select();
    }

    // Seed professionals
    const professionals = [
      { category: 'Abogado', name: 'María González', phone: '786-555-0101', email: 'maria@law.com', company: 'González & Asociados', city: 'Miami', state: 'Florida' },
      { category: 'Ingeniero', name: 'RoofTech Inc.', phone: '541-555-0192', email: 'info@rooftech.com', company: 'RoofTech Inc.', city: 'Coos Bay', state: 'Oregon' },
      { category: 'Compañía de Título', name: 'Clear Title Co.', phone: '407-555-0148', email: 'info@cleartitle.com', company: 'Clear Title Co.', city: 'Orlando', state: 'Florida' },
    ];
    for (const p of professionals) {
      await supabase.from('professionals').upsert(p, { onConflict: 'name' }).select();
    }

    // Seed contractors
    const contractors = [
      { name: 'José Rivera', company: 'Rivera Plumbing', phone: '786-555-0201', email: 'jose@riveraplumbing.com', specialty: 'Plomero', city: 'Miami', state: 'Florida', max_simultaneous_projects: 4, permit_days: 10, has_license: true, has_insurance: true, has_own_team: true },
      { name: 'ElecPro LLC', company: 'ElecPro LLC', phone: '407-555-0220', email: 'info@elecpro.com', specialty: 'Electricista', city: 'Orlando', state: 'Florida', max_simultaneous_projects: 3, permit_days: 14, has_license: true, has_insurance: true, has_own_team: false },
      { name: 'Mike Walls', company: '', phone: '541-555-0180', email: 'mike@walls.com', specialty: 'Pintura', city: 'Coos Bay', state: 'Oregon', max_simultaneous_projects: 2, permit_days: 7, has_license: false, has_insurance: false, has_own_team: true },
    ];
    for (const c of contractors) {
      await supabase.from('contractors').upsert(c, { onConflict: 'name' }).select();
    }

    const errors = [e1, e2, e3, e4, e5, e6].filter(Boolean);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database setup complete',
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
