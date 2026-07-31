import { withSupabase } from "@supabase/server";
import { NextResponse } from "next/server";

export const POST = withSupabase({ auth: "publishable" }, async (req, ctx) => {
  try {
    const { phone } = await req.json();
    
    if (!phone) {
      return NextResponse.json({ error: "Teléfono requerido" }, { status: 400 });
    }

    // Validar formato de teléfono (básico)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: "Formato de teléfono inválido" }, { status: 400 });
    }

    const supabase = ctx.supabase;

    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

    // Guardar código en la tabla (sin user_id para solicitud inicial)
    const { error: insertError } = await supabase
      .from("phone_verification_codes")
      .insert({
        phone,
        code,
        expires_at: expiresAt.toISOString(),
        user_id: null as any,
      } as any);

    if (insertError) {
      console.error("Error insertando código:", insertError);
      return NextResponse.json({ error: "Error al generar código" }, { status: 500 });
    }

    // Enviar SMS con el código (en producción, usar Twilio o similar)
    console.log(`Código de verificación para ${phone}: ${code} (expira en 30 minutos)`);

    return NextResponse.json({ 
      message: "Código enviado al teléfono. Expira en 30 minutos." 
    });

  } catch (error) {
    console.error("Error en request-phone-code:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
});
