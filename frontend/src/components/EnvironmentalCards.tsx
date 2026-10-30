import React from 'react';
import { 
  CloudSun, 
  Droplets, 
  Gauge, 
  Wind, 
  Layers, 
  Sparkles, 
  AlertTriangle,
  Compass,
  TrendingDown,
  ShieldAlert
} from 'lucide-react';
import { WeatherData, SoilProfile, GroundwaterStationInfo } from '../types';

interface EnvironmentalCardsProps {
  weather?: WeatherData;
  soil?: SoilProfile;
  groundwater?: GroundwaterStationInfo;
}

export const EnvironmentalCards: React.FC<EnvironmentalCardsProps> = ({
  weather,
  soil,
  groundwater
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      {/* 1. Real-Time Meteorological Intelligence */}
      <div className="glass-panel p-4 rounded-xl border border-slate-700/60 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CloudSun className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Weather & Evapotranspiration</h4>
              <p className="text-[10px] text-slate-400 font-mono">Open-Meteo Real-Time Ingestion</p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-slate-800 text-amber-300 px-2 py-0.5 rounded border border-slate-700">
            ET0: {weather?.et0_mm || 5.2} mm/d
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Temperature</span>
            <span className="text-base font-bold text-white">{weather?.temperature_c || 28.5}°C</span>
            <span className="text-[10px] text-slate-400 block font-mono">Range: {weather?.temp_min_c || 21}° - {weather?.temp_max_c || 35}°</span>
          </div>

          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Humidity & Wind</span>
            <span className="text-base font-bold text-cyan-300">{weather?.humidity_pct || 52}%</span>
            <span className="text-[10px] text-slate-400 block font-mono">{weather?.wind_speed_kmh || 12} km/h</span>
          </div>

          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Precipitation Deficit</span>
            <span className="text-base font-bold text-rose-400">{weather?.rainfall_deficit_pct || 72}%</span>
            <span className="text-[10px] text-slate-400 block font-mono">P: {weather?.precipitation_mm || 0.0} mm</span>
          </div>

          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block">UNEP Aridity Index</span>
            <span className="text-base font-bold text-amber-400">{weather?.aridity_index || 0.22}</span>
            <span className="text-[10px] text-rose-400 block font-semibold">{weather?.drought_risk || 'High'} Risk</span>
          </div>
        </div>
      </div>

      {/* 2. Soil Agronomic Intelligence */}
      <div className="glass-panel p-4 rounded-xl border border-slate-700/60 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Soil Pedology & Chemistry</h4>
              <p className="text-[10px] text-slate-400 font-mono">ISRIC SoilGrids & ICAR 250m</p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-slate-800 text-emerald-300 px-2 py-0.5 rounded border border-slate-700">
            pH {soil?.ph || 7.6}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 col-span-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Texture Classification</span>
              <span className="text-sm font-bold text-white">{soil?.texture || 'Alluvial Sandy Loam'}</span>
            </div>
            <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
              {(soil?.confidence || 0.90) * 100}% Conf.
            </span>
          </div>

          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Organic Carbon (OC)</span>
            <span className="text-sm font-bold text-emerald-300">{soil?.organic_carbon_pct || 0.52}%</span>
            <span className="text-[10px] text-slate-400 block font-mono">Standard Medium</span>
          </div>

          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Water Holding Capacity</span>
            <span className="text-sm font-bold text-cyan-300">{soil?.water_holding_capacity_pct || 36.5}%</span>
            <span className="text-[10px] text-slate-400 block font-mono">Moisture: {soil?.soil_moisture_pct || 21}%</span>
          </div>

          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 col-span-2">
            <span className="text-[10px] text-slate-400 block font-mono">Available N-P-K (kg/ha)</span>
            <div className="flex items-center justify-between mt-1 text-xs font-mono">
              <span className="text-slate-300">N: <b className="text-white">{soil?.nitrogen_kg_ha || 215}</b></span>
              <span className="text-slate-300">P: <b className="text-white">{soil?.phosphorus_kg_ha || 22}</b></span>
              <span className="text-slate-300">K: <b className="text-white">{soil?.potassium_kg_ha || 210}</b></span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CGWB Groundwater & Aquifer Telemetry */}
      <div className="glass-panel p-4 rounded-xl border border-slate-700/60 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Groundwater Aquifer Depth</h4>
              <p className="text-[10px] text-slate-400 font-mono">CGWB / NWIC Telemetry Monitoring</p>
            </div>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
            groundwater?.classification === 'Over-Exploited'
              ? 'bg-rose-950 text-rose-300 border-rose-800'
              : 'bg-amber-950 text-amber-300 border-amber-800'
          }`}>
            {groundwater?.classification || 'Over-Exploited'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 col-span-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Water Table Depth</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-extrabold text-white">{groundwater?.depth_mbgl || 34.6}</span>
                <span className="text-xs font-semibold text-rose-400">mbgl</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-mono">Annual Drawdown</span>
              <span className="text-sm font-bold text-rose-400 flex items-center gap-1 justify-end">
                <TrendingDown className="w-3.5 h-3.5" />
                {Math.abs(groundwater?.historical_trend_slope || 0.68)} m/yr
              </span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Telemetry Station</span>
            <span className="text-xs font-bold text-slate-200 truncate block">{groundwater?.station_name || 'Bhawanigarh DWLR'}</span>
            <span className="text-[10px] text-cyan-400 font-mono">{groundwater?.distance_km || 4.2} km away</span>
          </div>

          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Aquifer Vulnerability</span>
            <span className="text-xs font-bold text-rose-300 block">Severe Overdraft</span>
            <span className="text-[10px] text-slate-400 font-mono">Stage: &gt;160% extracted</span>
          </div>

          <div className="col-span-2 text-[10px] text-slate-400 italic">
            *Nearby telemetry station indicates regional aquifer stress; on-farm budget must be conserved to avert tube-well failure.
          </div>
        </div>
      </div>

    </div>
  );
};
