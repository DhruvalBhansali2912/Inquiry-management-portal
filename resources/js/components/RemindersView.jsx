import React, { useState, useEffect } from 'react';
import { remindersApi } from '../api';
import { Calendar, CheckCircle2, Clock, MessageSquare, ArrowUpRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function RemindersView({ onSelectInquiry }) {
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReminders = async () => {
    try {
      setIsLoading(true);
      const res = await remindersApi.getUpcoming();
      setReminders(res.data.data);
    } catch (err) {
      console.error('Failed to load reminders', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleToggle = async (id) => {
    try {
      await remindersApi.toggle(id);
      fetchReminders();
    } catch (err) {
      alert('Failed to toggle reminder: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Follow-up Reminders & Schedule
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pending tasks and scheduled follow-ups across active inquiries
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
          <p className="text-xs text-slate-500">Loading reminders...</p>
        </div>
      ) : reminders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">You are all caught up!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            No pending follow-up reminders. When you open any inquiry, you can schedule reminders from the Reminders tab.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className="p-4 hover:bg-slate-50 transition flex items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-start gap-3.5 flex-1">
                <input
                  type="checkbox"
                  checked={rem.status === 'completed'}
                  onChange={() => handleToggle(rem.id)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{rem.title}</h4>
                  {rem.notes && <p className="text-slate-600 mt-0.5">{rem.notes}</p>}
                  
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-slate-400">
                    <span className="flex items-center gap-1 font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <Clock className="w-3 h-3" />
                      Due: {formatDate(rem.remind_at)}
                    </span>
                    {rem.user && <span>&bull; Set by {rem.user.name}</span>}
                  </div>
                </div>
              </div>

              {rem.inquiry && (
                <div className="text-right flex items-center gap-3">
                  <div className="hidden sm:block">
                    <span className="font-mono font-bold text-blue-600 text-xs">
                      {rem.inquiry.reference_no}
                    </span>
                    <p className="text-slate-600 font-medium truncate max-w-[150px]">
                      {rem.inquiry.name}
                    </p>
                  </div>
                  <button
                    onClick={() => onSelectInquiry(rem.inquiry.id)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                    title="View Inquiry"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
