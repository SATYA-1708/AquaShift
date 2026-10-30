export interface ReverseGeocodeResponse {
  latitude: number;
  longitude: number;
  village: string;
  district: string;
  state: string;
  country: string;
  formatted_address: string;
  agro_climatic_zone: string;
  elevation_m: number;
  source: string;
}

export interface DailyWeatherForecast {
  date: string;
  temp_min_c: number;
  temp_max_c: number;
  precipitation_mm: number;
  precipitation_probability_pct: number;
  et0_mm: number;
  condition: string;
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  temperature_c: number;
  temp_min_c: number;
  temp_max_c: number;
  humidity_pct: number;
  wind_speed_kmh: number;
  precipitation_mm: number;
  et0_mm: number;
  aridity_index: number;
  heat_stress_level: string;
  drought_risk: string;
  rainfall_deficit_pct: number;
  daily_forecast: DailyWeatherForecast[];
  source: string;
  timestamp: string;
}

export interface SoilProfile {
  texture: string;
  ph: number;
  organic_carbon_pct: number;
  nitrogen_kg_ha: number;
  phosphorus_kg_ha: number;
  potassium_kg_ha: number;
  water_holding_capacity_pct: number;
  soil_moisture_pct: number;
  source: string;
  confidence: number;
  timestamp: string;
}

export interface GroundwaterStationInfo {
  station_code: string;
  station_name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  depth_mbgl: number;
  historical_trend_slope: number;
  classification: string;
  distance_km: number;
  source: string;
  timestamp: string;
}

export interface CropDetail {
  code: string;
  name: string;
  category: string;
  season: string;
  base_yield_tonnes_ha: number;
  water_req_m3_ha: number;
  msp_price_per_tonne: number;
  avg_mandi_price_per_tonne: number;
  cultivation_cost_per_ha: number;
  calorie_density_kcal_kg: number;
  drought_tolerance: string;
  suitability_score: number;
}

export interface CropPredictionItem {
  crop_code: string;
  crop_name: string;
  category: string;
  predicted_yield_tonnes_ha: number;
  water_req_m3_ha: number;
  estimated_revenue_inr_ha: number;
  cultivation_cost_inr_ha: number;
  estimated_net_income_inr_ha: number;
  suitability_score: number;
  confidence: number;
  data_provenance: string;
}

export interface AllocatedCropItem {
  crop_code: string;
  crop_name: string;
  category: string;
  allocated_ha: number;
  percentage_of_land: number;
  expected_yield_tonnes: number;
  expected_water_consumed_m3: number;
  expected_net_income_inr: number;
  revenue_inr: number;
  cost_inr: number;
}

export interface OptimizationDiagnosis {
  has_conflict: boolean;
  binding_constraints: string[];
  water_shortfall_m3: number;
  food_shortfall_tonnes: number;
  income_shortfall_inr: number;
  explanation: string;
}

export interface OptimizationResponse {
  scenario_name: string;
  solver_status: string;
  is_feasible_as_requested: boolean;
  total_land_ha: number;
  total_land_allocated_ha: number;
  total_water_budget_m3: number;
  total_water_consumed_m3: number;
  total_food_target_tonnes: number;
  total_food_produced_tonnes: number;
  total_income_target_inr: number;
  total_farmer_net_income_inr: number;
  water_savings_vs_budget_m3: number;
  allocations: AllocatedCropItem[];
  diagnosis: OptimizationDiagnosis;
  ai_explanation?: string;
}

export interface StressTestScenarioResult {
  scenario_id: string;
  scenario_name: string;
  description: string;
  water_budget_m3: number;
  food_target_tonnes: number;
  income_target_inr: number;
  water_consumed_m3: number;
  food_produced_tonnes: number;
  net_income_inr: number;
  allocations: AllocatedCropItem[];
  diagnosis: OptimizationDiagnosis;
}

export interface StressTestResponse {
  baseline: StressTestScenarioResult;
  scenarios: StressTestScenarioResult[];
}

export interface AIExplanationResponse {
  scenario_name: string;
  executive_summary: string;
  crop_allocation_rationale: { crop: string; allocated_area: string; rationale: string }[];
  water_sustainability_assessment: string;
  financial_impact_and_risks: string;
  constraint_bottlenecks_and_recommendations: string;
  full_markdown_report: string;
}
