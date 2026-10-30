from typing import Dict, Any
from fastapi import APIRouter
from app.services.scenario_engine import run_all_stress_scenarios
from app.services.optimization_engine import solve_crop_allocation
from app.schemas.schemas import OptimizationRequest

router = APIRouter()


@router.get("/preset")
async def get_hackathon_demo_preset() -> Dict[str, Any]:
    """
    Returns turnkey hackathon demonstration dataset calibrated for Sangrur, Punjab:
    Over-exploited groundwater aquifer, high-paddy baseline, multi-stage stress tests.
    """
    lat, lon = 30.2458, 75.8421
    field_coords = [
        [75.8380, 30.2420],
        [75.8470, 30.2425],
        [75.8465, 30.2510],
        [75.8375, 30.2505],
        [75.8380, 30.2420]
    ]
    total_land_ha = 25.0
    baseline_water_budget = 180000.0 # m3
    baseline_food_target = 45.0 # tonnes
    baseline_income_target = 1100000.0 # ₹11,00,000

    # Solve baseline
    req_base = OptimizationRequest(
        total_land_ha=total_land_ha,
        water_budget_m3=baseline_water_budget,
        food_target_tonnes=baseline_food_target,
        income_target_inr=baseline_income_target,
        scenario_name="Baseline Plan"
    )
    res_base = solve_crop_allocation(req_base)

    # Solve 20% water reduction
    req_step5 = OptimizationRequest(
        total_land_ha=total_land_ha,
        water_budget_m3=baseline_water_budget * 0.80,
        food_target_tonnes=baseline_food_target,
        income_target_inr=baseline_income_target,
        scenario_name="Step 5: 20% Water Reduction"
    )
    res_step5 = solve_crop_allocation(req_step5)

    # Solve Extreme Stress
    req_step7 = OptimizationRequest(
        total_land_ha=total_land_ha,
        water_budget_m3=baseline_water_budget * 0.20, # -80% water
        food_target_tonnes=baseline_food_target * 1.10, # +10% food
        income_target_inr=baseline_income_target * 1.50, # +50% income
        scenario_name="Step 7: Extreme Stress Conflict"
    )
    res_step7 = solve_crop_allocation(req_step7)

    # Pre-calculate full 7-stress scenario suite
    stress_suite = run_all_stress_scenarios(
        total_land_ha=total_land_ha,
        base_water_budget_m3=baseline_water_budget,
        base_food_target_tonnes=baseline_food_target,
        base_income_target_inr=baseline_income_target
    )

    return {
        "region": {
            "name": "Bhawanigarh Block, Sangrur",
            "district": "Sangrur",
            "state": "Punjab",
            "lat": lat,
            "lon": lon,
            "elevation_m": 232.0,
            "field_coordinates": field_coords,
            "total_land_ha": total_land_ha,
            "total_land_acres": round(total_land_ha * 2.47105, 1)
        },
        "traditional_monoculture_baseline": {
            "paddy_ha": 18.0,
            "wheat_ha": 7.0,
            "annual_water_consumed_m3": 256500.0, # Massive overdraft
            "water_deficit_vs_sustainable_m3": 76500.0,
            "aquifer_impact": "Groundwater table falling at 0.68 meters/year"
        },
        "step4_optimized_baseline": res_base,
        "step6_water_minus_20": res_step5,
        "step8_extreme_conflict": res_step7,
        "stress_test_suite": stress_suite
    }
