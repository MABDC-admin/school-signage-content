import React, { useState } from 'react';
import { Settings, Palette, Image, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const SettingsSection: React.FC = () => {
  const [settings, setSettings] = useState({
    schoolName: 'Lincoln High School',
    primaryColor: '#1e40af',
    secondaryColor: '#059669',
    logoUrl: '',
    defaultDuration: 10,
    refreshInterval: 30,
    enableWeather: true,
    weatherLocation: 'New York, NY',
  });

  const handleSave = () => {
    localStorage.setItem('signage_settings', JSON.stringify(settings));
    toast.success('Settings saved');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500">Configure global signage settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* School Branding */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Palette className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900">School Branding</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">School Name</label>
              <input
                type="text"
                value={settings.schoolName}
                onChange={e => setSettings(prev => ({ ...prev, schoolName: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={e => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={e => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Secondary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.secondaryColor}
                    onChange={e => setSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.secondaryColor}
                    onChange={e => setSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
              <input
                type="url"
                value={settings.logoUrl}
                onChange={e => setSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/logo.png"
              />
            </div>

            {/* Preview */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: settings.primaryColor }}>
              <div className="flex items-center gap-3">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="w-10 h-10 rounded" />
                ) : (
                  <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center">
                    <Image className="w-5 h-5 text-white" />
                  </div>
                )}
                <span className="text-white font-semibold">{settings.schoolName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Display Settings</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Default Slide Duration (seconds)
              </label>
              <input
                type="number"
                value={settings.defaultDuration}
                onChange={e => setSettings(prev => ({ ...prev, defaultDuration: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="5"
                max="120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Content Refresh Interval (seconds)
              </label>
              <input
                type="number"
                value={settings.refreshInterval}
                onChange={e => setSettings(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="10"
                max="300"
              />
              <p className="text-xs text-slate-500 mt-1">How often displays check for new content</p>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Weather Widget</p>
                  <p className="text-sm text-slate-500">Show weather on displays</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableWeather}
                    onChange={e => setSettings(prev => ({ ...prev, enableWeather: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.enableWeather && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Weather Location</label>
                  <input
                    type="text"
                    value={settings.weatherLocation}
                    onChange={e => setSettings(prev => ({ ...prev, weatherLocation: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="City, State"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsSection;
