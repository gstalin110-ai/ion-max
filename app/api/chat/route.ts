import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // 1. Verificamos si Next.js encuentra tu llave de API
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: "No se encuentra la variable GEMINI_API_KEY en tu archivo .env.local" 
      }, { status: 500 });
    }

    if (!prompt) {
      return NextResponse.json({ error: "El prompt es requerido" }, { status: 400 });
    }

    // 2. Inicializamos el cliente con el modelo actualizado gemini-2.0-flash
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("🚨 Error detectado en el servidor:", error);
    
    // 3. Devolvemos el mensaje de error real que responda Google
    return NextResponse.json({ 
      error: error.message || "Error desconocido en el backend." 
    }, { status: 500 });
  }
}