import React from 'react';
import type { GraphTheoryMetrics } from '../../types/neuro';
import { Network, Zap, GitFork, Compass, Shield, Award } from 'lucide-react';

interface GraphMetricsCardProps {
  metrics: GraphTheoryMetrics;
}

export const GraphMetricsCard: React.FC<GraphMetricsCardProps> = ({ metrics }) => {
  const cards = [
    {
      title: 'Global Efficiency (E_glob)',
      value: metrics.globalEfficiency.toFixed(2),
      normal: '~ 0.60',
      description: 'Capacity for parallel information transfer across the entire connectome.',
      icon: Zap,
      color: 'text-cyan-400',
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-500/10'
    },
    {
      title: 'Modularity Index (Q)',
      value: metrics.modularityIndex.toFixed(2),
      normal: '> 0.40',
      description: 'Degree to which the network can be subdivided into distinct functional modules.',
      icon: GitFork,
      color: 'text-purple-400',
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/10'
    },
    {
      title: 'Small-Worldness (σ)',
      value: metrics.smallWorldnessIndex.toFixed(2),
      normal: '> 1.50',
      description: 'Balance between high local clustering and short global path length.',
      icon: Compass,
      color: 'text-pink-400',
      border: 'border-pink-500/30',
      bg: 'bg-pink-500/10'
    },
    {
      title: 'Mean Clustering (C)',
      value: metrics.meanClusteringCoefficient.toFixed(2),
      normal: '~ 0.55',
      description: 'Likelihood that two neighbors of a node are also connected.',
      icon: Network,
      color: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10'
    },
    {
      title: 'Char. Path Length (L)',
      value: `${metrics.characteristicPathLength.toFixed(2)} hops`,
      normal: '~ 2.10',
      description: 'Average shortest path between all pairs of anatomical nodes.',
      icon: Shield,
      color: 'text-amber-400',
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10'
    },
    {
      title: 'Active Rich-Club Hubs',
      value: `${metrics.richClubHubs.length} Hubs`,
      normal: metrics.richClubHubs.join(', '),
      description: 'High-degree anatomical cores facilitating inter-modular integration.',
      icon: Award,
      color: 'text-blue-400',
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className={`glass-card p-5 rounded-2xl border ${c.border} shadow-lg flex flex-col justify-between glass-card-hover`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                  {c.title}
                </span>
                <div className={`p-2 rounded-xl ${c.bg} ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="text-2xl font-extrabold text-white font-mono mb-1">
                {c.value}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                {c.description}
              </p>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-500">Benchmark:</span>
              <span className="text-cyan-300 font-semibold truncate max-w-[160px] text-right">
                {c.normal}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
