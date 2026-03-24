import { getSupabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });

  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);
  const viewAsUserId = searchParams.get('user_id');

  // Get employees
  const { data: employees } = await supabase
    .from('users')
    .select('id, name, email, role, status')
    .eq('role', 'employee');

  // Build filter for data queries
  const filter = viewAsUserId ? { created_by: parseInt(viewAsUserId) } : null;

  let marketQ = supabase.from('market_evaluations').select('*');
  let prosQ = supabase.from('professionals').select('*');
  let consQ = supabase.from('contractors').select('*');
  let invQ = supabase.from('investors').select('*');
  let lendQ = supabase.from('lending').select('*');
  let agentQ = supabase.from('agents').select('*');

  if (filter) {
    marketQ = marketQ.eq('created_by', filter.created_by);
    prosQ = prosQ.eq('created_by', filter.created_by);
    consQ = consQ.eq('created_by', filter.created_by);
    invQ = invQ.eq('created_by', filter.created_by);
    lendQ = lendQ.eq('created_by', filter.created_by);
    agentQ = agentQ.eq('created_by', filter.created_by);
  }

  const [marketRes, prosRes, consRes, invRes, lendRes, agentRes] = await Promise.all([marketQ, prosQ, consQ, invQ, lendQ, agentQ]);

  return NextResponse.json({
    employees: employees || [],
    markets: marketRes.data || [],
    professionals: prosRes.data || [],
    contractors: consRes.data || [],
    investors: invRes.data || [],
    lending: lendRes.data || [],
    agents: agentRes.data || [],
    counts: {
      employees: (employees || []).filter(u => u.status === 'active').length,
      markets: (marketRes.data || []).length,
      professionals: (prosRes.data || []).length,
      contractors: (consRes.data || []).length,
      investors: (invRes.data || []).length,
      lending: (lendRes.data || []).length,
      agents: (agentRes.data || []).length,
    },
    viewingAs: viewAsUserId ? (employees || []).find(e => e.id === parseInt(viewAsUserId)) : null,
  });
}
