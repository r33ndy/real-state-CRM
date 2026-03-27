import { getSupabaseAdmin } from '@/lib/supabase';
import { getSession, hashPassword } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, phone, role, status, created_at')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data });
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });

  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nombre, email y contraseña son requeridos' }, { status: 400 });
    }

    const password_hash = await hashPassword(password);
    const supabase = getSupabaseAdmin();

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        name,
        email: email.toLowerCase().trim(),
        password_hash,
        phone,
        role: 'employee',
        status: 'active'
      })
      .select('id, name, email, phone, role, status, created_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send welcome email with credentials (non-blocking)
    sendWelcomeEmail({ name, email: email.toLowerCase().trim(), password }).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    return NextResponse.json({ user, emailSent: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
