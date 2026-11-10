import React from 'react';
import { ApplicationStats, ApplicationStatus } from '../types';

interface StatsBannerProps {
  stats: ApplicationStats | null;
  loading: boolean;
  selectedStatus: string | null;
  onSelectStatus: (status: ApplicationStatus | null) => void;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  stats,
  loading,
  selectedStatus,
  onSelectStatus,
}) => {
  const cards: {
    status: ApplicationStatus | null;
    label: string;
    countKey: keyof ApplicationStats;
    dotColor: string;
    activeBorder: string;
  }[] = [
    {
      status: null,
      label: 'Semua Lamaran',
      countKey: 'total',
      dotColor: 'bg-zinc-400',
      activeBorder: 'border-zinc-400',
    },
    {
      status: 'wishlist',
      label: 'Wishlist',
      countKey: 'wishlist',
      dotColor: 'bg-zinc-400',
      activeBorder: 'border-zinc-400',
    },
    {
      status: 'applied',
      label: 'Applied',
      countKey: 'applied',
      dotColor: 'bg-blue-400',
      activeBorder: 'border-blue-500',
    },
    {
      status: 'interviewing',
      label: 'Interviewing',
      countKey: 'interviewing',
      dotColor: 'bg-amber-400',
      activeBorder: 'border-amber-500',
    },
    {
      status: 'offer',
      label: 'Offer',
      countKey: 'offer',
      dotColor: 'bg-emerald-400',
      activeBorder: 'border-emerald-500',
    },
    {
      status: 'rejected',
      label: 'Rejected',
      countKey: 'rejected',
      dotColor: 'bg-rose-400',
      activeBorder: 'border-rose-500',
    },
  ];

  if (loading && !stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 mb-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-xl bg-zinc-900/60 border border-zinc-800 animate-pulse p-3.5 flex flex-col justify-between"
          >
            <div className="h-3 w-16 bg-zinc-800 rounded"></div>
            <div className="h-6 w-8 bg-zinc-800 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 mb-6">
      {cards.map((card) => {
        const isSelected = selectedStatus === card.status || (card.status === null && selectedStatus === null);
        const count = stats ? stats[card.countKey] : 0;

        return (
          <button
            key={card.label}
            onClick={() => onSelectStatus(isSelected && card.status !== null ? null : card.status)}
            className={`text-left p-3 sm:p-3.5 rounded-xl border transition-all duration-150 flex flex-col justify-between group ${
              isSelected
                ? `bg-zinc-900 ${card.activeBorder} shadow-sm ring-1 ring-zinc-700/50`
                : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/80 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] sm:text-xs font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">
                {card.label}
              </span>
              <span className={`w-2 h-2 rounded-full ${card.dotColor} shrink-0`} />
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
              {count}
            </div>
          </button>
        );
      })}
    </div>
  );
};
