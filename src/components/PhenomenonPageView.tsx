import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ArrowRight, Share2, Check, ExternalLink, RefreshCw, 
  Layers, TrendingUp, Info, ChevronRight, Calculator, Dna, Sun, 
  Cpu, Users, CreditCard, Factory, Smartphone, Percent, Globe, Sparkles
} from 'lucide-react';
import { Phenomenon } from '../types';
import { CATEGORIES, PHENOMENA } from '../data/phenomena';
import { SimulationCanvas } from './SimulationCanvas';
import { PhenomenonCalculator } from './PhenomenonCalculator';
import { getPhenomenonPath, navigateTo } from '../utils/routing';
import { updatePageSEO } from '../utils/seo';

interface PhenomenonPageViewProps {
  phenomenon: Phenomenon;
  onNavigateHome: () => void;
  onSelectPhenomenon: (p: Phenomenon) => void;
}

export const PhenomenonPageView: React.FC<PhenomenonPageViewProps> = ({
  phenomenon,
  onNavigateHome,
  onSelectPhenomenon,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [useLogScale, setUseLogScale] = useState<boolean>(false);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const category = CATEGORIES.find(c => c.id === phenomenon.category);

  // Determine prev and next phenomenon in ordered list
  const currentIndex = PHENOMENA.findIndex(p => p.id === phenomenon.id);
  const prevPhenomenon = PHENOMENA[(currentIndex - 1 + PHENOMENA.length) % PHENOMENA.length];
  const nextPhenomenon = PHENOMENA[(currentIndex + 1) % PHENOMENA.length];

  // Related phenomena in same category or adjacent
  const relatedPhenomena = PHENOMENA.filter(p => p.id !== phenomenon.id && (p.category === phenomenon.category || Math.abs(p.growthSpeedRank - phenomenon.growthSpeedRank) <= 2)).slice(0, 3);

  // Update SEO dynamically whenever phenomenon changes
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://compound.world';
    const canonicalPath = getPhenomenonPath(phenomenon);

    updatePageSEO({
      title: `${phenomenon.title} (${phenomenon.doublingTimeText} Doubling Time)`,
      description: `${phenomenon.subtitle}. Explore verified historical data, interactive real-time simulation, custom calculator, and mathematical projections.`,
      path: canonicalPath,
      keywords: [
        phenomenon.title,
        'exponential growth',
        phenomenon.category,
        'doubling time',
        'compound effect',
        phenomenon.unit,
        'feedback loops',
      ],
      ogType: 'article',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': `${phenomenon.title}: Exponential Growth Analysis & Simulation`,
        'description': phenomenon.subtitle,
        'url': `${origin}${canonicalPath}`,
        'articleSection': category?.name || 'Science',
        'about': {
          '@type': 'Thing',
          'name': phenomenon.title,
          'description': phenomenon.baseUnit,
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'COMPOUND — The Exponential World',
        },
      },
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [phenomenon]);

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}${getPhenomenonPath(phenomenon)}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    });
  };

  // Prepare chart series
  const fullSeries = [
    ...phenomenon.historicalData.map(p => ({ ...p, isProjection: false })),
    ...phenomenon.projectionData.slice(1).map(p => ({ ...p, isProjection: true })),
  ];

  const chartWidth = 720;
  const chartHeight = 280;
  const padLeft = 65;
  const padRight = 35;
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

  const lastHistIdx = historicalPoints.length - 1;
  const projPath = [
    `M ${getXVal(lastHistIdx).toFixed(1)},${getYVal(historicalPoints[lastHistIdx].value).toFixed(1)}`,
    ...projectionPoints.map((p, i) => `L ${getXVal(lastHistIdx + 1 + i).toFixed(1)},${getYVal(p.value).toFixed(1)}`),
  ].join(' ');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* 1. Breadcrumbs & Top Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <a
            href="/"
            onClick={e => {
              e.preventDefault();
              onNavigateHome();
            }}
            className="hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            <span>Home</span>
          </a>
          <span className="text-slate-600">/</span>
          <span className="text-slate-300">{category?.name || 'Phenomena'}</span>
          <span className="text-slate-600">/</span>
          <span className="text-emerald-400 font-bold truncate max-w-[200px]">{phenomenon.title}</span>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Share / Copy Link button */}
          <button
            onClick={handleCopyLink}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 border ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800'
            }`}
            title="Copy direct shareable link for this page"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied!' : 'Share Page'}</span>
          </button>

          {/* Previous / Next navigation */}
          <div className="flex items-center gap-1">
            <a
              href={getPhenomenonPath(prevPhenomenon)}
              onClick={e => {
                e.preventDefault();
                onSelectPhenomenon(prevPhenomenon);
              }}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
              title={`Previous: ${prevPhenomenon.title}`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </a>
            <a
              href={getPhenomenonPath(nextPhenomenon)}
              onClick={e => {
                e.preventDefault();
                onSelectPhenomenon(nextPhenomenon);
              }}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
              title={`Next: ${nextPhenomenon.title}`}
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Hero Section */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border ${category?.badgeBg || 'bg-slate-800 text-slate-300'}`}>
            <span className="capitalize">{phenomenon.category}</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono">
            <span>2× in {phenomenon.doublingTimeText}</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono">
            <span>Rank #{phenomenon.growthSpeedRank} of 10</span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          {phenomenon.title}
        </h1>
        <p className="text-base sm:text-xl text-slate-300 leading-relaxed max-w-3xl">
          {phenomenon.subtitle}
        </p>
      </header>

      {/* 3. Key Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
          <span className="text-slate-400 block uppercase text-[11px] mb-1">Baseline Milestone</span>
          <span className="text-base font-bold text-white block">{phenomenon.historicalData[0].formattedValue}</span>
          <span className="text-slate-400 text-[11px]">at {phenomenon.historicalData[0].yearOrCycle}</span>
        </div>

        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
          <span className="text-slate-400 block uppercase text-[11px] mb-1">Latest Verified</span>
          <span className="text-base font-bold text-emerald-400 block">{phenomenon.historicalData[phenomenon.historicalData.length - 1].formattedValue}</span>
          <span className="text-slate-400 text-[11px]">at {phenomenon.historicalData[phenomenon.historicalData.length - 1].yearOrCycle}</span>
        </div>

        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
          <span className="text-slate-400 block uppercase text-[11px] mb-1">2050 Projection</span>
          <span className="text-base font-bold text-amber-400 block">{phenomenon.projectionData[phenomenon.projectionData.length - 1].formattedValue}</span>
          <span className="text-slate-400 text-[11px]">Horizon estimate</span>
        </div>

        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
          <span className="text-slate-400 block uppercase text-[11px] mb-1">Growth Cadence</span>
          <span className="text-base font-bold text-cyan-400 block">{phenomenon.growthRatePercent > 0 ? `+${phenomenon.growthRatePercent}%` : `${phenomenon.growthRatePercent}%`}</span>
          <span className="text-slate-400 text-[11px]">{phenomenon.growthPeriod}</span>
        </div>
      </div>

      {/* 4. Interactive Simulation Canvas */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 block">Module 1 · Physics & Particle Engine</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Kinetic 60 FPS Visual Simulation</h2>
          </div>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline-block">{phenomenon.simulationInstructions}</span>
        </div>

        <SimulationCanvas
          type={phenomenon.simulationType}
          simulationType={phenomenon.simulationType}
          title={phenomenon.title}
          accentColor={category?.accentColor || '#10b981'}
          growthRateText={phenomenon.doublingTimeText}
        />
      </section>

      {/* 5. Custom Tailored Interactive Calculator */}
      <section className="space-y-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-teal-400 block">Module 2 · Dedicated Formula Engine</span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Custom Interactive Calculator</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Adjust parameters directly to test scenarios and inspect compound multipliers.</p>
        </div>

        <PhenomenonCalculator phenomenon={phenomenon} />
      </section>

      {/* 6. Historical Data vs Projections Chart */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 block">Module 3 · Empirical Trajectory</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Verified Data vs. Projections</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseLogScale(!useLogScale)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors border ${
                useLogScale
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {useLogScale ? 'Logarithmic Scale (Linearizes Exponentials)' : 'Linear Scale'}
            </button>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
          {hoveredPointIndex !== null && (
            <div className="p-3 mb-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-slate-400 mr-2">Cycle/Year:</span>
                <strong className="text-white text-sm">{fullSeries[hoveredPointIndex].yearOrCycle}</strong>
              </div>
              <div>
                <span className="text-slate-400 mr-2">Value:</span>
                <strong className="text-emerald-400 text-sm">{fullSeries[hoveredPointIndex].formattedValue}</strong>
              </div>
              <div className="hidden sm:block text-slate-400 italic">
                {fullSeries[hoveredPointIndex].context || (fullSeries[hoveredPointIndex].isProjection ? 'Projected' : 'Historical')}
              </div>
            </div>
          )}

          <div className="bg-slate-950 p-2 sm:p-4 rounded-xl border border-slate-800/80">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible select-none">
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((frac, idx) => {
                const y = padTop + plotH * (1 - frac);
                return (
                  <line
                    key={idx}
                    x1={padLeft}
                    y1={y}
                    x2={chartWidth - padRight}
                    y2={y}
                    stroke="rgba(51, 65, 85, 0.25)"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Historical Curve */}
              <path d={histPath} fill="none" stroke="#10b981" strokeWidth="3" />

              {/* Projection Curve */}
              <path d={projPath} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="6 4" />

              {/* Data circles */}
              {fullSeries.map((pt, idx) => {
                const cx = getXVal(idx);
                const cy = getYVal(pt.value);
                const isHovered = hoveredPointIndex === idx;

                return (
                  <g key={idx} onMouseEnter={() => setHoveredPointIndex(idx)} onMouseLeave={() => setHoveredPointIndex(null)} className="cursor-pointer">
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 7 : 4.5}
                      fill={pt.isProjection ? '#38bdf8' : '#10b981'}
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                    <text
                      x={cx}
                      y={padTop + plotH + 18}
                      fill={pt.isProjection ? '#94a3b8' : '#64748b'}
                      fontSize="9"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {pt.yearOrCycle}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-5">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  Historical Verified ({phenomenon.historicalData[0].yearOrCycle}–{phenomenon.historicalData[phenomenon.historicalData.length - 1].yearOrCycle})
                </span>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  Mathematical Projection (to 2050)
                </span>
              </div>
              <span className="text-slate-400 text-[11px]">Hover any point to inspect exact milestone value</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Deep Scientific & Economic Explanation ("Why It Compounds") */}
      <section className="space-y-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-amber-400 block">Module 4 · Underlying Mechanics</span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Why Does This System Compound?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
              <span>The Positive Feedback Loop</span>
            </h3>
            <p className="text-sm text-slate-200 font-medium">
              {phenomenon.whyItCompounds.headline}
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {phenomenon.whyItCompounds.positiveFeedback}
            </p>
          </div>

          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
              <span>The Real-World Boundary (Carrying Capacity)</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {phenomenon.whyItCompounds.limitingFactor}
            </p>
            <div className="p-3 bg-slate-950 rounded-xl text-xs font-mono text-slate-400 border border-slate-800">
              In physical reality, unconstrained geometric progression always meets a physical, financial, or thermodynamic limit, bending the pure exponential into an S-curve.
            </div>
          </div>
        </div>
      </section>

      {/* 8. The Mathematical Engine & Universal Twin */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">The Governing Equation</span>
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
            <code className="text-lg font-mono font-bold text-emerald-400">{phenomenon.formula}</code>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono text-slate-400 block uppercase">Variable Definitions:</span>
            {phenomenon.formulaVariables.map((v, i) => (
              <div key={i} className="flex items-start gap-2 text-xs font-mono">
                <span className="text-emerald-400 font-bold shrink-0">{v.symbol}:</span>
                <span className="text-slate-300">{v.meaning}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 block">The Cross-Domain Twin</span>
            <h3 className="text-lg font-bold text-white mt-1">{phenomenon.sameMathEquivalent.title}</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              {phenomenon.sameMathEquivalent.description}
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Equivalent Field:</span>
            <span className="text-cyan-300 font-bold">{phenomenon.sameMathEquivalent.equivalentDomain}</span>
          </div>
        </div>
      </section>

      {/* 9. Verified Sources & Citations */}
      <section className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-slate-400 uppercase block">Verified Data Source:</span>
          <span className="text-sm font-bold text-white font-mono mt-0.5 block">{phenomenon.whyItCompounds.sourceName}</span>
        </div>

        {phenomenon.whyItCompounds.sourceUrl && (
          <a
            href={phenomenon.whyItCompounds.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>Inspect Primary Source</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </section>

      {/* 10. Related Phenomena Cross-Navigation */}
      <section className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Explore Related Compounding Phenomena</h2>
          <a
            href="/"
            onClick={e => {
              e.preventDefault();
              onNavigateHome();
            }}
            className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View All 10 Phenomena</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {relatedPhenomena.map(rel => (
            <a
              key={rel.id}
              href={getPhenomenonPath(rel)}
              onClick={e => {
                e.preventDefault();
                onSelectPhenomenon(rel);
              }}
              className="p-4 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all group block"
            >
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
                <span className="capitalize">{rel.category}</span>
                <span className="text-amber-400 font-bold">2× in {rel.doublingTimeText}</span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                {rel.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {rel.subtitle}
              </p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};
