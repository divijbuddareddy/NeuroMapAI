import React from 'react';
import type { ModelPrediction, PresetResearchScan } from '../../types/neuro';
import { 
  BarChart3, 
  Zap, 
  Gauge, 
  Award
} from 'lucide-react';

interface ModelBenchmarkLabProps {
  scan: PresetResearchScan;
  activeModel: ModelPrediction;
  onSelectModel: (modelId: ModelPrediction['modelId']) => void;
}

export const ModelBenchmarkLab: React.FC<ModelBenchmarkLabProps> = ({
  scan,
  activeModel,
  onSelectModel
}) => {
  const models = scan.predictions;

  return (
    <div className="flex flex-col gap-6">
      {/* Model Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {models.map((m) => {
          const isSelected = m.modelId === activeModel.modelId;
          return (
            <button
              key={m.modelId}
              onClick={() => onSelectModel(m.modelId)}
              className={`glass-card p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-500/15 shadow-glow-cyan'
                  : 'border-white/10 hover:border-white/20 bg-neuro-900/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md font-semibold border ${
                    isSelected ? 'bg-cyan-400 text-black border-cyan-400' : 'bg-slate-800 text-slate-400 border-white/10'
                  }`}>
                    {m.modelType}
                  </span>
                  <span className="text-xs font-mono text-cyan-300 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    {m.latencyMs} ms
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mb-1">{m.modelName}</h4>
                <p className="text-xs text-slate-400 mb-3">
                  Prediction: <strong className="text-white">{m.predictedClass}</strong>
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs font-mono">
                <span className="text-slate-400">ROC-AUC:</span>
                <span className="font-bold text-cyan-300">{m.benchmarks.rocAuc.toFixed(3)}</span>
                <span className="text-slate-400">F1:</span>
                <span className="font-bold text-purple-300">{m.benchmarks.f1Score.toFixed(3)}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Model Deep Dive Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Probability Gauge & Phenotype Confidence */}
        <div className="glass-card p-6 rounded-3xl border border-cyan-500/20 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                Inference Confidence
              </span>
              <Gauge className="w-5 h-5 text-cyan-400" />
            </div>

            <div className="flex flex-col items-center justify-center my-4">
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* Circular Progress Ring */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#1e294b"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#cyanProgGrad)"
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 * (1 - activeModel.confidence)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="cyanProgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00f2fe" />
                      <stop offset="100%" stopColor="#7928ca" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-white font-mono">
                    {(activeModel.confidence * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">POSTERIOR</span>
                </div>
              </div>

              <div className="text-center mt-2">
                <div className="text-base font-bold text-white">{activeModel.predictedClass}</div>
                <div className="text-xs text-slate-400 font-mono">Class ID: {activeModel.predictedClassId}</div>
              </div>
            </div>
          </div>

          {/* Probability Distribution Bars */}
          <div className="space-y-2 pt-4 border-t border-white/5 text-xs">
            <span className="text-slate-400 text-[11px] font-mono">CLASS PROBABILITY DISTRIBUTION</span>
            {Object.entries(activeModel.probabilities).map(([cName, prob]) => (
              <div key={cName} className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 truncate max-w-[170px]">{cName}</span>
                  <span className="font-mono text-cyan-300 font-bold">{(prob * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${prob * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluation Metrics Leaderboard */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-semibold">
                Cross-Validation Benchmark (OASIS/ADNI)
              </span>
              <Award className="w-5 h-5 text-purple-400" />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-neuro-900/80 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-mono">ROC-AUC SCORE</span>
                <span className="text-xl font-bold font-mono text-cyan-400">
                  {activeModel.benchmarks.rocAuc.toFixed(3)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neuro-900/80 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-mono">F1-SCORE (BALANCED)</span>
                <span className="text-xl font-bold font-mono text-purple-400">
                  {activeModel.benchmarks.f1Score.toFixed(3)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neuro-900/80 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-mono">SENSITIVITY / RECALL</span>
                <span className="text-xl font-bold font-mono text-pink-400">
                  {(activeModel.benchmarks.recall * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neuro-900/80 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-mono">SPECIFICITY</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {(activeModel.benchmarks.specificity * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-slate-300 leading-relaxed">
            <span className="text-cyan-300 font-semibold block mb-1">Leakage-Safe Validation Strategy:</span>
            Stratified 5-Fold Subject-Independent Cross Validation. No slices from the same subject ever crossed train/test splits.
          </div>
        </div>

        {/* Confusion Matrix Interactive Heatmap */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-pink-400 font-semibold">
                Hold-Out Confusion Matrix
              </span>
              <BarChart3 className="w-5 h-5 text-pink-400" />
            </div>

            <div className="flex flex-col items-center justify-center p-3 bg-neuro-950/80 rounded-2xl border border-white/5">
              <div className="text-[10px] font-mono text-slate-400 mb-2">PREDICTED CLASS →</div>
              
              <div className="flex flex-col gap-1.5">
                {activeModel.confusionMatrix.map((row, rIdx) => (
                  <div key={rIdx} className="flex items-center gap-1.5">
                    <span className="w-12 text-[10px] font-mono text-slate-400 text-right pr-1">
                      {activeModel.classes[rIdx]}
                    </span>
                    {row.map((val, cIdx) => {
                      const isDiag = rIdx === cIdx;
                      return (
                        <div
                          key={cIdx}
                          className={`w-14 h-12 rounded-lg flex flex-col items-center justify-center border font-mono ${
                            isDiag
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                              : val === 0
                              ? 'bg-slate-900 border-white/5 text-slate-600'
                              : 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-medium'
                          }`}
                        >
                          <span className="text-sm">{val}</span>
                          <span className="text-[9px] text-slate-400">
                            {activeModel.classes[cIdx]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="text-[10px] font-mono text-slate-500 mt-3">
                Overall Classification Accuracy: <strong className="text-cyan-300">{(activeModel.benchmarks.accuracy * 100).toFixed(1)}%</strong>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 italic pt-2">
            Diagonal cells represent true positives across held-out test subjects.
          </div>
        </div>
      </div>
    </div>
  );
};
