import React from 'react';
import { Search, MapPin, Gauge, Mountain, Calendar, X } from 'lucide-react';
import { RunFilters, TerrainType } from '../types.ts';

interface FiltersBarProps {
  filters: RunFilters;
  onChange: (filters: RunFilters) => void;
  totalRuns: number;
  filteredCount: number;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  filters,
  onChange,
  totalRuns,
  filteredCount,
}) => {
  const isFiltered =
    filters.search !== '' ||
    filters.distanceCategory !== 'all' ||
    filters.paceCategory !== 'all' ||
    filters.terrain !== 'all' ||
    filters.timeframe !== 'all';

  const resetFilters = () => {
    onChange({
      search: '',
      distanceCategory: 'all',
      paceCategory: 'all',
      terrain: 'all',
      timeframe: 'all',
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm space-y-3.5">
      {/* Search and Timeframe row */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search by title, location, road, trail, or neighborhood..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/50 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Timeframe Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-orange-400" />
            When:
          </span>
          {(['all', 'today', 'weekend', 'upcoming'] as const).map((t) => (
            <button
              key={t}
              onClick={() => onChange({ ...filters, timeframe: t })}
              className={`px-3 py-2 rounded-lg font-medium whitespace-nowrap capitalize transition-all ${
                filters.timeframe === t
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                  : 'bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {t === 'all' ? 'All Dates' : t === 'today' ? 'Today' : t === 'weekend' ? 'This Weekend' : 'Next 7 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Chips row (Distance, Pace, Terrain) */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Distance Filter */}
          <div className="flex items-center gap-1 bg-slate-950/50 p-1 rounded-xl border border-slate-800">
            <span className="text-slate-400 px-2 flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Dist:
            </span>
            {(['all', 'short', 'medium', 'long'] as const).map((d) => (
              <button
                key={d}
                onClick={() => onChange({ ...filters, distanceCategory: d })}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  filters.distanceCategory === d
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {d === 'all' ? 'Any' : d === 'short' ? '<6k' : d === 'medium' ? '6-12k' : '12k+'}
              </button>
            ))}
          </div>

          {/* Pace Filter */}
          <div className="flex items-center gap-1 bg-slate-950/50 p-1 rounded-xl border border-slate-800">
            <span className="text-slate-400 px-2 flex items-center gap-1 font-medium">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              Pace:
            </span>
            {(['all', 'chill', 'steady', 'tempo', 'fast'] as const).map((p) => (
              <button
                key={p}
                onClick={() => onChange({ ...filters, paceCategory: p })}
                className={`px-2.5 py-1 rounded-lg font-medium capitalize transition-all ${
                  filters.paceCategory === p
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {p === 'all' ? 'Any' : p}
              </button>
            ))}
          </div>

          {/* Terrain Filter */}
          <div className="flex items-center gap-1 bg-slate-950/50 p-1 rounded-xl border border-slate-800">
            <span className="text-slate-400 px-2 flex items-center gap-1 font-medium">
              <Mountain className="w-3.5 h-3.5 text-sky-400" />
              Terrain:
            </span>
            {(['all', 'road', 'trail', 'track', 'mixed'] as const).map((t) => (
              <button
                key={t}
                onClick={() => onChange({ ...filters, terrain: t as 'all' | TerrainType })}
                className={`px-2.5 py-1 rounded-lg font-medium capitalize transition-all ${
                  filters.terrain === t
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {t === 'all' ? 'Any' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Counter and Reset */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">
            Showing <strong className="text-white">{filteredCount}</strong> of {totalRuns} runs
          </span>
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-orange-400 text-xs font-semibold transition-colors"
            >
              <X className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
