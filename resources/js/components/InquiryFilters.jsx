import React from 'react';
import { Search, Filter, RotateCcw, Download, Calendar, User, Tag } from 'lucide-react';

export default function InquiryFilters({
  filters,
  onChange,
  onReset,
  onExportCsv,
  teamMembers = [],
  isExporting = false,
  currentUser,
}) {
  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' },
    { value: 'pending', label: 'Pending' },
  ];

  const priorities = [
    { value: 'all', label: 'All Priorities' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'normal', label: 'Normal' },
    { value: 'low', label: 'Low' },
  ];

  const sources = [
    { value: 'all', label: 'All Sources' },
    { value: 'website', label: 'Website' },
    { value: 'campaign', label: 'Campaign' },
    { value: 'google_ads', label: 'Google Ads' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'referral', label: 'Referral' },
    { value: 'other', label: 'Other' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value, page: 1 });
  };

  const handleStatusPill = (statusVal) => {
    onChange({ ...filters, status: statusVal, page: 1 });
  };

  const isFiltered = 
    filters.search || 
    (filters.status && filters.status !== 'all') || 
    (filters.priority && filters.priority !== 'all') || 
    (filters.source && filters.source !== 'all') || 
    (filters.assigned_to && filters.assigned_to !== 'all') ||
    filters.start_date ||
    filters.end_date;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
      {/* Search Bar & Actions */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="search"
            value={filters.search || ''}
            onChange={handleInputChange}
            placeholder="Search by lead name, email, company, subject, or reference code..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: '', page: 1 })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isFiltered && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}

          <button
            onClick={onExportCsv}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl shadow-sm transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Quick Status Tabs / Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-slate-100">
        <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Status:
        </span>
        {statuses.map((s) => {
          const isActive = (filters.status || 'all') === s.value;
          return (
            <button
              key={s.value}
              onClick={() => handleStatusPill(s.value)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 bg-slate-50'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Granular Dropdowns & Date Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {/* Priority */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Priority
          </label>
          <select
            name="priority"
            value={filters.priority || 'all'}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            {priorities.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Lead Source */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Lead Source
          </label>
          <select
            name="source"
            value={filters.source || 'all'}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            {sources.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Assigned Staff */}
        {/* Assigned Staff (Admin/Manager) or Assigned Scope (Agent) */}
        {currentUser?.role === 'agent' ? (
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Lead Scope
            </label>
            <div className="w-full px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              My Assigned Leads
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Assigned Staff
            </label>
            <select
              name="assigned_to"
              value={filters.assigned_to || 'all'}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            >
              <option value="all">All Staff</option>
              <option value="unassigned">Unassigned Only</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.role})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date From */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Date From
          </label>
          <input
            type="date"
            name="start_date"
            value={filters.start_date || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          />
        </div>
      </div>
    </div>
  );
}
