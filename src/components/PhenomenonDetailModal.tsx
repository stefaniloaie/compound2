import React, { useState } from 'react';
import { 
  X, Sparkles, LineChart, Cpu, Info, ExternalLink, RefreshCw, Layers, ArrowRight, Dna, Sun, TrendingUp, CreditCard, Factory, Users, Smartphone, Percent, Globe
} from 'lucide-react';
import { Phenomenon } from '../types';
import { CATEGORIES, PHENOMENA } from '../data/phenomena';
import { SimulationCanvas } from './SimulationCanvas';

interface PhenomenonDetailModalProps {
  phenomenon: Phenomenon;
  onClose: () => void;
  onSelectOther: (phenomenon: Phenomenon) => void;
}

export const PhenomenonDetailModal: React.FC<PhenomenonDetailModalProps> = ({
  phenomenon,
  onClose,
  onSelectOther,
}) => {
  const [activeTab, setActiveTab] = useState<'simulation' | 'chart' | 'math' | 'why'>('simulation');
  const [useLogScale, setUseLogScale] = useState<boolean>(false);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const catMeta = CATEGORIES.find(c => c.id === phenomenon.category);

  // Combine historical and projection for the chart
  const fullSeries = [
    ...phenomenon.historicalData.map(p => ({ ...p, isProjection: false })),
    ...phenomenon.projectionData.slice(1).map(p => ({ ...p, isProjection: true })),
  ];

  // Chart math
  const chartWidth = 600;
  const chartHeight = 260;
  const padLeft = 60;
  const padRight = 30;
  const padTop = 25;
  const padBottom = 35;
  const plotW = chartWidth - padLeft - padRight;
  const plotH = chartHeight - padTop - padBottom;

  const rawValues = fullSeries.map(p => p.value);
  const minRaw = Math.min(...rawValues);
  const maxRaw = Math.max(...rawValues);

  const getYVal = (v: number) => {
    if (useLogScale) {
      const safeMin = minRaw > 0 ? Math.log10(minRaw) : 0;
      const safeMax = maxRaw > 0 ? Math.log10(maxRaw) : 1;
      const safeV = v > 0 ? Math.log10(v) : 0;
      const range = safeMax - safeMin || 1;
      return padTop + plotH - ((safeV - safeMin) / range) * plotH;
    }
    const range = maxRaw - minRaw || 1;
    return padTop + plotH - ((v - minRaw) / range) * plotH;
  };

  const getXVal = (idx: number) => {
    return padLeft + (idx / (fullSeries.length - 1)) * plotW;
  };

  const historicalPoints = fullSeries.filter(p => !p.isProjection);
  const projectionPoints = fullSeries.filter(p => p.isProjection);

  const histPath = historicalPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getXVal(i).toFixed(1)},${getYVal(p.value).toFixed(1)}`)
    .join(' ');

  // Projection path continues from last historical point
  const lastHistIdx = historicalPoints.length - 1;
  const projPathArray = [
    `M ${getXVal(lastHistIdx).toFixed(1)},${getYVal(historicalPoints[lastHistIdx].value).toFixed(1)}`,
    ...projectionPoints.map((p, i) => {
      const totalIdx = lastHistIdx + 1 + i;
      return `L ${getXVal(totalIdx).toFixed(1)},${getYVal(p.value).toFixed(1)}`;
    }),
  ];
  const projPath = projPathArray.join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        id="phenomenon-modal-card"
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border ${
                catMeta?.badgeBg || 'bg-slate-800 text-slate-300'
              }`}
            >
              <span className="capitalize">{phenomenon.category}</span>
            </span>
            <div className="h-4 w-px bg-slate-700" />
            <span className="text-xs font-mono text-amber-400 bg-amber-400/10 border border-amber-500/20 px-2 py-0.5 rounded">
              2× in {phenomenon.doublingTimeText}
            </span>
          </div>

          <button
            id="close-detail-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title area */}
        <div className="px-6 pt-5 pb-3 shrink-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {phenomenon.title}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {phenomenon.subtitle}
          </p>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 border-b border-slate-800 pb-2 overflow-x-auto">
            <button
              id="tab-simulation"
              onClick={() => setActiveTab('simulation')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'simulation'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Story & Simulation</span>
            </button>

            <button
              id="tab-chart"
              onClick={() => setActiveTab('chart')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'chart'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Historical vs 2050 Projection</span>
            </button>

            <button
              id="tab-math"
              onClick={() => setActiveTab('math')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'math'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>The Same Mathematics</span>
            </button>

            <button
              id="tab-why"
              onClick={() => setActiveTab('why')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'why'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Why Does This Curve Compound?</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="px-6 py-4 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: KINETIC SIMULATION */}
          {activeTab === 'simulation' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono text-slate-300">
                <span className="text-slate-400">{phenomenon.simulationInstructions}</span>
                <span className="text-emerald-400 font-bold ml-2">Base: {phenomenon.initialContext}</span>
              </div>

              <SimulationCanvas
                type={phenomenon.simulationType}
                simulationType={phenomenon.simulationType}
                title={phenomenon.title}
                accentColor={catMeta?.accentColor || '#10b981'}
                growthRateText={phenomenon.doublingTimeText}
              />

              {/* Cognitive Context Box */}
              <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>The Generative Principle</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Notice how early progress feels slow and invisible. In generation 1, 2, or 3, barely anything seems to happen. But once the critical mass threshold is crossed, each additional doubling produces more sheer volume than the entire history of the system combined.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: HISTORICAL VS 2050 PROJECTION */}
          {activeTab === 'chart' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-emerald-400 rounded-full" />
                    <span className="text-slate-300">Empirical Historical Record</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-amber-400 rounded-full stroke-dasharray" />
                    <span className="text-amber-300">Mathematical Projection to 2050</span>
                  </div>
                </div>

                {/* Log scale toggle */}
                <button
                  id="toggle-log-scale-btn"
                  onClick={() => setUseLogScale(!useLogScale)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono border transition-colors ${
                    useLogScale
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  Scale: {useLogScale ? 'Logarithmic (Linearized)' : 'Standard Linear'}
                </button>
              </div>

              {/* SVG Chart */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible select-none">
                  {/* Grid Lines */}
                  {[0, 0.33, 0.66, 1].map((frac, idx) => {
                    const y = padTop + plotH * (1 - frac);
                    return (
                      <line
                        key={idx}
                        x1={padLeft}
                        y1={y}
                        x2={chartWidth - padRight}
                        y2={y}
                        stroke="rgba(51, 65, 85, 0.3)"
                        strokeDasharray="4 4"
                      />
                    );
                  })}

                  {/* Historical Solid Line */}
                  <path
                    d={histPath}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                  />

                  {/* Projection Dashed Line */}
                  <path
                    d={projPath}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                  />

                  {/* Data Points */}
                  {fullSeries.map((p, idx) => {
                    const cx = getXVal(idx);
                    const cy = getYVal(p.value);
                    const isHovered = hoveredPointIndex === idx;

                    return (
                      <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredPointIndex(idx)}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isHovered ? 6 : 4}
                          fill={p.isProjection ? '#f59e0b' : '#10b981'}
                          stroke="#0f172a"
                          strokeWidth="2"
                        />
                        <text
                          x={cx}
                          y={padTop + plotH + 18}
                          fill={p.isProjection ? '#f59e0b' : '#64748b'}
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

                {/* Hovered Point Info Tooltip */}
                {hoveredPointIndex !== null && fullSeries[hoveredPointIndex] && (
                  <div className="mt-3 p-3 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 mr-2">
                        {fullSeries[hoveredPointIndex].isProjection ? 'Projected Scenario' : 'Historical Data Point'} ({fullSeries[hoveredPointIndex].yearOrCycle}):
                      </span>
                      <span className="font-bold text-white">{fullSeries[hoveredPointIndex].formattedValue}</span>
                    </div>
                    {fullSeries[hoveredPointIndex].context && (
                      <span className="text-slate-400 italic">"{fullSeries[hoveredPointIndex].context}"</span>
                    )}
                  </div>
                )}
              </div>

              {/* Source callout */}
              <div className="flex items-center justify-between text-xs text-slate-400 p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <span>Verified Data Source: <strong className="text-slate-300">{phenomenon.whyItCompounds.sourceName}</strong></span>
                {phenomenon.whyItCompounds.sourceUrl && (
                  <a
                    href={phenomenon.whyItCompounds.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                  >
                    <span>View Reference</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: THE SAME MATHEMATICS */}
          {activeTab === 'math' && (
            <div className="space-y-5">
              <div className="p-5 bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-xl">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Unified Mathematical Law
                </div>
                <div className="text-2xl font-mono text-emerald-400 font-bold mb-3 tracking-wide">
                  {phenomenon.formula}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-300 pt-3 border-t border-slate-800/80">
                  {phenomenon.formulaVariables.map((v, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">{v.symbol}:</span>
                      <span className="text-slate-400">{v.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  <span>{phenomenon.sameMathEquivalent.title}</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {phenomenon.sameMathEquivalent.description}
                </p>
                <div className="inline-block px-2.5 py-1 bg-slate-800 rounded text-xs font-mono text-cyan-300">
                  Domain Counterpart: {phenomenon.sameMathEquivalent.equivalentDomain}
                </div>
              </div>

              {/* Cross-domain picker */}
              <div>
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                  Compare with other exponential systems:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {PHENOMENA.filter(p => p.id !== phenomenon.id).slice(0, 3).map(other => (
                    <button
                      key={other.id}
                      onClick={() => onSelectOther(other)}
                      className="p-3 text-left bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors group"
                    >
                      <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {other.title}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-1">
                        Doubling: {other.doublingTimeText}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WHY DOES THIS CURVE COMPOUND? */}
          {activeTab === 'why' && (
            <div className="space-y-4">
              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                  <span>The Compounding Mechanism</span>
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {phenomenon.whyItCompounds.headline}
                </p>
                <div className="p-3 bg-slate-900 rounded-lg text-xs text-slate-300 leading-relaxed border border-slate-800">
                  <strong className="text-white block mb-1">Positive Feedback Loop:</strong>
                  {phenomenon.whyItCompounds.positiveFeedback}
                </div>
              </div>

              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <span>The Real-World Boundary: Why It Doesn't Grow Forever</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {phenomenon.whyItCompounds.limitingFactor}
                </p>
                <div className="text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
                  Pure unconstrained exponential growth exists only in pure math; in physics and biology, every exponential curve eventually meets its carrying capacity (K) to form an S-curve (Logistic curve).
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs font-mono text-slate-400">
            Speed Rank: #{phenomenon.growthSpeedRank} of 10 Phenomena
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Close Story
          </button>
        </div>
      </div>
    </div>
  );
};
