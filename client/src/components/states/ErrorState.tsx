import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string | null;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-rose-900/60 bg-rose-950/20 p-8 text-center my-8">
      <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
      <h3 className="text-base font-semibold text-rose-200">Gagal Memuat Data</h3>
      <p className="text-xs text-rose-300/80 mt-1 max-w-md mx-auto">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-rose-900/40 hover:bg-rose-900/60 text-rose-200 border border-rose-800 transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Coba Lagi</span>
      </button>
    </div>
  );
}
