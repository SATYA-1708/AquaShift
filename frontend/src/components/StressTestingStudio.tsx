import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Sparkles, 
  AlertTriangle, 
  Droplet, 
  TrendingUp, 
  Utensils, 
  CheckCircle,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { StressTestResponse, StressTestScenarioResult } from '../types';

interface StressTestingStudioProps {
  stressData: StressTestResponse;
  onSelectScenario: (scenario: StressTestScenarioResult) => void;
}

export const StressTestingStudio: React.FC<StressTestingStudioProps> = ({
  stressData,
  onSelectScenario
}) => {
  const allScenarios = [stressData.baseline, ...stressData.scenarios];
  const [selectedId, setSelectedId] = useState<string>(allScenarios[0]?.scenario_id || 'baseline');

  const activeScenario = allScenarios.find(s => s.scenario_id === selectedId) || allScenarios[0];

  // Format data for comparative multi-metric chart
  const comparisonData = allScenarios.map((s) => ({
    name: s.scenario_name.split(':')[0].replace(/^[A-G]\.\s*/, ''),
    waterConsumedK: Math.round(s.water_consumed_m3 / 1000),
    waterBudgetK: Math.round(s.water_budget_m3 / 1000),
    incomeLakhs: Number((s.net_income_inr / 100000).toFixed(1)),
    foodTonnes: Math.round(s.food_produced_tonnes)
  }));

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 shadow-xl flex flex-col gap-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Climate & Economic Stress-Testing Studio
            </h3>
            <p className="text-xs text-slate-400">
              Evaluates resilience across 7 canonical climate, groundwater, and economic shock profiles
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-cyan-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
          7 Scenarios Evaluated Simultaneously
        </span>
      </div>

      {/* Comparative Multi-Bar Chart */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            Water Consumption (k m³) vs Net Income (₹ Lakhs) Across Stress Profiles
          </span>
          <span className="text-[11px] text-slate-400">Simulated by AquaShift Engine</span>
        </div>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="waterConsumedK" name="Water Consumed (k m³)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="incomeLakhs" name="Net Income (₹ Lakhs)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="foodTonnes" name="Food Produced (Tonnes)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scenario Selector & Deep-Dive Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Scenario List (Left) */}
        <div className="lg:col-span-5 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">
            Select Stress Profile for Deep Dive
          </span>

          {allScenarios.map((s) => {
            const isSelected = s.scenario_id === selectedId;
            return (
              <button
                key={s.scenario_id}
                onClick={() => setSelectedId(s.scenario_id)}
                className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500/50 shadow-md'
                    : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{s.scenario_name}</span>
                    {s.diagnosis.has_conflict && (
                      <span className="text-[9px] font-mono bg-amber-950 text-amber-400 px-1.5 py-0.2 rounded border border-amber-800">
                        Conflict
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{s.description}</p>
                </div>
                <ArrowRight className={`w-4 h-4 shrink-0 transition ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
              </button>
            );
          })}
        </div>

        {/* Selected Scenario Detailed Allocation Inspection (Right) */}
        <div className="lg:col-span-7 bg-slate-900/70 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <div>
                <h4 className="text-xs font-bold text-cyan-300 font-mono uppercase">
                  Scenario Inspection: {activeScenario.scenario_name}
                </h4>
                <p className="text-xs text-slate-400">{activeScenario.description}</p>
              </div>

              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                activeScenario.diagnosis.has_conflict
                  ? 'bg-amber-950 text-amber-400 border-amber-800'
                  : 'bg-emerald-950 text-emerald-400 border-emerald-800'
              }`}>
                {activeScenario.diagnosis.has_conflict ? 'Slack Relaxed' : 'Feasible Target'}
              </span>
            </div>

            {/* Metrics summary */}
            <div className="grid grid-cols-3 gap-2 text-xs mb-3 font-mono">
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Water Consumed</span>
                <span className="font-bold text-cyan-300">{activeScenario.water_consumed_m3.toLocaleString()} m³</span>
                <span className="text-[10px] text-slate-500 block">of {activeScenario.water_budget_m3.toLocaleString()}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Food Produced</span>
                <span className="font-bold text-amber-300">{activeScenario.food_produced_tonnes.toFixed(1)} t</span>
                <span className="text-[10px] text-slate-500 block">target {activeScenario.food_target_tonnes} t</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Net Income</span>
                <span className="font-bold text-emerald-300">₹{activeScenario.net_income_inr.toLocaleString()}</span>
                <span className="text-[10px] text-slate-500 block">target ₹{activeScenario.income_target_inr.toLocaleString()}</span>
              </div>
            </div>

            {/* Resulting Crop Mix */}
            <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1.5">
              Resulting Mathematical Crop Reallocation
            </span>
            <div className="space-y-1.5">
              {activeScenario.allocations.map((a) => (
                <div key={a.crop_code} className="flex items-center justify-between text-xs bg-slate-950/60 px-3 py-1.5 rounded border border-slate-800">
                  <span className="font-medium text-white">{a.crop_name}</span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-300">{a.allocated_ha} ha ({a.percentage_of_land}%)</span>
                    <span className="text-cyan-400">{(a.expected_water_consumed_m3 / 1000).toFixed(1)}k m³</span>
                    <span className="text-emerald-400 font-bold">₹{(a.expected_net_income_inr / 1000).toFixed(0)}k</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conflict diagnosis alert */}
          {activeScenario.diagnosis.has_conflict && (
            <div className="mt-3 p-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
              <span className="font-bold block">Bottleneck Diagnosis:</span>
              <span>{activeScenario.diagnosis.explanation}</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
