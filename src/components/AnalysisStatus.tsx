"use client";

interface AnalysisStatusProps {
  message: string;
}

/** Regiao de status educada (aria-live) para anunciar progresso a leitores de tela. */
export function AnalysisStatus({ message }: AnalysisStatusProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
    >
      <span
        aria-hidden="true"
        className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700"
      />
      <span className="text-base font-medium text-brand-900">{message}</span>
    </div>
  );
}

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

/** Alerta acessivel (aria-live assertivo) com acao opcional de tentar de novo. */
export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 text-red-900"
    >
      <p className="text-base font-semibold">Ocorreu um problema</p>
      <p className="mt-1 text-base">{message}</p>
      {onRetry ? (
        <button type="button" className="btn-secondary mt-4" onClick={onRetry}>
          Tentar novamente
        </button>
      ) : null}
    </div>
  );
}
