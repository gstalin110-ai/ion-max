import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Email y newPassword son requeridos' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Obtener el user ID del email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      return NextResponse.json({ error: 'Error al listar usuarios' }, { status: 500 });
    }

    const user = users.find(u => u.email === email);
    
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Cambiar contraseña usando admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { 
        password: newPassword 
      }
    );

    if (updateError) {
      return NextResponse.json({ error: 'Error al cambiar contraseña' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Contraseña cambiada exitosamente',
      email 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
