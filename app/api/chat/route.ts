import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimitMiddleware } from "@/src/lib/rate-limiter";

export async function POST(req: Request) {
  try {
    // Rate limiting basado en IP
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    rateLimitMiddleware(ip, '/api/chat');

    const { prompt, userId } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "El prompt es requerido" }, { status: 400 });
    }

    // Obtener la API Key del usuario desde Supabase
    let apiKey = process.env.GEMINI_API_KEY; // Fallback a la clave del servidor

    if (userId) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: profile } = await supabase
          .from("profiles")
          .select("gemini_api_key")
          .eq("id", userId)
          .maybeSingle();

        if (profile?.gemini_api_key) {
          apiKey = profile.gemini_api_key;
        }
      } catch (error) {
        console.error("Error al obtener API Key del usuario:", error);
        // Continuar con la clave del servidor como fallback
      }
    }

    if (!apiKey) {
      return NextResponse.json({ 
        error: "No se encontró una API Key de Gemini. Configúrala en tu perfil de Configuración." 
      }, { status: 500 });
    }

    // Inicializamos el cliente con el modelo actualizado gemini-2.0-flash
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("🚨 Error detectado en el servidor:", error);
    
    return NextResponse.json({ 
      error: error.message || "Error desconocido en el backend." 
    }, { status: 500 });
  }
}