import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Display, ContentItem, Playlist, PlaylistItem, DisplayAssignment, Alert, AuditLog } from '@/types';

// Generic fetch hook
function useApiQuery<T>(
  endpoint: string,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await api.get<T[]>(endpoint);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  return { data, isLoading, error, refetch: fetchData };
}

// Displays hook
export function useDisplays() {
  const { data, isLoading, error, refetch } = useApiQuery<Display>('/displays');

  const createDisplay = async (display: Partial<Display>) => {
    try {
      const newDisplay = await api.post<Display>('/displays', display);
      refetch();
      return { data: newDisplay, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateDisplay = async (id: string, updates: Partial<Display>) => {
    try {
      const updated = await api.patch<Display>(`/displays/${id}`, updates);
      refetch();
      return { data: updated, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const deleteDisplay = async (id: string) => {
    try {
      await api.delete(`/displays/${id}`);
      refetch();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const rotateSecretKey = async (id: string) => {
    const newKey = Math.random().toString(36).substring(2) + Date.now().toString(36);
    return updateDisplay(id, { secret_key: newKey });
  };

  return { displays: data, isLoading, error, refetch, createDisplay, updateDisplay, deleteDisplay, rotateSecretKey };
}

// Content Items hook
export function useContentItems() {
  const { data, isLoading, error, refetch } = useApiQuery<ContentItem>('/content_items');

  const createContent = async (content: Partial<ContentItem>) => {
    try {
      const newContent = await api.post<ContentItem>('/content_items', content);
      refetch();
      return { data: newContent, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateContent = async (id: string, updates: Partial<ContentItem>) => {
    try {
      const updated = await api.patch<ContentItem>(`/content_items/${id}`, updates);
      refetch();
      return { data: updated, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const deleteContent = async (id: string) => {
    try {
      await api.delete(`/content_items/${id}`);
      refetch();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const publishContent = async (id: string) => {
    return updateContent(id, { status: 'PUBLISHED' });
  };

  const archiveContent = async (id: string) => {
    return updateContent(id, { status: 'ARCHIVED' });
  };

  return { contentItems: data, isLoading, error, refetch, createContent, updateContent, deleteContent, publishContent, archiveContent };
}

// Playlists hook
export function usePlaylists() {
  const { data, isLoading, error, refetch } = useApiQuery<Playlist>('/playlists');

  const createPlaylist = async (playlist: Partial<Playlist>) => {
    try {
      const newPlaylist = await api.post<Playlist>('/playlists', playlist);
      refetch();
      return { data: newPlaylist, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updatePlaylist = async (id: string, updates: Partial<Playlist>) => {
    try {
      const updated = await api.patch<Playlist>(`/playlists/${id}`, updates);
      refetch();
      return { data: updated, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const deletePlaylist = async (id: string) => {
    try {
      await api.delete(`/playlists/${id}`);
      refetch();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return { playlists: data, isLoading, error, refetch, createPlaylist, updatePlaylist, deletePlaylist };
}

// Playlist Items hook
export function usePlaylistItems(playlistId?: string) {
  const [items, setItems] = useState<PlaylistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!playlistId) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.get<PlaylistItem[]>(`/playlists/${playlistId}/items`);
      setItems(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [playlistId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (contentItemId: string, orderIndex: number) => {
    try {
      const data = await api.post(`/playlists/${playlistId}/items`, { content_item_id: contentItemId, order_index: orderIndex });
      fetchItems();
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const removeItem = async (id: string) => {
    try {
      await api.delete(`/playlists/items/${id}`);
      fetchItems();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const reorderItems = async (orderedIds: string[]) => {
    try {
      await api.post(`/playlists/items/reorder`, { orderedIds });
      fetchItems();
    } catch (error) {
      console.error(error);
    }
  };

  return { items, isLoading, refetch: fetchItems, addItem, removeItem, reorderItems };
}

// Display Assignments hook
export function useDisplayAssignments() {
  const [assignments, setAssignments] = useState<DisplayAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssignments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get<DisplayAssignment[]>('/display_assignments');
      setAssignments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const createAssignment = async (assignment: Partial<DisplayAssignment>) => {
    try {
      const data = await api.post<DisplayAssignment>('/display_assignments', assignment);
      fetchAssignments();
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateAssignment = async (id: string, updates: Partial<DisplayAssignment>) => {
    try {
      const data = await api.patch<DisplayAssignment>(`/display_assignments/${id}`, updates);
      fetchAssignments();
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const deleteAssignment = async (id: string) => {
    try {
      await api.delete(`/display_assignments/${id}`);
      fetchAssignments();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return { assignments, isLoading, refetch: fetchAssignments, createAssignment, updateAssignment, deleteAssignment };
}

// Alerts hook
export function useAlerts() {
  const { data, isLoading, error, refetch } = useApiQuery<Alert>('/alerts');

  const createAlert = async (alert: Partial<Alert>) => {
    try {
      const newAlert = await api.post<Alert>('/alerts', alert);
      refetch();
      return { data: newAlert, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateAlert = async (id: string, updates: Partial<Alert>) => {
    try {
      const updated = await api.patch<Alert>(`/alerts/${id}`, updates);
      refetch();
      return { data: updated, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      await api.delete(`/alerts/${id}`);
      refetch();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const activateAlert = async (id: string) => {
    return updateAlert(id, { is_active: true });
  };

  const deactivateAlert = async (id: string) => {
    return updateAlert(id, { is_active: false });
  };

  return { alerts: data, isLoading, error, refetch, createAlert, updateAlert, deleteAlert, activateAlert, deactivateAlert };
}

// Player data hook - uses API
export function usePlayerData(displayId: string, secretKey: string) {
  const [data, setData] = useState<{
    display: Display | null;
    assignment: DisplayAssignment | null;
    playlist: Playlist | null;
    items: ContentItem[];
    alerts: Alert[];
    isValid: boolean;
  }>({
    display: null,
    assignment: null,
    playlist: null,
    items: [],
    alerts: [],
    isValid: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPlayerData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.post<any>('/player/content', { displayId, secretKey });

      if (!response?.isValid) {
        setData(prev => ({ ...prev, isValid: false }));
        setIsLoading(false);
        return;
      }

      setData({
        display: response.display,
        assignment: response.assignment,
        playlist: response.playlist,
        items: response.items || [],
        alerts: response.alerts || [],
        isValid: true,
      });
    } catch (err) {
      console.error('Player data fetch error:', err);
      // Fallback is implicit via error handling here, if server is down, we show error
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [displayId, secretKey]);

  useEffect(() => {
    fetchPlayerData();

    // Set up polling for updates
    const interval = setInterval(fetchPlayerData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [fetchPlayerData]);

  // Heartbeat
  useEffect(() => {
    if (!data.isValid) return;

    const heartbeat = setInterval(async () => {
      try {
        await api.post('/player/heartbeat', { displayId, secretKey });
      } catch (err) {
        console.error('Heartbeat failed', err);
      }
    }, 60000); // Every 60 seconds

    return () => clearInterval(heartbeat);
  }, [displayId, secretKey, data.isValid]);

  return { ...data, isLoading, error, refetch: fetchPlayerData };
}

// Audit logs hook
export function useAuditLogs() {
  const { data, isLoading, error, refetch } = useApiQuery<AuditLog>('/audit_logs');

  const logAction = async (action: string, entityType: string, entityId?: string, details?: Record<string, any>) => {
    const userId = localStorage.getItem('signage_user')
      ? JSON.parse(localStorage.getItem('signage_user')!).id
      : null;

    try {
      await api.post('/audit_logs', {
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
      });
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  return { logs: data, isLoading, error, refetch, logAction };
}
