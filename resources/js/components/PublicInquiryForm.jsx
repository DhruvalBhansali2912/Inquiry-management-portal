import React, { useState, useEffect } from 'react';
import { 
  Send, 
  CheckCircle2, 
  Upload, 
  FileText, 
  X, 
  AlertCircle, 
  Mail, 
  Phone, 
  Building, 
  User, 
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { publicApi } from '../api';

export default function PublicInquiryForm({ onOpenAdminLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    source: 'website',
    campaign_tag: '',
    priority: 'normal',
  });

  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  // Auto-detect UTM params from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source');
    const utmCampaign = params.get('utm_campaign');

    if (utmSource || utmCampaign) {
      setFormData((prev) => ({
        ...prev,
        source: utmSource ? (['website', 'campaign', 'google_ads', 'linkedin', 'referral', 'other'].includes(utmSource) ? utmSource : 'campaign') : prev.source,
        campaign_tag: utmCampaign || prev.campaign_tag,
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      alert('You can upload a maximum of 5 files.');
      return;
    }
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject or purpose is required';
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val) data.append(key, val);
      });

      files.forEach((file) => {
        data.append('attachments[]', file);
      });

      const response = await publicApi.submitInquiry(data);
      setSubmissionSuccess(response.data);
      setFiles([]);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        source: 'website',
        campaign_tag: '',
        priority: 'normal',
      });
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        alert('Submission failed: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionSuccess) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-3xl shadow-xl border border-slate-200 text-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Inquiry Successfully Submitted!
        </h2>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
          Thank you for reaching out. We have received your inquiry and our team is already reviewing it.
        </p>

        <div className="my-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-sm mx-auto">
          <p className="text-xs uppercase tracking-wider font-bold text-slate-400">
            Your Reference Code
          </p>
          <p className="font-mono text-xl font-extrabold text-blue-600 mt-1 select-all">
            {submissionSuccess.reference_no}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Keep this reference handy if you contact our support team.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setSubmissionSuccess(null)}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Submit Another Inquiry
          </button>
          {onOpenAdminLogin && (
            <button
              onClick={onOpenAdminLogin}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Go to Staff Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-8 p-6 sm:p-10 bg-white rounded-3xl shadow-xl border border-slate-200/80">
      
      {/* Form Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          Lead & Inquiry Intake
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          How can we help your business?
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          Fill out this form with your project requirements or questions. Our team typically responds within 2 hours.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Name & Email Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                className={`w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  errors.name ? 'border-red-500 bg-red-50/30' : 'border-slate-200'
                }`}
              />
            </div>
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jane@company.com"
                className={`w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  errors.email ? 'border-red-500 bg-red-50/30' : 'border-slate-200'
                }`}
              />
            </div>
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>
        </div>

        {/* Phone & Company Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Company / Organization <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Acme Corp"
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Subject / Service Needed <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="e.g. Enterprise Cloud Deployment & Support Inquiry"
            className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              errors.subject ? 'border-red-500 bg-red-50/30' : 'border-slate-200'
            }`}
          />
          {errors.subject && <p className="text-xs text-red-600 mt-1">{errors.subject}</p>}
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Your Message or Project Details <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell us about your requirements, project timeline, budget, or any specific questions..."
            className={`w-full px-3.5 py-3 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              errors.message ? 'border-red-500 bg-red-50/30' : 'border-slate-200'
            }`}
          />
          {errors.message && <p className="text-xs text-red-600 mt-1">{errors.message}</p>}
        </div>

        {/* Lead Source & Priority Selection (Optional) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              How did you find us?
            </label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="website">Website / Direct Search</option>
              <option value="google_ads">Google Search / Ads</option>
              <option value="linkedin">LinkedIn</option>
              <option value="campaign">Online Campaign / Promotion</option>
              <option value="referral">Friend or Colleague Referral</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Urgency / Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="normal">Normal (Standard inquiry)</option>
              <option value="high">High (Active decision within 2 weeks)</option>
              <option value="urgent">Urgent (Immediate project kickoff)</option>
              <option value="low">Low (General exploratory information)</option>
            </select>
          </div>
        </div>

        {/* File Attachments */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Attach Relevant Documents / Specifications <span className="text-slate-400 font-normal">(Max 5 files, up to 10MB each)</span>
          </label>
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-slate-50 transition cursor-pointer relative">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
            <p className="text-xs text-slate-600 font-medium">
              Drag and drop files here, or <span className="text-blue-600 underline">browse files</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Supported formats: PDF, DOC, DOCX, TXT, PNG, JPG, ZIP
            </p>
          </div>

          {files.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate max-w-[160px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="p-0.5 hover:text-red-500 rounded transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            🔒 Your contact details will remain strictly confidential.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Submitting Your Inquiry...' : 'Submit Inquiry'}
          </button>
        </div>
      </form>
    </div>
  );
}
