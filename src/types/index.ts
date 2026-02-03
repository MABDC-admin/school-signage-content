// User types
export type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
}

// Display types
export interface Display {
  id: string;
  name: string;
  location?: string;
  secret_key: string;
  timezone: string;
  is_active: boolean;
  last_seen_at?: string;
  theme_color: string;
  logo_url?: string;
  created_at: string;
}

// Content types
export type ContentType = 'ANNOUNCEMENT' | 'EVENT' | 'IMAGE' | 'VIDEO' | 'SCHEDULE' | 'WEATHER' | 'HTML_WIDGET';
export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  body?: string;
  media_url?: string;
  duration_seconds: number;
  start_at?: string;
  end_at?: string;
  priority: number;
  status: ContentStatus;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Playlist types
export interface Playlist {
  id: string;
  name: string;
  description?: string;
  created_by?: string;
  created_at: string;
}

export interface PlaylistItem {
  id: string;
  playlist_id: string;
  content_item_id: string;
  order_index: number;
  created_at: string;
  content_item?: ContentItem;
}

// Display Assignment types
export type LayoutPreset = 'fullscreen' | 'grid' | 'ticker';

export interface DisplayAssignment {
  id: string;
  display_id: string;
  playlist_id: string;
  active_from?: string;
  active_to?: string;
  layout_preset: LayoutPreset;
  is_active: boolean;
  created_at: string;
  playlist?: Playlist;
  display?: Display;
}

// Alert types
export type AlertLevel = 'INFO' | 'WARNING' | 'EMERGENCY';

export interface Alert {
  id: string;
  title: string;
  message: string;
  level: AlertLevel;
  is_active: boolean;
  starts_at: string;
  ends_at?: string;
  created_by?: string;
  created_at: string;
}

// Audit log types
export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, any>;
  created_at: string;
}

// Player data types
export interface PlayerData {
  display: Display;
  assignment?: DisplayAssignment;
  playlist?: Playlist;
  items: ContentItem[];
  alerts: Alert[];
}
