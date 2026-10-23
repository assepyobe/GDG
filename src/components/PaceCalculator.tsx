import React, { useState } from 'react';
import { Gauge, Calculator, Timer, ArrowRight, Zap, Target } from 'lucide-react';

interface PaceCalculatorProps {
  onFindRunsWithPace?: (paceCategory: 'chill' | 'steady' | 'tempo' | 'fast') => void;
}

export const PaceCalculator: React.FC<PaceCalculatorProps> = ({ onFindRunsWithPace }) => {
  const [paceMin, setPaceMin] = useState(5);
  const [paceSec, setPaceSec] = useState(30);
  const [unit, setUnit] = useState<'km' | 'mile'>('km');

  // Total seconds per km
  const totalSecondsPerKm =
    unit === 'km'
      ? paceMin * 60 + paceSec
      : (paceMin * 60 + paceSec) / 1.60934;

  const secondsPerMile = totalSecondsPerKm * 1.60934;

  const formatPace = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatFinishTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = Math.round(totalSec % 60);
    if (hrs > 0) {
      return `${hrs}h ${mins < 10 ? '0' : ''}${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
    }
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  // Target race distances
  const races = [
    { name: '5K', distKm: 5, icon: '⚡' },
    { name: '10K', distKm: 10, icon: '🔥' },
    { name: 'Half Marathon', distKm: 21.0975, icon: '🏅' },
    { name: 'Marathon', distKm: 42.195, icon: '👑' },
  ];

  // Determine Club Pace Group
  let paceCategory: 'chill' | 'steady' | 'tempo' | 'fast' = 'steady';
  let categoryLabel = 'Steady Pace';
  let categoryDesc = 'Aerobic comfort zone, great for mid-week loops and steady long runs.';
  let badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

  if (totalSecondsPerKm >= 375) {
    // 6:15+
    paceCategory = 'chill';
    categoryLabel = 'Chill / Conversational';
    categoryDesc = 'Easy, social pace. You can talk in full sentences without gasping for breath.';
    badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  } else if (totalSecondsPerKm >= 315) {
    // 5:15 - 6:15
    paceCategory = 'steady';
    categoryLabel = 'Steady Rhythm';
    categoryDesc = 'Aerobic base building, smooth cadence, sustainable for double-digit mileage.';
    badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  } else if (totalSecondsPerKm >= 270) {
    // 4:30 - 5:15
    paceCategory = 'tempo';
    categoryLabel = 'Tempo / Fast Aerobic';
    categoryDesc = 'Comfortably hard. Great for threshold intervals and marathon race pace tests.';
    badgeColor = 'bg-orange-500/20 text-orange-400 border-orange-500/30';
  } else {
    // < 4:30
    paceCategory = 'fast';
    categoryLabel = 'Speed / Racing';
    categoryDesc = 'Sub-22 5K & Sub-45 10K territory. Track intervals and fast race simulation.';
    badgeColor = 'bg-red-500/20 text-red-400 border-red-500/30';
  }

  // Generate 5-split milestones
  const splits = [1, 2, 3, 5, 10, 15, 21.1, 42.2].map((km) => {
    const elapsed = km * totalSecondsPerKm;
    return {
      km,
      miles: (km * 0.621371).toFixed(1),
      time: formatFinishTime(elapsed),
    };
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Runner Pace & Split Calculator</h1>
              <p className="text-xs text-slate-400">Project finish times, compare metric/imperial, and match club pace groups</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs self-start sm:self-auto">
            <button
              onClick={() => setUnit('km')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                unit === 'km' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              min / km
            </button>
            <button
              onClick={() => setUnit('mile')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                unit === 'mile' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              min / mile
            </button>
          </div>
        </div>

        {/* Sliders and Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/70 p-6 rounded-2xl border border-slate-800/80 mb-6">
          {/* Minutes */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
              <span>Minutes ({paceMin} min)</span>
              <span className="text-orange-400 font-mono text-base">{paceMin}</span>
            </div>
            <input
              type="range"
              min="3"
              max="9"
              value={paceMin}
              onChange={(e) => setPaceMin(Number(e.target.value))}
              className="w-full accent-orange-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>3:00 (Elite)</span>
              <span>6:00 (Steady)</span>
              <span>9:00 (Gentle)</span>
            </div>
          </div>

          {/* Seconds */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
              <span>Seconds ({paceSec} sec)</span>
              <span className="text-amber-400 font-mono text-base">{paceSec < 10 ? `0${paceSec}` : paceSec}</span>
            </div>
            <input
              type="range"
              min="0"
              max="55"
              step="5"
              value={paceSec}
              onChange={(e) => setPaceSec(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>:00</span>
              <span>:15</span>
              <span>:30</span>
              <span>:45</span>
            </div>
          </div>
        </div>

        {/* Calculated Conversions Display */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kilometer Pace</p>
            <p className="text-2xl font-black text-orange-400 mt-1 font-mono">
              {formatPace(totalSecondsPerKm)} <span className="text-xs font-bold text-slate-400">/km</span>
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mile Pace</p>
            <p className="text-2xl font-black text-amber-400 mt-1 font-mono">
              {formatPace(secondsPerMile)} <span className="text-xs font-bold text-slate-400">/mi</span>
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Speed</p>
            <p className="text-2xl font-black text-emerald-400 mt-1 font-mono">
              {(3600 / totalSecondsPerKm).toFixed(1)} <span className="text-xs font-bold text-slate-400">km/h</span>
            </p>
          </div>
        </div>

        {/* Club Pace Group matching card */}
        <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Club Pace Tier:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeColor}`}>
                  {categoryLabel}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{categoryDesc}</p>
            </div>
          </div>

          {onFindRunsWithPace && (
            <button
              onClick={() => onFindRunsWithPace(paceCategory)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition-all whitespace-nowrap self-start sm:self-auto"
            >
              <span>Find {categoryLabel} Runs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Race Projections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {races.map((race) => {
          const totalTime = race.distKm * totalSecondsPerKm;
          return (
            <div
              key={race.name}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{race.icon}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800">
                  {race.distKm} km
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-300">{race.name}</h3>
              <p className="text-2xl font-black text-white mt-1 font-mono tracking-tight">
                {formatFinishTime(totalTime)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                At {formatPace(totalSecondsPerKm)}/km constant pace
              </p>
            </div>
          );
        })}
      </div>

      {/* Split Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Timer className="w-4 h-4 text-orange-400" />
          <span>Distance Split Checkpoints</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {splits.map((s) => (
            <div
              key={s.km}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
            >
              <span className="font-bold text-slate-300">
                {s.km} km <span className="text-[10px] text-slate-500">({s.miles} mi)</span>
              </span>
              <span className="font-mono font-bold text-orange-400">{s.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
