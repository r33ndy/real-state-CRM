import { getSupabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    // Verify ownership: only creator or admin can edit
    if (session.role !== 'admin') {
      const { data: record } = await supabase.from('professionals').select('created_by').eq('id', id).single();
      if (!record || record.created_by !== session.id) {
        return NextResponse.json({ error: 'No tienes permiso para editar este registro' }, { status: 403 });
      }
    }

    const body = await request.json();
    const allowed = ['category', 'name', 'phone', 'email', 'company', 'city', 'state', 'notes'];
    const updates = {};
    allowed.forEach(key => {
      if (body[key] !== undefined) updates[key] = body[key];
    });

    const { data, error } = await supabase
      .from('professionals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ professional: data });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    // Verify ownership: only creator or admin can delete
    if (session.role !== 'admin') {
      const { data: record } = await supabase.from('professionals').select('created_by').eq('id', id).single();
      if (!record || record.created_by !== session.id) {
        return NextResponse.json({ error: 'No tienes permiso para eliminar este registro' }, { status: 403 });
      }
    }

    const { error } = await supabase.from('professionals').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
