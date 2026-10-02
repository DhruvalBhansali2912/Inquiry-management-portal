import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import { authApi } from '../api';

export default function AdminLogin({ onLoginSuccess, onCancel }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem('inquiry_auth_token', res.data.token);
      localStorage.setItem('inquiry_auth_user', JSON.stringify(res.data.user));
      if (onLoginSuccess) {
        onLoginSuccess(res.data.user);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Invalid email or password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Staff Portal Login</h2>
        <p className="text-xs text-slate-500 mt-1">
          Access the inquiry management dashboard and lead tracker
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
          {errorMessage}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@inquiry.local"
              required
              className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? 'Signing In...' : 'Sign In to Portal'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Demo Credentials Section */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
          Quick Demo Accounts (1-Click Fill)
        </p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleDemoLogin('admin@inquiry.local', 'Password123!')}
            className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition flex items-center justify-between text-xs"
          >
            <div>
              <span className="font-bold text-slate-800">Sarah Connor</span>
              <span className="ml-2 px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold uppercase">
                Admin
              </span>
              <p className="text-slate-400 text-[11px]">admin@inquiry.local</p>
            </div>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('manager@inquiry.local', 'Password123!')}
            className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition flex items-center justify-between text-xs"
          >
            <div>
              <span className="font-bold text-slate-800">Michael Scott</span>
              <span className="ml-2 px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase">
                Manager
              </span>
              <p className="text-slate-400 text-[11px]">manager@inquiry.local</p>
            </div>
            <UserCheck className="w-4 h-4 text-indigo-600" />
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('agent@inquiry.local', 'Password123!')}
            className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition flex items-center justify-between text-xs"
          >
            <div>
              <span className="font-bold text-slate-800">Jim Halpert</span>
              <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold uppercase">
                Agent
              </span>
              <p className="text-slate-400 text-[11px]">agent@inquiry.local</p>
            </div>
            <UserCheck className="w-4 h-4 text-amber-600" />
          </button>
        </div>

        {onCancel && (
          <div className="mt-4 text-center">
            <button
              onClick={onCancel}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Back to Public Form
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
