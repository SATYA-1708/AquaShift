import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  Maximize2, 
  Droplet, 
  Ruler, 
  Compass, 
  MapPin, 
  CloudSun,
  Eye
} from 'lucide-react';
import { GroundwaterStationInfo, WeatherData } from '../types';

interface GeospatialMapProps {
  coordinates: [number, number][]; // [lat, lon] array
  areaHa: number;
  areaAcres: number;
  center: [number, number];
  groundwaterStation?: GroundwaterStationInfo;
  weather?: WeatherData;
  onPolygonChange?: (newCoords: [number, number][]) => void;
  allocatedCrops?: { crop_name: string; allocated_ha: number; percentage_of_land: number }[];
}

export const GeospatialMap: React.FC<GeospatialMapProps> = ({
  coordinates,
  areaHa,
  areaAcres,
  center,
  groundwaterStation,
  weather,
  onPolygonChange,
  allocatedCrops
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const stationMarkerRef = useRef<L.Marker | null>(null);
  const [mapLayer, setMapLayer] = useState<'satellite' | 'dark' | 'terrain'>('satellite');
  const [showOverlays, setShowOverlays] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: 14,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    map.setView(center, 14);

    // Layer management
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let attribution = '&copy; Esri &mdash; World Imagery';

    if (mapLayer === 'dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attribution = '&copy; OpenStreetMap contributors &copy; CARTO';
    } else if (mapLayer === 'terrain') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
    }

    L.tileLayer(tileUrl, {
      attribution: attribution,
      maxZoom: 19
    }).addTo(map);

  }, [center, mapLayer]);

  // Update Polygon and Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Draw field boundary polygon
    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
    }

    if (coordinates.length >= 3) {
      const poly = L.polygon(coordinates, {
        color: '#10b981',
        weight: 3,
        opacity: 0.9,
        fillColor: '#10b981',
        fillOpacity: 0.25,
        dashArray: '4, 4'
      }).addTo(map);

      poly.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px; color: #0f172a;">
          <b style="color: #059669; font-size: 13px;">Selected Agricultural Plot</b><br/>
          <b>Area:</b> ${areaHa} ha (${areaAcres} acres)<br/>
          <b>Elevation:</b> 232 m ASL<br/>
          <small style="color: #64748b;">PostGIS Geodesic Cadastral Layer</small>
        </div>
      `);

      polygonLayerRef.current = poly;
      map.fitBounds(poly.getBounds(), { padding: [50, 50], maxZoom: 16 });
    }

    // Add Groundwater Monitoring Station Marker
    if (stationMarkerRef.current) {
      map.removeLayer(stationMarkerRef.current);
    }

    if (groundwaterStation) {
      const gwIcon = L.divIcon({
        className: 'custom-gw-marker',
        html: `
          <div style="
            background: rgba(14, 165, 233, 0.9);
            border: 2px solid white;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 15px rgba(14, 165, 233, 0.7);
            color: white;
            font-size: 14px;
          ">
            💧
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const stMarker = L.marker([groundwaterStation.latitude, groundwaterStation.longitude], {
        icon: gwIcon
      }).addTo(map);

      stMarker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px; color: #0f172a;">
          <b style="color: #0284c7; font-size: 13px;">${groundwaterStation.station_name}</b><br/>
          <b>Station Code:</b> ${groundwaterStation.station_code}<br/>
          <b>Depth to Water:</b> <span style="color: #dc2626; font-weight: bold;">${groundwaterStation.depth_mbgl} mbgl</span><br/>
          <b>Depletion Rate:</b> ${groundwaterStation.historical_trend_slope} m/year<br/>
          <b>Classification:</b> <span style="background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${groundwaterStation.classification}</span><br/>
          <b>Distance to Plot:</b> ${groundwaterStation.distance_km} km<br/>
          <small style="color: #64748b;">Source: ${groundwaterStation.source}</small>
        </div>
      `);

      stationMarkerRef.current = stMarker;
    }
  }, [coordinates, areaHa, areaAcres, groundwaterStation]);

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden glass-panel border border-slate-700/60 shadow-2xl">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-slate-950" />

      {/* Top Floating HUD: Layer Toggles & Mode */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/70 shadow-lg">
        <button
          onClick={() => setMapLayer('satellite')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            mapLayer === 'satellite' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
          }`}
        >
          High-Res Satellite
        </button>
        <button
          onClick={() => setMapLayer('dark')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            mapLayer === 'dark' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
          }`}
        >
          Carto Dark
        </button>
        <button
          onClick={() => setMapLayer('terrain')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            mapLayer === 'terrain' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
          }`}
        >
          Topographic
        </button>
      </div>

      {/* Right Floating HUD: Acreage & PostGIS Cadastral Metrics */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-emerald-500/40 shadow-xl min-w-[210px]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-mono uppercase">
              <Ruler className="w-3.5 h-3.5 text-emerald-400" /> Plot Cadastre
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
              WGS-84
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">{areaHa}</span>
            <span className="text-sm font-semibold text-emerald-400">Hectares</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            ≈ {areaAcres} Standard Acres
          </p>

          {allocatedCrops && allocatedCrops.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Active Optimized Mix</span>
              <div className="flex flex-wrap gap-1">
                {allocatedCrops.slice(0, 4).map((c, i) => (
                  <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                    {c.crop_name.split(' ')[0]}: {c.allocated_ha} ha
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Aquifer Stress Indicator Badge */}
        {groundwaterStation && (
          <div className="bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-red-500/40 shadow-lg text-xs">
            <div className="flex items-center gap-1.5 text-rose-400 font-semibold mb-0.5">
              <Droplet className="w-3.5 h-3.5" />
              <span>CGWB Monitoring Well ({groundwaterStation.distance_km} km)</span>
            </div>
            <div className="text-slate-300">
              Depth: <span className="font-bold text-white">{groundwaterStation.depth_mbgl} mbgl</span>
              <span className="text-rose-400 font-mono ml-2">({groundwaterStation.classification})</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar: Environmental Provenance & Weather HUD */}
      {weather && showOverlays && (
        <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/70 shadow-lg flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <CloudSun className="w-4 h-4 text-amber-400" />
            <span className="text-white font-medium">{weather.temperature_c}°C</span>
            <span className="text-slate-400">({weather.temp_min_c}° / {weather.temp_max_c}°)</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="text-slate-300">
            ET0: <span className="font-semibold text-cyan-400">{weather.et0_mm} mm/d</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="text-slate-300">
            Drought Risk: <span className={`font-semibold ${weather.drought_risk === 'High' ? 'text-rose-400' : 'text-amber-400'}`}>{weather.drought_risk}</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="text-[11px] text-slate-400 font-mono">
            {weather.source.split(' ')[0]} Live Ingested
          </div>
        </div>
      )}

    </div>
  );
};
