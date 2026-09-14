import React, { useState, useEffect } from 'react';
import { Calculator, RefreshCw, Sparkles, TrendingUp, Sliders, ArrowRight, Share2, Check } from 'lucide-react';
import { UNIVERSAL_SCENARIOS } from '../data/phenomena';

export const UniversalCalculator: React.FC = () => {
  const [initialValue, setInitialValue] = useState<number>(10000);
  const [ratePercent, setRatePercent] = useState<number>(5.0);
  const [periods, setPeriods] = useState<number>(30);
  const [unitLabel, setUnitLabel] = useState<string>('€');
  const [activePresetId, setActivePresetId] = useState<string>('money-preset-5');
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  // Restore scenario from URL query params if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlVal = params.get('u_val');
      const urlRate = params.get('u_rate');
      const urlPeriods = params.get('u_t');
      const urlUnit = params.get('u_unit');

      if (urlVal || urlRate || urlPeriods) {
        if (urlVal) setInitialValue(Number(urlVal));
        if (urlRate) setRatePercent(Number(urlRate));
        if (urlPeriods) setPeriods(Number(urlPeriods));
        if (urlUnit) setUnitLabel(urlUnit);
        setActivePresetId('custom');
      }
    }
  }, []);

  const handleShareScenario = async () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.origin + '/universal-calculator');
    url.searchParams.set('u_val', initialValue.toString());
    url.searchParams.set('u_rate', ratePercent.toString());
    url.searchParams.set('u_t', periods.toString());
    url.searchParams.set('u_unit', unitLabel);

    try {
      await navigator.clipboard.writeText(url.toString());
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3500);
    } catch {
      // fallback
    }
  };

  const presets = [
    {
      id: 'money-preset-5',
      name: 'Money €10k @ 5%',
      initial: 10000,
      rate: 5.0,
      t: 30,
      unit: '€',
      note: 'The foundational benchmark: €10,000 at 5% for 30 years yields €43,219.',
    },
    {
      id: 'money-preset-7',
      name: 'Money €10k @ 7%',
      initial: 10000,
      rate: 7.0,
      t: 30,
      unit: '€',
      note: 'Just 2% higher rate yields €76,123 — nearly double the 5% final balance!',
    },
    {
      id: 'bacteria-preset',
      name: 'Bacteria (1 cell)',
      initial: 1,
      rate: 100.0,
      t: 20,
      unit: 'cells',
      note: 'Binary fission doubling: 1 cell becomes over 1,000,000 cells in 20 cycles.',
    },
    {
      id: 'solar-preset',
      name: 'Solar Energy (GW)',
      initial: 100,
      rate: 28.0,
      t: 12,
      unit: 'GW',
      note: 'Solar PV capacity expanding at ~28% CAGR over a 12-year window.',
    },
    {
      id: 'debt-preset',
      name: 'Compound Debt',
      initial: 25000,
      rate: 8.5,
      t: 20,
      unit: '€',
      note: 'High-interest unserviced debt multiplies more than 5-fold over two decades.',
    },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setActivePresetId(preset.id);
    setInitialValue(preset.initial);
    setRatePercent(preset.rate);
    setPeriods(preset.t);
    setUnitLabel(preset.unit);
  };

  // Computations
  const r = ratePercent / 100;
  const finalValue = Math.round(initialValue * Math.pow(1 + r, periods));
  const linearValue = Math.round(initialValue + (initialValue * r) * periods);
  const totalGain = finalValue - initialValue;
  const multiplier = (finalValue / Math.max(1, initialValue)).toFixed(2);
  const doublingTime = (Math.log(2) / Math.log(1 + r)).toFixed(1);
  const numDoublings = (periods / Number(doublingTime)).toFixed(1);

  // Generate SVG curve points
  const points = [];
  const numSteps = Math.min(50, Math.max(10, periods));
  for (let i = 0; i <= numSteps; i++) {
    const curT = (i / numSteps) * periods;
    const v = initialValue * Math.pow(1 + r, curT);
    const linV = initialValue + (initialValue * r) * curT;
    points.push({ t: curT, compound: v, linear: linV });
  }

  const svgW = 500;
  const svgH = 180;
  const padL = 40;
  const padR = 20;
  const padT = 15;
  const padB = 25;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const maxVal = Math.max(...points.map(p => p.compound));
  const getX = (t: number) => padL + (t / periods) * plotW;
  const getY = (val: number) => padT + plotH - (val / maxVal) * plotH;

  const compPath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.t).toFixed(1)},${getY(p.compound).toFixed(1)}`)
    .join(' ');

  const linPath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.t).toFixed(1)},${getY(p.linear).toFixed(1)}`)
    .join(' ');

  return (
    <section id="universal-calculator-section" className="py-16 border-b border-slate-800/80 bg-slate-950/90">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-3 uppercase tracking-wider">
              <Calculator className="w-3.5 h-3.5" />
              <span>Universal Compound Engine</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              One Equation Across Every Universe
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Whether you are multiplying Euros, bacterial cells, solar arrays, or national debt, the mathematics never changes: <span className="font-mono text-emerald-400 font-bold">N(t) = N_0 · (1 + r)^t</span>.
            </p>
          </div>

          {/* Share Scenario Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareScenario}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-emerald-500/50 text-xs font-mono transition-all flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"
              title="Copy a shareable link containing your exact custom calculator numbers"
            >
              {copiedToast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedToast ? 'Scenario Link Copied!' : 'Share Scenario'}</span>
            </button>
          </div>
        </div>

        {copiedToast && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Scenario URL copied to clipboard! Anyone opening this link will see your exact custom inputs and compounding curve.</span>
          </div>
        )}

        {/* Preset Switcher Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          <span className="text-xs font-mono text-slate-400 shrink-0 mr-1 uppercase">Presets:</span>
          {presets.map(p => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all border ${
                activePresetId === p.id
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Calculator Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1.5">
                <span>Initial Baseline (N_0):</span>
                <span className="font-bold text-white font-mono">
                  {unitLabel === '€' ? '€' : ''}{initialValue.toLocaleString()} {unitLabel !== '€' ? unitLabel : ''}
                </span>
              </div>
              <input
                type="number"
                min="1"
                value={initialValue}
                onChange={e => {
                  setInitialValue(Math.max(1, Number(e.target.value)));
                  setActivePresetId('');
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1.5">
                <span>Compounding Rate (r):</span>
                <span className="font-bold text-emerald-400 font-mono">+{ratePercent}% / period</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="100"
                step="0.5"
                value={ratePercent}
                onChange={e => {
                  setRatePercent(Number(e.target.value));
                  setActivePresetId('');
                }}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1.5">
                <span>Time Horizon (t periods):</span>
                <span className="font-bold text-cyan-400 font-mono">{periods} periods / years</span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                value={periods}
                onChange={e => {
                  setPeriods(Number(e.target.value));
                  setActivePresetId('');
                }}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1.5">Unit Label:</label>
              <input
                type="text"
                value={unitLabel}
                onChange={e => setUnitLabel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-slate-700 focus:outline-none"
                placeholder="e.g. €, cells, GW, people"
              />
            </div>
          </div>

          {/* Results & Live Curve Column */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            {/* Big Result Readout */}
            <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Compound Result at t={periods}
                </span>
                <div className="text-2xl sm:text-4xl font-extrabold text-emerald-400 font-mono">
                  {unitLabel === '€' ? '€' : ''}{finalValue.toLocaleString()} {unitLabel !== '€' ? unitLabel : ''}
                </div>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  Initial: {unitLabel === '€' ? '€' : ''}{initialValue.toLocaleString()} → Multiplier: <strong className="text-white">{multiplier}×</strong>
                </div>
              </div>

              <div className="text-right border-l border-slate-800 pl-4">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  If Linear (Without Compounding)
                </span>
                <div className="text-lg sm:text-xl font-bold text-slate-400 font-mono">
                  {unitLabel === '€' ? '€' : ''}{linearValue.toLocaleString()} {unitLabel !== '€' ? unitLabel : ''}
                </div>
                <div className="text-xs text-emerald-400 font-mono mt-1">
                  Compound Advantage: +{(finalValue - linearValue).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Micro SVG Graph */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2 px-1">
                <span>Trajectory over {periods} periods</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2.5 h-0.5 bg-emerald-400" /> Compound Curve
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <span className="w-2.5 h-0.5 bg-slate-500" /> Linear Equivalent
                  </span>
                </div>
              </div>

              <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto overflow-visible select-none">
                <path d={linPath} fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="4 3" />
                <path d={compPath} fill="none" stroke="#10b981" strokeWidth="3" />
                <circle cx={getX(periods)} cy={getY(finalValue)} r="5" fill="#10b981" stroke="#0f172a" strokeWidth="2" />
              </svg>
            </div>

            {/* Doublings metadata */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Doubling Time:</span>
                <span className="text-amber-400 font-bold text-sm">{doublingTime} periods</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Completed Doublings:</span>
                <span className="text-cyan-400 font-bold text-sm">{numDoublings} doublings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
