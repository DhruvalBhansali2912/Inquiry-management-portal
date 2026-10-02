import React from 'react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { 
  Eye, 
  User, 
  MessageSquare, 
  Paperclip, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  Building,
  Mail,
  Phone
} from 'lucide-react';

export default function InquiryTable({
  inquiries = [],
  pagination = {},
  isLoading = false,
  onSelectInquiry,
  onQuickStatusChange,
  onPageChange,
  onSortChange,
  currentSort = { field: 'created_at', direction: 'desc' },
}) {
  const statusOptions = ['new', 'contacted', 'qualified', 'won', 'lost', 'pending'];

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSort = (field) => {
    if (!onSortChange) return;
    const direction = currentSort.field === field && currentSort.direction === 'asc' ? 'desc' : 'asc';
    onSortChange(field, direction);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
        <p className="text-sm text-slate-500 font-medium">Loading inquiries...</p>
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No inquiries found</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
          No inquiries matched your current filter criteria or search keywords.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200">
            <tr>
              <th 
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('reference_no')}
              >
                <div className="flex items-center gap-1">
                  <span>Reference ID</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th 
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  <span>Lead / Contact</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4">Subject</th>
              <th 
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th 
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center gap-1">
                  <span>Priority</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4">Source</th>
              <th className="py-3.5 px-4">Assigned To</th>
              <th 
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center gap-1">
                  <span>Received</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inquiries.map((inq) => (
              <tr 
                key={inq.id}
                className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                onClick={() => onSelectInquiry(inq.id)}
              >
                {/* Ref ID */}
                <td className="py-3.5 px-4 font-mono font-semibold text-xs text-blue-600">
                  {inq.reference_no}
                </td>

                {/* Lead Contact Info */}
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {inq.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1 truncate max-w-[140px]" title={inq.email}>
                      <Mail className="w-3 h-3" />
                      {inq.email}
                    </span>
                    {inq.company && (
                      <span className="flex items-center gap-1 text-slate-500 font-medium">
                        &bull; {inq.company}
                      </span>
                    )}
                  </div>
                </td>

                {/* Subject & Indicators */}
                <td className="py-3.5 px-4 max-w-xs">
                  <p className="truncate font-medium text-slate-800" title={inq.subject}>
                    {inq.subject}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                    {inq.notes_count > 0 && (
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <MessageSquare className="w-3 h-3" /> {inq.notes_count}
                      </span>
                    )}
                    {inq.attachments_count > 0 && (
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Paperclip className="w-3 h-3" /> {inq.attachments_count}
                      </span>
                    )}
                    {inq.reminders_count > 0 && (
                      <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                        <Calendar className="w-3 h-3" /> {inq.reminders_count} reminder
                      </span>
                    )}
                  </div>
                </td>

                {/* Status + Quick update selector */}
                <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={inq.status}
                      onChange={(e) => onQuickStatusChange(inq.id, e.target.value)}
                      className="text-xs bg-transparent border-0 rounded-lg focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer p-0 text-slate-700"
                    >
                      {statusOptions.map((st) => (
                        <option key={st} value={st}>
                          {st.charAt(0).toUpperCase() + st.slice(1)}
                        </option>
                      ))}
                    </select>
                    <StatusBadge status={inq.status} size="xs" />
                  </div>
                </td>

                {/* Priority */}
                <td className="py-3.5 px-4">
                  <PriorityBadge priority={inq.priority} />
                </td>

                {/* Source */}
                <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                  <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-slate-600 capitalize">
                    {inq.source?.replace('_', ' ')}
                  </span>
                </td>

                {/* Assigned To */}
                <td className="py-3.5 px-4 text-xs">
                  {inq.assigned_user ? (
                    <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                        {inq.assigned_user.name.charAt(0)}
                      </span>
                      {inq.assigned_user.name}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Unassigned</span>
                  )}
                </td>

                {/* Received Date */}
                <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                  {formatDate(inq.created_at)}
                </td>

                {/* Action button */}
                <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onSelectInquiry(inq.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                    title="View Full Details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.total > 0 && (
        <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{pagination.from || 1}</span> to{' '}
            <span className="font-semibold text-slate-700">{pagination.to || inquiries.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{pagination.total}</span> inquiries
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(pagination.current_page - 1)}
              disabled={pagination.current_page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg">
              {pagination.current_page} / {pagination.last_page}
            </span>
            <button
              onClick={() => onPageChange(pagination.current_page + 1)}
              disabled={pagination.current_page >= pagination.last_page}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
