import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Erro ao limpar cache:', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 font-sans text-stone-900">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-stone-200 p-6 md:p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold font-serif text-stone-900 mb-2">
              Ops! Algo inesperado aconteceu
            </h1>
            <p className="text-stone-600 text-sm mb-6">
              A LibreOteca encontrou uma instabilidade ao renderizar a página. Clique abaixo para recarregar ou restaurar o estado padrão.
            </p>

            {this.state.error && (
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-left mb-6 overflow-auto max-h-36 text-xs text-red-700 font-mono">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-medium rounded-xl transition shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Recarregar Página
              </button>
              <button
                onClick={this.handleResetCache}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-medium rounded-xl transition"
              >
                <Home className="w-4 h-4" />
                Restaurar e Limpar Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
