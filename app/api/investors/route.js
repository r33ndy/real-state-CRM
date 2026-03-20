import { getSupabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);
  const viewAsUserId = searchParams.get('user_id');

  let query = supabase.from('investors').select('*').order('created_at', { ascending: false });

  if (session.role === 'admin' && viewAsUserId) {
    query = query.eq('created_by', viewAsUserId);
  } else if (session.role !== 'admin') {
    query = query.eq('created_by', session.id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ investors: data });
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const body = await request.json();
    const {
      name, email, phone, investment_area, property_type,
      strategy, budget, payment_method, closing_time,
      max_simultaneous_projects, city, state, notes
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('investors')
      .insert({
        name, email, phone, investment_area, property_type,
        strategy, budget, payment_method, closing_time,
        max_simultaneous_projects: max_simultaneous_projects ? parseInt(max_simultaneous_projects) : null,
        city, state, notes,
        created_by: session.id
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ investor: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
