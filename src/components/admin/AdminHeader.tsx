import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Search, ExternalLink } from 'lucide-react';
import { useAlerts } from '@/hooks/useSignageData';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle }) => {
  const { user } = useAuth();
  const { alerts } = useAlerts();
  
  const activeAlerts = alerts.filter(a => a.is_active);
  const hasEmergency = activeAlerts.some(a => a.level === 'EMERGENCY');

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-slate-100 border-0 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all w-64"
            />
          </div>

          {/* Preview Player Link */}
          <a
            href="/player/10000000-0000-0000-0000-000000000001?key=lobby-secret-key-123"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Preview Player</span>
          </a>

          {/* Alerts indicator */}
          <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            {activeAlerts.length > 0 && (
              <span className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full ${hasEmergency ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`} />
            )}
          </button>

          {/* User avatar */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
