import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardOverview from './components/DashboardOverview';
import InquiryFilters from './components/InquiryFilters';
import InquiryTable from './components/InquiryTable';
import InquiryDetailModal from './components/InquiryDetailModal';
import PublicInquiryForm from './components/PublicInquiryForm';
import AdminLogin from './components/AdminLogin';
import RemindersView from './components/RemindersView';
import { 
  inquiriesApi, 
  dashboardApi, 
  authApi 
} from './api';

export default function MainApp() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('inquiry_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Views: 'dashboard', 'inquiries', 'reminders', 'public_form', 'login'
  const [currentView, setCurrentView] = useState(() => {
    const token = localStorage.getItem('inquiry_auth_token');
    return token ? 'dashboard' : 'public_form';
  });

  // Inquiries State
  const [inquiries, setInquiries] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);
  const [selectedInquiryId, setSelectedInquiryId] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  // Dashboard Metrics State
  const [metricsData, setMetricsData] = useState(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    source: 'all',
    assigned_to: 'all',
    start_date: '',
    end_date: '',
    sort_by: 'created_at',
    order: 'desc',
    page: 1,
  });

  // Listen for unauthorized events
  useEffect(() => {
    const handleUnauthorized = () => {
      setCurrentUser(null);
      setCurrentView('login');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Fetch Team Members if logged in
  const fetchTeam = async () => {
    if (!currentUser) return;
    try {
      const res = await authApi.getTeam();
      setTeamMembers(res.data.data || []);
    } catch (err) {
      console.error('Failed to load team', err);
    }
  };

  // Fetch Dashboard Metrics
  const fetchMetrics = async () => {
    if (!currentUser) return;
    try {
      setIsLoadingMetrics(true);
      const res = await dashboardApi.getMetrics();
      setMetricsData(res.data);
    } catch (err) {
      console.error('Failed to load metrics', err);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  // Fetch Inquiries List
  const fetchInquiries = async () => {
    if (!currentUser) return;
    try {
      setIsLoadingInquiries(true);
      const res = await inquiriesApi.getAll(filters);
      setInquiries(res.data.data || []);
      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
        from: res.data.from,
        to: res.data.to,
      });
    } catch (err) {
      console.error('Failed to load inquiries', err);
    } finally {
      setIsLoadingInquiries(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchTeam();
      fetchMetrics();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && currentView === 'inquiries') {
      fetchInquiries();
    }
  }, [filters, currentUser, currentView]);

  const handleQuickStatusChange = async (inquiryId, newStatus) => {
    try {
      await inquiriesApi.updateStatus(inquiryId, { status: newStatus });
      fetchInquiries();
      fetchMetrics();
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const response = await inquiriesApi.exportCsv(filters);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('CSV Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      priority: 'all',
      source: 'all',
      assigned_to: 'all',
      start_date: '',
      end_date: '',
      sort_by: 'created_at',
      order: 'desc',
      page: 1,
    });
  };

  const handleFilterStatusFromCard = (statusKey) => {
    setFilters((prev) => ({ ...prev, status: statusKey, page: 1 }));
    setCurrentView('inquiries');
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('inquiry_auth_token');
      localStorage.removeItem('inquiry_auth_user');
      setCurrentUser(null);
      setCurrentView('public_form');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenPublicForm={() => setCurrentView('public_form')}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* View 1: Public Inquiry Form */}
        {currentView === 'public_form' && (
          <PublicInquiryForm onOpenAdminLogin={() => setCurrentView('login')} />
        )}

        {/* View 2: Admin Login */}
        {currentView === 'login' && (
          <AdminLogin
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setCurrentView('dashboard');
            }}
            onCancel={() => setCurrentView('public_form')}
          />
        )}

        {/* View 3: Dashboard Overview */}
        {currentView === 'dashboard' && currentUser && (
          <DashboardOverview
            metricsData={metricsData}
            onNavigate={setCurrentView}
            onSelectInquiry={(id) => setSelectedInquiryId(id)}
            onFilterStatus={handleFilterStatusFromCard}
          />
        )}

        {/* View 4: All Inquiries with search, filters & table */}
        {currentView === 'inquiries' && currentUser && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Inquiry Registry & Leads
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Filter, manage, assign, and update lead status through conversion
                </p>
              </div>
            </div>

            <InquiryFilters
              filters={filters}
              onChange={setFilters}
              onReset={handleResetFilters}
              onExportCsv={handleExportCsv}
              teamMembers={teamMembers}
              isExporting={isExporting}
            />

            <InquiryTable
              inquiries={inquiries}
              pagination={pagination}
              isLoading={isLoadingInquiries}
              onSelectInquiry={(id) => setSelectedInquiryId(id)}
              onQuickStatusChange={handleQuickStatusChange}
              onPageChange={(page) => setFilters({ ...filters, page })}
              onSortChange={(field, direction) => setFilters({ ...filters, sort_by: field, order: direction })}
              currentSort={{ field: filters.sort_by, direction: filters.order }}
            />
          </div>
        )}

        {/* View 5: Reminders & Tasks */}
        {currentView === 'reminders' && currentUser && (
          <RemindersView onSelectInquiry={(id) => setSelectedInquiryId(id)} />
        )}
      </main>

      {/* Inquiry Detail Modal */}
      {selectedInquiryId && (
        <InquiryDetailModal
          inquiryId={selectedInquiryId}
          onClose={() => setSelectedInquiryId(null)}
          onStatusUpdated={() => {
            fetchInquiries();
            fetchMetrics();
          }}
          onInquiryDeleted={() => {
            fetchInquiries();
            fetchMetrics();
          }}
          teamMembers={teamMembers}
          currentUser={currentUser}
        />
      )}

      {/* Modern Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6 text-center text-xs text-slate-400">
        <p>Inquiry Management Portal &bull; Enterprise Lead Capture & Follow-up Tracking System</p>
      </footer>
    </div>
  );
}
