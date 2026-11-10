import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Trash2, Calendar, Building, MapPin, DollarSign, UserCheck, Loader2 } from 'lucide-react';
import { Application, ApplicationStatus, UpdateApplicationDto, WorkMode } from '../types';

interface DetailDrawerProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: UpdateApplicationDto) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  application,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [formData, setFormData] = useState<UpdateApplicationDto>({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (application) {
      setFormData({
        company: application.company,
        role: application.role,
        status: application.status,
        work_mode: application.work_mode,
        location: application.location || '',
        salary: application.salary || '',
        job_url: application.job_url || '',
        applied_date: application.applied_date,
        interview_date: application.interview_date || '',
        contact_info: application.contact_info || '',
        notes: application.notes || '',
      });
      setIsEditing(false);
      setConfirmDelete(false);
      setError(null);
    }
  }, [application, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !application) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company?.trim()) {
      setError('Nama perusahaan tidak boleh kosong');
      return;
    }
    if (!formData.role?.trim()) {
      setError('Posisi tidak boleh kosong');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onUpdate(application.id, formData);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui lamaran');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await onDelete(application.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus lamaran');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'wishlist':
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
      case 'applied':
        return 'bg-blue-950/60 text-blue-400 border-blue-800/50';
      case 'interviewing':
        return 'bg-amber-950/60 text-amber-400 border-amber-800/50';
      case 'offer':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50';
      case 'rejected':
        return 'bg-zinc-900 text-zinc-500 border-zinc-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className="w-screen max-w-md bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-zinc-800/80 flex items-start justify-between">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${getStatusBadge(application.status)}`}>
                  {application.status.toUpperCase()}
                </span>
                <span className="text-[11px] font-medium text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-full border border-zinc-700/50">
                  {application.work_mode.toUpperCase()}
                </span>
              </div>
              <h2 className="text-lg font-bold text-zinc-100 tracking-tight">
                {application.role}
              </h2>
              <p className="text-sm text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <Building className="w-3.5 h-3.5 text-zinc-400" />
                {application.company}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && (
              <div className="p-3 text-xs rounded-lg bg-rose-950/50 border border-rose-900/60 text-rose-300">
                {error}
              </div>
            )}

            {!isEditing ? (
              /* View Mode */
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Tanggal Apply
                    </span>
                    <p className="text-xs font-semibold text-zinc-200 mt-1">
                      {application.applied_date}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Gaji / Range
                    </span>
                    <p className="text-xs font-semibold text-zinc-200 mt-1 truncate">
                      {application.salary || '-'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Lokasi
                    </span>
                    <p className="text-xs font-semibold text-zinc-200 mt-1 truncate">
                      {application.location || '-'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Wawancara Berikutnya
                    </span>
                    <p className="text-xs font-semibold text-zinc-200 mt-1 truncate">
                      {application.interview_date || '-'}
                    </p>
                  </div>
                </div>

                {application.job_url && (
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-[11px] text-zinc-400 block mb-1">Link Lowongan</span>
                    <a
                      href={application.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 truncate underline underline-offset-2"
                    >
                      <span className="truncate">{application.job_url}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  </div>
                )}

                {application.contact_info && (
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1 mb-1">
                      <UserCheck className="w-3.5 h-3.5" /> Kontak Recruiter / HR
                    </span>
                    <p className="text-xs text-zinc-200 whitespace-pre-wrap">
                      {application.contact_info}
                    </p>
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                  <span className="text-[11px] text-zinc-400 block mb-1.5 font-medium">
                    Catatan Lamaran & Evaluasi
                  </span>
                  <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed min-h-[60px]">
                    {application.notes || 'Belum ada catatan.'}
                  </p>
                </div>
              </div>
            ) : (
              /* Edit Mode Form */
              <form id="edit-form" onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Perusahaan</label>
                  <input
                    type="text"
                    required
                    value={formData.company || ''}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Posisi</label>
                  <input
                    type="text"
                    required
                    value={formData.role || ''}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                      className="w-full px-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    >
                      <option value="wishlist">Wishlist</option>
                      <option value="applied">Applied</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Tipe Kerja</label>
                    <select
                      value={formData.work_mode}
                      onChange={(e) => setFormData({ ...formData, work_mode: e.target.value as WorkMode })}
                      className="w-full px-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    >
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-site</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Range Gaji</label>
                    <input
                      type="text"
                      value={formData.salary || ''}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Lokasi</label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Tanggal Apply</label>
                    <input
                      type="date"
                      value={formData.applied_date || ''}
                      onChange={(e) => setFormData({ ...formData, applied_date: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Jadwal Interview</label>
                    <input
                      type="date"
                      value={formData.interview_date || ''}
                      onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Link Lowongan</label>
                  <input
                    type="url"
                    value={formData.job_url || ''}
                    onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Kontak HR / Recruiter</label>
                  <input
                    type="text"
                    value={formData.contact_info || ''}
                    onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Catatan</label>
                  <textarea
                    rows={3}
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none"
                  />
                </div>
              </form>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Yakin Hapus'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                title="Hapus lamaran ini"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                >
                  Edit Data
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    form="edit-form"
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 text-zinc-900 hover:bg-white transition-colors"
                  >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Simpan</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
