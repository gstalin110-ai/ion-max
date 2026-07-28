"use client";

import { Component, ReactNode } from "react";
import { logger } from "@/src/lib/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error para debugging
    logger.error("Error caught by ErrorBoundary", error, {
      componentStack: errorInfo.componentStack,
    });

    // Llamar callback personalizado si existe
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback personalizado o default
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[50vh] items-center justify-center bg-zinc-950 px-4">
          <div className="max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center">
            <div className="mb-4 text-6xl">⚠️</div>
            <h2 className="mb-2 text-2xl font-black text-white">
              Algo salió mal
            </h2>
            <p className="mb-6 text-sm text-zinc-400">
              Ha ocurrido un error inesperado. Por favor, recarga la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-3 font-black text-black transition-all hover:shadow-lg hover:shadow-yellow-500/50"
            >
              Recargar Página
            </button>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-zinc-400">
                  Ver detalles del error (desarrollo)
                </summary>
                <pre className="mt-2 overflow-auto rounded-lg bg-black p-4 text-xs text-red-400">
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Error Boundary específico para componentes de IA
 */
export class AIErrorBoundary extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null } as State;
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error("AI Error caught by AIErrorBoundary", error, {
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if ((this.state as State).hasError) {
      return (
        <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-zinc-900 p-8">
          <div className="text-center">
            <div className="mb-4 text-4xl">🤖</div>
            <p className="text-sm text-zinc-400">
              El servicio de IA no está disponible temporalmente.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Error Boundary específico para componentes de pagos
 */
export class PaymentErrorBoundary extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null } as State;
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error("Payment Error caught by PaymentErrorBoundary", error, {
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if ((this.state as State).hasError) {
      return (
        <div className="flex items-center justify-center rounded-2xl border border-red-500/50 bg-red-950/20 p-8">
          <div className="text-center">
            <div className="mb-4 text-4xl">💳</div>
            <h3 className="mb-2 text-lg font-black text-white">
              Error en el proceso de pago
            </h3>
            <p className="mb-4 text-sm text-zinc-400">
              Ha ocurrido un error al procesar tu pago. Por favor, intenta nuevamente.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-red-500 px-6 py-3 font-black text-white transition-all hover:bg-red-600"
            >
              Intentar Nuevamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
