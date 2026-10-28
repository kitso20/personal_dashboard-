import React, { useState } from 'react';
import {
  Cloud,
  Sun,
  CloudRain,
  CloudLightning,
  Wind,
  CloudSnow,
  Plus,
  Trash2,
  Pin,
  Send,
  Droplets,
  AlertTriangle,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { WeatherCity } from '../../types';

interface WeatherWidgetProps {
  cities: WeatherCity[];
  tempUnit: 'C' | 'F';
  onAddCity: (city: { name: string; country: string; temp?: number; condition?: any }) => Promise<void>;
  onRemoveCity: (id: string) => Promise<void>;
  onTogglePin: (id: string) => Promise<void>;
  onToggleUnit: (unit: 'C' | 'F') => Promise<void>;
  onSendEmailAlert: (cityId: string) => Promise<void>;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  cities,
  tempUnit,
  onAddCity,
  onRemoveCity,
  onTogglePin,
  onToggleUnit,
  onSendEmailAlert
}) => {
  const [selectedCityId, setSelectedCityId] = useState<string>(cities[0]?.id || '');
  const [isAddingCity, setIsAddingCity] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [newCityCountry, setNewCityCountry] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const activeCity = cities.find((c) => c.id === selectedCityId) || cities[0];

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${celsius}°C`;
  };

  const getWeatherIcon = (condition: string, className = 'w-5 h-5') => {
    const c = condition.toLowerCase();
    if (c.includes('rain')) return <CloudRain className={`${className} text-blue-400`} />;
    if (c.includes('thunder')) return <CloudLightning className={`${className} text-amber-400`} />;
    if (c.includes('snow')) return <CloudSnow className={`${className} text-sky-200`} />;
    if (c.includes('wind')) return <Wind className={`${className} text-teal-400`} />;
    if (c.includes('sun') || c.includes('clear')) return <Sun className={`${className} text-amber-400`} />;
    return <Cloud className={`${className} text-slate-400`} />;
  };

  const handleCreateCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim()) return;
    await onAddCity({
      name: newCityName.trim(),
      country: newCityCountry.trim() || 'Global'
    });
    setNewCityName('');
    setNewCityCountry('');
    setIsAddingCity(false);
  };

  const handleEmailReport = async (cityId: string) => {
    setIsSendingEmail(true);
    try {
      await onSendEmailAlert(cityId);
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="h-full bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-slate-700/80 transition-colors">
      <div>
        {/* Header with Title, Unit Switcher, and Add City */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Multi-City Weather</h3>
              <p className="text-[11px] text-slate-400">Track conditions & alerts across your locations</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Unit Switcher */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-md p-0.5 text-[11px]">
              <button
                onClick={() => onToggleUnit('C')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  tempUnit === 'C' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                °C
              </button>
              <button
                onClick={() => onToggleUnit('F')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  tempUnit === 'F' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                °F
              </button>
            </div>

            <button
              onClick={() => setIsAddingCity(!isAddingCity)}
              className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 hover:text-white transition-colors"
              title="Add a new city"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Add City Drawer Form */}
        {isAddingCity && (
          <form onSubmit={handleCreateCity} className="mt-3 p-3 bg-slate-950 border border-indigo-500/40 rounded-lg space-y-2">
            <div className="text-xs font-semibold text-white">Add New Weather City</div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="City Name (e.g. Paris)"
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
              <input
                type="text"
                placeholder="Country/Region (e.g. France)"
                value={newCityCountry}
                onChange={(e) => setNewCityCountry(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingCity(false)}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium"
              >
                Track City
              </button>
            </div>
          </form>
        )}

        {/* City Switcher Tabs */}
        <div className="flex items-center gap-1.5 py-3 overflow-x-auto no-scrollbar">
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => setSelectedCityId(city.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-all border ${
                activeCity?.id === city.id
                  ? 'bg-slate-800 border-indigo-500/50 text-white shadow-xs'
                  : 'bg-slate-950/70 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {getWeatherIcon(city.condition, 'w-3.5 h-3.5')}
              <span className="font-medium">{city.name}</span>
              <span className="text-[11px] font-mono text-slate-300">{formatTemp(city.temp)}</span>
              {city.isPinned && <Pin className="w-2.5 h-2.5 text-indigo-400 fill-current" />}
            </button>
          ))}
        </div>

        {/* Active City Details Hero Card */}
        {activeCity && (
          <div className="mt-1 p-3.5 bg-linear-to-b from-sky-950/20 via-slate-950/90 to-slate-950/90 border border-white/[0.07] rounded-xl space-y-3">
            {/* Top row: City Name, Weather Icon, Main Temp */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white tracking-tight">{activeCity.name}</h4>
                  <span className="text-[11px] text-slate-400 font-normal">({activeCity.country})</span>
                  <button
                    onClick={() => onTogglePin(activeCity.id)}
                    className={`p-1 rounded hover:bg-white/[0.06] transition-colors ${
                      activeCity.isPinned ? 'text-indigo-400' : 'text-slate-500'
                    }`}
                    title={activeCity.isPinned ? 'Unpin city' : 'Pin city to top'}
                  >
                    <Pin className={`w-3 h-3 ${activeCity.isPinned ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Feels {formatTemp(activeCity.feelsLike)} · H: {formatTemp(activeCity.high)} / L: {formatTemp(activeCity.low)}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {getWeatherIcon(activeCity.condition, 'w-7 h-7')}
                <span className="text-2xl font-bold text-white font-mono tracking-tight">
                  {formatTemp(activeCity.temp)}
                </span>
              </div>
            </div>

            {/* Weather Alert if any */}
            {activeCity.alert && (
              <div className="p-2 bg-amber-950/40 border border-amber-900/50 rounded-lg flex items-center gap-2 text-[11px] text-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="flex-1 leading-snug">{activeCity.alert}</span>
              </div>
            )}

            {/* Telemetry Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-white/[0.06] text-xs">
              <div className="p-2 bg-white/[0.02] rounded-lg border border-white/[0.04]">
                <span className="text-[10px] uppercase text-slate-500 block font-medium">Humidity</span>
                <span className="font-semibold text-slate-200 font-mono mt-0.5 block">{activeCity.humidity}%</span>
              </div>
              <div className="p-2 bg-white/[0.02] rounded-lg border border-white/[0.04]">
                <span className="text-[10px] uppercase text-slate-500 block font-medium">Wind</span>
                <span className="font-semibold text-slate-200 font-mono mt-0.5 block">{activeCity.windSpeed} km/h</span>
              </div>
              <div className="p-2 bg-white/[0.02] rounded-lg border border-white/[0.04]">
                <span className="text-[10px] uppercase text-slate-500 block font-medium">UV Index</span>
                <span className={`font-semibold font-mono mt-0.5 block ${activeCity.uvIndex > 6 ? 'text-amber-400' : 'text-slate-200'}`}>
                  {activeCity.uvIndex} / 10
                </span>
              </div>
            </div>

            {/* 5-Day Forecast Strip */}
            <div className="pt-1.5 border-t border-white/[0.06]">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium mb-1.5">5-Day Outlook</div>
              <div className="grid grid-cols-5 gap-1.5 text-center">
                {activeCity.forecast.map((fc, idx) => (
                  <div key={idx} className="p-1.5 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg border border-white/[0.04] transition-colors">
                    <span className="text-[10px] text-slate-400 block font-medium">{fc.day}</span>
                    <div className="my-1 flex justify-center">
                      {getWeatherIcon(fc.condition, 'w-3.5 h-3.5')}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-200 font-mono block">
                      {formatTemp(fc.temp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions: Email Report & Delete */}
      {activeCity && (
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={() => handleEmailReport(activeCity.id)}
            disabled={isSendingEmail}
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            {isSendingEmail ? 'Sending...' : `Email Advisory for ${activeCity.name}`}
          </button>

          {cities.length > 1 && (
            <button
              onClick={() => onRemoveCity(activeCity.id)}
              className="text-slate-500 hover:text-rose-400 transition-colors p-1"
              title="Remove this city"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
