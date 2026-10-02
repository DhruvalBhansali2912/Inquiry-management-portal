import React, { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { 
  X, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  User, 
  Paperclip, 
  MessageSquare, 
  History, 
  Clock, 
  Send, 
  CheckCircle, 
  Trash2, 
  Download, 
  Plus, 
  Check, 
  ShieldAlert,
  ArrowRight,
  Globe,
  Tag,
  FileText,
  RefreshCw,
  UserCheck,
  CheckCircle2,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { inquiriesApi } from '../api';

export default function InquiryDetailModal({
  inquiryId,
  onClose,
  onStatusUpdated,
  onInquiryDeleted,
  teamMembers = [],
  currentUser,
}) {
  const [inquiry, setInquiry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notes'); // notes, reminders, attachments, history

  // Status Change State
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // New Note State
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('note');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // New Reminder State
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderNotes, setReminderNotes] = useState('');
  const [isSubmittingReminder, setIsSubmittingReminder] = useState(false);

  // Upload Attachment State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const fetchDetails = async () => {
    try {
      setIsLoading(true);
      const res = await inquiriesApi.getOne(inquiryId);
      setInquiry(res.data.data);
      setNewStatus(res.data.data.status);
    } catch (err) {
      console.error('Failed to load inquiry details', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (inquiryId) {
      fetchDetails();
    }
  }, [inquiryId]);

  if (!inquiryId) return null;

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!newStatus || newStatus === inquiry.status) return;

    try {
      setIsUpdatingStatus(true);
      const res = await inquiriesApi.updateStatus(inquiry.id, {
        status: newStatus,
        note: statusNote || undefined,
      });
      setStatusNote('');
      fetchDetails();
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssignChange = async (userId) => {
    try {
      await inquiriesApi.assign(inquiry.id, userId === 'none' ? null : userId);
      fetchDetails();
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      alert('Failed to reassign: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    try {
      setIsSubmittingNote(true);
      await inquiriesApi.addNote(inquiry.id, {
        content: noteContent,
        type: noteType,
        is_internal: true,
      });
      setNoteContent('');
      fetchDetails();
    } catch (err) {
      alert('Failed to add note: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await inquiriesApi.deleteNote(inquiry.id, noteId);
      fetchDetails();
    } catch (err) {
      alert('Failed to delete note: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!reminderTitle.trim() || !reminderDate) return;

    try {
      setIsSubmittingReminder(true);
      await inquiriesApi.addReminder(inquiry.id, {
        title: reminderTitle,
        remind_at: reminderDate,
        notes: reminderNotes,
      });
      setReminderTitle('');
      setReminderDate('');
      setReminderNotes('');
      fetchDetails();
    } catch (err) {
      alert('Failed to schedule reminder: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmittingReminder(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setIsUploadingFile(true);
      await inquiriesApi.uploadAttachment(inquiry.id, formData);
      setSelectedFile(null);
      fetchDetails();
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!confirm('Delete this attachment?')) return;
    try {
      await inquiriesApi.deleteAttachment(inquiry.id, attachmentId);
      fetchDetails();
    } catch (err) {
      alert('Failed to delete attachment: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteInquiry = async () => {
    if (!confirm('Are you sure you want to delete this inquiry permanently?')) return;
    try {
      await inquiriesApi.delete(inquiry.id);
      if (onInquiryDeleted) onInquiryDeleted(inquiry.id);
      onClose();
    } catch (err) {
      alert('Failed to delete inquiry: ' + (err.response?.data?.message || err.message));
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

  const getActionMeta = (action) => {
    switch (action) {
      case 'created':
        return {
          title: 'Inquiry Received',
          icon: Sparkles,
          iconBg: 'bg-emerald-100 text-emerald-700 border-emerald-300',
        };
      case 'status_updated':
        return {
          title: 'Status Transition',
          icon: RefreshCw,
          iconBg: 'bg-blue-100 text-blue-700 border-blue-300',
        };
      case 'assigned':
        return {
          title: 'Lead Assigned',
          icon: UserCheck,
          iconBg: 'bg-indigo-100 text-indigo-700 border-indigo-300',
        };
      case 'note_added':
        return {
          title: 'Internal Note Added',
          icon: MessageSquare,
          iconBg: 'bg-purple-100 text-purple-700 border-purple-300',
        };
      case 'reminder_created':
        return {
          title: 'Reminder Scheduled',
          icon: Calendar,
          iconBg: 'bg-amber-100 text-amber-700 border-amber-300',
        };
      case 'reminder_completed':
        return {
          title: 'Reminder Completed',
          icon: CheckCircle2,
          iconBg: 'bg-emerald-100 text-emerald-700 border-emerald-300',
        };
      case 'reminder_reopened':
        return {
          title: 'Reminder Re-opened',
          icon: RotateCcw,
          iconBg: 'bg-slate-100 text-slate-700 border-slate-300',
        };
      case 'file_uploaded':
        return {
          title: 'File Attached',
          icon: Paperclip,
          iconBg: 'bg-sky-100 text-sky-700 border-sky-300',
        };
      default:
        return {
          title: (action || 'activity').replace('_', ' '),
          icon: Clock,
          iconBg: 'bg-slate-100 text-slate-700 border-slate-300',
        };
    }
  };

  const renderActivityDetails = (log) => {
    const details = log.details || {};
    switch (log.action) {
      case 'status_updated':
        return (
          <div className="mt-2 space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Stage updated:</span>
              <StatusBadge status={details.from || 'new'} size="xs" />
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <StatusBadge status={details.to} size="xs" />
            </div>
            {details.note && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 italic">
                <span className="font-semibold text-slate-500 not-italic mr-1.5">Note:</span>
                "{details.note}"
              </div>
            )}
          </div>
        );
      case 'created':
        return (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {details.source && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                Channel: <span className="capitalize">{details.source.replace('_', ' ')}</span>
              </span>
            )}
            {details.campaign_tag && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg font-semibold">
                <Tag className="w-3.5 h-3.5 text-blue-500" />
                Campaign: {details.campaign_tag}
              </span>
            )}
            {details.assigned_to && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg font-semibold">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                Assigned to: {details.assigned_to}
              </span>
            )}
          </div>
        );
      case 'assigned':
        return (
          <div className="mt-1.5 text-xs text-slate-700 flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Assigned to:</span>
            <span className="font-bold text-slate-900 bg-indigo-50 border border-indigo-200 text-indigo-800 px-2 py-0.5 rounded-md">
              {details.assigned_to_name || 'Staff Member'}
            </span>
          </div>
        );
      case 'file_uploaded':
        return (
          <div className="mt-1.5 inline-flex items-center gap-2 bg-sky-50 border border-sky-200 text-sky-800 px-3 py-1.5 rounded-xl text-xs font-medium">
            <FileText className="w-3.5 h-3.5 text-sky-600" />
            <span className="font-bold">{details.filename}</span>
            {details.size && <span className="text-sky-600 text-[11px]">({details.size})</span>}
          </div>
        );
      case 'note_added':
        return (
          <div className="mt-1.5 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700">
            <span className="font-semibold text-slate-500 mr-1 uppercase text-[10px] tracking-wider bg-slate-200 px-1.5 py-0.5 rounded">
              {details.type || 'Note'}
            </span>
            <span className="ml-1.5 font-medium">{details.preview || 'Internal comment recorded'}</span>
          </div>
        );
      case 'reminder_created':
        return (
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-800">{details.title}</span>
            {details.remind_at && (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                Due: {details.remind_at}
              </span>
            )}
          </div>
        );
      case 'reminder_completed':
        return (
          <div className="mt-1.5 text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed task: "{details.title}"
          </div>
        );
      case 'reminder_reopened':
        return (
          <div className="mt-1.5 text-xs text-slate-600 flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            Re-opened task: "{details.title}"
          </div>
        );
      default:
        return details && Object.keys(details).length > 0 ? (
          <div className="mt-1 text-xs text-slate-500 font-mono bg-slate-50 p-2 rounded border border-slate-200">
            {JSON.stringify(details)}
          </div>
        ) : null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {inquiry?.reference_no}
              </span>
              <StatusBadge status={inquiry?.status} size="sm" />
              <PriorityBadge priority={inquiry?.priority} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {inquiry?.subject || 'Inquiry Details'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
            <p>Loading inquiry record...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Top Grid: Lead Contact Details & Quick Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              
              {/* Contact Information */}
              <div className="md:col-span-2 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Lead Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-slate-500">Full Name</span>
                    <p className="font-semibold text-slate-900">{inquiry.name}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Email Address</span>
                    <p className="font-medium text-blue-600 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      <a href={`mailto:${inquiry.email}`} className="hover:underline">{inquiry.email}</a>
                    </p>
                  </div>
                  {inquiry.phone && (
                    <div>
                      <span className="text-xs text-slate-500">Phone Number</span>
                      <p className="font-medium text-slate-800 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        <a href={`tel:${inquiry.phone}`} className="hover:underline">{inquiry.phone}</a>
                      </p>
                    </div>
                  )}
                  {inquiry.company && (
                    <div>
                      <span className="text-xs text-slate-500">Organization / Company</span>
                      <p className="font-medium text-slate-800 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5" />
                        {inquiry.company}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-slate-500">Lead Source</span>
                    <p className="font-medium text-slate-700 capitalize flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      {inquiry.source?.replace('_', ' ')}
                      {inquiry.campaign_tag && (
                        <span className="ml-1 text-xs text-slate-500">({inquiry.campaign_tag})</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Submission Timestamp</span>
                    <p className="text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(inquiry.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assignment & Status Control */}
              <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-200 md:pl-6 pt-4 md:pt-0">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Assignee
                  </label>
                  <select
                    value={inquiry.assigned_to || 'none'}
                    onChange={(e) => handleAssignChange(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none">-- Unassigned --</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.role})
                      </option>
                    ))}
                  </select>
                </div>

                <form onSubmit={handleStatusSubmit} className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Update Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="new">New Lead</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="won">Won (Converted)</option>
                    <option value="lost">Lost</option>
                    <option value="pending">Pending Follow-up</option>
                  </select>
                  {newStatus !== inquiry.status && (
                    <div className="space-y-2 pt-1 animate-in fade-in">
                      <input
                        type="text"
                        placeholder="Add reason or note (optional)"
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                      <button
                        type="submit"
                        disabled={isUpdatingStatus}
                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
                      >
                        {isUpdatingStatus ? 'Saving...' : 'Apply Status'}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Original Customer Message */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Original Message
              </h4>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {inquiry.message}
              </p>
            </div>

            {/* Submitted Attachments Direct Access Box */}
            {inquiry.attachments && inquiry.attachments.length > 0 && (
              <div className="bg-blue-50/70 p-5 rounded-2xl border border-blue-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-blue-600" />
                    Submitted Lead Attachments ({inquiry.attachments.length})
                  </h4>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/60 px-2.5 py-0.5 rounded-full">
                    Ready to download
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {inquiry.attachments.map((file) => (
                    <div
                      key={file.id}
                      className="bg-white p-3.5 rounded-xl border border-blue-100 flex items-center justify-between gap-3 shadow-xs hover:border-blue-300 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-900 truncate" title={file.original_filename}>
                            {file.original_filename}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {file.formatted_size} &bull; {file.user ? file.user.name : 'Submitted with Lead'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => inquiriesApi.downloadFile(inquiry.id, file.id, file.original_filename)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow transition"
                          title="Download File"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="border-b border-slate-200 flex items-center gap-6 text-sm">
              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-3 font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                  activeTab === 'notes'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Internal Notes ({inquiry.notes?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('reminders')}
                className={`pb-3 font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                  activeTab === 'reminders'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Follow-up Reminders ({inquiry.reminders?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('attachments')}
                className={`pb-3 font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                  activeTab === 'attachments'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Paperclip className="w-4 h-4" />
                Attachments ({inquiry.attachments?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`pb-3 font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                  activeTab === 'history'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <History className="w-4 h-4" />
                Activity Timeline ({inquiry.activity_logs?.length || 0})
              </button>
            </div>

            {/* Tab 1: Notes & Communication Logs */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <form onSubmit={handleAddNote} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Add Internal Note or Activity Log</span>
                    <select
                      value={noteType}
                      onChange={(e) => setNoteType(e.target.value)}
                      className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
                    >
                      <option value="note">Internal Note</option>
                      <option value="call_log">Call Log</option>
                      <option value="email_log">Email Sent / Received</option>
                      <option value="meeting">Meeting Log</option>
                    </select>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Type notes, client conversation points, or follow-up details..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full text-sm p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingNote || !noteContent.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {isSubmittingNote ? 'Saving...' : 'Post Note'}
                    </button>
                  </div>
                </form>

                <div className="space-y-3">
                  {inquiry.notes && inquiry.notes.length > 0 ? (
                    inquiry.notes.map((note) => (
                      <div key={note.id} className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">
                              {note.user ? note.user.name : 'System Staff'}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-600">
                              {note.type.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <span>{formatDate(note.created_at)}</span>
                            {(currentUser?.role === 'admin' || note.user_id === currentUser?.id) && (
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="text-slate-400 hover:text-red-600 transition"
                                title="Delete Note"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">No notes recorded yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Reminders */}
            {activeTab === 'reminders' && (
              <div className="space-y-4">
                <form onSubmit={handleAddReminder} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 block">Schedule a Follow-Up Reminder</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Reminder title (e.g. Call client regarding proposal)"
                      value={reminderTitle}
                      onChange={(e) => setReminderTitle(e.target.value)}
                      className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="datetime-local"
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Optional notes or instructions"
                    value={reminderNotes}
                    onChange={(e) => setReminderNotes(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingReminder || !reminderTitle.trim() || !reminderDate}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {isSubmittingReminder ? 'Scheduling...' : 'Set Reminder'}
                    </button>
                  </div>
                </form>

                <div className="space-y-2">
                  {inquiry.reminders && inquiry.reminders.length > 0 ? (
                    inquiry.reminders.map((rem) => (
                      <div
                        key={rem.id}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                          rem.status === 'completed'
                            ? 'bg-slate-50 border-slate-200 opacity-60'
                            : 'bg-amber-50/60 border-amber-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${rem.status === 'completed' ? 'bg-slate-400' : 'bg-amber-500'}`} />
                          <div>
                            <p className={`font-semibold ${rem.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                              {rem.title}
                            </p>
                            {rem.notes && <p className="text-slate-500 text-[11px] mt-0.5">{rem.notes}</p>}
                            <p className="text-slate-400 text-[10px] mt-0.5">
                              Due: {formatDate(rem.remind_at)} {rem.user ? `&bull; Set by ${rem.user.name}` : ''}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          rem.status === 'completed' ? 'bg-slate-200 text-slate-700' : 'bg-amber-200 text-amber-800'
                        }`}>
                          {rem.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">No follow-up reminders scheduled.</p>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Attachments */}
            {activeTab === 'attachments' && (
              <div className="space-y-4">
                <form onSubmit={handleFileUpload} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <button
                    type="submit"
                    disabled={isUploadingFile || !selectedFile}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
                  >
                    {isUploadingFile ? 'Uploading...' : 'Upload File'}
                  </button>
                </form>

                <div className="space-y-2">
                  {inquiry.attachments && inquiry.attachments.length > 0 ? (
                    inquiry.attachments.map((file) => (
                      <div key={file.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Paperclip className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{file.original_filename}</p>
                            <p className="text-slate-400 text-[10px]">
                              {file.formatted_size} &bull; Uploaded {formatDate(file.created_at)}
                              {file.user ? ` by ${file.user.name}` : ' (Public Lead)'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => inquiriesApi.downloadFile(inquiry.id, file.id, file.original_filename)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </button>
                          {(currentUser?.role === 'admin' || file.user_id === currentUser?.id) && (
                            <button
                              onClick={() => handleDeleteAttachment(file.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 transition"
                              title="Delete file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">No attachments uploaded.</p>
                  )}
                </div>
              </div>
            )}

            {/* Tab 4: Activity Log History */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-100">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Chronological Audit Trail
                  </span>
                  <span>{inquiry.activity_logs?.length || 0} events recorded</span>
                </div>

                {inquiry.activity_logs && inquiry.activity_logs.length > 0 ? (
                  <div className="relative pl-8 space-y-5 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                    {inquiry.activity_logs.map((log) => {
                      const meta = getActionMeta(log.action);
                      const Icon = meta.icon;
                      return (
                        <div key={log.id} className="relative group">
                          {/* Timeline Node Icon Badge */}
                          <div
                            className={`absolute -left-8 top-0.5 w-7 h-7 rounded-xl border flex items-center justify-center shadow-xs transition-transform group-hover:scale-110 ${meta.iconBg}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>

                          {/* Event Card */}
                          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition space-y-1.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-xs text-slate-900">
                                  {meta.title}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  by <strong className="text-slate-600 font-semibold">{log.user ? log.user.name : (log.action === 'created' ? 'Website Visitor' : 'Automated System')}</strong>
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {formatDate(log.created_at)}
                              </span>
                            </div>

                            {/* Human-friendly formatted details */}
                            {renderActivityDetails(log)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200">
                    <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-semibold">No activity logs recorded yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div>
            {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
              <button
                onClick={handleDeleteInquiry}
                className="text-red-600 hover:text-red-800 font-medium inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Inquiry
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
