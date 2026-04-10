import { getSupabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

// GET files for a lending record
export async function GET(request, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('lending_files')
    .select('*')
    .eq('lending_id', parseInt(id))
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ files: data });
}

// Upload file for a lending record
export async function POST(request, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/csv',
    ];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Solo se permiten archivos PDF, Excel o CSV' }, { status: 400 });
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo no puede ser mayor a 10MB' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `lending-${id}/${timestamp}-${safeName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('lending-files')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: `Error al subir archivo: ${uploadError.message}` }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('lending-files')
      .getPublicUrl(storagePath);

    // Save file metadata to database
    const { data: fileRecord, error: dbError } = await supabase
      .from('lending_files')
      .insert({
        lending_id: parseInt(id),
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        created_by: session.id,
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ file: fileRecord }, { status: 201 });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Error del servidor al subir archivo' }, { status: 500 });
  }
}

// DELETE a file
export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) return NextResponse.json({ error: 'fileId requerido' }, { status: 400 });

    const supabase = getSupabaseAdmin();

    // Get file record to delete from storage
    const { data: fileRecord } = await supabase
      .from('lending_files')
      .select('*')
      .eq('id', parseInt(fileId))
      .single();

    if (!fileRecord) {
      return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });
    }

    // Extract storage path from URL
    const urlParts = fileRecord.file_url.split('/lending-files/');
    if (urlParts[1]) {
      await supabase.storage.from('lending-files').remove([decodeURIComponent(urlParts[1])]);
    }

    // Delete from database
    const { error } = await supabase
      .from('lending_files')
      .delete()
      .eq('id', parseInt(fileId));

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
