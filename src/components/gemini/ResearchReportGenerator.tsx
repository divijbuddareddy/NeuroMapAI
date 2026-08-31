import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Printer, 
  RefreshCw, 
  Brain, 
  AlertTriangle
} from 'lucide-react';
import type { PresetResearchScan, ModelPrediction } from '../../types/neuro';
import { generateNeuroResearchReport, getStoredGeminiKey } from '../../services/geminiService';
import type { GeminiReasoningResponse } from '../../types/gemini';

interface ResearchReportGeneratorProps {
  scan: PresetResearchScan;
  activeModel: ModelPrediction;
  onOpenKeyModal: () => void;
}

export const ResearchReportGenerator: React.FC<ResearchReportGeneratorProps> = ({
  scan,
  activeModel,
  onOpenKeyModal
}) => {
  const [report, setReport] = useState<GeminiReasoningResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasApiKey = Boolean(getStoredGeminiKey());

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await generateNeuroResearchReport(scan, activeModel);
      setReport(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!report) return;
    navigator.clipboard.writeText(report.fullMarkdownReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!report) return;
    const blob = new Blob([report.fullMarkdownReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NeuroMap_Report_${scan.metadata.subjectId}_${activeModel.predictedClassId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-3xl border border-cyan-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-cyan-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 text-cyan-400">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-extrabold text-white">Gemini Neuro-Reasoning Engine</h2>
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                  hasApiKey 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {hasApiKey ? 'LIVE GEMINI ACTIVE' : 'SIMULATED COGNITION'}
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-xl">
                Synthesizes regional brain morphometry, structural connectome disruption, and explainable ML predictions into publication-grade neuroimaging research reports.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!hasApiKey && (
              <button
                onClick={onOpenKeyModal}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Connect Gemini API Key
              </button>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="neuro-button-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-glow-cyan disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Synthesizing...' : report ? 'Regenerate Report' : 'Generate Full Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <div className="flex-1">
            <span className="font-bold">Generation Error:</span> {error}
          </div>
          <button
            onClick={onOpenKeyModal}
            className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg text-xs font-semibold"
          >
            Check API Key
          </button>
        </div>
      )}

      {/* Report Display */}
      {report ? (
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col gap-6 animate-in fade-in duration-300">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Subject: <strong className="text-white font-mono">{scan.metadata.subjectId}</strong></span>
              <span>•</span>
              <span>Model: <strong className="text-cyan-300">{activeModel.modelName}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl bg-neuro-900 border border-white/10 text-xs text-slate-300 hover:text-white hover:border-cyan-500/40 transition flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Markdown'}
              </button>

              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-xl bg-neuro-900 border border-white/10 text-xs text-slate-300 hover:text-white hover:border-cyan-500/40 transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                Export .MD
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-xl bg-neuro-900 border border-white/10 text-xs text-slate-300 hover:text-white hover:border-cyan-500/40 transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-purple-400" />
                Print
              </button>
            </div>
          </div>

          {/* Key Insights Highlight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20">
              <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold mb-1">
                Phenotype Classification
              </div>
              <div className="text-base font-bold text-white mb-1">{activeModel.predictedClass}</div>
              <div className="text-xs text-slate-400">
                Confidence: <strong className="text-cyan-300 font-mono">{(activeModel.confidence * 100).toFixed(1)}%</strong>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20">
              <div className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-semibold mb-1">
                Primary Biomarker Driver
              </div>
              <div className="text-sm font-bold text-white mb-1">
                {activeModel.topContributingRegions[0]?.regionName ?? 'Hippocampus'}
              </div>
              <div className="text-xs text-slate-400">
                SHAP Impact: <strong className="text-purple-300 font-mono">+{activeModel.topContributingRegions[0]?.shapValue.toFixed(3) ?? '0.380'}</strong>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-pink-500/5 border border-pink-500/20">
              <div className="text-[11px] font-mono uppercase tracking-wider text-pink-400 font-semibold mb-1">
                Network Global Efficiency
              </div>
              <div className="text-base font-bold text-white mb-1">
                {scan.graphMetrics.globalEfficiency}
              </div>
              <div className="text-xs text-slate-400">
                Modularity Index Q: <strong className="text-pink-300 font-mono">{scan.graphMetrics.modularityIndex}</strong>
              </div>
            </div>
          </div>

          {/* Full Formatted Report Content */}
          <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed space-y-4 font-sans border-t border-white/5 pt-6">
            <div className="whitespace-pre-wrap bg-neuro-900/60 p-6 rounded-2xl border border-white/5 font-mono text-xs text-slate-300 overflow-x-auto">
              {report.fullMarkdownReport}
            </div>
          </div>

          {/* Prominent Bottom Safety Disclaimer */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex items-start gap-3 text-xs text-slate-400">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Research Platform Disclaimer:</strong>
              This report was generated using computational machine learning and AI inference. It is intended strictly for neuroimaging research, algorithm evaluation, and hypothesis generation. It must not be interpreted as a definitive clinical diagnosis.
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="glass-card p-12 rounded-3xl border border-white/10 text-center flex flex-col items-center justify-center gap-4">
          <div className="p-4 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Ready to Generate Research Report</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Click the button above to run Gemini AI reasoning across all volumetric features, connectome edges, and SHAP explainability metrics for <strong className="text-cyan-300 font-mono">{scan.metadata.subjectId}</strong>.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="neuro-button-primary px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-glow-cyan"
          >
            <Sparkles className="w-4 h-4" />
            Synthesize Neuro-Report
          </button>
        </div>
      )}
    </div>
  );
};
