import React from 'react';

const priorityConfig = {
  urgent: {
    label: 'Urgent',
    classes: 'bg-red-100 text-red-800 border-red-200',
  },
  high: {
    label: 'High',
    classes: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  normal: {
    label: 'Normal',
    classes: 'bg-sky-50 text-sky-800 border-sky-200',
  },
  low: {
    label: 'Low',
    classes: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

export default function PriorityBadge({ priority }) {
  const normalized = (priority || 'normal').toLowerCase();
  const config = priorityConfig[normalized] || priorityConfig.normal;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border ${config.classes}`}
    >
      {config.label}
    </span>
  );
}
