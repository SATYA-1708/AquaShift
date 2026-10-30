import React from 'react';
import { 
  Sprout
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
    <div className="farm-card p-6 flex flex-col gap-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-200">
            <Sprout className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-base font-heading font-extrabold text-slate-900">
              Crop Yield &amp; Profit Estimator
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Based on official ICAR yield data, Open-Meteo local evapotranspiration, and APMC mandi market prices.
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 self-start sm:self-auto">
          {modelName}
        </span>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {predictions.map((p) => {
          return (
            <div 
              key={p.crop_code} 
              className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between hover:border-emerald-300 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {p.crop_name}
                  </span>
                  <span className="text-[11px] font-semibold bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    {p.category}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs mt-3">
                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-500">Expected Yield:</span>
                    <b className="text-slate-900">{p.predicted_yield_tonnes_ha} Tonnes / ha</b>
                  </div>

                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-500">Water Demand:</span>
                    <b className="text-blue-700">{p.water_req_m3_ha.toLocaleString()} m³ / ha</b>
                  </div>

                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-500">Mandi Price (Gross):</span>
                    <span className="text-slate-900 font-semibold">₹{p.estimated_revenue_inr_ha.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-500">Cultivation Cost:</span>
                    <span className="text-slate-500">₹{p.cultivation_cost_inr_ha.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-emerald-800 pt-2 border-t border-slate-200 font-bold text-sm">
                    <span>Net Profit / ha:</span>
                    <span>₹{p.estimated_net_income_inr_ha.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Suitability & Confidence */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  Suitability: <b className="text-emerald-700 font-bold">{(p.suitability_score * 100).toFixed(0)}%</b>
                </span>
                <span className="text-slate-400 font-medium">
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
