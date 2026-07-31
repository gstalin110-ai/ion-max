import { withSupabase } from "@supabase/server";
import { NextResponse } from "next/server";

export const POST = withSupabase({ auth: "publishable" }, async (req, ctx) => {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    const supabase = ctx.supabase;

    // Obtener usuario por email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error("Error listando usuarios:", userError);
      return NextResponse.json({ error: "Error al buscar usuario" }, { status: 500 });
    }

    const user = users.find((u: any) => u.email === email);
    
    if (!user) {
      // Por seguridad, no revelamos si el email existe
      return NextResponse.json({ message: "Si el email existe, recibirás un código en 12 horas" });
    }

    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 horas

    // Guardar código en la tabla
    const { error: insertError } = await supabase
      .from("password_reset_codes")
      .insert({
        user_id: user.id,
        code,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Error insertando código:", insertError);
      return NextResponse.json({ error: "Error al generar código" }, { status: 500 });
    }

    // Enviar email con el código (usando Supabase Auth)
    // Nota: En producción, usar un servicio de email real
    console.log(`Código de reset para ${email}: ${code} (expira en 12 horas)`);

    return NextResponse.json({ 
      message: "Si el email existe, recibirás un código en 12 horas" 
    });

  } catch (error) {
    console.error("Error en request-reset-code:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
});
