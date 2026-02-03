import React, { useState } from 'react';
import { useDisplays } from '@/hooks/useSignageData';
import { useAuth } from '@/contexts/AuthContext';
import { Display } from '@/types';
import {
  Monitor, Plus, Edit2, Trash2, RefreshCw, Copy, ExternalLink,
  MapPin, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const DisplaysSection: React.FC = () => {
  const { displays, isLoading, createDisplay, updateDisplay, deleteDisplay, rotateSecretKey } = useDisplays();
  const { hasPermission } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingDisplay, setEditingDisplay] = useState<Display | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    timezone: 'America/New_York',
    theme_color: '#1e40af',
  });

  const canEdit = hasPermission('EDITOR');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingDisplay) {
      const { error } = await updateDisplay(editingDisplay.id, formData);
      if (error) {
        toast.error('Failed to update display');
        console.error(error);
        return;
      }
      toast.success('Display updated successfully');
    } else {
      const { error } = await createDisplay(formData);
      if (error) {
        toast.error('Failed to create display');
        console.error(error);
        return;
      }
      toast.success('Display created successfully');
    }

    setShowForm(false);
    setEditingDisplay(null);
    setFormData({ name: '', location: '', timezone: 'America/New_York', theme_color: '#1e40af' });
  };

  const handleEdit = (display: Display) => {
    setEditingDisplay(display);
    setFormData({
      name: display.name,
      location: display.location || '',
      timezone: display.timezone,
      theme_color: display.theme_color,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this display?')) {
      const { error } = await deleteDisplay(id);
      if (error) {
        toast.error('Failed to delete display');
        console.error(error);
        return;
      }
      toast.success('Display deleted');
    }
  };

  const handleRotateKey = async (id: string) => {
    if (confirm('Rotate secret key? The current player URL will stop working.')) {
      const { error } = await rotateSecretKey(id);
      if (error) {
        toast.error('Failed to rotate secret key');
        console.error(error);
        return;
      }
      toast.success('Secret key rotated');
    }
  };

  const copyPlayerUrl = (display: Display) => {
    const url = `${window.location.origin}/player/${display.id}?key=${display.secret_key}`;
    navigator.clipboard.writeText(url);
    toast.success('Player URL copied to clipboard');
  };

  const isOnline = (display: Display) => {
    if (!display.last_seen_at) return false;
    return new Date(display.last_seen_at) > new Date(Date.now() - 5 * 60 * 1000);
  };

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
          <h2 className="text-lg font-semibold text-slate-900">Displays</h2>
          <p className="text-sm text-slate-500">Manage your TV screens and digital displays</p>
        </div>
        {canEdit && (
          <button
            onClick={() => {
              setEditingDisplay(null);
              setFormData({ name: '', location: '', timezone: 'America/New_York', theme_color: '#1e40af' });
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Display
          </button>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingDisplay ? 'Edit Display' : 'Add New Display'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Main Lobby TV"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Building A - Main Entrance"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
                <select
                  value={formData.timezone}
                  onChange={e => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Theme Color</label>
                <input
                  type="color"
                  value={formData.theme_color}
                  onChange={e => setFormData(prev => ({ ...prev, theme_color: e.target.value }))}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingDisplay ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Displays Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displays.map(display => (
          <div
            key={display.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
          >
            {/* Header with status */}
            <div
              className="p-4 text-white"
              style={{ backgroundColor: display.theme_color }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  <span className="font-semibold">{display.name}</span>
                </div>
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${isOnline(display)
                    ? 'bg-white/20 text-white'
                    : 'bg-black/20 text-white/80'
                  }`}>
                  {isOnline(display) ? (
                    <><CheckCircle className="w-3 h-3" /> Online</>
                  ) : (
                    <><XCircle className="w-3 h-3" /> Offline</>
                  )}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{display.location || 'No location set'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>
                  {display.last_seen_at
                    ? `Last seen ${formatDistanceToNow(new Date(display.last_seen_at))} ago`
                    : 'Never connected'}
                </span>
              </div>

              {/* Secret Key */}
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Secret Key</p>
                <code className="text-xs text-slate-700 font-mono break-all">
                  {display.secret_key.substring(0, 12)}...
                </code>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => copyPlayerUrl(display)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy URL
                </button>
                <a
                  href={`/player/${display.id}?key=${display.secret_key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Preview
                </a>
                {canEdit && (
                  <>
                    <button
                      onClick={() => handleRotateKey(display.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Rotate Key
                    </button>
                    <button
                      onClick={() => handleEdit(display)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(display.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {displays.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <Monitor className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">No displays configured yet</p>
          {canEdit && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Display
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DisplaysSection;
