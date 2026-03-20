import { getSupabaseAdmin } from '@/lib/supabase';
import { getSession, hashPassword, comparePassword } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const body = await request.json();
    const { name, phone, current_password, new_password } = body;
    const supabase = getSupabaseAdmin();

    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;

    // If changing password, verify current password first
    if (new_password) {
      if (!current_password) {
        return NextResponse.json({ error: 'Contraseña actual es requerida para cambiar la contraseña' }, { status: 400 });
      }
      if (new_password.length < 6) {
        return NextResponse.json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' }, { status: 400 });
      }

      // Fetch current password hash
      const { data: userData } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', session.id)
        .single();

      if (!userData) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

      const valid = await comparePassword(current_password, userData.password_hash);
      if (!valid) {
        return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 403 });
      }

      updates.password_hash = await hashPassword(new_password);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No hay cambios para guardar' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', session.id)
      .select('id, name, email, phone, role')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ user: data, message: 'Perfil actualizado exitosamente' });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
