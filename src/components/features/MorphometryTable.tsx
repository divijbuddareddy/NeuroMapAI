import React, { useState } from 'react';
import type { BrainRegion } from '../../types/neuro';
import { Search, ArrowUpDown, AlertOctagon } from 'lucide-react';

interface MorphometryTableProps {
  regions: BrainRegion[];
  selectedRegionId?: string | null;
  onSelectRegion?: (regionId: string | null) => void;
}

export const MorphometryTable: React.FC<MorphometryTableProps> = ({
  regions,
  selectedRegionId,
  onSelectRegion
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLobe, setSelectedLobe] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'volume' | 'thickness' | 'zScore'>('zScore');
  const [sortAsc, setSortAsc] = useState(true);

  const lobes = ['ALL', 'Frontal', 'Temporal', 'Parietal', 'Occipital', 'Subcortical', 'Limbic'];

  const filteredRegions = regions
    .filter(r => {
      const matchSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchLobe = selectedLobe === 'ALL' || r.lobe === selectedLobe;
      return matchSearch && matchLobe;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortBy === 'volume') comparison = a.volume_mm3 - b.volume_mm3;
      else if (sortBy === 'thickness') comparison = a.cortical_thickness_mm - b.cortical_thickness_mm;
      else if (sortBy === 'zScore') comparison = a.zScore - b.zScore;
      return sortAsc ? comparison : -comparison;
    });

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(field === 'zScore'); // Default Z-score to ascending (most atrophied first)
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col">
      {/* Table Header & Search Bar */}
      <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            Desikan-Killiany 68-Region Atlas Morphometry
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              {filteredRegions.length} Regions
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Regional volumetric, cortical thickness, and normative Z-score deviations
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search region or code..."
              className="bg-neuro-900 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-44"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
          </div>

          {/* Lobe Filter Buttons */}
          <div className="flex items-center gap-1 bg-neuro-900/80 p-1 rounded-xl border border-white/10 text-xs">
            {lobes.map((l) => (
              <button
                key={l}
                onClick={() => setSelectedLobe(l)}
                className={`px-2 py-0.5 rounded-lg transition text-[11px] ${
                  selectedLobe === l
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-neuro-950/95 backdrop-blur-md border-b border-white/10 text-slate-400 font-mono text-[11px] uppercase">
            <tr>
              <th 
                onClick={() => toggleSort('name')} 
                className="py-3 px-4 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  Region Name
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3">Lobe</th>
              <th className="py-3 px-3">Hemisphere</th>
              <th 
                onClick={() => toggleSort('volume')} 
                className="py-3 px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  Volume (mm³)
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                onClick={() => toggleSort('thickness')} 
                className="py-3 px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  Thickness (mm)
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3">Asymmetry</th>
              <th 
                onClick={() => toggleSort('zScore')} 
                className="py-3 px-4 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  Normative Z-Score
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredRegions.map((region) => {
              const isSelected = selectedRegionId === region.id;
              const isAtrophy = region.zScore <= -1.5;
              const isSevere = region.zScore <= -2.0;

              return (
                <tr
                  key={region.id}
                  onClick={() => onSelectRegion?.(isSelected ? null : region.id)}
                  className={`cursor-pointer transition ${
                    isSelected
                      ? 'bg-cyan-500/20 border-l-4 border-l-cyan-400 text-white'
                      : isSevere
                      ? 'bg-rose-500/5 hover:bg-rose-500/10'
                      : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <td className="py-2.5 px-4 font-medium flex items-center gap-2">
                    <span className="font-mono text-cyan-400 text-[11px] px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                      {region.code}
                    </span>
                    <span className="text-white">{region.name}</span>
                  </td>

                  <td className="py-2.5 px-3">
                    <span className="text-slate-400">{region.lobe}</span>
                  </td>

                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      region.hemisphere === 'Left' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      {region.hemisphere}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 font-mono text-slate-200">
                    {region.volume_mm3.toLocaleString()}
                  </td>

                  <td className="py-2.5 px-3 font-mono">
                    {region.cortical_thickness_mm > 0 ? (
                      <span className="text-slate-200">{region.cortical_thickness_mm.toFixed(2)}</span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 font-mono text-[11px]">
                    <span className={region.asymmetry_index > 0 ? 'text-cyan-400' : 'text-purple-400'}>
                      {region.asymmetry_index > 0 ? `+${region.asymmetry_index}` : region.asymmetry_index}
                    </span>
                  </td>

                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                        isSevere
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : isAtrophy
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {region.zScore > 0 ? `+${region.zScore.toFixed(2)}` : region.zScore.toFixed(2)}σ
                      </span>
                      {isSevere && <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
