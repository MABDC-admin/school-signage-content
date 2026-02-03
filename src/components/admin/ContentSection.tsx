import React, { useState } from 'react';
import { useContentItems } from '@/hooks/useSignageData';
import { useAuth } from '@/contexts/AuthContext';
import { ContentItem, ContentType, ContentStatus } from '@/types';
import {
  FileText, Plus, Edit2, Trash2, Eye, CheckCircle, Clock, Archive,
  Megaphone, Calendar, Image, Video, Clock3, Cloud, Code
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const contentTypeIcons: Record<ContentType, React.ElementType> = {
  ANNOUNCEMENT: Megaphone,
  EVENT: Calendar,
  IMAGE: Image,
  VIDEO: Video,
  SCHEDULE: Clock3,
  WEATHER: Cloud,
  HTML_WIDGET: Code,
};

const contentTypeColors: Record<ContentType, string> = {
  ANNOUNCEMENT: 'bg-blue-100 text-blue-700',
  EVENT: 'bg-purple-100 text-purple-700',
  IMAGE: 'bg-green-100 text-green-700',
  VIDEO: 'bg-red-100 text-red-700',
  SCHEDULE: 'bg-yellow-100 text-yellow-700',
  WEATHER: 'bg-cyan-100 text-cyan-700',
  HTML_WIDGET: 'bg-orange-100 text-orange-700',
};

const ContentSection: React.FC = () => {
  const { contentItems, isLoading, createContent, updateContent, deleteContent, publishContent, archiveContent } = useContentItems();
  const { hasPermission, user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [filterType, setFilterType] = useState<ContentType | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<ContentStatus | 'ALL'>('ALL');
  const [formData, setFormData] = useState({
    type: 'ANNOUNCEMENT' as ContentType,
    title: '',
    body: '',
    media_url: '',
    duration_seconds: 10,
    priority: 0,
    start_at: '',
    end_at: '',
  });

  const canEdit = hasPermission('EDITOR');

  const filteredContent = contentItems.filter(item => {
    if (filterType !== 'ALL' && item.type !== filterType) return false;
    if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      start_at: formData.start_at || null,
      end_at: formData.end_at || null,
      created_by: user?.id,
    };

    if (editingContent) {
      const { error } = await updateContent(editingContent.id, data);
      if (error) {
        toast.error('Failed to update content');
        console.error(error);
        return;
      }
      toast.success('Content updated successfully');
    } else {
      const { error } = await createContent(data);
      if (error) {
        toast.error('Failed to create content');
        console.error(error);
        return;
      }
      toast.success('Content created successfully');
    }

    setShowForm(false);
    setEditingContent(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: 'ANNOUNCEMENT',
      title: '',
      body: '',
      media_url: '',
      duration_seconds: 10,
      priority: 0,
      start_at: '',
      end_at: '',
    });
  };

  const handleEdit = (content: ContentItem) => {
    setEditingContent(content);
    setFormData({
      type: content.type,
      title: content.title,
      body: content.body || '',
      media_url: content.media_url || '',
      duration_seconds: content.duration_seconds,
      priority: content.priority,
      start_at: content.start_at ? new Date(content.start_at).toISOString().slice(0, 16) : '',
      end_at: content.end_at ? new Date(content.end_at).toISOString().slice(0, 16) : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
      const { error } = await deleteContent(id);
      if (error) {
        toast.error('Failed to delete content');
        console.error(error);
        return;
      }
      toast.success('Content deleted');
    }
  };

  const handlePublish = async (id: string) => {
    const { error } = await publishContent(id);
    if (error) {
      toast.error('Failed to publish content');
      console.error(error);
      return;
    }
    toast.success('Content published');
  };

  const handleArchive = async (id: string) => {
    const { error } = await archiveContent(id);
    if (error) {
      toast.error('Failed to archive content');
      console.error(error);
      return;
    }
    toast.success('Content archived');
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Content Library</h2>
          <p className="text-sm text-slate-500">Create and manage your digital signage content</p>
        </div>
        {canEdit && (
          <button
            onClick={() => {
              setEditingContent(null);
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Content
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value as ContentType | 'ALL')}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Types</option>
          <option value="ANNOUNCEMENT">Announcements</option>
          <option value="EVENT">Events</option>
          <option value="IMAGE">Images</option>
          <option value="VIDEO">Videos</option>
          <option value="SCHEDULE">Schedules</option>
          <option value="WEATHER">Weather</option>
          <option value="HTML_WIDGET">HTML Widgets</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as ContentStatus | 'ALL')}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 m-4 my-8">
            <h3 className="text-lg font-semibold mb-4">
              {editingContent ? 'Edit Content' : 'Create New Content'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as ContentType }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ANNOUNCEMENT">Announcement</option>
                    <option value="EVENT">Event</option>
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                    <option value="SCHEDULE">Schedule</option>
                    <option value="WEATHER">Weather</option>
                    <option value="HTML_WIDGET">HTML Widget</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={e => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter content title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Body / Description</label>
                <textarea
                  value={formData.body}
                  onChange={e => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
                  placeholder="Enter content body or description"
                />
              </div>

              {(formData.type === 'IMAGE' || formData.type === 'VIDEO') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Media URL</label>
                  <input
                    type="url"
                    value={formData.media_url}
                    onChange={e => setFormData(prev => ({ ...prev, media_url: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/media.jpg"
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duration (seconds)</label>
                  <input
                    type="number"
                    value={formData.duration_seconds}
                    onChange={e => setFormData(prev => ({ ...prev, duration_seconds: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="5"
                    max="300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start At (optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.start_at}
                    onChange={e => setFormData(prev => ({ ...prev, start_at: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End At (optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.end_at}
                    onChange={e => setFormData(prev => ({ ...prev, end_at: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
                  {editingContent ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Content</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Duration</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Priority</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Updated</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredContent.map(item => {
                const TypeIcon = contentTypeIcons[item.type];
                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${contentTypeColors[item.type]}`}>
                          <TypeIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{item.title}</p>
                          <p className="text-sm text-slate-500 truncate max-w-xs">
                            {item.body?.substring(0, 50)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${contentTypeColors[item.type]}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full w-fit ${item.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                          item.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-slate-100 text-slate-600'
                        }`}>
                        {item.status === 'PUBLISHED' && <CheckCircle className="w-3 h-3" />}
                        {item.status === 'DRAFT' && <Clock className="w-3 h-3" />}
                        {item.status === 'ARCHIVED' && <Archive className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.duration_seconds}s</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.priority}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {formatDistanceToNow(new Date(item.updated_at))} ago
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {canEdit && item.status === 'DRAFT' && (
                          <button
                            onClick={() => handlePublish(item.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Publish"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {canEdit && item.status === 'PUBLISHED' && (
                          <button
                            onClick={() => handleArchive(item.id)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Archive"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredContent.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">No content found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentSection;
