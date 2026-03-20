import { getSupabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);
  const viewAsUserId = searchParams.get('user_id');

  let query = supabase.from('contractors').select('*').order('created_at', { ascending: false });

  if (session.role === 'admin' && viewAsUserId) {
    query = query.eq('created_by', viewAsUserId);
  } else if (session.role !== 'admin') {
    query = query.eq('created_by', session.id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ contractors: data });
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const body = await request.json();
    const {
      name, company, phone, email, specialty, city, state,
      work_area, max_simultaneous_projects, permit_days,
      does_new_construction, has_license, has_insurance, has_own_team, notes
    } = body;

    if (!name || !specialty) {
      return NextResponse.json({ error: 'Nombre y especialidad son requeridos' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('contractors')
      .insert({
        name, company, phone, email, specialty, city, state,
        work_area,
        max_simultaneous_projects: max_simultaneous_projects ? parseInt(max_simultaneous_projects) : null,
        permit_days: permit_days ? parseInt(permit_days) : null,
        does_new_construction: !!does_new_construction,
        has_license: !!has_license,
        has_insurance: !!has_insurance,
        has_own_team: !!has_own_team,
        notes,
        created_by: session.id
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ contractor: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
