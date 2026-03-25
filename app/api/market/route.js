import { getSupabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);
  const viewAsUserId = searchParams.get('user_id');

  let query = supabase.from('market_evaluations').select('*').order('created_at', { ascending: false });

  if (session.role === 'admin' && viewAsUserId) {
    query = query.eq('created_by', parseInt(viewAsUserId));
  } else {
    query = query.eq('created_by', session.id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ evaluations: data });
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const body = await request.json();
    const { state, city, population, avg_price, days_on_market, crime_index } = body;

    if (!state || !city) {
      return NextResponse.json({ error: 'Estado y ciudad son requeridos' }, { status: 400 });
    }

    const ownerId = (session.role === 'admin' && body.created_for) ? parseInt(body.created_for) : session.id;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('market_evaluations')
      .insert({
        state, city, population, avg_price,
        days_on_market: days_on_market ? parseInt(days_on_market) : null,
        crime_index,
        created_by: ownerId
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ evaluation: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
