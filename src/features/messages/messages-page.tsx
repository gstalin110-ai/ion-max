"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "¡Hola, Stalin! Soy el asistente inteligente de IÓN MAX. ¿En qué te puedo colaborar hoy con el sistema?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll suave hacia el último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: userMessage }),
      });

      const data = await response.json();

      if (response.ok && data.text) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.text }]);
      } else {
        // Ahora te mostrará el mensaje de error real que envíe tu backend o Google
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `🤖 Error del Servidor: ${data.error || "No se obtuvo respuesta de la API."}` },
        ]);
      }
    } catch (error) {
      console.error("Error en la petición de chat:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error de conexión. Asegúrate de que el servidor local está corriendo." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-140px)]">
      {/* Encabezado Premium con etiquetas correctas */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-6 shrink-0">
        <p className="text-sm uppercase tracking-[0.3em] text-yellow-400 font-black">ION MAX • Ecosistema Inteligente</p>
        <h1 className="mt-2 text-3xl font-black text-white">Centro de Inteligencia Artificial</h1>
      </div>

      {/* Caja del Chat */}
      <div className="flex-1 flex flex-col rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-md overflow-hidden relative min-h-[350px]">
        
        {/* Contenedor de las burbujas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(100vh-380px)] text-white">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed shadow-lg ${
                  msg.role === "user"
                    ? "bg-yellow-400 text-black font-semibold rounded-tr-none"
                    : "bg-zinc-900 border border-white/5 text-zinc-100 rounded-tl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          
          {/* Esfera de carga */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-zinc-900 border border-white/5 text-zinc-400 rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center space-x-1.5">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Formulario */}
        <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-zinc-900/40 flex gap-2 items-center shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isLoading ? "La IA está respondiendo..." : "Escribe un mensaje para Gemini..."}
            disabled={isLoading}
            className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-black px-6 py-3 rounded-xl text-sm transition-all active:scale-95 disabled:opacity-40"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
