import React from 'react';
import { 
  Cpu, 
  Droplet, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles,
  Info
} from 'lucide-react';
import { CropPredictionItem } from '../types';

interface CropPredictionStudioProps {
  predictions: CropPredictionItem[];
  modelName: string;
}

export const CropPredictionStudio: React.FC<CropPredictionStudioProps> = ({
  predictions,
  modelName
}) => {
  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 shadow-xl flex flex-col gap-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              FAO-56 Agronomic & ML Prediction Engine
            </h3>
            <p className="text-xs text-slate-400">
              Couples FAO-56 Penman-Monteith crop evapotranspiration with ICAR regional yield response functions
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-800">
          Model: {modelName}
        </span>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {predictions.map((p) => {
          return (
            <div 
              key={p.crop_code} 
              className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white text-xs">{p.crop_name}</span>
                  <span className="text-[10px] font-mono bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded">
                    {p.category}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-mono mt-2">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Predicted Yield:</span>
                    <b className="text-white">{p.predicted_yield_tonnes_ha} t/ha</b>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Water Demand:</span>
                    <b className="text-cyan-300">{p.water_req_m3_ha.toLocaleString()} m³/ha</b>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Gross Revenue:</span>
                    <span className="text-slate-200">₹{p.estimated_revenue_inr_ha.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Cultivation Cost:</span>
                    <span className="text-slate-400">₹{p.cultivation_cost_inr_ha.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-emerald-400 pt-1 border-t border-slate-800">
                    <span>Net Income:</span>
                    <b>₹{p.estimated_net_income_inr_ha.toLocaleString()} / ha</b>
                  </div>
                </div>
              </div>

              {/* Suitability & Confidence */}
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">
                  Suitability: <b className="text-emerald-400">{(p.suitability_score * 100).toFixed(0)}%</b>
                </span>
                <span className="text-slate-500">
                  Conf: {(p.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
