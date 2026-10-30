import React from 'react';
import { 
  Sliders, 
  Droplet, 
  TrendingUp, 
  Utensils, 
  Ruler, 
  Sparkles, 
  RefreshCw,
  AlertTriangle,
  Check
} from 'lucide-react';
import { CropDetail } from '../types';

interface ScenarioBuilderProps {
  totalLand: number;
  setTotalLand: (val: number) => void;
  waterBudget: number;
  setWaterBudget: (val: number) => void;
  foodTarget: number;
  setFoodTarget: (val: number) => void;
  incomeTarget: number;
  setIncomeTarget: (val: number) => void;
  availableCrops: CropDetail[];
  selectedCrops: string[];
  toggleCrop: (code: string) => void;
  onRunOptimization: () => void;
  isLoading: boolean;
  onApplyPreset: (presetKey: string) => void;
  activePreset: string;
}

export const ScenarioBuilder: React.FC<ScenarioBuilderProps> = ({
  totalLand,
  setTotalLand,
  waterBudget,
  setWaterBudget,
  foodTarget,
  setFoodTarget,
  incomeTarget,
  setIncomeTarget,
  availableCrops,
  selectedCrops,
  toggleCrop,
  onRunOptimization,
  isLoading,
  onApplyPreset,
  activePreset
}) => {
  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 shadow-xl flex flex-col gap-5">
      
      {/* Header & Quick Climate Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Agricultural Scenario Configurator</h3>
            <p className="text-xs text-slate-400">Configure land, water budget, food security, and income constraints</p>
          </div>
        </div>

        {/* Preset Stress Shortcuts */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-mono mr-1">Stress Presets:</span>
          {[
            { key: 'baseline', label: 'Baseline', color: 'hover:border-emerald-500' },
            { key: 'water_20', label: '-20% Water', color: 'hover:border-amber-500' },
            { key: 'water_50', label: '-50% Water', color: 'hover:border-orange-500' },
            { key: 'extreme', label: 'Extreme Shock', color: 'hover:border-rose-500 text-rose-300' }
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => onApplyPreset(p.key)}
              className={`text-xs px-2.5 py-1 rounded-md border font-medium transition ${
                activePreset === p.key
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                  : `bg-slate-900/80 text-slate-300 border-slate-700 ${p.color}`
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Land Slider */}
        <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-emerald-400" /> Total Land Area
            </span>
            <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
              {totalLand} ha
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            step="1"
            value={totalLand}
            onChange={(e) => setTotalLand(parseFloat(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
            <span>5 ha</span>
            <span>≈ {(totalLand * 2.471).toFixed(1)} Acres</span>
            <span>100 ha</span>
          </div>
        </div>

        {/* Water Budget Slider */}
        <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 text-cyan-400" /> Water Budget
            </span>
            <span className="text-xs font-mono font-bold text-cyan-300 bg-slate-800 px-2 py-0.5 rounded">
              {(waterBudget / 1000).toFixed(0)}k m³
            </span>
          </div>
          <input
            type="range"
            min="10000"
            max="300000"
            step="5000"
            value={waterBudget}
            onChange={(e) => setWaterBudget(parseFloat(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
            <span>10k m³</span>
            <span>{waterBudget.toLocaleString()} m³</span>
            <span>300k m³</span>
          </div>
        </div>

        {/* Food Target Slider */}
        <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-amber-400" /> Food Target
            </span>
            <span className="text-xs font-mono font-bold text-amber-300 bg-slate-800 px-2 py-0.5 rounded">
              {foodTarget} Tonnes
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="150"
            step="5"
            value={foodTarget}
            onChange={(e) => setFoodTarget(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
            <span>10 t</span>
            <span>Edible Staple Grain</span>
            <span>150 t</span>
          </div>
        </div>

        {/* Income Target Slider */}
        <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Net Income Target
            </span>
            <span className="text-xs font-mono font-bold text-emerald-300 bg-slate-800 px-2 py-0.5 rounded">
              ₹{(incomeTarget / 100000).toFixed(1)} Lakhs
            </span>
          </div>
          <input
            type="range"
            min="300000"
            max="3000000"
            step="50000"
            value={incomeTarget}
            onChange={(e) => setIncomeTarget(parseFloat(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
            <span>₹3L</span>
            <span>₹{incomeTarget.toLocaleString()}</span>
            <span>₹30L</span>
          </div>
        </div>

      </div>

      {/* Candidate Crops Multi-Select Portfolio */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            Candidate Crop Portfolio ({selectedCrops.length} Active Candidates)
          </span>
          <span className="text-[11px] text-slate-400">Click to include/exclude crops from optimization pool</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {availableCrops.map((c) => {
            const isSelected = selectedCrops.includes(c.code);
            return (
              <button
                key={c.code}
                onClick={() => toggleCrop(c.code)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                  isSelected
                    ? 'bg-slate-800/90 text-white border-emerald-500/60 shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-slate-600'}`} />
                <span>{c.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {(c.water_req_m3_ha / 1000).toFixed(1)}k m³/ha
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Trigger Button */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-slate-400 hidden sm:block">
          <span className="font-semibold text-emerald-400">Google OR-Tools & HiGHS LP:</span> Multi-objective slack-elastic linear program.
        </div>

        <button
          onClick={onRunOptimization}
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 hover:brightness-110 active:scale-[0.98] transition cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              <span>Solving LP Formulation...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Run Mathematical Optimization</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
