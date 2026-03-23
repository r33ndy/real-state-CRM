import { getSupabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = getSupabaseAdmin();
    
    // Update admin name and email
    const { error } = await supabase
      .from('users')
      .update({ name: 'Edwin', email: 'edwin@ecadino.com' })
      .eq('email', 'admin@edwinllc.com');

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Admin updated to Edwin / edwin@ecadino.com' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
