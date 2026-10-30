import React from 'react';
import { 
  Droplets, 
  Scale, 
  MapPin, 
  Cpu, 
  ShieldCheck, 
  ArrowRight, 
  Play, 
  TrendingUp,
  Layers,
  Sparkles
} from 'lucide-react';

interface LandingHeroProps {
  onLaunchPlatform: () => void;
  onLaunchDemo: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onLaunchPlatform,
  onLaunchDemo
}) => {
  return (
    <div className="flex flex-col gap-12 py-8">
      
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel-glow border border-emerald-500/30 p-8 md:p-12 text-center flex flex-col items-center">
        
        {/* Glow badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Agricultural Decision Intelligence</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
          Resolve the Agricultural Trilemma: <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Water, Food Security & Farmer Income
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mt-5 leading-relaxed">
          AquaShift 2.0 unifies geospatial cadastral data, Open-Meteo real-time weather, CGWB groundwater telemetry, 
          and Google OR-Tools mathematical optimization to determine what to grow, where to grow it, and how to allocate scarce water.
        </p>

        {/* Core Tenet Badge */}
        <div className="mt-6 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono text-cyan-300 max-w-2xl">
          <span className="text-emerald-400 font-bold">The AquaShift Principle:</span> Machine Learning predicts. Mathematical Optimization decides. Geospatial Intelligence contextualizes. AI explains.
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <button
            onClick={onLaunchPlatform}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-95 transition cursor-pointer"
          >
            <span>Launch Platform Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onLaunchDemo}
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm flex items-center gap-2 transition cursor-pointer"
          >
            <Play className="w-4 h-4 text-emerald-400 fill-current" />
            <span>Watch 2-Minute Judging Walkthrough</span>
          </button>
        </div>
      </div>

      {/* Trilemma Architecture Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Pillar 1: Water */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <Droplets className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">1. Groundwater & Water Conservation</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ingests live Central Ground Water Board (CGWB) telemetry. Converts flood irrigation models to water-conserving drip regimes, preventing tube-well abandonment.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-cyan-400">
            ✓ Prevents Aquifer Overdraft
          </div>
        </div>

        {/* Pillar 2: Food Security */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">2. Regional Food Production Targets</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Maintains non-negotiable food security quotas. Diversifies into protein-dense legumes (Moong/Gram) and oilseeds (Mustard) without causing caloric shortages.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-amber-400">
            ✓ Guaranteed Calorie Floor
          </div>
        </div>

        {/* Pillar 3: Farmer Income */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">3. Farmer Profitability & Livelihood</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Calibrated to Agmarknet wholesale APMC mandi prices and official MSPs. Mathematical allocation maximizes net earnings per cubic meter of water.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-emerald-400">
            ✓ Robust Household Margins
          </div>
        </div>

      </div>

    </div>
  );
};
