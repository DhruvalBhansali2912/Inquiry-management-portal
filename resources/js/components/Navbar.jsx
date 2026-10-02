import React from 'react';
import { 
  Inbox, 
  LayoutDashboard, 
  Calendar, 
  ExternalLink, 
  LogOut, 
  User, 
  Sparkles,
  ShieldAlert,
  Layers
} from 'lucide-react';

export default function Navbar({
  currentView,
  onNavigate,
  currentUser,
  onLogout,
  onOpenPublicForm,
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <div 
              onClick={() => onNavigate(currentUser ? 'dashboard' : 'public_form')}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-tight">
                  Inquiry<span className="text-blue-600">Hub</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block">
                  Lead Portal
                </span>
              </div>
            </div>

            {/* Navigation Links for Authenticated Staff */}
            {currentUser && (
              <nav className="hidden md:flex items-center gap-1 text-sm font-semibold">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
                    currentView === 'dashboard'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>

                <button
                  onClick={() => onNavigate('inquiries')}
                  className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
                    currentView === 'inquiries'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Inbox className="w-4 h-4" />
                  All Inquiries
                </button>

                <button
                  onClick={() => onNavigate('reminders')}
                  className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
                    currentView === 'reminders'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Reminders
                </button>
              </nav>
            )}
          </div>

          {/* Right Header: Public Form Button, User Profile & Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenPublicForm}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                currentView === 'public_form'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Public Inquiry Form</span>
              <span className="sm:hidden">Public Form</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600">
                    {currentUser.role}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Staff Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
