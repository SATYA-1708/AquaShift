import React from 'react';
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Pause, 
  X, 
  Info,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export interface DemoStepInfo {
  number: number;
  title: string;
  tag: string;
  narrative: string;
  actionSummary: string;
}

export const HACKATHON_STEPS: DemoStepInfo[] = [
  {
    number: 1,
    title: "Geospatial Region & Field Identification",
    tag: "GEOSPATIAL",
    narrative: "Targeting Bhawanigarh Block, Sangrur (Punjab). 25.0 Hectares (61.8 Acres) agricultural field polygon projected on high-resolution satellite imagery.",
    actionSummary: "Field boundary loaded, acreage computed geodesic-correctly via PostGIS/Shapely."
  },
  {
    number: 2,
    title: "Multi-Source Environmental Ingestion",
    tag: "DATA INGESTION",
    narrative: "Live weather ingested from Open-Meteo (ET0: 5.2 mm/day). SoilGrids profile indicates Alluvial Sandy Loam (pH 7.6). Nearby CGWB telemetry monitoring station shows groundwater depth at 34.6 mbgl with an alarming 0.68 m/year depletion rate (Over-Exploited).",
    actionSummary: "Integrated Open-Meteo, SoilGrids, and CGWB monitoring telemetry."
  },
  {
    number: 3,
    title: "Baseline Traditional Monoculture",
    tag: "GROUND TRUTH",
    narrative: "Regional baseline: 18 ha flood-irrigated Paddy + 7 ha Wheat. Total water consumed is 256,500 m³, exceeding sustainable water budget by 76,500 m³ annually and driving severe aquifer overdraft.",
    actionSummary: "Critical baseline water deficit identified."
  },
  {
    number: 4,
    title: "AquaShift Mathematical Optimization",
    tag: "OPTIMIZATION",
    narrative: "Google OR-Tools executes Mixed-Integer Linear Programming. Reallocates field into high-protein low-water Moong pulses, Maize, Cotton, Mustard, and Drip Tomatoes.",
    actionSummary: "Water usage slashed by 76,000 m³ while net income increases to ₹13.8 Lakhs!"
  },
  {
    number: 5,
    title: "Moderate Climate Shock: -20% Water",
    tag: "STRESS TEST",
    narrative: "Simulating delayed monsoon / canal rationing: water availability decreased by 20% (to 144,000 m³).",
    actionSummary: "Adjusting water slider to -20% and testing model sensitivity."
  },
  {
    number: 6,
    title: "Dynamic Crop Portfolio Rebalancing",
    tag: "ADAPTATION",
    narrative: "The mathematical optimizer automatically expands drought-resilient Mustard and Moong legume acreage while trimming higher-water cereals. Hard land limits preserved.",
    actionSummary: "Optimal reallocation achieved without income loss."
  },
  {
    number: 7,
    title: "Extreme Compound Stress Ingestion",
    tag: "CRITICAL CONFLICT",
    narrative: "Injecting extreme shock: Water budget slashed by 80% (to 36,000 m³), while Farmer Income Target is increased by +50% and Food Target by +10%.",
    actionSummary: "Targets mathematically collide! Can the system survive without crashing?"
  },
  {
    number: 8,
    title: "Constraint Stress Test & Conflict Detection",
    tag: "RELIABILITY",
    narrative: "AquaShift NEVER just returns 'Infeasible'. The solver isolates conflicting constraints and activates elastic slack variables.",
    actionSummary: "Detected binding constraints: Water budget ceiling vs aggressive income target."
  },
  {
    number: 9,
    title: "Bottleneck Diagnosis & Closest Feasible Plan",
    tag: "DECISION SUPPORT",
    narrative: "The platform isolates Water as the binding dual constraint, displays exact shortfalls, and outputs the mathematically closest feasible allocation along the Pareto frontier.",
    actionSummary: "Quantified ₹2.4 Lakhs income shortfall; preserved physical water limit."
  },
  {
    number: 10,
    title: "AI Agronomic Synthesis & Policy Report",
    tag: "EXPLANATION",
    narrative: "Deterministic AI Agronomic Engine generates a plain-language audit report explaining trade-offs, seed variety recommendations, and groundwater mitigation roadmap.",
    actionSummary: "Generated audit report ready for export to PDF."
  }
];

interface HackathonDemoBarProps {
  currentStep: number;
  onSelectStep: (stepNumber: number) => void;
  onClose: () => void;
}

export const HackathonDemoBar: React.FC<HackathonDemoBarProps> = ({
  currentStep,
  onSelectStep,
  onClose
}) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const step = HACKATHON_STEPS.find(s => s.number === currentStep) || HACKATHON_STEPS[0];

  React.useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setTimeout(() => {
        if (currentStep < 10) {
          onSelectStep(currentStep + 1);
        } else {
          setIsPlaying(false);
        }
      }, 7000); // 7 seconds per step for comfortable judging review
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, onSelectStep]);

  return (
    <div className="bg-slate-900/95 border-b border-emerald-500/30 px-4 py-3 shadow-2xl relative">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        
        {/* Header line with step pills and controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Hackathon 10-Step Interactive Protocol
            </span>
            <span className="text-xs text-slate-400 font-mono">
              [Step {currentStep} of 10]
            </span>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {HACKATHON_STEPS.map((s) => (
              <button
                key={s.number}
                onClick={() => onSelectStep(s.number)}
                className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition border ${
                  s.number === currentStep
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/30 scale-110'
                    : s.number < currentStep
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-700/60'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
                title={s.title}
              >
                {s.number < currentStep ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.number}
              </button>
            ))}
          </div>

          {/* Actions & Auto Play */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
            </button>

            <button
              disabled={currentStep === 1}
              onClick={() => onSelectStep(Math.max(1, currentStep - 1))}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              disabled={currentStep === 10}
              onClick={() => onSelectStep(Math.min(10, currentStep + 1))}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition ml-2"
              title="Close Demo Mode"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Step Narrative Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
              step.number >= 7 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}>
              {step.number >= 7 ? <AlertTriangle className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">STEP {step.number}: {step.title}</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-cyan-800">
                  {step.tag}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-4xl">
                {step.narrative}
              </p>
            </div>
          </div>

          <div className="shrink-0 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 text-right w-full md:w-auto">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">System Outcome</span>
            <span className="text-xs font-semibold text-emerald-400">{step.actionSummary}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
