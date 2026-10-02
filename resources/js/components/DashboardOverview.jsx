import React from 'react';
import SummaryCards from './SummaryCards';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { 
  TrendingUp, 
  Globe, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Plus, 
  Layers, 
  Calendar 
} from 'lucide-react';

export default function DashboardOverview({
  metricsData,
  onNavigate,
  onSelectInquiry,
  onFilterStatus,
  onToggleReminder,
  currentUser,
}) {
  const metrics = metricsData?.metrics;
  const bySource = metricsData?.by_source || {};
  const byStatus = metricsData?.by_status || {};
  const recentInquiries = metricsData?.recent_inquiries || [];
  const upcomingReminders = metricsData?.upcoming_reminders || [];
  const isAgent = currentUser?.role === 'agent';

  const sourceLabels = {
    website: 'Website / Organic',
    google_ads: 'Google Ads',
    campaign: 'Campaigns',
    linkedin: 'LinkedIn',
    referral: 'Referrals',
    other: 'Other Channels',
  };

  const totalLeads = metrics?.total || 1;

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            {isAgent ? 'My Sales Pipeline' : 'Company Pipeline & Operations'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {isAgent ? `My Inquiries Pipeline` : 'Inquiry Management Hub'}
          </h1>
          <p className="text-sm text-blue-100 max-w-xl mt-1">
            {isAgent
              ? `Welcome back, ${currentUser?.name}! Here are the active inquiries and follow-ups assigned specifically to you.`
              : 'Capture, track, and convert website visitors and campaign leads into active accounts with end-to-end follow-up tracking.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('inquiries')}
            className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <span>{isAgent ? 'View My Inquiries' : 'Manage Inquiries'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards metrics={metrics} onFilterStatus={onFilterStatus} />

      {/* Grid: Lead Source Breakdown & Conversion Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lead Source Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              Leads by Channel / Source
            </h3>
            <span className="text-xs text-slate-400 font-medium">Channel Share</span>
          </div>

          <div className="space-y-3 pt-1">
            {Object.keys(sourceLabels).map((sourceKey) => {
              const count = bySource[sourceKey] || 0;
              const percentage = Math.round((count / totalLeads) * 100);
              return (
                <div key={sourceKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium capitalize">
                      {sourceLabels[sourceKey]}
                    </span>
                    <span className="font-bold text-slate-900">
                      {count} <span className="text-slate-400 font-normal">({percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution & Pipeline Health */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Pipeline Conversion Health
            </h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {metrics?.conversion_rate || 0}% Win Rate
            </span>
          </div>

          <div className="space-y-3 pt-1 text-xs">
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-blue-900">New Unprocessed Leads</span>
                <p className="text-[11px] text-blue-700">Immediate response recommended</p>
              </div>
              <span className="text-lg font-black text-blue-800">{metrics?.new || 0}</span>
            </div>

            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-purple-900">Contacted / In Discussion</span>
                <p className="text-[11px] text-purple-700">Active dialogue opened</p>
              </div>
              <span className="text-lg font-black text-purple-800">{metrics?.contacted || 0}</span>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-amber-900">Qualified Opportunities</span>
                <p className="text-[11px] text-amber-700">Proposals sent or meetings set</p>
              </div>
              <span className="text-lg font-black text-amber-800">{metrics?.qualified || 0}</span>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-900">Won / Converted</span>
                <p className="text-[11px] text-emerald-700">Contracts signed</p>
              </div>
              <span className="text-lg font-black text-emerald-800">{metrics?.won || 0}</span>
            </div>
          </div>
        </div>

        {/* Upcoming Action Items / Reminders */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              Pending Follow-Ups
            </h3>
            <button
              onClick={() => onNavigate('reminders')}
              className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 pt-1 text-xs">
            {upcomingReminders.length > 0 ? (
              upcomingReminders.map((rem) => (
                <div
                  key={rem.id}
                  onClick={() => rem.inquiry && onSelectInquiry(rem.inquiry.id)}
                  className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200/80 transition cursor-pointer flex items-start justify-between gap-2"
                >
                  <div>
                    <h5 className="font-semibold text-slate-800">{rem.title}</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Lead: <span className="font-medium text-slate-700">{rem.inquiry?.name}</span>
                    </p>
                    <p className="text-[10px] text-amber-700 font-semibold mt-1">
                      Due: {new Date(rem.remind_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-600 self-center shrink-0" />
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No upcoming reminders</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Inquiries List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Recent Inquiries</h3>
            <p className="text-xs text-slate-400">Newly received visitor submissions</p>
          </div>
          <button
            onClick={() => onNavigate('inquiries')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Open All Inquiries</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          {recentInquiries.map((inq) => (
            <div
              key={inq.id}
              onClick={() => onSelectInquiry(inq.id)}
              className="py-3 px-2 hover:bg-slate-50 rounded-xl transition cursor-pointer flex items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {inq.reference_no}
                </span>
                <div>
                  <h4 className="font-bold text-slate-900">{inq.name}</h4>
                  <p className="text-slate-500 truncate max-w-xs">{inq.subject}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={inq.status} size="xs" />
                <PriorityBadge priority={inq.priority} />
                <span className="text-slate-400 text-[11px] hidden sm:inline">
                  {new Date(inq.created_at).toLocaleDateString()}
                </span>
                <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
