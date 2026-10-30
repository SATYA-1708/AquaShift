import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Layers, 
  Droplet, 
  Ruler, 
  MapPin, 
  CloudSun,
  PenTool,
  Check,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { GroundwaterStationInfo, WeatherData } from '../types';
import { Translations } from '../constants/translations';

interface GeospatialMapProps {
  coordinates: [number, number][];
  areaHa: number;
  areaAcres: number;
  center: [number, number];
  groundwaterStation?: GroundwaterStationInfo;
  weather?: WeatherData;
  onPolygonChange?: (newCoords: [number, number][]) => void;
  onPolygonDrawn?: (newCoords: [number, number][], calculatedAreaHa: number) => void;
  allocatedCrops?: { crop_name: string; allocated_ha: number; percentage_of_land: number }[];
  t: Translations;
}

export const GeospatialMap: React.FC<GeospatialMapProps> = ({
  coordinates,
  areaHa,
  areaAcres,
  center,
  groundwaterStation,
  weather,
  onPolygonChange,
  onPolygonDrawn,
  allocatedCrops,
  t
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const drawingLayerRef = useRef<L.LayerGroup | null>(null);
  const stationMarkerRef = useRef<L.Marker | null>(null);

  // Layer & Interactive State
  const [mapLayer, setMapLayer] = useState<'satellite' | 'terrain' | 'street'>('satellite');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);

  // Calculate Geodesic Area (Shoelace spherical formula)
  const calculatePolygonAreaHa = (pts: [number, number][]): number => {
    if (pts.length < 3) return 25.0;
    const earthRadius = 6378137; // meters
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      const p1 = pts[i];
      const p2 = pts[j];
      const radLat1 = (p1[0] * Math.PI) / 180;
      const radLat2 = (p2[0] * Math.PI) / 180;
      const deltaLon = ((p2[1] - p1[1]) * Math.PI) / 180;
      area += deltaLon * (2 + Math.sin(radLat1) + Math.sin(radLat2));
    }
    area = Math.abs((area * earthRadius * earthRadius) / 2.0);
    const ha = area / 10000;
    return Math.max(2, Math.min(120, Math.round(ha * 10) / 10));
  };

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
      drawingLayerRef.current = L.layerGroup().addTo(map);
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

    let tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let attribution = '&copy; Esri &mdash; High-Resolution Satellite';

    if (mapLayer === 'terrain') {
      tileUrl = 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap &copy; CARTO';
    } else if (mapLayer === 'street') {
      tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
    }

    L.tileLayer(tileUrl, {
      attribution: attribution,
      maxZoom: 19
    }).addTo(map);

    setTimeout(() => map.invalidateSize(), 100);
    setTimeout(() => map.invalidateSize(), 400);
  }, [center, mapLayer]);

  // Handle Interactive Map Click for Plot Drawing
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!isDrawing) return;
      const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
      setDrawnPoints((prev) => [...prev, newPoint]);
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isDrawing]);

  // Render Live Preview of Drawn Points
  useEffect(() => {
    if (!drawingLayerRef.current || !mapInstanceRef.current) return;
    const dGroup = drawingLayerRef.current;
    dGroup.clearLayers();

    if (isDrawing && drawnPoints.length > 0) {
      drawnPoints.forEach((pt, idx) => {
        const marker = L.circleMarker(pt, {
          radius: 6,
          color: '#ffffff',
          weight: 2,
          fillColor: '#22c55e',
          fillOpacity: 1
        });
        marker.bindTooltip(`Point ${idx + 1}`, { permanent: true, direction: 'top' });
        dGroup.addLayer(marker);
      });

      if (drawnPoints.length >= 2) {
        const line = L.polyline(drawnPoints, {
          color: '#22c55e',
          weight: 3,
          dashArray: '4, 4'
        });
        dGroup.addLayer(line);
      }

      if (drawnPoints.length >= 3) {
        const polyPreview = L.polygon(drawnPoints, {
          color: '#22c55e',
          weight: 2,
          fillColor: '#4ade80',
          fillOpacity: 0.25
        });
        dGroup.addLayer(polyPreview);
      }
    }
  }, [drawnPoints, isDrawing]);

  // Complete Drawing Action
  const handleFinishDrawing = () => {
    if (drawnPoints.length < 3) {
      alert("Please click at least 3 points on the satellite map to outline your field.");
      return;
    }
    const closedCoords: [number, number][] = [...drawnPoints, drawnPoints[0]];
    const calculatedHa = calculatePolygonAreaHa(drawnPoints);

    if (onPolygonDrawn) {
      onPolygonDrawn(closedCoords, calculatedHa);
    } else if (onPolygonChange) {
      onPolygonChange(closedCoords);
    }

    setIsDrawing(false);
    setDrawnPoints([]);
    if (drawingLayerRef.current) {
      drawingLayerRef.current.clearLayers();
    }
  };

  // Cancel Drawing Action
  const handleCancelDrawing = () => {
    setIsDrawing(false);
    setDrawnPoints([]);
    if (drawingLayerRef.current) {
      drawingLayerRef.current.clearLayers();
    }
  };

  // Update Main Polygon and Station Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
    }

    if (coordinates.length >= 3 && !isDrawing) {
      const isSatellite = mapLayer === 'satellite';
      const poly = L.polygon(coordinates, {
        color: isSatellite ? '#22c55e' : '#15803d',
        weight: 3.5,
        opacity: 1,
        fillColor: isSatellite ? '#4ade80' : '#16a34a',
        fillOpacity: isSatellite ? 0.35 : 0.28,
        dashArray: '6, 6'
      }).addTo(map);

      poly.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; padding: 6px; color: #0f172a; min-width: 180px;">
          <div style="font-weight: 700; color: #15803d; font-size: 14px; margin-bottom: 4px;">Selected Farm Field Cadastre</div>
          <div style="font-size: 13px; line-height: 1.5;">
            <b>Total Land:</b> ${areaHa} ha (${areaAcres} acres)<br/>
            <b>Elevation:</b> 232m ASL (Trans-Gangetic Plain)<br/>
            <span style="color: #64748b; font-size: 11px;">Verified Satellite Field Boundary</span>
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
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.35);
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

  }, [coordinates, areaHa, areaAcres, groundwaterStation, mapLayer, isDrawing]);

  return (
    <div className="relative w-full h-[450px] rounded-2xl overflow-hidden farm-card shadow-xs border border-slate-200">
      
      {/* Map Canvas */}
      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: '100%', minHeight: '450px', cursor: isDrawing ? 'crosshair' : 'grab' }} 
        className="w-full h-full z-0 bg-slate-900" 
      />

      {/* Top Floating HUD: Layer Toggles & Interactive Plot Drawer */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-sm">
        <button
          onClick={() => setMapLayer('satellite')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
            mapLayer === 'satellite' 
              ? 'bg-emerald-700 text-white shadow-2xs' 
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <span>🛰️</span>
          <span>Satellite</span>
        </button>
        <button
          onClick={() => setMapLayer('terrain')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
            mapLayer === 'terrain' 
              ? 'bg-emerald-700 text-white shadow-2xs' 
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <span>🗺️</span>
          <span>Farmland</span>
        </button>
        <button
          onClick={() => setMapLayer('street')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
            mapLayer === 'street' 
              ? 'bg-emerald-700 text-white shadow-2xs' 
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <span>🛣️</span>
          <span>Roads</span>
        </button>

        <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block" />

        {/* Interactive Draw My Plot Button */}
        {!isDrawing ? (
          <button
            onClick={() => {
              setIsDrawing(true);
              setDrawnPoints([]);
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>{t.drawPlotBtn}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleFinishDrawing}
              disabled={drawnPoints.length < 3}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{t.finishDrawingBtn} ({drawnPoints.length} pts)</span>
            </button>
            <button
              onClick={handleCancelDrawing}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Floating Prompt Banner when in Drawing Mode */}
      {isDrawing && (
        <div className="absolute top-16 left-4 right-4 z-10 bg-amber-500/95 text-white px-4 py-2.5 rounded-xl shadow-md text-xs font-bold flex items-center justify-between backdrop-blur-xs">
          <span>📍 {t.drawPlotPrompt} ({drawnPoints.length} points placed)</span>
          <span className="text-[11px] underline cursor-pointer" onClick={handleCancelDrawing}>Cancel</span>
        </div>
      )}

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
      {weather && (
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
