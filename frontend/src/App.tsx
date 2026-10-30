import React, { useState, useEffect } from 'react';
import { Navbar, PRESET_LOCATIONS } from './components/Navbar';
import { HackathonDemoBar } from './components/HackathonDemoBar';
import { GeospatialMap } from './components/GeospatialMap';
import { EnvironmentalCards } from './components/EnvironmentalCards';
import { ScenarioBuilder } from './components/ScenarioBuilder';
import { OptimizationResults } from './components/OptimizationResults';
import { StressTestingStudio } from './components/StressTestingStudio';
import { CropPredictionStudio } from './components/CropPredictionStudio';
import { AIReportModal } from './components/AIReportModal';
import { LandingHero } from './components/LandingHero';

import {
  WeatherData,
  SoilProfile,
  GroundwaterStationInfo,
  CropDetail,
  CropPredictionItem,
  OptimizationResponse,
  StressTestResponse,
  AIExplanationResponse
} from './types';

import {
  fetchReverseGeocode,
  fetchCurrentWeather,
  fetchSoilProfile,
  fetchGroundwaterInfo,
  fetchCropsCatalog,
  fetchCropPredictions,
  runOptimization,
  runStressTestSuite,
  fetchAIDecisionExplanation,
  fetchDemoPreset
} from './services/api';

export function App() {
  // Navigation & View
  const [currentView, setCurrentView] = useState<'dashboard' | 'map' | 'stress' | 'landing'>('dashboard');
  const [selectedLocationKey, setSelectedLocationKey] = useState<string>('sangrur');
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Demo Mode
  const [demoActive, setDemoActive] = useState<boolean>(true);
  const [demoStep, setDemoStep] = useState<number>(1);

  // Geospatial & Field Coordinates
  const [activeCenter, setActiveCenter] = useState<[number, number]>([30.2458, 75.8421]);
  const [fieldCoordinates, setFieldCoordinates] = useState<[number, number][]>([
    [30.2420, 75.8380],
    [30.2425, 75.8470],
    [30.2510, 75.8465],
    [30.2505, 75.8375],
    [30.2420, 75.8380]
  ]);

  // Scenario Constraints
  const [totalLand, setTotalLand] = useState<number>(25.0);
  const [waterBudget, setWaterBudget] = useState<number>(180000.0);
  const [foodTarget, setFoodTarget] = useState<number>(45.0);
  const [incomeTarget, setIncomeTarget] = useState<number>(1100000.0);
  const [activePreset, setActivePreset] = useState<string>('baseline');
  const [selectedCrops, setSelectedCrops] = useState<string[]>([
    'PADDY', 'WHEAT', 'MAIZE', 'COTTON', 'MOONG', 'MUSTARD', 'TOMATO', 'GROUNDNUT'
  ]);

  // Data States
  const [weather, setWeather] = useState<WeatherData | undefined>();
  const [soil, setSoil] = useState<SoilProfile | undefined>();
  const [groundwater, setGroundwater] = useState<GroundwaterStationInfo | undefined>();
  const [cropsCatalog, setCropsCatalog] = useState<CropDetail[]>([]);
  const [predictions, setPredictions] = useState<CropPredictionItem[]>([]);
  const [optResult, setOptResult] = useState<OptimizationResponse | null>(null);
  const [stressData, setStressData] = useState<StressTestResponse | null>(null);

  // Modals & Loaders
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [aiReportData, setAiReportData] = useState<AIExplanationResponse | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Initial Data Ingestion
  useEffect(() => {
    loadLocationData(activeCenter[0], activeCenter[1]);
    loadCatalogAndPreset();
  }, []);

  const loadLocationData = async (lat: number, lon: number) => {
    try {
      const [wData, sData, gwData] = await Promise.all([
        fetchCurrentWeather(lat, lon).catch(() => undefined),
        fetchSoilProfile(lat, lon).catch(() => undefined),
        fetchGroundwaterInfo(lat, lon).catch(() => undefined)
      ]);
      setWeather(wData);
      setSoil(sData);
      setGroundwater(gwData);

      // Trigger crop predictions based on local soil and weather
      const preds = await fetchCropPredictions(lat, lon, sData, wData).catch(() => []);
      setPredictions(preds);
    } catch (e) {
      console.error("Error loading location data:", e);
    }
  };

  const loadCatalogAndPreset = async () => {
    try {
      const [crops, demo] = await Promise.all([
        fetchCropsCatalog().catch(() => []),
        fetchDemoPreset().catch(() => null)
      ]);
      if (crops.length > 0) setCropsCatalog(crops);
      if (demo) {
        setOptResult(demo.step4_optimized_baseline);
        setStressData(demo.stress_test_suite);
      }
    } catch (e) {
      console.error("Error loading demo preset:", e);
    }
  };

  const handleSelectLocation = (locKey: string) => {
    setSelectedLocationKey(locKey);
    const loc = PRESET_LOCATIONS.find(l => l.key === locKey);
    if (loc) {
      setActiveCenter([loc.lat, loc.lon]);
      // Adjust polygon around new center
      setFieldCoordinates([
        [loc.lat - 0.004, loc.lon - 0.004],
        [loc.lat - 0.003, loc.lon + 0.005],
        [loc.lat + 0.005, loc.lon + 0.004],
        [loc.lat + 0.004, loc.lon - 0.005],
        [loc.lat - 0.004, loc.lon - 0.004]
      ]);
      loadLocationData(loc.lat, loc.lon);
    }
  };

  const handleGpsLocate = () => {
    if (!navigator.geolocation) {
      alert("Browser Geolocation is not supported in this browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setActiveCenter([lat, lon]);
        setFieldCoordinates([
          [lat - 0.004, lon - 0.004],
          [lat - 0.003, lon + 0.005],
          [lat + 0.005, lon + 0.004],
          [lat + 0.004, lon - 0.005],
          [lat - 0.004, lon - 0.004]
        ]);
        await loadLocationData(lat, lon);
        setIsLocating(false);
      },
      (err) => {
        console.warn("GPS error:", err);
        setIsLocating(false);
        alert("Unable to retrieve your location. Reverting to Sangrur, Punjab benchmark.");
      },
      { timeout: 7000 }
    );
  };

  const toggleCrop = (code: string) => {
    if (selectedCrops.includes(code)) {
      if (selectedCrops.length > 2) {
        setSelectedCrops(selectedCrops.filter(c => c !== code));
      }
    } else {
      setSelectedCrops([...selectedCrops, code]);
    }
  };

  const handleApplyPreset = (presetKey: string) => {
    setActivePreset(presetKey);
    if (presetKey === 'baseline') {
      setWaterBudget(180000.0);
      setFoodTarget(45.0);
      setIncomeTarget(1100000.0);
    } else if (presetKey === 'water_20') {
      setWaterBudget(144000.0);
    } else if (presetKey === 'water_50') {
      setWaterBudget(90000.0);
    } else if (presetKey === 'extreme') {
      setWaterBudget(36000.0); // -80%
      setIncomeTarget(1650000.0); // +50%
      setFoodTarget(50.0); // +10%
    }
  };

  const handleRunOptimization = async () => {
    setIsOptimizing(true);
    try {
      const res = await runOptimization(
        totalLand,
        waterBudget,
        foodTarget,
        incomeTarget,
        selectedCrops,
        `Scenario: ${activePreset}`
      );
      setOptResult(res);

      // Also refresh stress test matrix in the background
      runStressTestSuite(totalLand, waterBudget, foodTarget, incomeTarget, selectedCrops)
        .then(data => setStressData(data))
        .catch(() => {});
    } catch (e) {
      console.error("Optimization failed:", e);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleOpenAIReport = async () => {
    if (!optResult) return;
    setAiModalOpen(true);
    setIsAiLoading(true);
    try {
      const locLabel = PRESET_LOCATIONS.find(l => l.key === selectedLocationKey)?.label || "Sangrur, Punjab";
      const report = await fetchAIDecisionExplanation(
        optResult.scenario_name,
        locLabel,
        optResult,
        groundwater ? `Nearest CGWB station is at ${groundwater.depth_mbgl} mbgl (${groundwater.classification}).` : undefined,
        soil ? `Soil profile: ${soil.texture}, pH ${soil.ph}.` : undefined
      );
      setAiReportData(report);
    } catch (e) {
      console.error("AI Report generation failed:", e);
    } finally {
      setIsAiLoading(false);
    }
  };

  // 10-Step Interactive Hackathon Demo Runner
  const handleSelectDemoStep = (stepNumber: number) => {
    setDemoStep(stepNumber);

    switch (stepNumber) {
      case 1:
        // Step 1: Geospatial Cadastre
        setCurrentView('map');
        handleSelectLocation('sangrur');
        setTotalLand(25.0);
        break;

      case 2:
        // Step 2: Multi-Source Environmental Ingestion
        setCurrentView('dashboard');
        break;

      case 3:
        // Step 3: Baseline Monoculture Problem
        setCurrentView('dashboard');
        handleApplyPreset('baseline');
        break;

      case 4:
        // Step 4: OR-Tools Optimization
        setCurrentView('dashboard');
        handleApplyPreset('baseline');
        handleRunOptimization();
        break;

      case 5:
        // Step 5: -20% Water Shortage
        setCurrentView('dashboard');
        handleApplyPreset('water_20');
        break;

      case 6:
        // Step 6: Dynamic Crop Rebalancing
        setCurrentView('dashboard');
        handleRunOptimization();
        break;

      case 7:
        // Step 7: Extreme Compound Conflict Shock
        setCurrentView('dashboard');
        handleApplyPreset('extreme');
        break;

      case 8:
        // Step 8: Constraint Conflict & Slack Activation
        setCurrentView('dashboard');
        handleRunOptimization();
        break;

      case 9:
        // Step 9: Stress Matrix Pareto Frontier
        setCurrentView('stress');
        break;

      case 10:
        // Step 10: AI Agronomic Decision Synthesis
        setCurrentView('dashboard');
        handleOpenAIReport();
        break;

      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-[#090e17] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Primary Top Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedLocation={selectedLocationKey}
        onSelectLocation={handleSelectLocation}
        onGpsLocate={handleGpsLocate}
        isLocating={isLocating}
        demoActive={demoActive}
        setDemoActive={setDemoActive}
        demoStep={demoStep}
      />

      {/* Hackathon 10-Step Judging Controller */}
      {demoActive && (
        <HackathonDemoBar
          currentStep={demoStep}
          onSelectStep={handleSelectDemoStep}
          onClose={() => setDemoActive(false)}
        />
      )}

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 flex flex-col gap-6">
        
        {/* Landing Page View */}
        {currentView === 'landing' && (
          <LandingHero
            onLaunchPlatform={() => setCurrentView('dashboard')}
            onLaunchDemo={() => {
              setDemoActive(true);
              handleSelectDemoStep(1);
            }}
          />
        )}

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <>
            {/* Top Environmental Ingestion Intelligence */}
            <EnvironmentalCards
              weather={weather}
              soil={soil}
              groundwater={groundwater}
            />

            {/* Interactive Cadastral Map Viewport */}
            <GeospatialMap
              coordinates={fieldCoordinates}
              areaHa={totalLand}
              areaAcres={Number((totalLand * 2.471).toFixed(1))}
              center={activeCenter}
              groundwaterStation={groundwater}
              weather={weather}
              allocatedCrops={optResult?.allocations}
            />

            {/* Scenario Builder (Sliders & Crop Portfolio) */}
            <ScenarioBuilder
              totalLand={totalLand}
              setTotalLand={setTotalLand}
              waterBudget={waterBudget}
              setWaterBudget={setWaterBudget}
              foodTarget={foodTarget}
              setFoodTarget={setFoodTarget}
              incomeTarget={incomeTarget}
              setIncomeTarget={setIncomeTarget}
              availableCrops={cropsCatalog}
              selectedCrops={selectedCrops}
              toggleCrop={toggleCrop}
              onRunOptimization={handleRunOptimization}
              isLoading={isOptimizing}
              onApplyPreset={handleApplyPreset}
              activePreset={activePreset}
            />

            {/* OR-Tools Mathematical Optimization Results */}
            {optResult && (
              <OptimizationResults
                result={optResult}
                onOpenAIReport={handleOpenAIReport}
              />
            )}

            {/* ML & FAO-56 Prediction Studio */}
            {predictions.length > 0 && (
              <CropPredictionStudio
                predictions={predictions}
                modelName="AquaShift FAO-56 Crop Coefficient Regressor"
              />
            )}
          </>
        )}

        {/* Dedicated Geospatial Map Explorer View */}
        {currentView === 'map' && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Interactive Cadastral Geospatial Explorer</h2>
                <p className="text-xs text-slate-400">High-resolution Earth observation, field boundary cadastre, and aquifer monitoring stations</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-3 py-1 rounded-lg border border-emerald-800">
                PostGIS Projection: EPSG:4326
              </span>
            </div>

            <GeospatialMap
              coordinates={fieldCoordinates}
              areaHa={totalLand}
              areaAcres={Number((totalLand * 2.471).toFixed(1))}
              center={activeCenter}
              groundwaterStation={groundwater}
              weather={weather}
              allocatedCrops={optResult?.allocations}
            />

            <EnvironmentalCards
              weather={weather}
              soil={soil}
              groundwater={groundwater}
            />
          </div>
        )}

        {/* Dedicated Stress Testing Matrix View */}
        {currentView === 'stress' && (
          <div className="flex flex-col gap-5">
            {stressData ? (
              <StressTestingStudio
                stressData={stressData}
                onSelectScenario={(scen) => {
                  setWaterBudget(scen.water_budget_m3);
                  setFoodTarget(scen.food_target_tonnes);
                  setIncomeTarget(scen.income_target_inr);
                }}
              />
            ) : (
              <div className="glass-panel p-12 text-center rounded-2xl">
                <p className="text-sm text-slate-400">Running stress test simulations across 7 canonical profiles...</p>
              </div>
            )}
          </div>
        )}

      </main>

      {/* AI Decision Explanation Audit Modal */}
      <AIReportModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        reportData={aiReportData}
        isLoading={isAiLoading}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-5 px-4 text-center text-xs text-slate-500 font-mono">
        AquaShift 2.0 &bull; AI-Powered Geospatial Agricultural Intelligence & Crop Optimization Platform &bull; Built for Hackathon Excellence
      </footer>

    </div>
  );
}

export default App;
