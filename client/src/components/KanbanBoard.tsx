import React from 'react';
import { Building, MapPin, DollarSign, Calendar, ChevronRight, Plus } from 'lucide-react';
import { Application, ApplicationStatus } from '../types';
import { formatDate } from '../lib/utils';
import { STATUS_CONFIG, NEXT_STAGE_MAP } from '../config/status';

interface KanbanBoardProps {
  applications: Application[];
  onSelectApplication: (app: Application) => void;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => Promise<void>;
  onOpenQuickAdd: (defaultStatus: ApplicationStatus) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  applications,
  onSelectApplication,
  onUpdateStatus,
  onOpenQuickAdd,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start pb-8">
      {STATUS_CONFIG.map((stage) => {
        const columnApps = applications.filter((app) => app.status === stage.status);

        return (
          <div
            key={stage.status}
            className="flex flex-col rounded-2xl bg-zinc-900/50 border border-zinc-800/80 p-3 min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/80 px-1">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${stage.dotColor}`} />
                <h3 className="text-xs font-semibold text-zinc-200 tracking-wide uppercase">
                  {stage.label}
                </h3>
                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-400">
                  {columnApps.length}
                </span>
              </div>
              <button
                onClick={() => onOpenQuickAdd(stage.status)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                title={`Tambah ke ${stage.label}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Column Cards */}
            <div className="space-y-2.5 flex-1">
              {columnApps.length === 0 ? (
                <div className="h-32 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                  <p className="text-xs text-zinc-400 mb-2">Belum ada lamaran</p>
                  <button
                    onClick={() => onOpenQuickAdd(stage.status)}
                    className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 font-medium"
                  >
                    <Plus className="w-3 h-3" /> Tambah
                  </button>
                </div>
              ) : (
                columnApps.map((app) => {
                  const nextStage = NEXT_STAGE_MAP[app.status];

                  return (
                    <div
                      key={app.id}
                      onClick={() => onSelectApplication(app)}
                      className="group p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/90 transition-all duration-150 cursor-pointer shadow-sm hover:shadow relative"
                    >
                      {/* Top: Role & Company */}
                      <div className="pr-6">
                        <h4 className="text-xs sm:text-sm font-semibold text-zinc-100 group-hover:text-white line-clamp-1">
                          {app.role}
                        </h4>
                        <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5 line-clamp-1">
                          <Building className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span>{app.company}</span>
                        </p>
                      </div>

                      {/* Work Mode & Salary Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase">
                          {app.work_mode}
                        </span>

                        {app.salary && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center gap-0.5">
                            <DollarSign className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[100px]">{app.salary}</span>
                          </span>
                        )}

                        {app.location && (
                          <span className="text-[10px] text-zinc-400 flex items-center gap-0.5 truncate max-w-[90px]">
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{app.location}</span>
                          </span>
                        )}
                      </div>

                      {/* Footer: Date & Quick Shift Action */}
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-800/60 text-[11px] text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(app.applied_date)}
                        </span>

                        {nextStage && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateStatus(app.id, nextStage);
                            }}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                            title={`Pindah ke ${nextStage}`}
                          >
                            <span>Lanjut</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
