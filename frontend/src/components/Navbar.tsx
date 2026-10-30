import React from 'react';
import { 
  Droplets, 
  MapPin, 
  Navigation, 
  Layers, 
  Activity, 
  FileText, 
  Sparkles,
  Play
} from 'lucide-react';

interface NavbarProps {
  currentView: 'dashboard' | 'map' | 'stress' | 'landing';
  setCurrentView: (view: 'dashboard' | 'map' | 'stress' | 'landing') => void;
  selectedLocation: string;
  onSelectLocation: (locKey: string) => void;
  onGpsLocate: () => void;
  isLocating: boolean;
  demoActive: boolean;
  setDemoActive: (active: boolean) => void;
  demoStep: number;
}

export const PRESET_LOCATIONS = [
  { key: 'sangrur', label: 'Sangrur, Punjab (Critical Overdraft)', lat: 30.2458, lon: 75.8421 },
  { key: 'bathinda', label: 'Bathinda, Punjab (Trans-Gangetic Plain)', lat: 29.9844, lon: 75.0898 },
  { key: 'anantapur', label: 'Anantapur, AP (Arid Drought Prone)', lat: 14.6819, lon: 77.6006 },
  { key: 'nashik', label: 'Nashik, Maharashtra (Deccan Horticulture)', lat: 20.0059, lon: 73.7898 },
  { key: 'jodhpur', label: 'Jodhpur, Rajasthan (Western Desert Fringe)', lat: 26.2389, lon: 73.0243 }
];

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  selectedLocation,
  onSelectLocation,
  onGpsLocate,
  isLocating,
  demoActive,
  setDemoActive,
  demoStep
}) => {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-700/60 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Droplets className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">Aqua<span className="text-emerald-400">Shift</span></span>
              <span className="text-xs uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">2.0 PRO</span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Plan Crops. Balance Water. Protect Livelihoods.</p>
          </div>
        </div>

        {/* Location & GPS Controls */}
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-lg p-1.5 shadow-inner">
          <MapPin className="w-4 h-4 text-emerald-400 ml-1 shrink-0" />
          <select 
            value={selectedLocation} 
            onChange={(e) => onSelectLocation(e.target.value)}
            className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-2"
          >
            {PRESET_LOCATIONS.map(loc => (
              <option key={loc.key} value={loc.key} className="bg-slate-900 text-slate-200">
                {loc.label}
              </option>
            ))}
          </select>

          <button
            onClick={onGpsLocate}
            disabled={isLocating}
            title="Detect current location via Browser GPS"
            className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded transition border border-slate-700"
          >
            <Navigation className={`w-3.5 h-3.5 text-cyan-400 ${isLocating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isLocating ? 'Locating...' : 'GPS'}</span>
          </button>
        </div>

        {/* View Switchers & Hackathon Demo Button */}
        <div className="flex items-center gap-2">
          <nav className="flex items-center bg-slate-900/60 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                currentView === 'dashboard' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentView('map')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                currentView === 'map' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Geospatial Map</span>
            </button>

            <button
              onClick={() => setCurrentView('stress')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                currentView === 'stress' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Stress Matrix</span>
            </button>
          </nav>

          {/* Hackathon Demo Trigger */}
          <button
            onClick={() => setDemoActive(!demoActive)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-lg ${
              demoActive 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-amber-500/20 animate-pulse' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold hover:brightness-110 shadow-emerald-500/20'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{demoActive ? `Demo Step ${demoStep}/10` : '2-Min Demo'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
