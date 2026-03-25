import { getSupabaseAdmin } from '@/lib/supabase';
import { getSession, hashPassword } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });

  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    const allowed = ['name', 'phone', 'status'];
    const updates = {};
    allowed.forEach(key => {
      if (body[key] !== undefined) updates[key] = body[key];
    });

    // Admin can reset a user's password directly
    if (body.new_password) {
      if (body.new_password.length < 6) {
        return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
      }
      updates.password_hash = await hashPassword(body.new_password);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No hay cambios para guardar' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, name, email, phone, role, status, created_at')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ user: data });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });

  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    // Prevent deleting yourself
    if (parseInt(id) === session.id) {
      return NextResponse.json({ error: 'No puedes eliminarte a ti mismo' }, { status: 400 });
    }

    // Delete all records from all tables for this user (cascade)
    const tables = ['market_evaluations', 'professionals', 'contractors', 'investors', 'lending', 'agents'];
    const deleteResults = await Promise.all(
      tables.map(table => supabase.from(table).delete().eq('created_by', id))
    );

    // Check for errors in cascade deletes
    for (let i = 0; i < deleteResults.length; i++) {
      if (deleteResults[i].error) {
        return NextResponse.json({ error: `Error al eliminar registros de ${tables[i]}: ${deleteResults[i].error.message}` }, { status: 500 });
      }
    }

    // Now delete the user
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
