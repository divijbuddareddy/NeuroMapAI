import React from 'react';
import { Brain, ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full glass-card border-t border-white/10 mt-16 bg-neuro-950/90 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-start justify-between gap-8">
        {/* Left Column */}
        <div className="flex flex-col gap-2 max-w-sm">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            <span className="font-extrabold text-white text-sm">NeuroMap AI</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              Explainable Neuroimaging Research Platform
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Explainable neuroimaging ML platform for MRI/dMRI feature extraction, brain connectivity analysis, multi-model evaluation, and Gemini AI-assisted research reporting.
          </p>
        </div>

        {/* Center Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs font-mono">
          <div>
            <span className="text-white font-bold block mb-2 font-sans">NEURO PIPELINE</span>
            <ul className="space-y-1 text-slate-400">
              <li>• Automated QC & BET</li>
              <li>• Desikan-Killiany 68 Atlas</li>
              <li>• Structural Connectome</li>
              <li>• Graph Theory (Q, E_glob)</li>
            </ul>
          </div>

          <div>
            <span className="text-white font-bold block mb-2 font-sans">ML SUITE & XAI</span>
            <ul className="space-y-1 text-slate-400">
              <li>• XGBoost Baseline</li>
              <li>• 3D ResNet Volumetric</li>
              <li>• SHAP Feature Impact</li>
              <li>• 3D Grad-CAM Saliency</li>
            </ul>
          </div>

          <div>
            <span className="text-white font-bold block mb-2 font-sans">BENCHMARKS</span>
            <ul className="space-y-1 text-slate-400">
              <li>• OASIS-3 Cohort</li>
              <li>• ADNI-3 Cohort</li>
              <li>• HCP Connectome</li>
              <li>• UK Biobank</li>
            </ul>
          </div>
        </div>

        {/* Right Safety Card */}
        <div className="p-4 rounded-2xl bg-neuro-900/80 border border-white/10 flex flex-col gap-2 max-w-xs">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <ShieldAlert className="w-4 h-4" />
            <span>Research-Only Prototype</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            This platform is an investigative computational neuroscience tool. Model outputs are probabilistic research metrics and must never be used for clinical diagnosis or patient management.
          </p>
        </div>
      </div>

      <div className="border-t border-white/5 py-4 px-4 text-center text-[11px] text-slate-500 font-mono">
        © 2026 NeuroMap AI Research Platform • Built for high-fidelity neuroimaging pair programming & interactive AI reasoning
      </div>
    </footer>
  );
};
