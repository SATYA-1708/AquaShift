import React from 'react';
import { 
  Sprout, 
  MapPin, 
  Navigation, 
  Map, 
  LayoutDashboard, 
  AlertTriangle,
  Globe
} from 'lucide-react';
import { PRESET_LOCATIONS } from '../constants/locations';
import { Language, Translations } from '../constants/translations';

export interface NavbarProps {
  currentView: 'dashboard' | 'map' | 'stress' | 'landing';
  setCurrentView: (view: 'dashboard' | 'map' | 'stress' | 'landing') => void;
  selectedLocation: string;
  onSelectLocation: (locKey: string) => void;
  onGpsLocate: () => void;
  isLocating: boolean;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  t: Translations;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  selectedLocation,
  onSelectLocation,
  onGpsLocate,
  isLocating,
  language,
  onSelectLanguage,
  t
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Platform Identity */}
        <div 
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:bg-emerald-700 transition-colors shrink-0">
            <Sprout className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-heading font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                Aqua<span className="text-emerald-600">Shift</span>
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Farmer Advisory
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                Hackathon Edition
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Smart Crop Planning &bull; Save Water &bull; Maximize Income
            </p>
          </div>
        </div>

        {/* Village / District Selector with GPS */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl p-1.5 shadow-2xs w-full md:w-auto">
          <div className="flex items-center pl-2 pr-1 text-emerald-700">
            <MapPin className="w-4 h-4 shrink-0" />
          </div>
          <div className="flex flex-col flex-1 sm:flex-none">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">
              {t.selectedFarmRegion}
            </label>
            <select 
              value={selectedLocation} 
              onChange={(e) => onSelectLocation(e.target.value)}
              className="bg-transparent text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none cursor-pointer pr-2 py-0.5"
            >
              {PRESET_LOCATIONS.map(loc => (
                <option key={loc.key} value={loc.key} className="bg-white text-slate-900">
                  {loc.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onGpsLocate}
            disabled={isLocating}
            title="Automatically detect my farm using browser GPS"
            className="flex items-center gap-1.5 text-xs bg-white hover:bg-slate-100 text-slate-800 font-semibold px-2.5 py-1.5 rounded-lg transition border border-slate-300 shadow-2xs cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Navigation className={`w-3.5 h-3.5 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? t.locating : t.gpsDetect}</span>
          </button>
        </div>

        {/* Navigation Tabs + Language Selector */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          
          {/* Navigation View Tabs */}
          <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 text-xs font-semibold">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'dashboard' 
                  ? 'bg-white text-emerald-800 shadow-xs font-bold border border-slate-200/80' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.cropPlanner}</span>
            </button>

            <button
              onClick={() => setCurrentView('map')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'map' 
                  ? 'bg-white text-emerald-800 shadow-xs font-bold border border-slate-200/80' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Map className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.satelliteMap}</span>
            </button>

            <button
              onClick={() => setCurrentView('stress')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'stress' 
                  ? 'bg-white text-emerald-800 shadow-xs font-bold border border-slate-200/80' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.droughtStressTest}</span>
            </button>
          </nav>

          {/* Language Switcher (English | हिंदी | ਪੰਜਾਬੀ) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold gap-0.5">
            <Globe className="w-3.5 h-3.5 text-slate-500 ml-1 mr-0.5 hidden sm:inline" />
            <button
              onClick={() => onSelectLanguage('en')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                language === 'en' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600 hover:bg-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onSelectLanguage('hi')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                language === 'hi' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600 hover:bg-white'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => onSelectLanguage('pa')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                language === 'pa' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600 hover:bg-white'
              }`}
            >
              ਪੰਜਾਬੀ
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
