import { withSupabase } from "@supabase/server";
import { NextResponse } from "next/server";

export const POST = withSupabase({ auth: "publishable" }, async (req, ctx) => {
  try {
    const { phone, code } = await req.json();
    
    if (!phone || !code) {
      return NextResponse.json({ error: "Teléfono y código requeridos" }, { status: 400 });
    }

    const supabase = ctx.supabase;

    // Verificar código válido y no expirado
    const { data: verificationCode, error: codeError } = await supabase
      .from("phone_verification_codes")
      .select("*")
      .eq("phone", phone)
      .eq("code", code)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (codeError || !verificationCode) {
      return NextResponse.json({ error: "Código inválido o expirado" }, { status: 400 });
    }

    // Marcar código como usado
    await (supabase
      .from("phone_verification_codes") as any)
      .update({ used: true })
      .eq("id", (verificationCode as any).id);

    return NextResponse.json({ message: "Teléfono verificado exitosamente" });

  } catch (error) {
    console.error("Error en verify-phone-code:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
});
