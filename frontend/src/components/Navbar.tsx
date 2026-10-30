import React from 'react';
import { 
  Sprout, 
  MapPin, 
  Map, 
  LayoutDashboard, 
  AlertTriangle,
  Globe,
  Search,
  ChevronDown
} from 'lucide-react';
import { Language, Translations } from '../constants/translations';

export interface NavbarProps {
  currentView: 'dashboard' | 'map' | 'stress' | 'landing';
  setCurrentView: (view: 'dashboard' | 'map' | 'stress' | 'landing') => void;
  locationLabel: string;
  coordinates: [number, number];
  onOpenLocationSearch: () => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  t: Translations;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  locationLabel,
  coordinates,
  onOpenLocationSearch,
  language,
  onSelectLanguage,
  t
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-4 lg:px-8 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Platform Identity */}
        <div 
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:bg-emerald-700 transition-colors">
            <Sprout className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-heading font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                Aqua<span className="text-emerald-600">Shift</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Farmer Advisory
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium -mt-0.5 hidden sm:block">
              Smart Crop Planning &bull; Save Water &bull; Higher Profit
            </p>
          </div>
        </div>

        {/* Universal Farm Location Pill (Replaces fixed dropdown) */}
        <button
          type="button"
          onClick={onOpenLocationSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-300 hover:border-emerald-400 text-left transition cursor-pointer shadow-2xs group w-full md:w-auto max-w-md justify-between"
          title="Click to search by place name, paste Google Maps link, enter coordinates, or use GPS"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="min-w-0 flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-none">
                  Farm Location &bull; GPS Active
                </span>
                <span className="text-[9px] text-emerald-700 font-semibold bg-emerald-50 px-1 rounded">
                  Change
                </span>
              </div>
              <span className="text-xs font-bold text-slate-900 truncate mt-0.5 block group-hover:text-emerald-950">
                {locationLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 pl-2 text-slate-400 group-hover:text-emerald-600 shrink-0">
            <Search className="w-3.5 h-3.5" />
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* Right Controls: Views & Languages */}
        <div className="flex items-center gap-2.5 shrink-0 justify-between w-full md:w-auto">
          
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

          {/* Language Switcher (EN | हिंदी | ਪੰਜਾਬੀ) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold gap-0.5 shrink-0">
            <Globe className="w-3.5 h-3.5 text-slate-500 ml-1 mr-0.5 hidden lg:inline" />
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
