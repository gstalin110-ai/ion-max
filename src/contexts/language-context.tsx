"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "es" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Traducciones
const translations = {
  es: {
    // Landing Page
    "hero.badge": "⚡ Sistema en constante desarrollo",
    "hero.title1": "ELEVA TU",
    "hero.title2": "AUTORIDAD",
    "hero.description": "IÓN MAX es un ecosistema digital profesional donde personas, empresas, emprendedores y profesionales pueden comprar, vender, ofrecer servicios, aprender, crear comunidades, administrar negocios y utilizar herramientas de inteligencia artificial desde una sola plataforma.",
    "hero.explore": "🚀 Explorar Ahora",
    "hero.marketplace": "🛍️ Ver Marketplace",
    "hero.consult": "📲 Consulta Gratis",
    "hero.survey": "📝 Ayúdanos a mejorar: Completa nuestra encuesta de desarrollo",
    
    // Stats
    "stats.products": "Productos Premium",
    "stats.users": "Usuarios Activos",
    "stats.satisfaction": "Satisfacción",
    "stats.support": "Soporte Premium",
    
    // Trust
    "trust.title": "Por Qué Confían En Nosotros",
    "trust.guaranteed": "✅ 100% Garantizado",
    "trust.guaranteedDesc": "O devolvemos tu dinero sin preguntas",
    "trust.security": "🔒 Seguridad Total",
    "trust.securityDesc": "Encriptación de nivel bancario",
    "trust.delivery": "⚡ Entrega Rápida",
    "trust.deliveryDesc": "Acceso inmediato a todos los productos",
    "trust.support": "👥 Soporte Premium",
    "trust.supportDesc": "Team dedicado 24/7 para ti",
    
    // Shop
    "shop.category": "CATEGORÍA 1 DE 3",
    "shop.title": "ION SHOP",
    "shop.description": "Productos de lujo seleccionados que definen tu autoridad. Solo lo mejor para quienes exigen calidad absoluta.",
    "shop.details": "Ver Detalles →",
    
    // Academy
    "academy.category": "CATEGORÍA 2 DE 3",
    "academy.title": "ION ACADEMY",
    "academy.description": "Cursos diseñados por expertos. Transforma tu conocimiento en poder real y monetizable.",
    "academy.enroll": "Inscribirse Ahora →",
    
    // Services
    "services.category": "CATEGORÍA 3 DE 3",
    "services.title": "ION SERVICES",
    "services.description": "Servicios premium para empresas que exigen excelencia. Operaciones escalables y medibles.",
    
    // Testimonials
    "testimonials.badge": "TESTIMONIOS",
    "testimonials.title": "Lo Que Dicen Nuestros Clientes",
    "testimonials.description": "Resultados reales de personas que transformaron su autoridad digital con IÓN MAX",
    
    // CTA
    "cta.title": "¿Listo para Transformar tu Vida?",
    "cta.description": "Únete a miles de personas que ya están experimentando el poder de IÓN MAX.",
    "cta.start": "Comenzar Ahora",
    "cta.chat": "💬 Hablar con Experto",
    
    // About
    "about.title": "Somos IÓN MAX",
    "about.description": "No solo vendemos productos. Construimos imperios de autoridad digital.",
    "about.mission": "🎯 Nuestra Misión",
    "about.missionText": "Conectar emprendedores con herramientas, conocimiento y servicios que los conviertan en autoridades en sus industrias.",
    "about.vision": "🚀 Nuestra Visión",
    "about.visionText": "Ser la plataforma de confianza número uno donde la calidad premium y la transformación real son garantizadas.",
    "about.values": "💎 Nuestros Valores",
    "about.valuesText": "Excelencia absoluta, transparencia radical, y resultados medibles. Nada mediocre. Nunca.",
    
    // Footer
    "footer.tagline": "Autoridad digital. Lujo absoluto. Transformación real.",
    "footer.product": "Producto",
    "footer.legal": "Legal",
    "footer.contact": "Contacto",
    "footer.trust": "Somos la marca de confianza de 10,000+ personas que transformaron sus vidas",
    "footer.rating": "⭐ Rating 4.9/5 — Garantía de Satisfacción 100% — Soporte 24/7",
    
    // Survey
    "survey.title": "¡Gracias por tu participación!",
    "survey.description": "Tu respuesta es invaluable para el desarrollo de IÓN MAX a escala mundial.",
    "survey.back": "Volver al inicio",
    "survey.question": "PREGUNTA",
    "survey.previous": "← Anterior",
    "survey.next": "Siguiente →",
    "survey.submit": "Enviar Encuesta",
    "survey.sending": "Enviando...",
    "survey.optional": "Esta encuesta es opcional pero muy valiosa para nosotros",
  },
  en: {
    // Landing Page
    "hero.badge": "⚡ System Under Constant Development",
    "hero.title1": "ELEVATE YOUR",
    "hero.title2": "AUTHORITY",
    "hero.description": "IÓN MAX is a professional digital ecosystem where individuals, companies, entrepreneurs, and professionals can buy, sell, offer services, learn, create communities, manage businesses, and use AI tools from a single platform.",
    "hero.explore": "🚀 Explore Now",
    "hero.marketplace": "🛍️ View Marketplace",
    "hero.consult": "📲 Free Consultation",
    "hero.survey": "📝 Help us improve: Complete our development survey",
    
    // Stats
    "stats.products": "Premium Products",
    "stats.users": "Active Users",
    "stats.satisfaction": "Satisfaction",
    "stats.support": "Premium Support",
    
    // Trust
    "trust.title": "Why They Trust Us",
    "trust.guaranteed": "✅ 100% Guaranteed",
    "trust.guaranteedDesc": "Or your money back, no questions asked",
    "trust.security": "🔒 Total Security",
    "trust.securityDesc": "Bank-level encryption",
    "trust.delivery": "⚡ Fast Delivery",
    "trust.deliveryDesc": "Immediate access to all products",
    "trust.support": "👥 Premium Support",
    "trust.supportDesc": "Dedicated 24/7 team for you",
    
    // Shop
    "shop.category": "CATEGORY 1 OF 3",
    "shop.title": "ION SHOP",
    "shop.description": "Selected luxury products that define your authority. Only the best for those who demand absolute quality.",
    "shop.details": "View Details →",
    
    // Academy
    "academy.category": "CATEGORY 2 OF 3",
    "academy.title": "ION ACADEMY",
    "academy.description": "Courses designed by experts. Transform your knowledge into real and monetizable power.",
    "academy.enroll": "Enroll Now →",
    
    // Services
    "services.category": "CATEGORY 3 OF 3",
    "services.title": "ION SERVICES",
    "services.description": "Premium services for companies that demand excellence. Scalable and measurable operations.",
    
    // Testimonials
    "testimonials.badge": "TESTIMONIALS",
    "testimonials.title": "What Our Clients Say",
    "testimonials.description": "Real results from people who transformed their digital authority with IÓN MAX",
    
    // CTA
    "cta.title": "Ready to Transform Your Life?",
    "cta.description": "Join thousands of people already experiencing the power of IÓN MAX.",
    "cta.start": "Start Now",
    "cta.chat": "💬 Talk to Expert",
    
    // About
    "about.title": "We Are IÓN MAX",
    "about.description": "We don't just sell products. We build digital authority empires.",
    "about.mission": "🎯 Our Mission",
    "about.missionText": "Connect entrepreneurs with tools, knowledge, and services that turn them into authorities in their industries.",
    "about.vision": "🚀 Our Vision",
    "about.visionText": "To be the #1 trusted platform where premium quality and real transformation are guaranteed.",
    "about.values": "💎 Our Values",
    "about.valuesText": "Absolute excellence, radical transparency, and measurable results. Nothing mediocre. Never.",
    
    // Footer
    "footer.tagline": "Digital authority. Absolute luxury. Real transformation.",
    "footer.product": "Product",
    "footer.legal": "Legal",
    "footer.contact": "Contact",
    "footer.trust": "We are the trusted brand of 10,000+ people who transformed their lives",
    "footer.rating": "⭐ Rating 4.9/5 — 100% Satisfaction Guarantee — 24/7 Support",
    
    // Survey
    "survey.title": "Thank You for Your Participation!",
    "survey.description": "Your response is invaluable for IÓN MAX's global development.",
    "survey.back": "Back to Home",
    "survey.question": "QUESTION",
    "survey.previous": "← Previous",
    "survey.next": "Next →",
    "survey.submit": "Submit Survey",
    "survey.sending": "Sending...",
    "survey.optional": "This survey is optional but very valuable to us",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("es");

  useEffect(() => {
    // Cargar idioma guardado
    const savedLang = localStorage.getItem("ion-language") as Language;
    if (savedLang && (savedLang === "es" || savedLang === "en")) {
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("ion-language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.es] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
