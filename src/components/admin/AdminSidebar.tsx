import React from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  Monitor,
  FileText,
  ListMusic,
  Link2,
  AlertTriangle,
  ClipboardList,
  Settings,
  LogOut,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'EDITOR', 'VIEWER'] },
  { id: 'displays', label: 'Displays', icon: Monitor, roles: ['ADMIN', 'EDITOR', 'VIEWER'] },
  { id: 'content', label: 'Content', icon: FileText, roles: ['ADMIN', 'EDITOR', 'VIEWER'] },
  { id: 'playlists', label: 'Playlists', icon: ListMusic, roles: ['ADMIN', 'EDITOR'] },
  { id: 'assignments', label: 'Assignments', icon: Link2, roles: ['ADMIN', 'EDITOR'] },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle, roles: ['ADMIN'] },
  { id: 'audit', label: 'Audit Log', icon: ClipboardList, roles: ['ADMIN'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['ADMIN'] },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSection,
  onSectionChange,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { user, logout, hasPermission } = useAuth();

  const filteredItems = menuItems.filter(item => 
    item.roles.some(role => hasPermission(role as any))
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-slate-900 text-white transition-all duration-300 z-50 flex flex-col',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg">SignageHub</h1>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {filteredItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-white')} />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="border-t border-slate-700 p-4">
        {!isCollapsed && user && (
          <div className="mb-3">
            <p className="font-medium text-sm truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
            <span className={cn(
              'inline-block mt-1 px-2 py-0.5 text-xs rounded-full',
              user.role === 'ADMIN' && 'bg-red-500/20 text-red-400',
              user.role === 'EDITOR' && 'bg-yellow-500/20 text-yellow-400',
              user.role === 'VIEWER' && 'bg-green-500/20 text-green-400'
            )}>
              {user.role}
            </span>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
