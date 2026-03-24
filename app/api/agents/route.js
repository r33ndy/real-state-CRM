import { getSupabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const url = new URL(request.url);
  const viewAs = url.searchParams.get('viewAs');

  let query = supabase.from('agents').select('*').order('created_at', { ascending: false });
  if (session.role !== 'admin') {
    query = query.eq('created_by', session.id);
  } else if (viewAs) {
    query = query.eq('created_by', viewAs);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ agents: data });
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const body = await request.json();
    if (!body.name) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('agents')
      .insert({
        name: body.name,
        phone: body.phone || null,
        email: body.email || null,
        state: body.state || null,
        city: body.city || null,
        agent_type: body.agent_type || 'Listing Agent',
        notes: body.notes || null,
        created_by: session.id,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ agent: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
