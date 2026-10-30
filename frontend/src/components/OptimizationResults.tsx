import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { 
  CheckCircle, 
  AlertTriangle, 
  Droplets, 
  Utensils, 
  TrendingUp, 
  FileText, 
  Sparkles,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { OptimizationResponse } from '../types';

interface OptimizationResultsProps {
  result: OptimizationResponse;
  onOpenAIReport: () => void;
}

const CROP_COLORS: Record<string, string> = {
  PADDY: '#0284c7', // Sky Blue (flood water)
  WHEAT: '#eab308', // Golden Yellow
  MAIZE: '#f97316', // Orange
  COTTON: '#a855f7', // Purple
  MOONG: '#10b981', // Emerald Green (nitrogen fixing)
  CHICKPEA: '#84cc16', // Lime
  MUSTARD: '#facc15', // Bright Yellow
  SUGARCANE: '#06b6d4', // Cyan
  GROUNDNUT: '#b45309', // Amber Brown
  TOMATO: '#ef4444' // Red
};

export const OptimizationResults: React.FC<OptimizationResultsProps> = ({
  result,
  onOpenAIReport
}) => {
  const { allocations, diagnosis } = result;

  // Chart data formatting
  const pieData = allocations.map((a) => ({
    name: a.crop_name,
    value: a.allocated_ha,
    percentage: a.percentage_of_land,
    color: CROP_COLORS[a.crop_code] || '#64748b'
  }));

  const barData = allocations.map((a) => ({
    name: a.crop_name.split(' ')[0],
    waterK: Math.round(a.expected_water_consumed_m3 / 1000),
    incomeL: Number((a.expected_net_income_inr / 100000).toFixed(2))
  }));

  const waterPct = Math.min(100, Math.round((result.total_water_consumed_m3 / Math.max(1, result.total_water_budget_m3)) * 100));
  const foodPct = Math.round((result.total_food_produced_tonnes / Math.max(1, result.total_food_target_tonnes)) * 100);
  const incomePct = Math.round((result.total_farmer_net_income_inr / Math.max(1, result.total_income_target_inr)) * 100);

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 shadow-xl flex flex-col gap-5">
      
      {/* Header & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                OR-Tools Optimal Allocation Engine
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {result.solver_status}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Scenario: {result.scenario_name} | Field: {result.total_land_allocated_ha} ha allocated
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAIReport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-semibold shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Agronomic Report</span>
        </button>
      </div>

      {/* Conflict / Bottleneck Diagnosis Alert (When constraints clash) */}
      {diagnosis.has_conflict && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-3.5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-amber-300 uppercase tracking-wide block mb-1">
              Binding Constraint Conflict Detected — Elastic Slack Relaxation Engaged
            </span>
            <p className="text-slate-300 leading-relaxed mb-2">
              {diagnosis.explanation}
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] font-mono">
              {diagnosis.binding_constraints.map((c) => (
                <span key={c} className="bg-slate-900/90 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                  Dual Bottleneck: {c}
                </span>
              ))}
              {diagnosis.water_shortfall_m3 > 0 && (
                <span className="bg-slate-900/90 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30">
                  Water Shortfall: {diagnosis.water_shortfall_m3.toLocaleString()} m³
                </span>
              )}
              {diagnosis.income_shortfall_inr > 0 && (
                <span className="bg-slate-900/90 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                  Income Gap: ₹{diagnosis.income_shortfall_inr.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KPI Performance Trilemma Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* 1. Water Consumed vs Budget */}
        <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-medium text-slate-300">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Water Consumption
            </span>
            <span className="text-[10px] font-mono text-cyan-400">{waterPct}% of Budget</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-white">
              {result.total_water_consumed_m3.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ {result.total_water_budget_m3.toLocaleString()} m³</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                waterPct > 95 ? 'bg-rose-500' : 'bg-cyan-400'
              }`}
              style={{ width: `${Math.min(100, waterPct)}%` }}
            />
          </div>
          <p className="text-[10px] text-emerald-400 mt-2 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            {result.water_savings_vs_budget_m3.toLocaleString()} m³ Saved vs Regional Baseline
          </p>
        </div>

        {/* 2. Food Production vs Target */}
        <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-medium text-slate-300">
              <Utensils className="w-3.5 h-3.5 text-amber-400" /> Food Production
            </span>
            <span className="text-[10px] font-mono text-amber-400">{foodPct}% of Target</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-white">
              {result.total_food_produced_tonnes.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ {result.total_food_target_tonnes} Tonnes</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full rounded-full bg-amber-400 transition-all duration-500" 
              style={{ width: `${Math.min(100, foodPct)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-mono">
            Nutritional security satisfied via Cereals & Pulses
          </p>
        </div>

        {/* 3. Farmer Net Income vs Target */}
        <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-medium text-slate-300">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Net Farmer Income
            </span>
            <span className="text-[10px] font-mono text-emerald-400">{incomePct}% of Target</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-white">
              ₹{result.total_farmer_net_income_inr.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ ₹{result.total_income_target_inr.toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full rounded-full bg-emerald-400 transition-all duration-500" 
              style={{ width: `${Math.min(100, incomePct)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-mono">
            ₹{(result.total_farmer_net_income_inr / Math.max(1, result.total_land_allocated_ha)).toFixed(0)} / ha Average Profit
          </p>
        </div>

      </div>

      {/* Visual Allocations: Donut Chart & Allocation Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Donut Chart */}
        <div className="lg:col-span-5 bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-2">
            Land Area Distribution (Hectares)
          </span>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950 border border-slate-700 p-2 rounded-lg text-xs font-mono shadow-xl">
                          <b className="text-white block">{data.name}</b>
                          <span className="text-emerald-400">{data.value} ha ({data.percentage}%)</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {pieData.map((item, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name.split(' ')[0]}: {item.percentage}%</span>
              </span>
            ))}
          </div>
        </div>

        {/* Allocation Table */}
        <div className="lg:col-span-7 bg-slate-900/60 p-4 rounded-xl border border-slate-800 overflow-x-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-3 block">
            Crops Resource Breakdown
          </span>

          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2 font-medium">Crop</th>
                <th className="pb-2 font-medium">Area</th>
                <th className="pb-2 font-medium">Yield</th>
                <th className="pb-2 font-medium">Water (m³)</th>
                <th className="pb-2 font-medium text-right">Net Income</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {allocations.map((a) => (
                <tr key={a.crop_code} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 flex items-center gap-2 font-sans font-medium text-white">
                    <span 
                      className="w-2 h-2 rounded-full shrink-0" 
                      style={{ backgroundColor: CROP_COLORS[a.crop_code] || '#10b981' }} 
                    />
                    <span>{a.crop_name}</span>
                  </td>
                  <td className="py-2.5 text-slate-200">
                    {a.allocated_ha} ha <span className="text-[10px] text-slate-400">({a.percentage_of_land}%)</span>
                  </td>
                  <td className="py-2.5 text-slate-200">
                    {a.expected_yield_tonnes.toFixed(1)} t
                  </td>
                  <td className="py-2.5 text-cyan-300 font-mono">
                    {a.expected_water_consumed_m3.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-emerald-300 font-semibold text-right">
                    ₹{a.expected_net_income_inr.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
