import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-200">
            <div className="mx-auto h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Ops! Algo deu errado.</h1>
            <p className="text-slate-500 mb-6">
              O sistema encontrou um erro inesperado. Não se preocupe, seus dados estão salvos no armazenamento local.
            </p>
            
            <div className="bg-slate-100 p-4 rounded-lg mb-6 text-left overflow-auto max-h-32">
              <code className="text-xs text-slate-600 font-mono">
                {this.state.error?.message || "Erro desconhecido"}
              </code>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={this.handleReload} className="w-full justify-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                Recarregar Página
              </Button>
              <button 
                onClick={this.handleReset}
                className="text-xs text-red-500 hover:text-red-700 underline mt-2"
              >
                Limpar dados e reiniciar (Use se o erro persistir)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}