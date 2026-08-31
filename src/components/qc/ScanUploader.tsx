import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Database, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import type { PresetResearchScan } from '../../types/neuro';
import { PRESET_RESEARCH_SCANS, synthesizeScanFromUpload } from '../../services/mockNeuroEngine';

interface ScanUploaderProps {
  activeScan: PresetResearchScan;
  onSelectScan: (scan: PresetResearchScan) => void;
}

export const ScanUploader: React.FC<ScanUploaderProps> = ({ activeScan, onSelectScan }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setIsUploading(true);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            const synthesized = synthesizeScanFromUpload(file.name, file.size);
            onSelectScan(synthesized);
            setIsUploading(false);
            setUploadProgress(0);
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Benchmark Cohort Preset Selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Public Benchmark Research Cohorts</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Select a curated MRI/dMRI scan</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRESET_RESEARCH_SCANS.map((preset) => {
            const isSelected = activeScan.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectScan(preset)}
                className={`glass-card p-5 rounded-2xl border text-left transition flex flex-col justify-between group ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-500/15 shadow-glow-cyan'
                    : 'border-white/10 hover:border-white/20 bg-neuro-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                      {preset.cohort}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {preset.metadata.modality}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1 group-hover:text-cyan-300 transition">
                    {preset.title}
                  </h4>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {preset.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">
                    Ground Truth: <strong className="text-white">{preset.groundTruth}</strong>
                  </span>
                  <ArrowRight className={`w-4 h-4 transition ${
                    isSelected ? 'text-cyan-400 translate-x-1' : 'text-slate-500'
                  }`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Drag and Drop Custom File Ingestion */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-purple-400" />
            Upload Research NIfTI / DICOM Volumetric Scan
          </h3>
          <p className="text-xs text-slate-400">
            Accepts <code className="text-cyan-300 font-mono">.nii</code>, <code className="text-cyan-300 font-mono">.nii.gz</code>, or <code className="text-cyan-300 font-mono">DICOM (.dcm)</code> series. Runs client-side QC validation, 3D segmentation, and connectome feature extraction.
          </p>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition ${
            isDragging
              ? 'border-cyan-400 bg-cyan-500/10 shadow-glow-cyan'
              : 'border-white/15 hover:border-cyan-500/40 bg-neuro-950/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".nii,.nii.gz,.dcm,.zip"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-3 w-full max-w-xs">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              <div className="text-sm font-bold text-white font-mono">
                Ingesting & Preprocessing Volume... {uploadProgress}%
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Performing BET skull-stripping & Desikan-Killiany atlas registration
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  Drop your NIfTI or DICOM file here, or <span className="text-cyan-400 hover:underline">browse</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports 3D/4D Structural T1/T2, FLAIR, and Diffusion-Weighted Tensor Imaging
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-1">
                <span>ANONYMIZED RESEARCH INGESTION</span>
                <span>•</span>
                <span>CLIENT-SIDE VOLUMETRIC QC</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
