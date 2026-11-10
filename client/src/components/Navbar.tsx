import React from 'react';
import { Columns3, Table2, Plus, Search, X, Compass } from 'lucide-react';

interface NavbarProps {
  appName?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'kanban' | 'table';
  onViewModeChange: (mode: 'kanban' | 'table') => void;
  onOpenQuickAdd: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  appName = 'Haluan',
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onOpenQuickAdd,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 shadow-sm">
              <Compass className="w-4 h-4 text-zinc-300" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
                {appName}
                <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                  Local
                </span>
              </h1>
            </div>
          </div>

          {/* Mobile Quick Add Button */}
          <button
            onClick={onOpenQuickAdd}
            className="sm:hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 text-zinc-900 hover:bg-white active:bg-zinc-200 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </div>

        {/* Center: Search & Controls */}
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari perusahaan, posisi, atau catatan..."
              className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-700 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5 rounded"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Toggle (Kanban / Table) */}
          <div className="flex items-center p-1 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0">
            <button
              onClick={() => onViewModeChange('kanban')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'kanban'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Tampilan Kanban"
            >
              <Columns3 className="w-4 h-4" />
              <span className="hidden md:inline">Kanban</span>
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Tampilan Tabel"
            >
              <Table2 className="w-4 h-4" />
              <span className="hidden md:inline">Tabel</span>
            </button>
          </div>
        </div>

        {/* Right CTA Desktop */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={onOpenQuickAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-zinc-100 text-zinc-900 hover:bg-white active:bg-zinc-200 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Lamaran</span>
          </button>
        </div>
      </div>
    </header>
  );
};
