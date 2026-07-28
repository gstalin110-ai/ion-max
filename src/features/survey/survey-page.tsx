"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/src/lib/supabase/client";
import { useLanguage } from "@/src/contexts/language-context";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const questions = [
  {
    id: 1,
    question: "¿Qué edad tienes?",
    type: "select",
    options: ["18-24", "25-34", "35-44", "45-54", "55+"]
  },
  {
    id: 2,
    question: "¿Cuál es tu ocupación principal?",
    type: "select",
    options: ["Estudiante", "Emprendedor", "Profesional", "Dueño de negocio", "Freelancer", "Otro"]
  },
  {
    id: 3,
    question: "¿Qué tan importante es para ti tener una plataforma unificada para negocios?",
    type: "select",
    options: ["Muy importante", "Importante", "Neutral", "Poco importante", "No importante"]
  },
  {
    id: 4,
    question: "¿Qué funcionalidad te interesa más?",
    type: "select",
    options: ["Marketplace", "Academia/Cursos", "Servicios profesionales", "Comunidad/Red social", "Wallet financiero"]
  },
  {
    id: 5,
    question: "¿Con qué frecuencia usarías una plataforma como IÓN MAX?",
    type: "select",
    options: ["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente", "Raramente"]
  },
  {
    id: 6,
    question: "¿Qué presupuesto mensual estarías dispuesto a invertir en una plataforma premium?",
    type: "select",
    options: ["$0-10", "$11-30", "$31-50", "$51-100", "$100+"]
  },
  {
    id: 7,
    question: "¿Prefieres aprender mediante cursos o contenido interactivo?",
    type: "select",
    options: ["Cursos estructurados", "Contenido interactivo", "Ambos", "No estoy interesado en aprendizaje"]
  },
  {
    id: 8,
    question: "¿Qué tan importante es la comunidad y networking para ti?",
    type: "select",
    options: ["Muy importante", "Importante", "Neutral", "Poco importante", "No importante"]
  },
  {
    id: 9,
    question: "¿Utilizarías herramientas de IA para mejorar tu productividad?",
    type: "select",
    options: ["Definitivamente sí", "Probablemente sí", "Tal vez", "Probablemente no", "Definitivamente no"]
  },
  {
    id: 10,
    question: "¿Qué país te gustaría que IÓN MAX priorice para su expansión?",
    type: "select",
    options: ["Estados Unidos", "España", "México", "Colombia", "Argentina", "Brasil", "Otro"]
  },
  {
    id: 11,
    question: "¿Qué te gustaría mejorar en plataformas similares que has usado?",
    type: "text",
    placeholder: "Describe tu experiencia..."
  },
  {
    id: 12,
    question: "¿Algún comentario o sugerencia adicional para IÓN MAX?",
    type: "text",
    placeholder: "Comentarios adicionales..."
  }
];

export function SurveyPage() {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('survey_responses')
        .insert({
          answers,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      setSubmitted(true);
    } catch (error) {
      console.error('Error guardando encuesta:', error);
      alert('Hubo un error al guardar tu respuesta. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentStep + 1) / questions.length) * 100;

  if (submitted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl text-center"
        >
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-4xl md:text-5xl font-black mb-6">
            {t("survey.title")}
          </h1>
          <p className="text-xl text-zinc-400 mb-8">
            {t("survey.description")}
          </p>
          <a
            href="/"
            className="inline-block bg-white text-black px-8 py-4 rounded-full font-black uppercase tracking-widest hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all"
          >
            {t("survey.back")}
          </a>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        {/* PROGRESS BAR */}
        <div className="mb-12">
          <div className="flex justify-between text-xs uppercase tracking-widest text-zinc-500 mb-2">
            <span>Pregunta {currentStep + 1} de {questions.length}</span>
            <span>{Math.round(progress)}% completado</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600"
            />
          </div>
        </div>

        {/* QUESTION CARD */}
        <motion.div
          key={currentStep}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="rounded-3xl border border-white/10 bg-zinc-950/80 p-8 md:p-12"
        >
          <div className="mb-8">
            <span className="text-xs font-black uppercase tracking-widest text-yellow-400 mb-4 inline-block">
              PREGUNTA {currentQuestion.id}
            </span>
            <h2 className="text-2xl md:text-3xl font-black leading-tight">
              {currentQuestion.question}
            </h2>
          </div>

          {currentQuestion.type === "select" ? (
            <div className="space-y-4">
              {currentQuestion.options?.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(currentQuestion.id, option)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    answers[currentQuestion.id] === option
                      ? "border-yellow-400 bg-yellow-400/10 text-yellow-400"
                      : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20"
                  }`}
                >
                  <span className="font-black">{option}</span>
                </button>
              ))}
            </div>
          ) : (
            <textarea
              value={answers[currentQuestion.id] || ""}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              placeholder={currentQuestion.placeholder}
              rows={4}
              className="w-full resize-none rounded-2xl border border-white/10 bg-black px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-yellow-400"
            />
          )}

          {/* NAVIGATION */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-6 py-3 rounded-full border border-white/10 text-zinc-400 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("survey.previous")}
            </button>

            {currentStep === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={loading || !answers[currentQuestion.id]}
                className="px-8 py-3 rounded-full bg-yellow-400 text-black font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t("survey.sending") : t("survey.submit")}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!answers[currentQuestion.id]}
                className="px-8 py-3 rounded-full bg-white text-black font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("survey.next")}
              </button>
            )}
          </div>
        </motion.div>

        {/* SKIP OPTION */}
        <p className="text-center text-zinc-600 text-sm mt-6">
          {t("survey.optional")}
        </p>
      </div>
    </div>
  );
}
