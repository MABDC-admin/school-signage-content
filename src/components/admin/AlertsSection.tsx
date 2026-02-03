import React, { useState } from 'react';
import { useAlerts } from '@/hooks/useSignageData';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertLevel } from '@/types';
import {
  AlertTriangle, Plus, Edit2, Trash2, Power, PowerOff,
  Info, AlertCircle, Siren
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const alertLevelConfig: Record<AlertLevel, {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  INFO: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500'
  },
  WARNING: {
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-500'
  },
  EMERGENCY: {
    icon: Siren,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500'
  },
};

const AlertsSection: React.FC = () => {
  const { alerts, isLoading, createAlert, updateAlert, deleteAlert, activateAlert, deactivateAlert } = useAlerts();
  const { hasPermission, user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    level: 'INFO' as AlertLevel,
    starts_at: '',
    ends_at: '',
  });

  const canEdit = hasPermission('ADMIN');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      starts_at: formData.starts_at || new Date().toISOString(),
      ends_at: formData.ends_at || null,
      created_by: user?.id,
    };

    if (editingAlert) {
      const { error } = await updateAlert(editingAlert.id, data);
      if (error) {
        toast.error('Failed to update alert');
        console.error(error);
        return;
      }
      toast.success('Alert updated');
    } else {
      const { error } = await createAlert(data);
      if (error) {
        toast.error('Failed to create alert');
        console.error(error);
        return;
      }
      toast.success('Alert created');
    }

    setShowForm(false);
    setEditingAlert(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      level: 'INFO',
      starts_at: '',
      ends_at: '',
    });
  };

  const handleEdit = (alert: Alert) => {
    setEditingAlert(alert);
    setFormData({
      title: alert.title,
      message: alert.message,
      level: alert.level,
      starts_at: alert.starts_at ? new Date(alert.starts_at).toISOString().slice(0, 16) : '',
      ends_at: alert.ends_at ? new Date(alert.ends_at).toISOString().slice(0, 16) : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this alert?')) {
      const { error } = await deleteAlert(id);
      if (error) {
        toast.error('Failed to delete alert');
        console.error(error);
        return;
      }
      toast.success('Alert deleted');
    }
  };

  const handleToggleActive = async (alert: Alert) => {
    if (alert.is_active) {
      const { error } = await deactivateAlert(alert.id);
      if (error) {
        toast.error('Failed to deactivate alert');
        console.error(error);
        return;
      }
      toast.success('Alert deactivated');
    } else {
      // Warn about emergency alerts
      if (alert.level === 'EMERGENCY') {
        if (!confirm('This will broadcast an EMERGENCY alert to ALL displays immediately. Continue?')) {
          return;
        }
      }
      const { error } = await activateAlert(alert.id);
      if (error) {
        toast.error('Failed to activate alert');
        console.error(error);
        return;
      }
      toast.success('Alert activated - now showing on all displays');
    }
  };

  const activeAlerts = alerts.filter(a => a.is_active);
  const inactiveAlerts = alerts.filter(a => !a.is_active);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Emergency Alerts</h2>
          <p className="text-sm text-slate-500">Manage alerts that override all display content</p>
        </div>
        {canEdit && (
          <button
            onClick={() => {
              setEditingAlert(null);
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Alert
          </button>
        )}
      </div>

      {/* Active Alerts Warning */}
      {activeAlerts.length > 0 && (
        <div className="p-4 bg-red-100 border-2 border-red-300 rounded-xl">
          <div className="flex items-center gap-3">
            <Siren className="w-6 h-6 text-red-600 animate-pulse" />
            <div>
              <p className="font-semibold text-red-800">
                {activeAlerts.length} Active Alert{activeAlerts.length > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-red-600">
                These alerts are currently displayed on all screens
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 m-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingAlert ? 'Edit Alert' : 'Create Alert'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Fire Drill"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea
                  value={formData.message}
                  onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
                  placeholder="Enter the alert message..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Alert Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['INFO', 'WARNING', 'EMERGENCY'] as AlertLevel[]).map(level => {
                    const config = alertLevelConfig[level];
                    const Icon = config.icon;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, level }))}
                        className={`p-3 border-2 rounded-lg text-center transition-all ${formData.level === level
                            ? `${config.borderColor} ${config.bgColor}`
                            : 'border-slate-200 hover:border-slate-300'
                          }`}
                      >
                        <Icon className={`w-6 h-6 mx-auto mb-1 ${config.color}`} />
                        <p className="text-sm font-medium">{level}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Starts At</label>
                  <input
                    type="datetime-local"
                    value={formData.starts_at}
                    onChange={e => setFormData(prev => ({ ...prev, starts_at: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ends At</label>
                  <input
                    type="datetime-local"
                    value={formData.ends_at}
                    onChange={e => setFormData(prev => ({ ...prev, ends_at: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {formData.level === 'EMERGENCY' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    <strong>Warning:</strong> Emergency alerts will immediately override all content on every display.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingAlert ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-slate-900">Active Alerts</h3>
          <div className="space-y-4">
            {activeAlerts.map(alert => {
              const config = alertLevelConfig[alert.level];
              const Icon = config.icon;
              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border-l-4 ${config.bgColor} ${config.borderColor}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Icon className={`w-6 h-6 ${config.color} mt-0.5`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900">{alert.title}</h4>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${alert.level === 'EMERGENCY' ? 'bg-red-200 text-red-800' :
                              alert.level === 'WARNING' ? 'bg-yellow-200 text-yellow-800' :
                                'bg-blue-200 text-blue-800'
                            }`}>
                            {alert.level}
                          </span>
                          <span className="px-2 py-0.5 text-xs bg-green-200 text-green-800 rounded-full animate-pulse">
                            LIVE
                          </span>
                        </div>
                        <p className="text-slate-700 mt-1">{alert.message}</p>
                        <p className="text-sm text-slate-500 mt-2">
                          Started {formatDistanceToNow(new Date(alert.starts_at))} ago
                        </p>
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(alert)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                        >
                          <PowerOff className="w-4 h-4" />
                          Deactivate
                        </button>
                        <button
                          onClick={() => handleEdit(alert)}
                          className="p-1.5 text-slate-600 hover:bg-white/50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inactive Alerts */}
      <div className="space-y-4">
        <h3 className="font-medium text-slate-900">All Alerts</h3>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Alert</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Level</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Created</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {alerts.map(alert => {
                const config = alertLevelConfig[alert.level];
                const Icon = config.icon;
                return (
                  <tr key={alert.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config.bgColor}`}>
                          <Icon className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{alert.title}</p>
                          <p className="text-sm text-slate-500 truncate max-w-xs">{alert.message}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${alert.level === 'EMERGENCY' ? 'bg-red-100 text-red-700' :
                          alert.level === 'WARNING' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                        }`}>
                        {alert.level}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${alert.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                        {alert.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {formatDistanceToNow(new Date(alert.created_at))} ago
                    </td>
                    <td className="px-4 py-3">
                      {canEdit && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleActive(alert)}
                            className={`p-1.5 rounded-lg transition-colors ${alert.is_active
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                              }`}
                            title={alert.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {alert.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleEdit(alert)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(alert.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {alerts.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No alerts configured</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsSection;
