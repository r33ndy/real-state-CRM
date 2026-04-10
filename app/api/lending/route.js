import { getSupabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);
  const viewAsUserId = searchParams.get('user_id');

  let query = supabase.from('lending').select('*').order('created_at', { ascending: false });

  if (session.role === 'admin' && viewAsUserId) {
    query = query.eq('created_by', parseInt(viewAsUserId));
  } else {
    query = query.eq('created_by', session.id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ lending: data });
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const body = await request.json();
    if (!body.company) return NextResponse.json({ error: 'La compañía es obligatoria' }, { status: 400 });

    const ownerId = (session.role === 'admin' && body.created_for) ? parseInt(body.created_for) : session.id;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('lending')
      .insert({
        company: body.company,
        phone: body.phone || null,
        email: body.email || null,
        loan_type: body.loan_type || null,
        max_loan_amount: body.max_loan_amount || null,
        ltv_percentage: body.ltv_percentage || null,
        estimated_closing_time: body.estimated_closing_time || null,
        interest_rate: body.interest_rate || null,
        max_loan_term: body.max_loan_term || null,
        min_loan_term: body.min_loan_term || null,
        min_loan_amount: body.min_loan_amount || null,
        origination_points: body.origination_points || null,
        work_states: body.work_states || null,
        application_link: body.application_link || null,
        notes: body.notes || null,
        created_by: ownerId,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ lending: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
