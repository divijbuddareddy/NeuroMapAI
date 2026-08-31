import React, { useState, useMemo } from 'react';
import type { ConnectomeNode, ConnectomeEdge } from '../../types/neuro';
import { Sliders, Network } from 'lucide-react';

interface ConnectivityMatrixProps {
  nodes: ConnectomeNode[];
  edges: ConnectomeEdge[];
}

export const ConnectivityMatrix: React.FC<ConnectivityMatrixProps> = ({ nodes, edges }) => {
  const [minWeight, setMinWeight] = useState(0.2);
  const [hoveredCell, setHoveredCell] = useState<{
    source: string;
    target: string;
    weight: number;
    streamlines?: number;
  } | null>(null);

  // Take top 16 prominent hub nodes for crisp matrix rendering
  const matrixNodes = useMemo(() => nodes.slice(0, 16), [nodes]);

  // Build NxN adjacency matrix
  const matrix = useMemo(() => {
    const grid: number[][] = Array(matrixNodes.length).fill(0).map(() => Array(matrixNodes.length).fill(0));
    
    matrixNodes.forEach((nodeI, i) => {
      matrixNodes.forEach((nodeJ, j) => {
        if (i === j) {
          grid[i][j] = 1.0;
          return;
        }
        const edge = edges.find(
          e => (e.source === nodeI.id && e.target === nodeJ.id) || (e.source === nodeJ.id && e.target === nodeI.id)
        );
        grid[i][j] = edge ? edge.weight : 0.05 + ((i + j) % 5) * 0.04;
      });
    });
    return grid;
  }, [matrixNodes, edges]);

  const getColor = (val: number) => {
    if (val < minWeight && val !== 1.0) return 'rgba(15, 23, 42, 0.4)';
    if (val >= 0.8) return 'rgba(0, 242, 254, 0.95)';
    if (val >= 0.6) return 'rgba(0, 229, 255, 0.7)';
    if (val >= 0.4) return 'rgba(121, 40, 202, 0.65)';
    if (val >= 0.2) return 'rgba(255, 0, 122, 0.5)';
    return 'rgba(30, 41, 59, 0.5)';
  };

  return (
    <div className="glass-card p-5 rounded-3xl border border-white/10 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            Connectome Adjacency Matrix (N × N)
          </h3>
          <p className="text-xs text-slate-400">
            Pairwise structural tract count / functional BOLD correlation
          </p>
        </div>

        {/* Filter Slider */}
        <div className="flex items-center gap-2 text-xs bg-neuro-900 px-3 py-1.5 rounded-xl border border-white/10">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Min Correlation:</span>
          <input
            type="range"
            min="0.0"
            max="0.8"
            step="0.05"
            value={minWeight}
            onChange={(e) => setMinWeight(parseFloat(e.target.value))}
            className="w-20 accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
          />
          <span className="font-mono text-cyan-300 w-6">{minWeight.toFixed(2)}</span>
        </div>
      </div>

      {/* Matrix Heatmap Grid */}
      <div className="flex flex-col items-center justify-center p-2 bg-neuro-950/80 rounded-2xl border border-white/5 overflow-x-auto">
        <div className="flex flex-col">
          {/* Top Node Labels */}
          <div className="flex pl-16 mb-1">
            {matrixNodes.map((node) => (
              <div
                key={node.id}
                className="w-7 text-[9px] font-mono text-slate-400 truncate -rotate-45 origin-bottom-left"
                title={node.name}
              >
                {node.id}
              </div>
            ))}
          </div>

          {/* Matrix Rows */}
          {matrixNodes.map((rowNode, i) => (
            <div key={rowNode.id} className="flex items-center">
              {/* Row Label */}
              <span
                className="w-16 text-[10px] font-mono text-slate-400 truncate text-right pr-2"
                title={rowNode.name}
              >
                {rowNode.id}
              </span>

              {/* Row Cells */}
              <div className="flex gap-0.5">
                {matrix[i].map((val, j) => {
                  const targetNode = matrixNodes[j];
                  const edge = edges.find(
                    e => (e.source === rowNode.id && e.target === targetNode.id) || (e.source === targetNode.id && e.target === rowNode.id)
                  );
                  const isSelf = i === j;

                  return (
                    <div
                      key={j}
                      onMouseEnter={() =>
                        setHoveredCell({
                          source: rowNode.name,
                          target: targetNode.name,
                          weight: val,
                          streamlines: edge?.fiberStreamlines
                        })
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                      style={{ backgroundColor: getColor(val) }}
                      className={`w-7 h-7 rounded-sm transition-all hover:scale-125 hover:z-20 cursor-pointer border border-black/20 ${
                        isSelf ? 'opacity-30' : ''
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hovered Cell Info Readout */}
      {hoveredCell ? (
        <div className="p-3 bg-neuro-900 rounded-xl border border-cyan-500/30 text-xs flex items-center justify-between animate-in fade-in">
          <div>
            <span className="text-slate-400">Connection: </span>
            <strong className="text-white">{hoveredCell.source}</strong>
            <span className="text-cyan-400 mx-1.5">↔</span>
            <strong className="text-white">{hoveredCell.target}</strong>
          </div>
          <div className="flex items-center gap-3 font-mono">
            <span className="text-slate-400">Weight: <strong className="text-cyan-300">{hoveredCell.weight.toFixed(3)}</strong></span>
            {hoveredCell.streamlines && (
              <span className="text-slate-400">Fibers: <strong className="text-purple-300">{hoveredCell.streamlines}</strong></span>
            )}
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-slate-500 text-center italic">
          Hover over matrix cells to inspect regional tract strengths and cross-correlations
        </div>
      )}
    </div>
  );
};
