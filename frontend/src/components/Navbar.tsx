import React from 'react';
import { Sprout, MapPin, Map, LayoutDashboard, AlertTriangle } from 'lucide-react';
import { PRESET_LOCATIONS } from '../constants/locations';

export interface NavbarProps {
  currentView: 'dashboard' | 'map' | 'stress' | 'landing';
  setCurrentView: (view: 'dashboard' | 'map' | 'stress' | 'landing') => void;
  selectedLocation: string;
  onSelectLocation: (locKey: string) => void;
  onGpsLocate: () => void;
  isLocating: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  selectedLocation,
  onSelectLocation,
  onGpsLocate,
  isLocating
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Live badge */}
        <div className="flex items-center gap-2">
          <div
            onClick={() => setCurrentView('dashboard')}
            className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md hover:bg-emerald-700 transition-colors"
          >
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-heading font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                Aqua<span className="text-emerald-600">Shift</span>
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Farmer Advisory
              </span>
            </div>
            <span className="text-xs font-medium text-slate-500">
              Smart Crop Planning &bull; Save Water &bull; Maximize Income
            </span>
          </div>
          {/* Live badge */}
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Live
          </span>
        </div>

        {/* Village / District Selector */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl p-1.5 shadow-2xs">
          <div className="flex items-center pl-2 pr-1 text-emerald-700">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
          </div>
          <div className="flex flex-col">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-none">
              Selected Farm Region
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => onSelectLocation(e.target.value)}
              className="bg-transparent text-sm text-slate-900 font-semibold focus:outline-none cursor-pointer pr-2 py-1"
            >
              {PRESET_LOCATIONS.map(loc => (
                <option key={loc.key} value={loc.key} className="bg-white text-slate-900">
                  {loc.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`
              px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer
              ${currentView === 'dashboard'}
                ? 'bg-white text-emerald-800 shadow-xs font-bold border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            `}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
            <span>Crop Planner</span>
          </button>
          <button
            onClick={() => setCurrentView('map')}
            className={`
              px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer
              ${currentView === 'map'}
                ? 'bg-white text-emerald-800 shadow-xs font-bold border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            `}
          >
            <Map className="w-3.5 h-3.5 text-blue-600" />
            <span>Satellite Map</span>
          </button>
        </div>
      </div>
    </header>
  );
};