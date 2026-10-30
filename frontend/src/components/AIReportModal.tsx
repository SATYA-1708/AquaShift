import React from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Printer, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { AIExplanationResponse } from '../types';

interface AIReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: AIExplanationResponse | null;
  isLoading: boolean;
}

export const AIReportModal: React.FC<AIReportModalProps> = ({
  isOpen,
  onClose,
  reportData,
  isLoading
}) => {
  if (!isOpen) return null;

  const handleDownloadMarkdown = () => {
    if (!reportData) return;
    const blob = new Blob([reportData.full_markdown_report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AquaShift_Agronomic_Report_${reportData.scenario_name.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                AI Agronomic Decision Intelligence Report
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Deterministic agronomic synthesis from mathematical optimization results
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadMarkdown}
              disabled={!reportData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
              title="Download Markdown Report"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export .MD</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={!reportData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
              title="Print / Save PDF"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Print PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-200">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-mono">Synthesizing agronomic trade-offs and physical constraints...</p>
            </div>
          ) : reportData ? (
            <>
              {/* Executive Summary */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono block mb-2">
                  1. Executive Decision Summary
                </span>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {reportData.executive_summary}
                </p>
              </div>

              {/* Crop Allocation Rationale */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono block mb-3">
                  2. Crop-by-Crop Mathematical Rationale
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {reportData.crop_allocation_rationale.map((item, idx) => (
                    <div key={idx} className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-white text-xs">{item.crop}</span>
                        <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                          {item.allocated_area}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-normal">
                        {item.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Water & Aquifer Sustainability */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono block mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" /> 3. Hydrological & Aquifer Sustainability
                </span>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {reportData.water_sustainability_assessment}
                </p>
              </div>

              {/* Financial Impact & Market Risks */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono block mb-2">
                  4. Socio-Economic Resilience & Market Risk Audit
                </span>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {reportData.financial_impact_and_risks}
                </p>
              </div>

              {/* Bottleneck Guidance */}
              <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/30">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 font-mono block mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400" /> 5. Constraint Bottleneck Diagnosis & Policy Guidance
                </span>
                <p className="text-slate-200 leading-relaxed text-xs">
                  {reportData.constraint_bottlenecks_and_recommendations}
                </p>
              </div>
            </>
          ) : (
            <p className="text-slate-400 text-center py-8">No report generated yet.</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition cursor-pointer"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
};
