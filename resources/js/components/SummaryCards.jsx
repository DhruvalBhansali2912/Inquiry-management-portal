import React from 'react';
import { 
  Inbox, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  BellRing,
  AlertCircle
} from 'lucide-react';

export default function SummaryCards({ metrics, onFilterStatus }) {
  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-xl" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      id: 'total',
      title: 'Total Inquiries',
      value: metrics.total ?? 0,
      subtext: 'Lifetime leads captured',
      icon: Inbox,
      color: 'blue',
      filterKey: 'all',
    },
    {
      id: 'open',
      title: 'Active / Open Leads',
      value: metrics.open ?? 0,
      subtext: `${metrics.new ?? 0} new, ${metrics.contacted ?? 0} contacted`,
      icon: Clock,
      color: 'indigo',
      filterKey: 'new',
    },
    {
      id: 'pending',
      title: 'Pending Follow-up',
      value: metrics.pending ?? 0,
      subtext: `${metrics.pending_reminders ?? 0} scheduled reminders`,
      icon: BellRing,
      color: 'amber',
      filterKey: 'pending',
    },
    {
      id: 'won',
      title: 'Won / Converted',
      value: metrics.won ?? 0,
      subtext: `${metrics.conversion_rate ?? 0}% win rate`,
      icon: TrendingUp,
      color: 'emerald',
      filterKey: 'won',
    },
  ];

  const colorStyles = {
    blue: {
      bg: 'bg-blue-50/70',
      border: 'border-blue-100',
      iconBg: 'bg-blue-600 text-white',
      badge: 'bg-blue-100 text-blue-800',
    },
    indigo: {
      bg: 'bg-indigo-50/70',
      border: 'border-indigo-100',
      iconBg: 'bg-indigo-600 text-white',
      badge: 'bg-indigo-100 text-indigo-800',
    },
    amber: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-100',
      iconBg: 'bg-amber-600 text-white',
      badge: 'bg-amber-100 text-amber-800',
    },
    emerald: {
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-600 text-white',
      badge: 'bg-emerald-100 text-emerald-800',
    },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const style = colorStyles[card.color];
        return (
          <div
            key={card.id}
            onClick={() => onFilterStatus && onFilterStatus(card.filterKey)}
            className={`p-5 rounded-2xl border transition-all duration-200 bg-white hover:shadow-md cursor-pointer hover:border-slate-300 relative overflow-hidden group`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {card.title}
                </p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {card.value}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-xl shadow-sm ${style.iconBg} group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{card.subtext}</span>
              <span className="text-blue-600 font-medium group-hover:translate-x-0.5 transition-transform">
                View &rarr;
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
