import { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import type { NavTab } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { BrainViewer3D } from './components/3d/BrainViewer3D';
import { OrthogonalViewer } from './components/mri/OrthogonalViewer';
import { MorphometryTable } from './components/features/MorphometryTable';
import { ConnectivityMatrix } from './components/features/ConnectivityMatrix';
import { GraphMetricsCard } from './components/features/GraphMetricsCard';
import { ModelBenchmarkLab } from './components/ml/ModelBenchmarkLab';
import { ShapAttributionView } from './components/ml/ShapAttributionView';
import { QualityControlDashboard } from './components/qc/QualityControlDashboard';
import { ScanUploader } from './components/qc/ScanUploader';
import { GeminiKeyModal } from './components/gemini/GeminiKeyModal';
import { ResearchReportGenerator } from './components/gemini/ResearchReportGenerator';
import { NeuroChatAssistant } from './components/gemini/NeuroChatAssistant';
import { PRESET_RESEARCH_SCANS } from './services/mockNeuroEngine';
import type { PresetResearchScan, ModelPrediction } from './types/neuro';
import { 
  Network, 
  Layers, 
  BarChart3, 
  Sparkles, 
  ChevronRight, 
  Zap, 
  Crosshair, 
  Upload
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [activeScan, setActiveScan] = useState<PresetResearchScan>(PRESET_RESEARCH_SCANS[0]);
  const [activeModelId, setActiveModelId] = useState<ModelPrediction['modelId']>('xgboost');
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  // Active Model
  const activeModel = activeScan.predictions.find(m => m.modelId === activeModelId) || activeScan.predictions[0];
  const selectedRegion = activeScan.regions.find(r => r.id === selectedRegionId) || null;

  const handleSelectScan = (scan: PresetResearchScan) => {
    setActiveScan(scan);
    setActiveModelId(scan.predictions[0].modelId);
    setSelectedRegionId(null);
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeScan={activeScan}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        onOpenUpload={() => setActiveTab('ingestion')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* ==================== VIEW 1: DASHBOARD OVERVIEW ==================== */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            {/* Hero Pitch Banner */}
            <div className="glass-card p-6 md:p-8 rounded-3xl border border-cyan-500/20 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                      Explainable Neuroimaging ML Platform
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Cohort: <strong className="text-white">{activeScan.cohort}</strong>
                    </span>
                  </div>

                  <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight mb-3">
                    Transforming MRI & dMRI into <span className="neuro-gradient-text">Explainable Connectome Intelligence</span>
                  </h1>

                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
                    NeuroMap AI combines automated neuroimaging pipelines (BET skull-stripping, Desikan-Killiany morphometry) with structural connectome graph theory, multi-model evaluation (XGBoost, 3D ResNet), SHAP/Grad-CAM explainability, and <strong>Gemini AI reasoning</strong>.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('3d_connectome')}
                      className="neuro-button-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-glow-cyan"
                    >
                      <Network className="w-4 h-4" />
                      Explore 3D Connectome
                    </button>

                    <button
                      onClick={() => setActiveTab('gemini_assistant')}
                      className="neuro-button-outline px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Gemini Research Report
                    </button>
                  </div>
                </div>

                {/* Quick Subject Card */}
                <div className="glass-card p-5 rounded-2xl border border-white/10 bg-neuro-950/80 lg:w-80 shrink-0 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">ACTIVE SUBJECT</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      QC: {activeScan.qc.qcStatus}
                    </span>
                  </div>
                  
                  <div className="font-mono text-base font-bold text-cyan-300">
                    {activeScan.metadata.subjectId}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Modality</span>
                      <span>{activeScan.metadata.modality}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Field Strength</span>
                      <span>{activeScan.metadata.fieldStrength}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Ground Truth</span>
                      <span className="text-amber-300 truncate block">{activeScan.groundTruth}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">ML Inference</span>
                      <span className="text-cyan-300 truncate block">{activeModel.predictedClass}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('ingestion')}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 mt-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Switch Preset / Upload NIfTI
                  </button>
                </div>
              </div>
            </div>

            {/* 3D Brain & Real-time Telemetry Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 3D Brain Visualizer Preview */}
              <div className="lg:col-span-2 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white">Interactive 3D WebGL Connectome Viewer</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('3d_connectome')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
                  >
                    Full Screen Connectome <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <BrainViewer3D
                  regions={activeScan.regions}
                  nodes={activeScan.nodes}
                  edges={activeScan.edges}
                  selectedRegionId={selectedRegionId}
                  onSelectRegion={setSelectedRegionId}
                />
              </div>

              {/* Right KPI Sidebar */}
              <div className="flex flex-col gap-4">
                {/* ML Inference Card */}
                <div className="glass-card p-5 rounded-2xl border border-cyan-500/20 shadow-lg flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-mono uppercase text-cyan-400 font-semibold">Active Model Inference</span>
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                  </div>

                  <div>
                    <div className="text-xl font-bold text-white mb-1">
                      {activeModel.predictedClass}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300 font-mono mb-3">
                      <span>Model: <strong className="text-cyan-300">{activeModel.modelName}</strong></span>
                      <span>•</span>
                      <span>Confidence: <strong className="text-cyan-300">{(activeModel.confidence * 100).toFixed(1)}%</strong></span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-neuro-950/60 border border-white/5 text-xs text-slate-400">
                    Top Driver: <strong className="text-rose-400">{activeModel.topContributingRegions[0]?.regionName ?? 'Hippocampus'}</strong> (+{activeModel.topContributingRegions[0]?.shapValue.toFixed(3) ?? '0.380'} SHAP)
                  </div>
                </div>

                {/* Graph Theory Overview */}
                <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-lg flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-mono uppercase text-purple-400 font-semibold">Connectome Graph Topology</span>
                    <Zap className="w-4 h-4 text-purple-400" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-neuro-950/60 border border-white/5">
                      <span className="text-slate-500 block text-[10px]">Global Efficiency</span>
                      <span className="text-lg font-bold text-white">{activeScan.graphMetrics.globalEfficiency}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neuro-950/60 border border-white/5">
                      <span className="text-slate-500 block text-[10px]">Modularity (Q)</span>
                      <span className="text-lg font-bold text-white">{activeScan.graphMetrics.modularityIndex}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neuro-950/60 border border-white/5">
                      <span className="text-slate-500 block text-[10px]">Small-World (σ)</span>
                      <span className="text-lg font-bold text-cyan-300">{activeScan.graphMetrics.smallWorldnessIndex}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neuro-950/60 border border-white/5">
                      <span className="text-slate-500 block text-[10px]">Active Edges</span>
                      <span className="text-lg font-bold text-purple-300">{activeScan.graphMetrics.totalEdges}</span>
                    </div>
                  </div>
                </div>

                {/* Gemini AI Action Card */}
                <div className="glass-card p-5 rounded-2xl border border-pink-500/20 bg-pink-500/5 shadow-lg flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-pink-400 mb-1">
                    <span className="font-mono uppercase font-semibold">Gemini AI Reasoning</span>
                    <Sparkles className="w-4 h-4 text-pink-400" />
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    Synthesize full explainability & generate structured neuro-report with multi-modal insights.
                  </p>
                  <button
                    onClick={() => setActiveTab('gemini_assistant')}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold transition shadow-glow-magenta flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Open Gemini Reasoning Lab
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  tab: 'orthogonal_mri' as NavTab,
                  title: 'Orthogonal MRI Slices',
                  desc: 'Axial, Coronal, Sagittal planes with 3D Grad-CAM saliency heatmaps.',
                  icon: Crosshair,
                  color: 'text-cyan-400',
                  border: 'border-cyan-500/30'
                },
                {
                  tab: 'morphometry' as NavTab,
                  title: 'Desikan-Killiany Morphometry',
                  desc: '68 anatomical regions, cortical thickness, and normative Z-scores.',
                  icon: Layers,
                  color: 'text-purple-400',
                  border: 'border-purple-500/30'
                },
                {
                  tab: 'ml_benchmarks' as NavTab,
                  title: 'ML Benchmarks & ROC-AUC',
                  desc: 'Compare XGBoost, Random Forest, 3D ResNet, and confusion matrices.',
                  icon: BarChart3,
                  color: 'text-pink-400',
                  border: 'border-pink-500/30'
                },
                {
                  tab: 'xai_explainability' as NavTab,
                  title: 'SHAP & Grad-CAM (XAI)',
                  desc: 'Regional feature attribution waterfalls & connectome pathway impacts.',
                  icon: Zap,
                  color: 'text-emerald-400',
                  border: 'border-emerald-500/30'
                }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(item.tab)}
                    className={`glass-card p-5 rounded-2xl border ${item.border} text-left transition flex flex-col justify-between glass-card-hover group`}
                  >
                    <div>
                      <div className={`p-2.5 rounded-xl bg-neuro-950 border border-white/5 ${item.color} w-fit mb-3 group-hover:scale-110 transition`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1 group-hover:text-cyan-300 transition">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-cyan-400 font-semibold pt-3 mt-2 border-t border-white/5">
                      <span>Launch Tool</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== VIEW 2: 3D CONNECTOME ==================== */}
        {activeTab === '3d_connectome' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Network className="w-6 h-6 text-cyan-400" />
                Interactive 3D WebGL Brain Connectome
              </h2>
              <p className="text-xs text-slate-400">
                Rotate, zoom, and select Desikan-Killiany atlas ROIs. Arcs represent structural fiber tract density and functional correlation.
              </p>
            </div>

            <BrainViewer3D
              regions={activeScan.regions}
              nodes={activeScan.nodes}
              edges={activeScan.edges}
              selectedRegionId={selectedRegionId}
              onSelectRegion={setSelectedRegionId}
            />

            <GraphMetricsCard metrics={activeScan.graphMetrics} />

            <ConnectivityMatrix nodes={activeScan.nodes} edges={activeScan.edges} />
          </div>
        )}

        {/* ==================== VIEW 3: ORTHOGONAL MRI SLICES ==================== */}
        {activeTab === 'orthogonal_mri' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <OrthogonalViewer
              scan={activeScan}
              selectedRegion={selectedRegion}
              gradCamEnabled={true}
            />
          </div>
        )}

        {/* ==================== VIEW 4: BRAIN MORPHOMETRY ==================== */}
        {activeTab === 'morphometry' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <MorphometryTable
              regions={activeScan.regions}
              selectedRegionId={selectedRegionId}
              onSelectRegion={setSelectedRegionId}
            />
          </div>
        )}

        {/* ==================== VIEW 5: ML BENCHMARKS ==================== */}
        {activeTab === 'ml_benchmarks' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
                Machine Learning & Deep Learning Benchmark Lab
              </h2>
              <p className="text-xs text-slate-400">
                Comparative evaluation across Tabular ML (XGBoost, Random Forest, Logistic Regression) and 3D Volumetric Deep Learning (3D ResNet-50 CNN).
              </p>
            </div>

            <ModelBenchmarkLab
              scan={activeScan}
              activeModel={activeModel}
              onSelectModel={setActiveModelId}
            />
          </div>
        )}

        {/* ==================== VIEW 6: EXPLAINABILITY (XAI) ==================== */}
        {activeTab === 'xai_explainability' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-purple-400" />
                Explainable AI (XAI) & Attribution Analysis
              </h2>
              <p className="text-xs text-slate-400">
                SHAP feature attributions and network tract importance rankings for model interpretability.
              </p>
            </div>

            <ShapAttributionView
              activeModel={activeModel}
              onSelectRegion={(regId) => {
                setSelectedRegionId(regId);
                setActiveTab('3d_connectome');
              }}
            />
          </div>
        )}

        {/* ==================== VIEW 7: GEMINI REASONING & CHAT ==================== */}
        {activeTab === 'gemini_assistant' && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            <ResearchReportGenerator
              scan={activeScan}
              activeModel={activeModel}
              onOpenKeyModal={() => setIsKeyModalOpen(true)}
            />

            <div>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Interactive Gemini Neuro-Assistant
              </h3>
              <NeuroChatAssistant
                scan={activeScan}
                activeModel={activeModel}
                onOpenKeyModal={() => setIsKeyModalOpen(true)}
              />
            </div>
          </div>
        )}

        {/* ==================== VIEW 8: INGESTION & QC ==================== */}
        {activeTab === 'ingestion' && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Upload className="w-6 h-6 text-cyan-400" />
                Data Ingestion & Automated Quality Control (QC)
              </h2>
              <p className="text-xs text-slate-400">
                Load benchmark research scans from OASIS-3, ADNI-3, HCP, or upload custom NIfTI (.nii/.nii.gz) files.
              </p>
            </div>

            <ScanUploader
              activeScan={activeScan}
              onSelectScan={handleSelectScan}
            />

            <QualityControlDashboard
              qc={activeScan.qc}
              metadata={activeScan.metadata}
            />
          </div>
        )}

      </main>

      {/* Gemini API Key Configuration Modal */}
      <GeminiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeySaved={() => {}}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
export default App;
