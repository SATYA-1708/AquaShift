import {
  ReverseGeocodeResponse,
  WeatherData,
  SoilProfile,
  GroundwaterStationInfo,
  CropDetail,
  CropPredictionItem,
  OptimizationResponse,
  StressTestResponse,
  AIExplanationResponse
} from '../types';

const BASE_URL = '/api/v1';

export async function fetchReverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResponse> {
  const res = await fetch(`${BASE_URL}/geo/reverse-geocode?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error('Failed to reverse geocode');
  return res.json();
}

export async function fetchCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
  const res = await fetch(`${BASE_URL}/weather/current?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error('Failed to fetch weather');
  return res.json();
}

export async function fetchSoilProfile(lat: number, lon: number): Promise<SoilProfile> {
  const res = await fetch(`${BASE_URL}/soil/profile?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error('Failed to fetch soil profile');
  return res.json();
}

export async function fetchGroundwaterInfo(lat: number, lon: number): Promise<GroundwaterStationInfo> {
  const res = await fetch(`${BASE_URL}/water/groundwater?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error('Failed to fetch groundwater info');
  return res.json();
}

export async function fetchCropsCatalog(): Promise<CropDetail[]> {
  const res = await fetch(`${BASE_URL}/crops`);
  if (!res.ok) throw new Error('Failed to fetch crops catalog');
  return res.json();
}

export async function fetchCropPredictions(
  lat: number,
  lon: number,
  soil?: SoilProfile,
  weather?: WeatherData
): Promise<CropPredictionItem[]> {
  const res = await fetch(`${BASE_URL}/predictions/yield`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      latitude: lat,
      longitude: lon,
      soil_profile: soil,
      weather_data: weather
    })
  });
  if (!res.ok) throw new Error('Failed to fetch predictions');
  const data = await res.json();
  return data.predictions;
}

export async function runOptimization(
  totalLandHa: number,
  waterBudgetM3: number,
  foodTargetTonnes: number,
  incomeTargetInr: number,
  selectedCrops?: string[],
  scenarioName: string = "Custom Optimization"
): Promise<OptimizationResponse> {
  const res = await fetch(`${BASE_URL}/optimization/solve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      total_land_ha: totalLandHa,
      water_budget_m3: waterBudgetM3,
      food_target_tonnes: foodTargetTonnes,
      income_target_inr: incomeTargetInr,
      selected_crop_codes: selectedCrops,
      scenario_name: scenarioName
    })
  });
  if (!res.ok) throw new Error('Failed to run optimization');
  return res.json();
}

export async function runStressTestSuite(
  totalLandHa: number,
  baseWaterM3: number,
  baseFoodTonnes: number,
  baseIncomeInr: number,
  selectedCrops?: string[]
): Promise<StressTestResponse> {
  const res = await fetch(`${BASE_URL}/scenarios/stress-test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      total_land_ha: totalLandHa,
      water_budget_m3: baseWaterM3,
      food_target_tonnes: baseFoodTonnes,
      income_target_inr: baseIncomeInr,
      selected_crop_codes: selectedCrops
    })
  });
  if (!res.ok) throw new Error('Failed to run stress test suite');
  return res.json();
}

export async function fetchAIDecisionExplanation(
  scenarioName: string,
  locationSummary: string,
  optResult: OptimizationResponse,
  groundwaterContext?: string,
  soilContext?: string
): Promise<AIExplanationResponse> {
  const res = await fetch(`${BASE_URL}/insights/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scenario_name: scenarioName,
      location_summary: locationSummary,
      optimization_result: optResult,
      groundwater_context: groundwaterContext,
      soil_context: soilContext
    })
  });
  if (!res.ok) throw new Error('Failed to generate AI explanation');
  return res.json();
}

export async function fetchDemoPreset(): Promise<any> {
  const res = await fetch(`${BASE_URL}/demo/preset`);
  if (!res.ok) throw new Error('Failed to fetch demo preset');
  return res.json();
}
