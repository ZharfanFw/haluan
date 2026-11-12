import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { ApplicationStatus, CreateApplicationDto, WorkMode } from '../types';
import { STATUS_CONFIG, WORK_MODE_OPTIONS } from '../config/status';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateApplicationDto) => Promise<void>;
  defaultStatus?: ApplicationStatus;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultStatus = 'applied',
}) => {
  const companyInputRef = useRef<HTMLInputElement>(null);

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>(defaultStatus);
  const [workMode, setWorkMode] = useState<WorkMode>('remote');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [appliedDate, setAppliedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCompany('');
      setRole('');
      setStatus(defaultStatus);
      setWorkMode('remote');
      setLocation('');
      setSalary('');
      setJobUrl('');
      setNotes('');
      setAppliedDate(new Date().toISOString().split('T')[0]);
      setShowAdvanced(false);
      setError(null);
      setTimeout(() => companyInputRef.current?.focus(), 50);
    }
  }, [isOpen, defaultStatus]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) {
      setError('Nama perusahaan wajib diisi');
      return;
    }
    if (!role.trim()) {
      setError('Posisi pekerjaan wajib diisi');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        company: company.trim(),
        role: role.trim(),
        status,
        work_mode: workMode,
        location: location.trim() || null,
        salary: salary.trim() || null,
        job_url: jobUrl.trim() || null,
        applied_date: appliedDate,
        notes: notes.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan lamaran');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">Tambah Lamaran Baru</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Cukup isi nama perusahaan dan posisi untuk simpan cepat
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-lg bg-rose-950/50 border border-rose-900/60 text-rose-300">
              {error}
            </div>
          )}

          {/* Essential Fields */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Perusahaan <span className="text-rose-400">*</span>
              </label>
              <input
                ref={companyInputRef}
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="misal: GoTo, Shopee, Google"
                className="w-full px-3.5 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-700 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Posisi / Role <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="misal: Frontend Engineer, Backend Developer"
                className="w-full px-3.5 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-700 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Tahap / Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                >
                  {STATUS_CONFIG.map((opt) => (
                    <option key={opt.status} value={opt.status}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Tipe Kerja
                </label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                >
                  {WORK_MODE_OPTIONS.map((opt) => (
                    <option key={opt.mode} value={opt.mode}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Collapsible Optional Section */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 font-medium py-1 transition-colors"
            >
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showAdvanced ? 'Sembunyikan Opsi Tambahan' : 'Tampilkan Opsi Tambahan (Gaji, Link, Catatan)'}</span>
            </button>

            {showAdvanced && (
              <div className="space-y-3.5 pt-3 animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      Range Gaji
                    </label>
                    <input
                      type="text"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="e.g. 15jt - 20jt"
                      className="w-full px-3 py-1.5 text-xs sm:text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      Lokasi
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Jakarta, BSD"
                      className="w-full px-3 py-1.5 text-xs sm:text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      Link Lowongan
                    </label>
                    <input
                      type="url"
                      value={jobUrl}
                      onChange={(e) => setJobUrl(e.target.value)}
                      placeholder="https://linkedin.com/..."
                      className="w-full px-3 py-1.5 text-xs sm:text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      Tanggal Apply
                    </label>
                    <input
                      type="date"
                      value={appliedDate}
                      onChange={(e) => setAppliedDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Catatan Singkat
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="misal: Menggunakan CV v3, referral dari mas Budi"
                    className="w-full px-3 py-1.5 text-xs sm:text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-zinc-100 text-zinc-900 hover:bg-white active:bg-zinc-200 transition-colors shadow-sm disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Simpan Lamaran</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
