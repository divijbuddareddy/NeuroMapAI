import React from 'react';
import { 
  Brain, 
  Sparkles, 
  Layers, 
  Network, 
  Crosshair, 
  BarChart3, 
  ShieldAlert, 
  Upload,
  Cpu
} from 'lucide-react';
import type { PresetResearchScan } from '../../types/neuro';
import { getStoredGeminiKey } from '../../services/geminiService';

export type NavTab = 
  | 'dashboard' 
  | '3d_connectome' 
  | 'orthogonal_mri' 
  | 'morphometry' 
  | 'ml_benchmarks' 
  | 'xai_explainability' 
  | 'gemini_assistant' 
  | 'ingestion';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeScan: PresetResearchScan;
  onOpenKeyModal: () => void;
  onOpenUpload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  activeScan,
  onOpenKeyModal,
  onOpenUpload
}) => {
  const hasGeminiKey = Boolean(getStoredGeminiKey());

  const navItems: Array<{ id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Overview', icon: Brain },
    { id: '3d_connectome', label: '3D Connectome', icon: Network },
    { id: 'orthogonal_mri', label: 'MRI Slices', icon: Crosshair },
    { id: 'morphometry', label: 'Morphometry', icon: Layers },
    { id: 'ml_benchmarks', label: 'ML Benchmarks', icon: BarChart3 },
    { id: 'xai_explainability', label: 'Explainability (XAI)', icon: Cpu },
    { id: 'gemini_assistant', label: 'Gemini Reasoning', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b border-white/10 bg-neuro-950/80 backdrop-blur-xl">
      {/* Top micro-bar with safety warning */}
      <div className="bg-neuro-950/90 border-b border-white/5 px-4 py-1 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-amber-300 font-semibold uppercase tracking-wider">Research-Only Prototype:</span>
          <span>Model outputs must not be presented as clinical diagnoses.</span>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => onSelectTab('dashboard')} 
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-0.5 shadow-glow-cyan transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-neuro-950 rounded-[14px] flex items-center justify-center">
              <Brain className="w-5 h-5 text-cyan-400 group-hover:animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-white tracking-tight">NeuroMap</span>
              <span className="text-base font-extrabold text-cyan-400">AI</span>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 ml-1">
                v2.4
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              Brain Connectivity & Abnormality Platform
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-neuro-900/60 p-1 rounded-2xl border border-white/10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold shadow-glow-cyan'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Tools & Gemini Status */}
        <div className="flex items-center gap-2">
          {/* Active Scan Indicator & Ingestion Trigger */}
          <button
            onClick={onOpenUpload}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-2 border transition ${
              activeTab === 'ingestion'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-glow-purple'
                : 'bg-neuro-900 text-slate-300 border-white/10 hover:border-cyan-500/40'
            }`}
            title="Switch or Upload Subject Scan"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline truncate max-w-[120px] font-bold">
              {activeScan.metadata.subjectId}
            </span>
          </button>

          {/* Gemini AI Key Modal Button */}
          <button
            onClick={onOpenKeyModal}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
              hasGeminiKey
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25 shadow-glow-emerald'
                : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline font-mono">
              {hasGeminiKey ? 'Gemini Active' : 'Set Gemini Key'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation */}
      <div className="lg:hidden px-4 py-2 border-t border-white/5 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`whitespace-nowrap px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                isActive
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
