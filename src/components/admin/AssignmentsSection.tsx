import React, { useState } from 'react';
import { useDisplayAssignments, useDisplays, usePlaylists } from '@/hooks/useSignageData';
import { useAuth } from '@/contexts/AuthContext';
import { DisplayAssignment, LayoutPreset } from '@/types';
import { Link2, Plus, Edit2, Trash2, Monitor, ListMusic, Layout } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const layoutOptions: { value: LayoutPreset; label: string; description: string }[] = [
  { value: 'fullscreen', label: 'Fullscreen', description: 'Single content fills the entire screen' },
  { value: 'grid', label: 'Grid Layout', description: 'Multiple content items in a grid' },
  { value: 'ticker', label: 'Ticker', description: 'Slideshow with bottom news ticker' },
];

const AssignmentsSection: React.FC = () => {
  const { assignments, isLoading, createAssignment, updateAssignment, deleteAssignment } = useDisplayAssignments();
  const { displays } = useDisplays();
  const { playlists } = usePlaylists();
  const { hasPermission } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<DisplayAssignment | null>(null);
  const [formData, setFormData] = useState({
    display_id: '',
    playlist_id: '',
    layout_preset: 'fullscreen' as LayoutPreset,
    is_active: true,
    active_from: '',
    active_to: '',
  });

  const canEdit = hasPermission('EDITOR');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      active_from: formData.active_from || null,
      active_to: formData.active_to || null,
    };

    if (editingAssignment) {
      const { error } = await updateAssignment(editingAssignment.id, data);
      if (error) {
        toast.error('Failed to update assignment');
        console.error(error);
        return;
      }
      toast.success('Assignment updated');
    } else {
      const { error } = await createAssignment(data);
      if (error) {
        toast.error('Failed to create assignment');
        console.error(error);
        return;
      }
      toast.success('Assignment created');
    }

    setShowForm(false);
    setEditingAssignment(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      display_id: '',
      playlist_id: '',
      layout_preset: 'fullscreen',
      is_active: true,
      active_from: '',
      active_to: '',
    });
  };

  const handleEdit = (assignment: DisplayAssignment) => {
    setEditingAssignment(assignment);
    setFormData({
      display_id: assignment.display_id,
      playlist_id: assignment.playlist_id,
      layout_preset: assignment.layout_preset,
      is_active: assignment.is_active,
      active_from: assignment.active_from ? new Date(assignment.active_from).toISOString().slice(0, 16) : '',
      active_to: assignment.active_to ? new Date(assignment.active_to).toISOString().slice(0, 16) : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this assignment?')) {
      const { error } = await deleteAssignment(id);
      if (error) {
        toast.error('Failed to delete assignment');
        console.error(error);
        return;
      }
      toast.success('Assignment deleted');
    }
  };

  const toggleActive = async (assignment: DisplayAssignment) => {
    const { error } = await updateAssignment(assignment.id, { is_active: !assignment.is_active });
    if (error) {
      toast.error('Failed to toggle assignment status');
      console.error(error);
      return;
    }
    toast.success(assignment.is_active ? 'Assignment deactivated' : 'Assignment activated');
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
          <h2 className="text-lg font-semibold text-slate-900">Display Assignments</h2>
          <p className="text-sm text-slate-500">Connect playlists to your displays</p>
        </div>
        {canEdit && (
          <button
            onClick={() => {
              setEditingAssignment(null);
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Assignment
          </button>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 m-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingAssignment ? 'Edit Assignment' : 'Create Assignment'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Display</label>
                <select
                  value={formData.display_id}
                  onChange={e => setFormData(prev => ({ ...prev, display_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a display...</option>
                  {displays.map(display => (
                    <option key={display.id} value={display.id}>
                      {display.name} ({display.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Playlist</label>
                <select
                  value={formData.playlist_id}
                  onChange={e => setFormData(prev => ({ ...prev, playlist_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a playlist...</option>
                  {playlists.map(playlist => (
                    <option key={playlist.id} value={playlist.id}>
                      {playlist.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Layout Preset</label>
                <div className="grid grid-cols-3 gap-3">
                  {layoutOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, layout_preset: option.value }))}
                      className={`p-3 border-2 rounded-lg text-center transition-all ${formData.layout_preset === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <Layout className={`w-6 h-6 mx-auto mb-1 ${formData.layout_preset === option.value ? 'text-blue-600' : 'text-slate-400'
                        }`} />
                      <p className="text-sm font-medium">{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Active From</label>
                  <input
                    type="datetime-local"
                    value={formData.active_from}
                    onChange={e => setFormData(prev => ({ ...prev, active_from: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Active To</label>
                  <input
                    type="datetime-local"
                    value={formData.active_to}
                    onChange={e => setFormData(prev => ({ ...prev, active_to: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={e => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm text-slate-700">Active immediately</label>
              </div>

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
                  {editingAssignment ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map(assignment => (
          <div
            key={assignment.id}
            className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all ${assignment.is_active ? 'border-green-200' : 'border-slate-200'
              }`}
          >
            <div className={`p-4 ${assignment.is_active ? 'bg-green-50' : 'bg-slate-50'}`}>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 text-xs rounded-full ${assignment.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                  {assignment.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full capitalize">
                  {assignment.layout_preset}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Display */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Monitor className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Display</p>
                  <p className="font-medium text-slate-900">{assignment.display?.name || 'Unknown'}</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <Link2 className="w-5 h-5 text-slate-300 rotate-90" />
              </div>

              {/* Playlist */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ListMusic className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Playlist</p>
                  <p className="font-medium text-slate-900">{assignment.playlist?.name || 'Unknown'}</p>
                </div>
              </div>

              {/* Schedule */}
              {(assignment.active_from || assignment.active_to) && (
                <div className="p-3 bg-slate-50 rounded-lg text-sm">
                  <p className="text-slate-500">
                    {assignment.active_from && `From: ${new Date(assignment.active_from).toLocaleString()}`}
                  </p>
                  <p className="text-slate-500">
                    {assignment.active_to && `To: ${new Date(assignment.active_to).toLocaleString()}`}
                  </p>
                </div>
              )}

              {/* Actions */}
              {canEdit && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => toggleActive(assignment)}
                    className={`flex-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${assignment.is_active
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                  >
                    {assignment.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleEdit(assignment)}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(assignment.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <Link2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">No assignments configured</p>
          {canEdit && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Assignment
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignmentsSection;
