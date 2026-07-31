import { withSupabase } from "@supabase/server";
import { NextResponse } from "next/server";

export const POST = withSupabase({ auth: "publishable" }, async (req, ctx) => {
  try {
    const { email, code, newPassword } = await req.json();
    
    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: "Email, código y nueva contraseña requeridos" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
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
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Verificar código válido y no expirado
    const { data: resetCode, error: codeError } = await supabase
      .from("password_reset_codes")
      .select("*")
      .eq("user_id", user.id)
      .eq("code", code)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (codeError || !resetCode) {
      return NextResponse.json({ error: "Código inválido o expirado" }, { status: 400 });
    }

    // Marcar código como usado
    await (supabase
      .from("password_reset_codes") as any)
      .update({ used: true })
      .eq("id", (resetCode as any).id);

    // Cambiar contraseña
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (updateError) {
      console.error("Error actualizando contraseña:", updateError);
      return NextResponse.json({ error: "Error al actualizar contraseña" }, { status: 500 });
    }

    return NextResponse.json({ message: "Contraseña actualizada exitosamente" });

  } catch (error) {
    console.error("Error en verify-reset-code:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
});
