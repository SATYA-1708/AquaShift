import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Layers, 
  Droplet, 
  Ruler, 
  Compass, 
  MapPin, 
  CloudSun,
  Eye,
  Maximize2
} from 'lucide-react';
import { GroundwaterStationInfo, WeatherData } from '../types';

interface GeospatialMapProps {
  coordinates: [number, number][];
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
  const [mapLayer, setMapLayer] = useState<'terrain' | 'satellite' | 'street'>('terrain');
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

    // Clear existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    let attribution = '&copy; OpenStreetMap &copy; CARTO';

    if (mapLayer === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri &mdash; Satellite Imagery';
    } else if (mapLayer === 'street') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
    }

    L.tileLayer(tileUrl, {
      attribution: attribution,
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    // Multi-timer invalidateSize to guarantee tiles render properly
    setTimeout(() => map.invalidateSize(), 100);
    setTimeout(() => map.invalidateSize(), 400);
    setTimeout(() => map.invalidateSize(), 1000);

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
        color: '#15803d',
        weight: 3,
        opacity: 1,
        fillColor: '#16a34a',
        fillOpacity: 0.3,
        dashArray: '6, 6'
      }).addTo(map);

      poly.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; padding: 6px; color: #0f172a; min-width: 180px;">
          <div style="font-weight: 700; color: #15803d; font-size: 14px; margin-bottom: 4px;">Selected Farm Field Cadastre</div>
          <div style="font-size: 13px; line-height: 1.5;">
            <b>Total Land:</b> ${areaHa} ha (${areaAcres} acres)<br/>
            <b>Elevation:</b> 232m ASL (Trans-Gangetic Plain)<br/>
            <span style="color: #64748b; font-size: 11px;">Verified Farm Polygon Coordinates</span>
          </div>
        </div>
      `);

      polygonLayerRef.current = poly;
      try {
        map.fitBounds(poly.getBounds(), { padding: [45, 45], maxZoom: 15 });
      } catch (e) {}
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
            background: #0284c7;
            border: 3px solid #ffffff;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.25);
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const stMarker = L.marker([groundwaterStation.latitude, groundwaterStation.longitude], {
        icon: gwIcon
      }).addTo(map);

      stMarker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; padding: 6px; color: #0f172a; min-width: 220px;">
          <div style="font-weight: 700; color: #0284c7; font-size: 14px; margin-bottom: 4px;">Govt Well: ${groundwaterStation.station_name}</div>
          <div style="font-size: 12px; line-height: 1.5;">
            <b>Water Depth:</b> <span style="color: #dc2626; font-weight: bold;">${groundwaterStation.depth_mbgl} meters below ground</span><br/>
            <b>Annual Depletion:</b> ${groundwaterStation.historical_trend_slope} m/year<br/>
            <b>Aquifer Status:</b> <span style="background: #fee2e2; color: #991b1b; padding: 1px 6px; border-radius: 4px; font-weight: bold;">${groundwaterStation.classification}</span><br/>
            <b>Distance:</b> ${groundwaterStation.distance_km} km from your plot<br/>
            <span style="color: #64748b; font-size: 10px;">Source: Central Ground Water Board (CGWB)</span>
          </div>
        </div>
      `);

      stationMarkerRef.current = stMarker;
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [coordinates, areaHa, areaAcres, groundwaterStation]);

  return (
    <div className="relative w-full h-[440px] rounded-2xl overflow-hidden farm-card shadow-xs border border-slate-200">
      {/* Map Canvas */}
      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: '100%', minHeight: '440px' }} 
        className="w-full h-full z-0 bg-slate-100" 
      />

      {/* Top Floating HUD: Layer Toggles */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-sm">
        <button
          onClick={() => setMapLayer('terrain')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            mapLayer === 'terrain' 
              ? 'bg-emerald-700 text-white shadow-2xs' 
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          Farmland Map
        </button>
        <button
          onClick={() => setMapLayer('satellite')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            mapLayer === 'satellite' 
              ? 'bg-emerald-700 text-white shadow-2xs' 
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => setMapLayer('street')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            mapLayer === 'street' 
              ? 'bg-emerald-700 text-white shadow-2xs' 
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          Roads
        </button>
      </div>

      {/* Right Floating HUD: Acreage & Land Details */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 max-w-[240px]">
        <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span className="flex items-center gap-1.5 uppercase text-[10px]">
              <Ruler className="w-3.5 h-3.5 text-emerald-700" /> Farm Field Area
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
              GPS
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-heading font-extrabold text-slate-900">{areaHa}</span>
            <span className="text-xs font-bold text-slate-600">Hectares</span>
          </div>
          <p className="text-xs text-emerald-700 font-bold mt-0.5">
            = {areaAcres} Standard Acres
          </p>

          {allocatedCrops && allocatedCrops.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Allocated Crops</span>
              <div className="flex flex-wrap gap-1">
                {allocatedCrops.slice(0, 4).map((c, i) => (
                  <span key={i} className="text-[11px] bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                    {c.crop_name.split(' ')[0]}: <b>{c.allocated_ha}ha</b>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Aquifer Well Indicator Badge */}
        {groundwaterStation && (
          <div className="bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-red-200 shadow-sm text-xs">
            <div className="flex items-center gap-1.5 text-red-700 font-bold mb-0.5">
              <Droplet className="w-3.5 h-3.5 fill-current" />
              <span>CGWB Well ({groundwaterStation.distance_km} km)</span>
            </div>
            <div className="text-slate-800 flex items-center justify-between">
              <span>Depth: <b className="text-red-700 font-bold">{groundwaterStation.depth_mbgl} m</b></span>
              <span className="text-red-800 text-[10px] font-bold uppercase bg-red-100 px-1.5 py-0.5 rounded border border-red-200">
                {groundwaterStation.classification}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar: Environmental Info */}
      {weather && showOverlays && (
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-1.5">
            <CloudSun className="w-4 h-4 text-amber-600" />
            <span className="text-slate-900 font-bold">{weather.temperature_c}°C</span>
          </div>
          <div className="h-3 w-px bg-slate-300 hidden sm:block" />
          <div>
            Daily Evaporation: <span className="font-bold text-blue-700">{weather.et0_mm} mm/d</span>
          </div>
          <div className="h-3 w-px bg-slate-300 hidden sm:block" />
          <div>
            Drought Risk: <span className={`font-bold ${weather.drought_risk === 'High' ? 'text-red-700' : 'text-amber-700'}`}>{weather.drought_risk}</span>
          </div>
        </div>
      )}

    </div>
  );
};
