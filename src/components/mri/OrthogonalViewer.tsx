import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Sliders, 
  Layers, 
  Flame, 
  RotateCcw, 
  Crosshair
} from 'lucide-react';
import type { PresetResearchScan, BrainRegion } from '../../types/neuro';

interface OrthogonalViewerProps {
  scan: PresetResearchScan;
  selectedRegion?: BrainRegion | null;
  gradCamEnabled?: boolean;
}

export const OrthogonalViewer: React.FC<OrthogonalViewerProps> = ({
  scan,
  gradCamEnabled: initialGradCam = false
}) => {
  // Slices coordinates
  const [axialSlice, setAxialSlice] = useState(scan.sliceData.defaultAxial);
  const [coronalSlice, setCoronalSlice] = useState(scan.sliceData.defaultCoronal);
  const [sagittalSlice, setSagittalSlice] = useState(scan.sliceData.defaultSagittal);

  // Display Settings
  const [windowLevel, setWindowLevel] = useState(128); // Brightness
  const [windowWidth, setWindowWidth] = useState(256); // Contrast
  const [showCrosshairs, setShowCrosshairs] = useState(true);
  const [showGradCam, setShowGradCam] = useState(initialGradCam);
  const [showAtlasMask, setShowAtlasMask] = useState(false);

  const axialCanvasRef = useRef<HTMLCanvasElement>(null);
  const coronalCanvasRef = useRef<HTMLCanvasElement>(null);
  const sagittalCanvasRef = useRef<HTMLCanvasElement>(null);

  // Procedural anatomical MRI slice renderer with realistic gray matter, white matter, ventricles, sulci & Grad-CAM heatmap
  const renderSlice = useCallback((
    canvas: HTMLCanvasElement | null,
    plane: 'axial' | 'coronal' | 'sagittal',
    sliceIdx: number,
    maxSlices: number
  ) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.fillStyle = '#05070f';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const normSlice = sliceIdx / maxSlices; // 0.0 to 1.0

    // Compute contrast adjustments
    const minVal = windowLevel - windowWidth / 2;
    const maxVal = windowLevel + windowWidth / 2;
    const applyWL = (rawVal: number) => {
      const clamped = Math.max(minVal, Math.min(maxVal, rawVal));
      return Math.floor(((clamped - minVal) / (maxVal - minVal)) * 255);
    };

    // 1. Draw Outer Skull & Scalp
    ctx.beginPath();
    let rx = width * 0.4;
    let ry = height * 0.44;
    if (plane === 'axial') {
      rx = width * 0.38;
      ry = height * 0.44;
    } else if (plane === 'coronal') {
      rx = width * 0.38;
      ry = height * 0.40;
    } else {
      rx = width * 0.44;
      ry = height * 0.38;
    }
    ctx.ellipse(centerX, centerY, rx, ry, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = `rgba(${applyWL(80)}, ${applyWL(80)}, ${applyWL(80)}, 0.4)`;
    ctx.lineWidth = 3;
    ctx.stroke();

    // 2. Draw Brain Cortical Parenchyma (Gray & White Matter with realistic gyri/sulci convolutions)
    const gyriCount = 28;
    const isAtrophy = scan.id.includes('AD') || scan.id.includes('MCI');

    // Brain boundary
    ctx.beginPath();
    const brainRx = rx * 0.92;
    const brainRy = ry * 0.92;
    for (let a = 0; a < Math.PI * 2; a += 0.05) {
      const gyrusOffset = Math.sin(a * gyriCount + normSlice * 10) * (isAtrophy ? 5.5 : 3.5);
      const px = centerX + Math.cos(a) * (brainRx + gyrusOffset);
      const py = centerY + Math.sin(a) * (brainRy + gyrusOffset);
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    
    // Gray matter fill
    const gmVal = applyWL(130);
    ctx.fillStyle = `rgb(${gmVal}, ${gmVal}, ${gmVal})`;
    ctx.fill();

    // White matter core
    ctx.beginPath();
    const wmRx = brainRx * 0.72;
    const wmRy = brainRy * 0.72;
    for (let a = 0; a < Math.PI * 2; a += 0.05) {
      const gyrusOffset = Math.sin(a * (gyriCount - 4)) * 3;
      const px = centerX + Math.cos(a) * (wmRx + gyrusOffset);
      const py = centerY + Math.sin(a) * (wmRy + gyrusOffset);
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    const wmVal = applyWL(190);
    ctx.fillStyle = `rgb(${wmVal}, ${wmVal}, ${wmVal})`;
    ctx.fill();

    // 3. Draw Lateral & Third Ventricles (CSF - Hypointense dark)
    const ventScale = isAtrophy ? 1.7 : 1.0; // Enlarged in Alzheimer phenotype
    const csfVal = applyWL(25);
    ctx.fillStyle = `rgb(${csfVal}, ${csfVal}, ${csfVal})`;

    // Left ventricle horn
    ctx.beginPath();
    ctx.ellipse(centerX - 16 * ventScale, centerY - 6, 8 * ventScale, 20 * ventScale, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Right ventricle horn
    ctx.beginPath();
    ctx.ellipse(centerX + 16 * ventScale, centerY - 6, 8 * ventScale, 20 * ventScale, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // 4. Interhemispheric Fissure
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - brainRy);
    ctx.lineTo(centerX, centerY + brainRy);
    ctx.strokeStyle = `rgb(${csfVal}, ${csfVal}, ${csfVal})`;
    ctx.lineWidth = isAtrophy ? 3.0 : 1.8;
    ctx.stroke();

    // 5. Grad-CAM Saliency Heatmap Overlay (if enabled)
    if (showGradCam) {
      // Hotspot localized around Medial Temporal Lobe / Hippocampus for AD scan
      const gradCamGradient = ctx.createRadialGradient(
        centerX - 24, centerY + 18, 4,
        centerX - 24, centerY + 18, 48
      );
      gradCamGradient.addColorStop(0, 'rgba(255, 0, 0, 0.75)');
      gradCamGradient.addColorStop(0.35, 'rgba(255, 140, 0, 0.6)');
      gradCamGradient.addColorStop(0.7, 'rgba(255, 255, 0, 0.35)');
      gradCamGradient.addColorStop(1, 'rgba(0, 0, 255, 0)');

      ctx.fillStyle = gradCamGradient;
      ctx.beginPath();
      ctx.arc(centerX - 24, centerY + 18, 48, 0, Math.PI * 2);
      ctx.fill();

      // Right hemisphere secondary hotspot
      const gradCamRight = ctx.createRadialGradient(
        centerX + 24, centerY + 18, 2,
        centerX + 24, centerY + 18, 40
      );
      gradCamRight.addColorStop(0, 'rgba(255, 50, 0, 0.65)');
      gradCamRight.addColorStop(0.4, 'rgba(255, 160, 0, 0.4)');
      gradCamRight.addColorStop(1, 'rgba(0, 0, 255, 0)');
      ctx.fillStyle = gradCamRight;
      ctx.beginPath();
      ctx.arc(centerX + 24, centerY + 18, 40, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Atlas Segmentation Mask Overlay (if enabled)
    if (showAtlasMask) {
      // Color-coded anatomical lobes
      ctx.fillStyle = 'rgba(0, 242, 254, 0.25)'; // Frontal
      ctx.fillRect(centerX - brainRx * 0.8, centerY - brainRy * 0.8, brainRx * 1.6, brainRy * 0.7);

      ctx.fillStyle = 'rgba(121, 40, 202, 0.25)'; // Temporal
      ctx.fillRect(centerX - brainRx * 0.8, centerY + 10, brainRx * 1.6, brainRy * 0.7);
    }

    // 7. Crosshairs
    if (showCrosshairs) {
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.65)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, height);
      ctx.stroke();

      ctx.setLineDash([]);
    }

    // Slice Info Annotations
    ctx.fillStyle = '#00e5ff';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText(`${plane.toUpperCase()} SLICE: ${sliceIdx} / ${maxSlices}`, 8, 16);
    ctx.fillText(`FOV: 240x240mm`, 8, height - 8);
    ctx.fillText(`W:${windowWidth} L:${windowLevel}`, width - 78, height - 8);

    // Anatomical Orientation labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    if (plane === 'axial') {
      ctx.fillText('A', centerX - 4, 14);
      ctx.fillText('P', centerX - 4, height - 6);
      ctx.fillText('R', 6, centerY + 4);
      ctx.fillText('L', width - 14, centerY + 4);
    } else if (plane === 'coronal') {
      ctx.fillText('S', centerX - 4, 14);
      ctx.fillText('I', centerX - 4, height - 6);
      ctx.fillText('R', 6, centerY + 4);
      ctx.fillText('L', width - 14, centerY + 4);
    } else {
      ctx.fillText('S', centerX - 4, 14);
      ctx.fillText('I', centerX - 4, height - 6);
      ctx.fillText('A', 6, centerY + 4);
      ctx.fillText('P', width - 14, centerY + 4);
    }
  }, [windowLevel, windowWidth, showGradCam, showAtlasMask, showCrosshairs, scan]);

  useEffect(() => {
    renderSlice(axialCanvasRef.current, 'axial', axialSlice, scan.sliceData.axialSlices);
  }, [axialSlice, renderSlice, scan]);

  useEffect(() => {
    renderSlice(coronalCanvasRef.current, 'coronal', coronalSlice, scan.sliceData.coronalSlices);
  }, [coronalSlice, renderSlice, scan]);

  useEffect(() => {
    renderSlice(sagittalCanvasRef.current, 'sagittal', sagittalSlice, scan.sliceData.sagittalSlices);
  }, [sagittalSlice, renderSlice, scan]);

  return (
    <div className="flex flex-col gap-4">
      {/* Controls Header */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
        {/* Left Status & Preset Info */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Orthogonal Multi-Slice MRI Viewer
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                {scan.metadata.modality}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Synchronized 3-plane navigation with Grad-CAM 3D saliency activation maps
            </p>
          </div>
        </div>

        {/* View Mode & Overlay Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowGradCam(!showGradCam)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              showGradCam
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-glow-magenta'
                : 'bg-neuro-900 text-slate-400 hover:text-slate-200 border border-white/10'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            Grad-CAM Heatmap
          </button>

          <button
            onClick={() => setShowAtlasMask(!showAtlasMask)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              showAtlasMask
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-glow-purple'
                : 'bg-neuro-900 text-slate-400 hover:text-slate-200 border border-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            Atlas Overlay
          </button>

          <button
            onClick={() => setShowCrosshairs(!showCrosshairs)}
            className={`p-2 rounded-xl text-xs transition ${
              showCrosshairs ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-neuro-900 text-slate-400 border border-white/10'
            }`}
            title="Toggle Crosshairs"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          {/* Window/Level Reset */}
          <button
            onClick={() => { setWindowLevel(128); setWindowWidth(256); }}
            className="p-2 rounded-xl text-xs bg-neuro-900 text-slate-400 hover:text-white border border-white/10 transition"
            title="Reset Contrast / Window Level"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3 Orthogonal Planes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. AXIAL PLANE */}
        <div className="glass-card p-3 rounded-2xl border border-white/10 flex flex-col gap-2 relative group">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-cyan-400 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              AXIAL (Z-Plane)
            </span>
            <span className="text-slate-400 font-mono">{axialSlice} / {scan.sliceData.axialSlices}</span>
          </div>

          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black flex items-center justify-center border border-white/5">
            <canvas 
              ref={axialCanvasRef} 
              width={260} 
              height={260} 
              className="w-full h-full object-contain cursor-crosshair"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] text-slate-500 font-mono">Inferior</span>
            <input
              type="range"
              min="1"
              max={scan.sliceData.axialSlices}
              value={axialSlice}
              onChange={(e) => setAxialSlice(parseInt(e.target.value))}
              className="flex-1 accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 font-mono">Superior</span>
          </div>
        </div>

        {/* 2. CORONAL PLANE */}
        <div className="glass-card p-3 rounded-2xl border border-white/10 flex flex-col gap-2 relative group">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-purple-400 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              CORONAL (Y-Plane)
            </span>
            <span className="text-slate-400 font-mono">{coronalSlice} / {scan.sliceData.coronalSlices}</span>
          </div>

          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black flex items-center justify-center border border-white/5">
            <canvas 
              ref={coronalCanvasRef} 
              width={260} 
              height={260} 
              className="w-full h-full object-contain cursor-crosshair"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] text-slate-500 font-mono">Posterior</span>
            <input
              type="range"
              min="1"
              max={scan.sliceData.coronalSlices}
              value={coronalSlice}
              onChange={(e) => setCoronalSlice(parseInt(e.target.value))}
              className="flex-1 accent-purple-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 font-mono">Anterior</span>
          </div>
        </div>

        {/* 3. SAGITTAL PLANE */}
        <div className="glass-card p-3 rounded-2xl border border-white/10 flex flex-col gap-2 relative group">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-pink-400 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-pink-400"></span>
              SAGITTAL (X-Plane)
            </span>
            <span className="text-slate-400 font-mono">{sagittalSlice} / {scan.sliceData.sagittalSlices}</span>
          </div>

          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black flex items-center justify-center border border-white/5">
            <canvas 
              ref={sagittalCanvasRef} 
              width={260} 
              height={260} 
              className="w-full h-full object-contain cursor-crosshair"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] text-slate-500 font-mono">Left</span>
            <input
              type="range"
              min="1"
              max={scan.sliceData.sagittalSlices}
              value={sagittalSlice}
              onChange={(e) => setSagittalSlice(parseInt(e.target.value))}
              className="flex-1 accent-pink-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 font-mono">Right</span>
          </div>
        </div>
      </div>

      {/* Medical Image Contrast & Radiometry Controls */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="flex items-center gap-3">
          <Sliders className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-slate-300 shrink-0 font-medium">Window Level (Brightness):</span>
          <input
            type="range"
            min="30"
            max="220"
            value={windowLevel}
            onChange={(e) => setWindowLevel(parseInt(e.target.value))}
            className="flex-1 accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
          />
          <span className="font-mono text-cyan-300 w-8">{windowLevel}</span>
        </div>

        <div className="flex items-center gap-3">
          <Sliders className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="text-slate-300 shrink-0 font-medium">Window Width (Contrast):</span>
          <input
            type="range"
            min="50"
            max="400"
            value={windowWidth}
            onChange={(e) => setWindowWidth(parseInt(e.target.value))}
            className="flex-1 accent-purple-400 h-1.5 bg-slate-800 rounded cursor-pointer"
          />
          <span className="font-mono text-purple-300 w-8">{windowWidth}</span>
        </div>
      </div>
    </div>
  );
};
