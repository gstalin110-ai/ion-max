/**
 * SERVICIO DE IA PARA MARKETING - IÓN MAX
 * Automatización inteligente para descripciones, marketing y recomendaciones
 */

import { supabase } from "@/src/lib/supabase/client";

/**
 * Generar descripción optimizada para listing con IA
 */
export async function generateOptimizedDescription(listingData: {
  title: string;
  description: string;
  category: string;
  price: number;
  location?: string;
}): Promise<{
  title: string;
  description: string;
  tags: string;
  seo_keywords: string;
}> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuario no autenticado");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `Como experto en marketing digital y e-commerce para IÓN MAX (marketplace social de Ecuador), optimiza el siguiente listing:

TÍTULO ACTUAL: ${listingData.title}
DESCRIPCIÓN ACTUAL: ${listingData.description}
CATEGORÍA: ${listingData.category}
PRECIO: $${listingData.price}
UBICACIÓN: ${listingData.location || 'No especificada'}

Genera un JSON con este formato exacto:
{
  "title": "título optimizado persuasivo (máximo 80 caracteres)",
  "description": "descripción detallada y persuasiva (máximo 500 caracteres) que resalte beneficios, incluya emojis relevantes y mencione IÓN MAX",
  "tags": "tag1, tag2, tag3, tag4, tag5 (palabras clave separadas por coma)",
  "seo_keywords": "keyword1, keyword2, keyword3 (palabras clave para SEO en Ecuador)"
}

El tono debe ser profesional pero accesible, enfocado en el mercado ecuatoriano.`,
        userId: user.id,
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.text) {
      throw new Error("Error al generar descripción optimizada");
    }

    const optimized = JSON.parse(data.text);
    return optimized;
  } catch (error) {
    console.error("Error en AI Marketing Service:", error);
    throw error;
  }
}

/**
 * Generar ideas de contenido para red social IÓN MAX
 */
export async function generateSocialMediaContent(topic: string): Promise<{
  post_text: string;
  hashtags: string;
  call_to_action: string;
}> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuario no autenticado");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `Como experto en social media marketing para IÓN MAX (marketplace social de Ecuador), genera contenido para un post sobre: ${topic}

Genera un JSON con este formato exacto:
{
  "post_text": "texto del post (máximo 280 caracteres, con emojis, tono amigable y profesional)",
  "hashtags": "hashtag1, hashtag2, hashtag3 (relevantes para Ecuador y e-commerce)",
  "call_to_action": "frase de llamada a la acción (máximo 50 caracteres)"
}

Enfócate en conectar vendedores y compradores en Ecuador.`,
        userId: user.id,
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.text) {
      throw new Error("Error al generar contenido social");
    }

    const content = JSON.parse(data.text);
    return content;
  } catch (error) {
    console.error("Error en AI Marketing Service:", error);
    throw error;
  }
}

/**
 * Generar recomendaciones de productos similares
 */
export async function generateProductRecommendations(listingData: {
  title: string;
  category: string;
  description: string;
}): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuario no autenticado");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `Como experto en e-commerce para IÓN MAX, genera 5 categorías o tipos de productos similares a:

TÍTULO: ${listingData.title}
CATEGORÍA: ${listingData.category}
DESCRIPCIÓN: ${listingData.description}

Devuelve SOLO un array JSON con 5 strings: ["categoría1", "categoría2", "categoría3", "categoría4", "categoría5"]

Las categorías deben ser relevantes para el mercado ecuatoriano.`,
        userId: user.id,
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.text) {
      throw new Error("Error al generar recomendaciones");
    }

    const recommendations = JSON.parse(data.text);
    return recommendations;
  } catch (error) {
    console.error("Error en AI Marketing Service:", error);
    throw error;
  }
}

/**
 * Generar respuesta automática para mensajes de soporte
 */
export async function generateSupportResponse(ticketMessage: string, ticketCategory: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuario no autenticado");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `Como equipo de soporte de IÓN MAX, genera una respuesta empática y profesional para:

MENSAJE DEL USUARIO: ${ticketMessage}
CATEGORÍA: ${ticketCategory}

La respuesta debe:
- Ser empática y profesional
- Ofrecer ayuda concreta
- Mencionar que estamos revisando el caso
- Ser máximo 200 caracteres

Devuelve SOLO el texto de la respuesta, sin JSON.`,
        userId: user.id,
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.text) {
      throw new Error("Error al generar respuesta de soporte");
    }

    return data.text;
  } catch (error) {
    console.error("Error en AI Marketing Service:", error);
    throw error;
  }
}

/**
 * Analizar sentimiento de reseña o feedback
 */
export async function analyzeSentiment(text: string): Promise<{
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  suggestions: string;
}> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuario no autenticado");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `Analiza el sentimiento del siguiente texto para IÓN MAX:

TEXTO: ${text}

Genera un JSON con este formato exacto:
{
  "sentiment": "positive/neutral/negative",
  "confidence": 0.0 a 1.0,
  "suggestions": "sugerencia breve para mejorar basada en el análisis (máximo 100 caracteres)"
}

Devuelve SOLO el JSON.`,
        userId: user.id,
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.text) {
      throw new Error("Error al analizar sentimiento");
    }

    const analysis = JSON.parse(data.text);
    return analysis;
  } catch (error) {
    console.error("Error en AI Marketing Service:", error);
    throw error;
  }
}
