import React, { useState } from 'react';
import { TrendingUp, ArrowRight, Sparkles, Sliders, Zap } from 'lucide-react';

export const HeroLinearVsCompound: React.FC<{
  onExploreClick: () => void;
}> = ({ onExploreClick }) => {
  const [years, setYears] = useState<number>(30);
  const [baseValue, setBaseValue] = useState<number>(100);
  const [ratePercent, setRatePercent] = useState<number>(10);
  const [linearAdd, setLinearAdd] = useState<number>(10);

  // Generate data points for SVG chart
  const maxYears = 40;
  const currentYear = years;

  // Linear value at year t = base + linearAdd * t
  // Compound value at year t = base * (1 + rate/100)^t
  const dataPoints = [];
  for (let t = 0; t <= maxYears; t++) {
    const lin = baseValue + linearAdd * t;
    const comp = baseValue * Math.pow(1 + ratePercent / 100, t);
    dataPoints.push({
      year: t,
      linear: Math.round(lin),
      compound: Math.round(comp),
    });
  }

  const currentLinear = baseValue + linearAdd * currentYear;
  const currentCompound = Math.round(baseValue * Math.pow(1 + ratePercent / 100, currentYear));
  const divergenceMultiplier = (currentCompound / currentLinear).toFixed(1);
  const divergenceGap = currentCompound - currentLinear;

  // Chart SVG coordinates
  const svgWidth = 640;
  const svgHeight = 260;
  const padLeft = 60;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  const maxVal = Math.max(...dataPoints.map(d => d.compound));

  const getX = (year: number) => padLeft + (year / maxYears) * plotW;
  const getY = (val: number) => padTop + plotH - (val / maxVal) * plotH;

  const linearPath = dataPoints
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.year).toFixed(1)},${getY(d.linear).toFixed(1)}`)
    .join(' ');

  const compoundPath = dataPoints
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.year).toFixed(1)},${getY(d.compound).toFixed(1)}`)
    .join(' ');

  // Active year scrubber point
  const currentX = getX(currentYear);
  const currentLinearY = getY(currentLinear);
  const currentCompoundY = getY(currentCompound);

  return (
    <div className="relative overflow-hidden pt-12 pb-16 border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[250px] bg-amber-500/5 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header Eyebrow & Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-4 tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Exploration Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4 font-sans">
            COMPOUND
          </h1>
          <p className="text-xl sm:text-2xl text-slate-300 font-light mb-3">
            The world is full of things that grow exponentially.
          </p>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Instead of asking <span className="text-slate-200 font-medium">„What is compound interest?”</span>, explore{' '}
            <span className="text-emerald-400 font-semibold underline underline-offset-4 decoration-emerald-500/40">
              „What compounds across the entire world?”
            </span>{' '}
            From bacteria and neural networks to solar grids, human population, and planetary carbon.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              id="hero-explore-btn"
              onClick={onExploreClick}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 group"
            >
              <span>Explore The 10 Phenomena</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#fastest-section"
              className="px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white font-medium text-sm transition-all border border-slate-700/60 flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>What Compounds Fastest?</span>
            </a>
          </div>
        </div>

        {/* The Core Demonstration: LINEAR vs COMPOUND */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-800/80 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                <span>The Foundational Axiom</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-semibold">One Universal Pattern</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                <span>Linear (+10/yr)</span>
                <span className="text-slate-500 text-lg">vs</span>
                <span className="text-emerald-400">Compound (+10%/yr)</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                At first they almost coincide. Then, small differences become enormous over time.
              </p>
            </div>

            {/* Live Divergence Stat Card */}
            <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
              <div className="text-right">
                <div className="text-[11px] font-mono text-slate-400 uppercase">At Year {currentYear}</div>
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono">
                  {divergenceMultiplier}× larger
                </div>
              </div>
              <div className="h-10 w-px bg-slate-800" />
              <div className="text-left">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Divergence Delta</div>
                <div className="text-sm font-semibold text-slate-200 font-mono">
                  +{divergenceGap.toLocaleString()} units
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Chart Container */}
          <div className="relative w-full">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                <linearGradient id="compGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((frac, idx) => {
                const y = padTop + plotH * (1 - frac);
                const val = Math.round(maxVal * frac);
                return (
                  <g key={idx}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={svgWidth - padRight}
                      y2={y}
                      stroke="rgba(51, 65, 85, 0.4)"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 4}
                      fill="#64748b"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Year tick marks */}
              {[0, 10, 20, 30, 40].map(yr => {
                const x = getX(yr);
                return (
                  <g key={yr}>
                    <line
                      x1={x}
                      y1={padTop + plotH}
                      x2={x}
                      y2={padTop + plotH + 6}
                      stroke="#475569"
                    />
                    <text
                      x={x}
                      y={padTop + plotH + 18}
                      fill="#64748b"
                      fontSize="10"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      Yr {yr}
                    </text>
                  </g>
                );
              })}

              {/* Linear Line */}
              <path
                d={linearPath}
                fill="none"
                stroke="#64748b"
                strokeWidth="2.5"
                strokeDasharray="6 3"
              />

              {/* Compound Line */}
              <path
                d={compoundPath}
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
              />

              {/* Vertical Scrubber Line for current year */}
              <line
                x1={currentX}
                y1={padTop}
                x2={currentX}
                y2={padTop + plotH}
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />

              {/* Linear Point Marker */}
              <circle
                cx={currentX}
                cy={currentLinearY}
                r="5"
                fill="#64748b"
                stroke="#0f172a"
                strokeWidth="2"
              />

              {/* Compound Point Marker */}
              <circle
                cx={currentX}
                cy={currentCompoundY}
                r="7"
                fill="#10b981"
                stroke="#0f172a"
                strokeWidth="2.5"
              />
            </svg>

            {/* Interactive Tooltip Badges anchored to the scrubber */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1 bg-slate-400 rounded-full" />
                  <span className="text-xs font-mono text-slate-300">Linear (Constant Addition)</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-mono mr-1">Value:</span>
                  <span className="text-sm font-bold font-mono text-slate-300">{currentLinear.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1 bg-emerald-400 rounded-full" />
                  <span className="text-xs font-mono text-emerald-300">Compound (Percentage on Total)</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-emerald-400/80 font-mono mr-1">Value:</span>
                  <span className="text-base font-bold font-mono text-emerald-400">{currentCompound.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scrubber Slider Controls */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <label htmlFor="year-scrubber" className="text-xs font-mono uppercase tracking-wider text-slate-300">
                  Scrub Timeline: <span className="text-emerald-400 font-bold">{years} Years</span>
                </label>
              </div>

              {/* Milestone Presets */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-slate-500 mr-1 text-[11px]">Jump to:</span>
                {[5, 10, 20, 30, 40].map(yr => (
                  <button
                    key={yr}
                    onClick={() => setYears(yr)}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      years === yr
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Yr {yr}
                  </button>
                ))}
              </div>
            </div>

            <input
              id="year-scrubber"
              type="range"
              min="0"
              max="40"
              value={years}
              onChange={e => setYears(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />

            {/* Cognitive explanation */}
            <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2.5">
              <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200">The Intuition Gap:</strong> Human intuition is deeply wired for linear progression. In Year 5, Compound ({dataPoints[5].compound}) is barely higher than Linear ({dataPoints[5].linear}). But by Year 30, compounding has outstripped linear by {((dataPoints[30].compound / dataPoints[30].linear)).toFixed(1)}× — generating in a single year what took decades to build before.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
