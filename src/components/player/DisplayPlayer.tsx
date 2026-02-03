import React, { useState, useEffect, useCallback } from 'react';
import { usePlayerData } from '@/hooks/useSignageData';
import { ContentItem, LayoutPreset, Alert } from '@/types';
import { 
  Megaphone, Calendar, Image, Video, Clock, Cloud, Code,
  AlertTriangle, Info, Siren, Loader2
} from 'lucide-react';

interface DisplayPlayerProps {
  displayId: string;
  secretKey: string;
}

const contentTypeIcons: Record<string, React.ElementType> = {
  ANNOUNCEMENT: Megaphone,
  EVENT: Calendar,
  IMAGE: Image,
  VIDEO: Video,
  SCHEDULE: Clock,
  WEATHER: Cloud,
  HTML_WIDGET: Code,
};

const DisplayPlayer: React.FC<DisplayPlayerProps> = ({ displayId, secretKey }) => {
  const { display, assignment, items, alerts, isValid, isLoading } = usePlayerData(displayId, secretKey);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-rotate slides
  useEffect(() => {
    if (items.length === 0) return;

    const currentItem = items[currentIndex];
    const duration = (currentItem?.duration_seconds || 10) * 1000;

    const timer = setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % items.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentIndex, items]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Loading display...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Display</h1>
          <p className="text-slate-400">The display ID or secret key is invalid.</p>
        </div>
      </div>
    );
  }

  const layoutPreset = assignment?.layout_preset || 'fullscreen';
  const themeColor = display?.theme_color || '#1e40af';
  const activeAlerts = alerts.filter(a => a.is_active);
  const emergencyAlert = activeAlerts.find(a => a.level === 'EMERGENCY');

  return (
    <div className="min-h-screen bg-slate-900 overflow-hidden relative">
      {/* Emergency Alert Overlay */}
      {emergencyAlert && (
        <EmergencyAlertOverlay alert={emergencyAlert} />
      )}

      {/* Non-emergency Alert Banner */}
      {!emergencyAlert && activeAlerts.length > 0 && (
        <AlertBanner alerts={activeAlerts} />
      )}

      {/* Main Content */}
      <div className={`h-screen ${activeAlerts.length > 0 && !emergencyAlert ? 'pt-16' : ''}`}>
        {layoutPreset === 'fullscreen' && (
          <FullscreenLayout
            items={items}
            currentIndex={currentIndex}
            themeColor={themeColor}
            currentTime={currentTime}
            displayName={display?.name || ''}
          />
        )}

        {layoutPreset === 'grid' && (
          <GridLayout
            items={items}
            themeColor={themeColor}
            currentTime={currentTime}
            displayName={display?.name || ''}
          />
        )}

        {layoutPreset === 'ticker' && (
          <TickerLayout
            items={items}
            currentIndex={currentIndex}
            themeColor={themeColor}
            currentTime={currentTime}
            displayName={display?.name || ''}
          />
        )}
      </div>
    </div>
  );
};

// Emergency Alert Overlay
const EmergencyAlertOverlay: React.FC<{ alert: Alert }> = ({ alert }) => (
  <div className="fixed inset-0 z-50 bg-red-600 flex items-center justify-center animate-pulse">
    <div className="text-center p-8">
      <Siren className="w-32 h-32 text-white mx-auto mb-8 animate-bounce" />
      <h1 className="text-6xl font-bold text-white mb-4">{alert.title}</h1>
      <p className="text-3xl text-white/90">{alert.message}</p>
    </div>
  </div>
);

// Alert Banner
const AlertBanner: React.FC<{ alerts: Alert[] }> = ({ alerts }) => {
  const [currentAlert, setCurrentAlert] = useState(0);

  useEffect(() => {
    if (alerts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentAlert(prev => (prev + 1) % alerts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [alerts.length]);

  const alert = alerts[currentAlert];
  const bgColor = alert.level === 'WARNING' ? 'bg-yellow-500' : 'bg-blue-500';
  const Icon = alert.level === 'WARNING' ? AlertTriangle : Info;

  return (
    <div className={`fixed top-0 left-0 right-0 z-40 ${bgColor} py-4 px-6`}>
      <div className="flex items-center justify-center gap-4">
        <Icon className="w-6 h-6 text-white" />
        <span className="text-xl font-semibold text-white">{alert.title}: {alert.message}</span>
      </div>
    </div>
  );
};

// Fullscreen Layout
interface LayoutProps {
  items: ContentItem[];
  currentIndex?: number;
  themeColor: string;
  currentTime: Date;
  displayName: string;
}

const FullscreenLayout: React.FC<LayoutProps> = ({ items, currentIndex = 0, themeColor, currentTime, displayName }) => {
  const currentItem = items[currentIndex];

  if (!currentItem) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: themeColor }}>
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">{displayName}</h1>
          <p className="text-xl opacity-80">No content scheduled</p>
          <p className="text-6xl font-light mt-8">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4" style={{ backgroundColor: themeColor }}>
        <h1 className="text-2xl font-bold text-white">{displayName}</h1>
        <div className="text-white text-xl">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-800">
        <ContentCard item={currentItem} size="large" />
      </div>

      {/* Progress */}
      <div className="h-2 bg-slate-700">
        <div 
          className="h-full transition-all duration-1000"
          style={{ 
            backgroundColor: themeColor,
            width: `${((currentIndex + 1) / items.length) * 100}%`
          }}
        />
      </div>
    </div>
  );
};

// Grid Layout
const GridLayout: React.FC<LayoutProps> = ({ items, themeColor, currentTime, displayName }) => {
  const announcements = items.filter(i => i.type === 'ANNOUNCEMENT');
  const events = items.filter(i => i.type === 'EVENT');
  const schedule = items.find(i => i.type === 'SCHEDULE');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4" style={{ backgroundColor: themeColor }}>
        <h1 className="text-2xl font-bold text-white">{displayName}</h1>
        <div className="text-white text-xl">
          {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })} | {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 grid grid-cols-3 gap-4 p-4 bg-slate-800">
        {/* Announcements */}
        <div className="bg-slate-700 rounded-xl p-4 overflow-hidden">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Megaphone className="w-5 h-5" style={{ color: themeColor }} />
            Announcements
          </h2>
          <div className="space-y-3 overflow-y-auto max-h-[calc(100%-3rem)]">
            {announcements.map(item => (
              <div key={item.id} className="bg-slate-600 rounded-lg p-3">
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="text-slate-300 text-sm mt-1">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-slate-700 rounded-xl p-4 overflow-hidden">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" style={{ color: themeColor }} />
            Bell Schedule
          </h2>
          {schedule ? (
            <pre className="text-slate-300 whitespace-pre-wrap text-sm">{schedule.body}</pre>
          ) : (
            <p className="text-slate-400">No schedule available</p>
          )}
        </div>

        {/* Events */}
        <div className="bg-slate-700 rounded-xl p-4 overflow-hidden">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" style={{ color: themeColor }} />
            Upcoming Events
          </h2>
          <div className="space-y-3 overflow-y-auto max-h-[calc(100%-3rem)]">
            {events.map(item => (
              <div key={item.id} className="bg-slate-600 rounded-lg p-3">
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="text-slate-300 text-sm mt-1">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Ticker Layout
const TickerLayout: React.FC<LayoutProps> = ({ items, currentIndex = 0, themeColor, currentTime, displayName }) => {
  const currentItem = items[currentIndex];
  const tickerItems = items.filter(i => i.type === 'ANNOUNCEMENT').slice(0, 5);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4" style={{ backgroundColor: themeColor }}>
        <h1 className="text-2xl font-bold text-white">{displayName}</h1>
        <div className="text-white text-xl">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-800">
        {currentItem ? (
          <ContentCard item={currentItem} size="large" />
        ) : (
          <p className="text-slate-400 text-2xl">No content available</p>
        )}
      </div>

      {/* Ticker */}
      <div className="h-20 bg-slate-900 overflow-hidden">
        <div className="h-full flex items-center animate-marquee">
          {tickerItems.map((item, idx) => (
            <div key={item.id} className="flex items-center px-8 whitespace-nowrap">
              <span className="text-xl text-white font-semibold">{item.title}</span>
              <span className="mx-4 text-slate-500">|</span>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {tickerItems.map((item, idx) => (
            <div key={`dup-${item.id}`} className="flex items-center px-8 whitespace-nowrap">
              <span className="text-xl text-white font-semibold">{item.title}</span>
              <span className="mx-4 text-slate-500">|</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Content Card Component
const ContentCard: React.FC<{ item: ContentItem; size?: 'small' | 'large' }> = ({ item, size = 'small' }) => {
  const Icon = contentTypeIcons[item.type] || Megaphone;
  const isLarge = size === 'large';

  if (item.type === 'IMAGE' && item.media_url) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <img 
          src={item.media_url} 
          alt={item.title}
          className="max-w-full max-h-full object-contain rounded-xl"
        />
      </div>
    );
  }

  if (item.type === 'VIDEO' && item.media_url) {
    return (
      <video
        src={item.media_url}
        autoPlay
        muted
        loop
        className="max-w-full max-h-full rounded-xl"
      />
    );
  }

  return (
    <div className={`bg-slate-700 rounded-2xl ${isLarge ? 'p-12 max-w-4xl' : 'p-6'}`}>
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-blue-600 rounded-xl">
          <Icon className={`${isLarge ? 'w-8 h-8' : 'w-5 h-5'} text-white`} />
        </div>
        <span className={`text-blue-400 font-medium ${isLarge ? 'text-xl' : 'text-sm'}`}>
          {item.type}
        </span>
      </div>
      <h2 className={`font-bold text-white ${isLarge ? 'text-5xl mb-6' : 'text-xl mb-3'}`}>
        {item.title}
      </h2>
      {item.body && (
        <p className={`text-slate-300 ${isLarge ? 'text-2xl leading-relaxed' : 'text-base'} whitespace-pre-wrap`}>
          {item.body}
        </p>
      )}
    </div>
  );
};

export default DisplayPlayer;
