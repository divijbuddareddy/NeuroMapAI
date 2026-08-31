import React from 'react';
import type { QualityControlMetrics, SubjectMetadata } from '../../types/neuro';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Activity, 
  Sliders, 
  Scan, 
  Compass, 
  ShieldCheck
} from 'lucide-react';

interface QualityControlDashboardProps {
  qc: QualityControlMetrics;
  metadata: SubjectMetadata;
}

export const QualityControlDashboard: React.FC<QualityControlDashboardProps> = ({ qc, metadata }) => {
  const isPass = qc.qcStatus === 'PASS';
  const isWarning = qc.qcStatus === 'WARNING';

  return (
    <div className="flex flex-col gap-6">
      {/* Overall QC Gate Status Banner */}
      <div className={`glass-card p-6 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl ${
        isPass
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : isWarning
          ? 'border-amber-500/30 bg-amber-500/5'
          : 'border-rose-500/30 bg-rose-500/5'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-2xl border ${
            isPass
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-glow-emerald'
              : isWarning
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
          }`}>
            {isPass ? <CheckCircle2 className="w-8 h-8" /> : isWarning ? <AlertTriangle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-mono uppercase px-2.5 py-0.5 rounded-md font-bold ${
                isPass ? 'bg-emerald-500 text-black' : isWarning ? 'bg-amber-500 text-black' : 'bg-rose-500 text-white'
              }`}>
                QC STATUS: {qc.qcStatus}
              </span>
              <span className="text-xs text-slate-400 font-mono">Subject ID: {metadata.subjectId}</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              {isPass
                ? 'Automated Neuroimaging Quality Verification Passed'
                : 'Minor Quality Variance Detected — Preprocessed with Motion Realignment'}
            </h3>
          </div>
        </div>

        <div className="text-xs text-slate-300 md:text-right font-mono">
          <div>Cohort: <strong className="text-cyan-300">{metadata.cohort}</strong></div>
          <div>Modality: <strong className="text-purple-300">{metadata.modality}</strong></div>
          <div>Field: <strong className="text-white">{metadata.fieldStrength}</strong></div>
        </div>
      </div>

      {/* Quantitative Metric Gauges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SNR */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono">SIGNAL-TO-NOISE (SNR)</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mb-1">
            {qc.snr.toFixed(1)} <span className="text-sm font-normal text-slate-400">dB</span>
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3 h-3" /> Nominal (&gt; 20 dB)
          </div>
        </div>

        {/* CNR */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono">CONTRAST-TO-NOISE (CNR)</span>
            <Sliders className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mb-1">
            {qc.cnr.toFixed(2)}
          </div>
          <div className="text-[11px] text-cyan-300 flex items-center gap-1 font-mono">
            Gray-to-White Distinction
          </div>
        </div>

        {/* Motion Artifact Score */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono">MOTION ARTIFACT SCORE</span>
            <Scan className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mb-1">
            {qc.motionScore.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            Scale: 0.00 (Pristine) - 1.00 (Severe)
          </div>
        </div>

        {/* Skull-Stripping BET Score */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono">SKULL-STRIP COVERAGE</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mb-1">
            {qc.skullStrippingScore.toFixed(1)}%
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            Robust Brain Extraction
          </div>
        </div>
      </div>

      {/* Acquisition Metadata & Preprocessing Provenance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col gap-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            Scanner & Geometric Calibration
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-neuro-900/60 border border-white/5">
              <span className="text-slate-400 block font-mono text-[10px]">MATRIX DIMENSIONS</span>
              <span className="font-mono text-cyan-300 font-bold">{metadata.dimensions.join(' × ')}</span>
            </div>
            <div className="p-3 rounded-xl bg-neuro-900/60 border border-white/5">
              <span className="text-slate-400 block font-mono text-[10px]">VOXEL RESOLUTION</span>
              <span className="font-mono text-purple-300 font-bold">{metadata.voxelSpacing.map(v => `${v}mm`).join(' × ')}</span>
            </div>
            <div className="p-3 rounded-xl bg-neuro-900/60 border border-white/5">
              <span className="text-slate-400 block font-mono text-[10px]">ORIENTATION CODE</span>
              <span className="font-mono text-pink-300 font-bold">{metadata.orientation}</span>
            </div>
            <div className="p-3 rounded-xl bg-neuro-900/60 border border-white/5">
              <span className="text-slate-400 block font-mono text-[10px]">SCANNER HARDWARE</span>
              <span className="text-white font-medium truncate block">{metadata.scanner}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col gap-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            Preprocessing Pipeline Verification
          </h4>

          <div className="space-y-2 text-xs">
            {qc.recommendations.map((rec, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{rec}</span>
              </div>
            ))}
            {qc.warnings.map((warn, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{warn}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
