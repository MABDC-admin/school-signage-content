import React from 'react';
import { useDisplays, useContentItems, usePlaylists, useAlerts } from '@/hooks/useSignageData';
import { Monitor, FileText, ListMusic, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const DashboardSection: React.FC = () => {
  const { displays } = useDisplays();
  const { contentItems } = useContentItems();
  const { playlists } = usePlaylists();
  const { alerts } = useAlerts();

  const activeDisplays = displays.filter(d => {
    if (!d.last_seen_at) return false;
    const lastSeen = new Date(d.last_seen_at);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastSeen > fiveMinutesAgo;
  });

  const publishedContent = contentItems.filter(c => c.status === 'PUBLISHED');
  const draftContent = contentItems.filter(c => c.status === 'DRAFT');
  const activeAlerts = alerts.filter(a => a.is_active);

  const stats = [
    {
      label: 'Active Displays',
      value: activeDisplays.length,
      total: displays.length,
      icon: Monitor,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Published Content',
      value: publishedContent.length,
      total: contentItems.length,
      icon: FileText,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Playlists',
      value: playlists.length,
      total: playlists.length,
      icon: ListMusic,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Active Alerts',
      value: activeAlerts.length,
      total: alerts.length,
      icon: AlertTriangle,
      color: activeAlerts.some(a => a.level === 'EMERGENCY') ? 'bg-red-500' : 'bg-yellow-500',
      bgColor: activeAlerts.some(a => a.level === 'EMERGENCY') ? 'bg-red-50' : 'bg-yellow-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {stat.value}
                    <span className="text-lg text-slate-400 font-normal">/{stat.total}</span>
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Display Status Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Display Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displays.map(display => {
            const isOnline = display.last_seen_at && 
              new Date(display.last_seen_at) > new Date(Date.now() - 5 * 60 * 1000);
            
            return (
              <div
                key={display.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isOnline 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className={`w-5 h-5 ${isOnline ? 'text-green-600' : 'text-slate-400'}`} />
                    <span className="font-medium text-slate-900">{display.name}</span>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-slate-300'}`} />
                </div>
                <p className="text-sm text-slate-500 mt-1">{display.location}</p>
                <p className="text-xs text-slate-400 mt-2">
                  {display.last_seen_at 
                    ? `Last seen ${formatDistanceToNow(new Date(display.last_seen_at))} ago`
                    : 'Never connected'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Content & Active Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Content</h2>
          <div className="space-y-3">
            {contentItems.slice(0, 5).map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className={`p-2 rounded-lg ${
                  item.status === 'PUBLISHED' ? 'bg-green-100' : 
                  item.status === 'DRAFT' ? 'bg-yellow-100' : 'bg-slate-100'
                }`}>
                  {item.status === 'PUBLISHED' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : item.status === 'DRAFT' ? (
                    <Clock className="w-4 h-4 text-yellow-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.type}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                  item.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Alerts</h2>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No alerts configured</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 5).map(alert => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.level === 'EMERGENCY' 
                      ? 'bg-red-50 border-red-500' 
                      : alert.level === 'WARNING'
                      ? 'bg-yellow-50 border-yellow-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">{alert.title}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      alert.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {alert.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardSection;
