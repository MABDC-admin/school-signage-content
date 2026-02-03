import React, { useState } from 'react';
import { usePlaylists, usePlaylistItems, useContentItems } from '@/hooks/useSignageData';
import { useAuth } from '@/contexts/AuthContext';
import { Playlist, ContentItem } from '@/types';
import {
  ListMusic, Plus, Edit2, Trash2, GripVertical, X, ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const PlaylistsSection: React.FC = () => {
  const { playlists, isLoading, createPlaylist, updatePlaylist, deletePlaylist } = usePlaylists();
  const { contentItems } = useContentItems();
  const { hasPermission, user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const canEdit = hasPermission('EDITOR');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPlaylist) {
      const { error } = await updatePlaylist(editingPlaylist.id, formData);
      if (error) {
        toast.error('Failed to update playlist');
        console.error(error);
        return;
      }
      toast.success('Playlist updated');
    } else {
      const { error } = await createPlaylist({ ...formData, created_by: user?.id });
      if (error) {
        toast.error('Failed to create playlist');
        console.error(error);
        return;
      }
      toast.success('Playlist created');
    }

    setShowForm(false);
    setEditingPlaylist(null);
    setFormData({ name: '', description: '' });
  };

  const handleEdit = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setFormData({ name: playlist.name, description: playlist.description || '' });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this playlist? This will also remove all assignments.')) {
      const { error } = await deletePlaylist(id);
      if (error) {
        toast.error('Failed to delete playlist');
        console.error(error);
        return;
      }
      if (selectedPlaylist?.id === id) setSelectedPlaylist(null);
      toast.success('Playlist deleted');
    }
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
          <h2 className="text-lg font-semibold text-slate-900">Playlists</h2>
          <p className="text-sm text-slate-500">Organize content into playlists for your displays</p>
        </div>
        {canEdit && (
          <button
            onClick={() => {
              setEditingPlaylist(null);
              setFormData({ name: '', description: '' });
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Playlist
          </button>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingPlaylist ? 'Edit Playlist' : 'Create Playlist'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Morning Announcements"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
                  placeholder="Describe this playlist..."
                />
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
                  {editingPlaylist ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Playlists List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-medium text-slate-900">All Playlists</h3>
          </div>
          <div className="divide-y divide-slate-200">
            {playlists.map(playlist => (
              <div
                key={playlist.id}
                className={`p-4 cursor-pointer transition-colors ${selectedPlaylist?.id === playlist.id
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : 'hover:bg-slate-50'
                  }`}
                onClick={() => setSelectedPlaylist(playlist)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <ListMusic className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{playlist.name}</p>
                      <p className="text-sm text-slate-500">
                        Created {formatDistanceToNow(new Date(playlist.created_at))} ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canEdit && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(playlist); }}
                          className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(playlist.id); }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
                {playlist.description && (
                  <p className="text-sm text-slate-500 mt-2 ml-12">{playlist.description}</p>
                )}
              </div>
            ))}

            {playlists.length === 0 && (
              <div className="p-8 text-center">
                <ListMusic className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">No playlists yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Playlist Items Editor */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          {selectedPlaylist ? (
            <PlaylistItemsEditor
              playlist={selectedPlaylist}
              contentItems={contentItems.filter(c => c.status === 'PUBLISHED')}
              canEdit={canEdit}
            />
          ) : (
            <div className="p-8 text-center">
              <ListMusic className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">Select a playlist to manage its content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Playlist Items Editor Component
interface PlaylistItemsEditorProps {
  playlist: Playlist;
  contentItems: ContentItem[];
  canEdit: boolean;
}

const PlaylistItemsEditor: React.FC<PlaylistItemsEditorProps> = ({ playlist, contentItems, canEdit }) => {
  const { items, addItem, removeItem, reorderItems } = usePlaylistItems(playlist.id);
  const [showAddContent, setShowAddContent] = useState(false);

  const availableContent = contentItems.filter(
    c => !items.some(i => i.content_item_id === c.id)
  );

  const handleAddContent = async (contentId: string) => {
    const { error } = await addItem(contentId, items.length);
    if (error) {
      toast.error('Failed to add content to playlist');
      console.error(error);
      return;
    }
    toast.success('Content added to playlist');
    setShowAddContent(false);
  };

  const handleRemoveItem = async (itemId: string) => {
    const { error } = await removeItem(itemId);
    if (error) {
      toast.error('Failed to remove content from playlist');
      console.error(error);
      return;
    }
    toast.success('Content removed from playlist');
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    await reorderItems(newItems.map(i => i.id));
  };

  return (
    <>
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="font-medium text-slate-900">{playlist.name}</h3>
          <p className="text-sm text-slate-500">{items.length} items</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowAddContent(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Content
          </button>
        )}
      </div>

      {/* Add Content Modal */}
      {showAddContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 m-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Content to Playlist</h3>
              <button onClick={() => setShowAddContent(false)} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {availableContent.map(content => (
                <button
                  key={content.id}
                  onClick={() => handleAddContent(content.id)}
                  className="w-full p-3 text-left bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <p className="font-medium text-slate-900">{content.title}</p>
                  <p className="text-sm text-slate-500">{content.type} • {content.duration_seconds}s</p>
                </button>
              ))}
              {availableContent.length === 0 && (
                <p className="text-center text-slate-500 py-4">No available content to add</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="divide-y divide-slate-200">
        {items.map((item, index) => (
          <div key={item.id} className="p-4 flex items-center gap-3">
            <div className="flex flex-col gap-1">
              <button
                onClick={() => moveItem(index, 'up')}
                disabled={index === 0}
                className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
              >
                <GripVertical className="w-4 h-4 text-slate-400 rotate-180" />
              </button>
              <button
                onClick={() => moveItem(index, 'down')}
                disabled={index === items.length - 1}
                className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
              >
                <GripVertical className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <span className="w-6 h-6 flex items-center justify-center bg-slate-200 rounded-full text-xs font-medium">
              {index + 1}
            </span>
            <div className="flex-1">
              <p className="font-medium text-slate-900">{item.content_item?.title}</p>
              <p className="text-sm text-slate-500">
                {item.content_item?.type} • {item.content_item?.duration_seconds}s
              </p>
            </div>
            {canEdit && (
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        {items.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-slate-500">No content in this playlist</p>
          </div>
        )}
      </div>
    </>
  );
};

export default PlaylistsSection;
