import React from 'react';
import type { ModelPrediction } from '../../types/neuro';
import { Sparkles, TrendingUp, TrendingDown, ShieldAlert } from 'lucide-react';

interface ShapAttributionViewProps {
  activeModel: ModelPrediction;
  onSelectRegion?: (regionId: string) => void;
}

export const ShapAttributionView: React.FC<ShapAttributionViewProps> = ({
  activeModel,
  onSelectRegion
}) => {
  const regions = activeModel.topContributingRegions;
  const edges = activeModel.topContributingEdges;

  // Maximum SHAP magnitude for percentage scaling
  const maxShap = Math.max(...regions.map(r => Math.abs(r.shapValue)), 0.01);

  return (
    <div className="flex flex-col gap-6">
      {/* SHAP Regional Feature Attribution Card */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              SHAP Regional Feature Importance (TreeSHAP / KernelSHAP)
            </h3>
            <p className="text-xs text-slate-400">
              Contribution of specific neuroanatomical regions toward the <strong className="text-cyan-300">{activeModel.predictedClass}</strong> decision
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-rose-500"></div>
              <span className="text-slate-300">Drives Prediction (+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-cyan-500"></div>
              <span className="text-slate-300">Opposes Prediction (-)</span>
            </div>
          </div>
        </div>

        {/* Feature Waterfall / Importance Bars */}
        <div className="space-y-4 pt-2">
          {regions.map((reg, idx) => {
            const isPositive = reg.shapValue >= 0;
            const widthPct = (Math.abs(reg.shapValue) / maxShap) * 100;

            return (
              <div
                key={reg.regionId}
                onClick={() => onSelectRegion?.(reg.regionId)}
                className="glass-card p-3.5 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition cursor-pointer flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-mono text-[10px] text-slate-400">
                      {idx + 1}
                    </span>
                    <strong className="text-white hover:text-cyan-300 transition">
                      {reg.regionName}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span className={`font-bold flex items-center gap-0.5 ${
                      isPositive ? 'text-rose-400' : 'text-cyan-400'
                    }`}>
                      {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {isPositive ? '+' : ''}{reg.shapValue.toFixed(3)}
                    </span>
                    <span className="text-[10px] text-slate-500">SHAP value</span>
                  </div>
                </div>

                {/* Magnitude Bar */}
                <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden flex items-center">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isPositive
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 shadow-glow-magenta'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-glow-cyan'
                    }`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>{reg.evidence}</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Click to view in 3D →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Contributing Connectome Dysconnectivity Edges */}
      {edges.length > 0 && (
        <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Influential Network Edge Attributions
            </h3>
            <p className="text-xs text-slate-400">
              Structural connectome pathways with the largest influence on model prediction
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {edges.map((e, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-neuro-900/80 border border-white/5 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                    {e.source}
                  </span>
                  <span className="text-slate-400">↔</span>
                  <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                    {e.target}
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-slate-400 text-[10px]">TRACT IMPACT</div>
                  <div className="text-rose-400 font-bold">+{e.impact.toFixed(3)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scientific & Causality Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-neuro-900/80 border border-white/10 text-xs text-slate-400 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white block mb-0.5">Scientific Boundary Notice:</strong>
          Feature attributions (SHAP values and Grad-CAM saliency maps) describe the internal decision logic of the trained machine learning model. They represent statistical associations and are <em>not</em> proof of biological causality or definitive clinical significance.
        </div>
      </div>
    </div>
  );
};
