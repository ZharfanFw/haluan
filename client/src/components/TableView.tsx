import React from 'react';
import { Building, Calendar, DollarSign, ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { Application, ApplicationStatus } from '../types';
import { formatDate } from '../lib/utils';

interface TableViewProps {
  applications: Application[];
  onSelectApplication: (app: Application) => void;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => Promise<void>;
  sortBy: string;
  order: 'asc' | 'desc';
  onSortChange: (field: string) => void;
}

const STATUS_OPTIONS: { value: ApplicationStatus; label: string; badge: string }[] = [
  { value: 'wishlist', label: 'Wishlist', badge: 'bg-zinc-800 text-zinc-300 border-zinc-700' },
  { value: 'applied', label: 'Applied', badge: 'bg-blue-950/60 text-blue-400 border-blue-800/50' },
  { value: 'interviewing', label: 'Interviewing', badge: 'bg-amber-950/60 text-amber-400 border-amber-800/50' },
  { value: 'offer', label: 'Offer', badge: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50' },
  { value: 'rejected', label: 'Rejected', badge: 'bg-zinc-900 text-zinc-500 border-zinc-800' },
];

export const TableView: React.FC<TableViewProps> = ({
  applications,
  onSelectApplication,
  onUpdateStatus,
  sortBy,
  order,
  onSortChange,
}) => {
  if (applications.length === 0) {
    return (
      <div className="py-20 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-zinc-900/20">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center mb-3 border border-zinc-800 text-zinc-400">
          <Search className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-200">Tidak ada lamaran yang cocok</h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm">
          Coba ubah kata kunci pencarian atau bersihkan filter status untuk melihat lamaran lainnya.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400">
              <th
                onClick={() => onSortChange('company')}
                className="py-3.5 px-4 font-medium cursor-pointer hover:text-zinc-200 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Perusahaan & Role</span>
                  {sortBy === 'company' ? (
                    order === 'asc' ? <ArrowUp className="w-3 h-3 text-zinc-200" /> : <ArrowDown className="w-3 h-3 text-zinc-200" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  )}
                </div>
              </th>
              <th className="py-3.5 px-4 font-medium">Status</th>
              <th className="py-3.5 px-4 font-medium">Tipe</th>
              <th
                onClick={() => onSortChange('applied_date')}
                className="py-3.5 px-4 font-medium cursor-pointer hover:text-zinc-200 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Tanggal Apply</span>
                  {sortBy === 'applied_date' ? (
                    order === 'asc' ? <ArrowUp className="w-3 h-3 text-zinc-200" /> : <ArrowDown className="w-3 h-3 text-zinc-200" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  )}
                </div>
              </th>
              <th className="py-3.5 px-4 font-medium">Gaji / Range</th>
              <th className="py-3.5 px-4 font-medium text-right">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {applications.map((app) => (
              <tr
                key={app.id}
                onClick={() => onSelectApplication(app)}
                className="group hover:bg-zinc-800/40 transition-colors cursor-pointer"
              >
                {/* Company & Role */}
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-zinc-100 group-hover:text-white text-xs sm:text-sm">
                    {app.role}
                  </div>
                  <div className="text-zinc-400 text-xs flex items-center gap-1 mt-0.5">
                    <Building className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span>{app.company}</span>
                    {app.location && <span className="text-zinc-400">• {app.location}</span>}
                  </div>
                </td>

                {/* Status Selector */}
                <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={app.status}
                    onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Work Mode */}
                <td className="py-3.5 px-4">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800/80 text-zinc-400 uppercase">
                    {app.work_mode}
                  </span>
                </td>

                {/* Applied Date */}
                <td className="py-3.5 px-4 text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    {formatDate(app.applied_date)}
                  </span>
                </td>

                {/* Salary */}
                <td className="py-3.5 px-4 text-zinc-300">
                  {app.salary ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-medium">
                      <DollarSign className="w-3 h-3" />
                      {app.salary}
                    </span>
                  ) : (
                    <span className="text-zinc-400">-</span>
                  )}
                </td>

                {/* Action Link */}
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => onSelectApplication(app)}
                    className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    Buka
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
