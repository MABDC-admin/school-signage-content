import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import DashboardSection from './DashboardSection';
import DisplaysSection from './DisplaysSection';
import ContentSection from './ContentSection';
import PlaylistsSection from './PlaylistsSection';
import AssignmentsSection from './AssignmentsSection';
import AlertsSection from './AlertsSection';
import AuditSection from './AuditSection';
import SettingsSection from './SettingsSection';
import LoginScreen from './LoginScreen';
import { cn } from '@/lib/utils';

const sectionTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of your digital signage system' },
  displays: { title: 'Displays', subtitle: 'Manage TV screens and digital displays' },
  content: { title: 'Content Library', subtitle: 'Create and manage content items' },
  playlists: { title: 'Playlists', subtitle: 'Organize content into playlists' },
  assignments: { title: 'Assignments', subtitle: 'Connect playlists to displays' },
  alerts: { title: 'Emergency Alerts', subtitle: 'Manage global alert broadcasts' },
  audit: { title: 'Audit Log', subtitle: 'Track system changes and actions' },
  settings: { title: 'Settings', subtitle: 'Configure global settings' },
};

const AdminDashboard: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection />;
      case 'displays':
        return <DisplaysSection />;
      case 'content':
        return <ContentSection />;
      case 'playlists':
        return <PlaylistsSection />;
      case 'assignments':
        return <AssignmentsSection />;
      case 'alerts':
        return <AlertsSection />;
      case 'audit':
        return <AuditSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <DashboardSection />;
    }
  };

  const currentSection = sectionTitles[activeSection] || sectionTitles.dashboard;

  return (
    <div className="min-h-screen bg-slate-100">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className={cn(
        'transition-all duration-300',
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      )}>
        <AdminHeader title={currentSection.title} subtitle={currentSection.subtitle} />
        
        <div className="p-6">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
