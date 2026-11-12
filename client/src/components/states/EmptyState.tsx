import { Compass, Plus } from 'lucide-react';

interface EmptyStateProps {
  onAddClick: () => void;
}

export function EmptyState({ onAddClick }: EmptyStateProps) {
  return (
    <div className="py-24 border border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-zinc-900/20 my-6">
      <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-800 shadow-inner text-zinc-300">
        <Compass className="w-7 h-7" />
      </div>
      <h2 className="text-lg font-bold text-zinc-100 tracking-tight">
        Mulai Tracking Lamaran Pertamamu
      </h2>
      <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-md leading-relaxed">
        Catat lowongan yang ingin kamu lamar dengan cepat tanpa repot. Cukup nama perusahaan dan posisi!
      </p>
      <button
        onClick={onAddClick}
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-zinc-100 text-zinc-900 hover:bg-white active:bg-zinc-200 transition-all shadow-md hover:shadow-lg"
      >
        <Plus className="w-4 h-4" />
        <span>Tambah Lamaran Sekarang</span>
      </button>
    </div>
  );
}
