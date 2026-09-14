import React, { useState } from 'react';
import { Globe, Calendar, TrendingUp, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Phenomenon } from '../types';
import { PHENOMENA } from '../data/phenomena';
import { getPhenomenonPath } from '../utils/routing';

export const WorldIn2050View: React.FC<{
  onOpenStory: (phenomenon: Phenomenon) => void;
}> = ({ onOpenStory }) => {
  const [selectedId, setSelectedId] = useState<string>('solar-energy');
  const [scenarioMode, setScenarioMode] = useState<'bounded' | 'unbounded'>('bounded');

  const selectedPhenomenon = PHENOMENA.find(p => p.id === selectedId) || PHENOMENA[2];

  // Prepare chart points
  const hist = selectedPhenomenon.historicalData;
  const proj = selectedPhenomenon.projectionData.slice(1);

  // If unbounded, calculate naive exponential extrapolation from latest historical
  const latestHist = hist[hist.length - 1];
  const rate = selectedPhenomenon.growthRatePercent / 100;

  const displayProj = proj.map(p => {
    if (scenarioMode === 'unbounded' && rate > 0) {
      const yearsDiff = p.yearOrCycle - latestHist.yearOrCycle;
      const rawVal = latestHist.value * Math.pow(1 + Math.min(0.28, rate), yearsDiff);
      return {
        ...p,
        value: Math.round(rawVal * 10) / 10,
        formattedValue: `${Math.round(rawVal).toLocaleString()} ${selectedPhenomenon.unit}`,
        context: 'Unconstrained exponential extrapolation',
      };
    }
    return p;
  });

  const allPoints = [
    ...hist.map(p => ({ ...p, isProjection: false })),
    ...displayProj.map(p => ({ ...p, isProjection: true })),
  ];

  // SVG Chart construction
  const svgW = 600;
  const svgH = 220;
  const padL = 50;
  const padR = 30;
  const padT = 20;
  const padB = 30;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const values = allPoints.map(p => p.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const getX = (idx: number) => padL + (idx / (allPoints.length - 1)) * plotW;
  const getY = (val: number) => padT + plotH - ((val - minVal) / range) * plotH;

  const histPath = hist
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)},${getY(p.value).toFixed(1)}`)
    .join(' ');

  const projPath = [
    `M ${getX(hist.length - 1).toFixed(1)},${getY(hist[hist.length - 1].value).toFixed(1)}`,
    ...displayProj.map((p, i) => `L ${getX(hist.length + i).toFixed(1)},${getY(p.value).toFixed(1)}`),
  ].join(' ');

  return (
    <section id="world-2050-section" className="py-16 border-b border-slate-800/80 bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-3 uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5" />
              <span>Exploration Scenario</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              The World in 2050: If Trends Continue...
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl leading-relaxed">
              We do not claim to forecast the future with a crystal ball. Instead, we cleanly separate verified <strong className="text-emerald-400">Historical Data</strong> from transparent <strong className="text-amber-400">Mathematical Projections</strong> to inspect what the math demands.
            </p>
          </div>
        </div>

        {/* Phenomenon Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {PHENOMENA.map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                selectedId === item.id
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        {/* Interactive Deep Exploration Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Selected Phenomenon:
              </span>
              <h3 className="text-2xl font-bold text-white mt-0.5">
                {selectedPhenomenon.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {selectedPhenomenon.subtitle}
              </p>
            </div>

            {/* Scenario toggle */}
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setScenarioMode('bounded')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  scenarioMode === 'bounded'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Bounded S-Curve (Realistic)</span>
              </button>

              <button
                onClick={() => setScenarioMode('unbounded')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  scenarioMode === 'unbounded'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Unbounded Pure Math</span>
              </button>
            </div>
          </div>

          {/* SVG Trajectory Chart */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 mb-6">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto overflow-visible select-none">
              {/* Grid Lines */}
              {[0, 0.5, 1].map((frac, idx) => {
                const y = padT + plotH * (1 - frac);
                return (
                  <line
                    key={idx}
                    x1={padL}
                    y1={y}
                    x2={svgW - padR}
                    y2={y}
                    stroke="rgba(51, 65, 85, 0.3)"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Historical Path */}
              <path
                d={histPath}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
              />

              {/* Projection Path */}
              <path
                d={projPath}
                fill="none"
                stroke={scenarioMode === 'unbounded' ? '#f59e0b' : '#38bdf8'}
                strokeWidth="2.5"
                strokeDasharray="6 4"
              />

              {/* Data points */}
              {allPoints.map((p, idx) => {
                const cx = getX(idx);
                const cy = getY(p.value);
                return (
                  <g key={idx}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r="4.5"
                      fill={p.isProjection ? (scenarioMode === 'unbounded' ? '#f59e0b' : '#38bdf8') : '#10b981'}
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                    <text
                      x={cx}
                      y={padT + plotH + 18}
                      fill={p.isProjection ? '#94a3b8' : '#64748b'}
                      fontSize="9"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {p.yearOrCycle}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Legend & Summary */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800/80 text-xs font-mono">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  Historical ({hist[0].yearOrCycle}–{hist[hist.length - 1].yearOrCycle})
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  2050 Mathematical Projection
                </span>
              </div>

              <a
                href={getPhenomenonPath(selectedPhenomenon)}
                onClick={e => {
                  if (e.metaKey || e.ctrlKey) return;
                  e.preventDefault();
                  onOpenStory(selectedPhenomenon);
                }}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold no-underline"
              >
                <span>Launch Full Interactive Simulation</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Contextual breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
              <div className="text-slate-400 uppercase text-[11px] mb-1">Baseline Milestone</div>
              <div className="text-base font-bold text-white">{hist[0].formattedValue}</div>
              <div className="text-slate-400 text-[11px] mt-0.5">at {hist[0].yearOrCycle}</div>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
              <div className="text-slate-400 uppercase text-[11px] mb-1">Today / Latest Measured</div>
              <div className="text-base font-bold text-emerald-400">{hist[hist.length - 1].formattedValue}</div>
              <div className="text-slate-400 text-[11px] mt-0.5">at {hist[hist.length - 1].yearOrCycle}</div>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
              <div className="text-slate-400 uppercase text-[11px] mb-1">2050 Scenario Horizon</div>
              <div className="text-base font-bold text-amber-400">{displayProj[displayProj.length - 1].formattedValue}</div>
              <div className="text-slate-400 text-[11px] mt-0.5">{scenarioMode === 'bounded' ? 'Capacity Bound' : 'Extrapolated'}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
