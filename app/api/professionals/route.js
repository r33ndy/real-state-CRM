import { getSupabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);
  const viewAsUserId = searchParams.get('user_id');

  let query = supabase.from('professionals').select('*').order('created_at', { ascending: false });

  if (session.role === 'admin' && viewAsUserId) {
    query = query.eq('created_by', viewAsUserId);
  } else if (session.role !== 'admin') {
    query = query.eq('created_by', session.id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ professionals: data });
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const body = await request.json();
    const { category, name, phone, email, company, city, state, notes } = body;

    if (!category || !name) {
      return NextResponse.json({ error: 'Categoría y nombre son requeridos' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('professionals')
      .insert({ category, name, phone, email, company, city, state, notes, created_by: session.id })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ professional: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
