import React, { useState, useEffect } from 'react';
import { Calculator, Sparkles, TrendingUp, RefreshCw, Layers, Share2, Check } from 'lucide-react';
import { Phenomenon } from '../types';

interface PhenomenonCalculatorProps {
  phenomenon: Phenomenon;
}

// Reusable scenario link sharing button
const ShareScenarioButton: React.FC<{ params: Record<string, string | number>; label?: string }> = ({
  params,
  label = 'Share Scenario',
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([k, v]) => {
      url.searchParams.set(k, String(v));
    });

    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // ignore
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 hover:border-emerald-500/50 rounded-lg text-xs font-mono transition-all cursor-pointer active:scale-95"
      title="Copy shareable link with current numbers"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3 text-slate-400" />}
      <span>{copied ? 'Link Copied!' : label}</span>
    </button>
  );
};

export const PhenomenonCalculator: React.FC<PhenomenonCalculatorProps> = ({ phenomenon }) => {
  // We provide tailored calculators based on phenomenon ID
  switch (phenomenon.id) {
    case 'compound-interest':
      return <CompoundInterestCalc />;
    case 'bacteria':
      return <BacteriaCalc />;
    case 'solar-energy':
      return <SolarCalc />;
    case 'ai-compute':
      return <AiComputeCalc />;
    case 'internet-adoption':
      return <InternetAdoptionCalc />;
    case 'global-debt':
      return <GlobalDebtCalc />;
    case 'atmospheric-co2':
      return <AtmosphericCo2Calc />;
    case 'world-population':
      return <PopulationCalc />;
    case 'smartphones':
      return <SmartphonesCalc />;
    case 'inflation-halving':
      return <InflationCalc />;
    default:
      return <GenericExponentialCalc phenomenon={phenomenon} />;
  }
};

// 1. COMPOUND INTEREST CALCULATOR
const CompoundInterestCalc: React.FC = () => {
  const [principal, setPrincipal] = useState<number>(10000);
  const [rate, setRate] = useState<number>(7.0);
  const [years, setYears] = useState<number>(30);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const p = params.get('ci_p');
      const rVal = params.get('ci_r');
      const y = params.get('ci_y');
      if (p) setPrincipal(Number(p));
      if (rVal) setRate(Number(rVal));
      if (y) setYears(Number(y));
    }
  }, []);

  const r = rate / 100;
  const compoundTotal = Math.round(principal * Math.pow(1 + r, years));
  const linearTotal = Math.round(principal + (principal * r) * years);
  const interestEarned = compoundTotal - principal;
  const compoundBonus = compoundTotal - linearTotal;
  const multiplier = (compoundTotal / principal).toFixed(2);
  const doublingYears = (Math.log(2) / Math.log(1 + r)).toFixed(1);

  return (
    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-bold">
          <Calculator className="w-4 h-4" />
          <span>Interactive Capital Compound Engine</span>
        </div>
        <div className="flex items-center gap-3">
          <ShareScenarioButton params={{ ci_p: principal, ci_r: rate, ci_y: years }} />
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">Formula: A = P · (1 + r)^t</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="text-xs font-mono text-slate-400 block mb-1.5">Initial Principal (P):</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">€</span>
            <input
              type="number"
              min="100"
              step="500"
              value={principal}
              onChange={e => setPrincipal(Math.max(10, Number(e.target.value)))}
              className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span>Annual Return Rate (r):</span>
            <span className="text-emerald-400 font-bold">{rate}% / yr</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            step="0.5"
            value={rate}
            onChange={e => setRate(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 mt-2"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span>Horizon (t):</span>
            <span className="text-cyan-400 font-bold">{years} years</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={years}
            onChange={e => setYears(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-900/90 rounded-xl border border-slate-800">
        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-0.5">Final Value</span>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">€{compoundTotal.toLocaleString()}</div>
          <span className="text-[11px] font-mono text-slate-400">{multiplier}× initial deposit</span>
        </div>

        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-0.5">Total Interest</span>
          <div className="text-xl sm:text-2xl font-black font-mono text-white">€{interestEarned.toLocaleString()}</div>
          <span className="text-[11px] font-mono text-emerald-400">Pure compounding gain</span>
        </div>

        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-0.5">If Linear (+{rate}%/yr)</span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-400">€{linearTotal.toLocaleString()}</div>
          <span className="text-[11px] font-mono text-amber-400">Compound edge: +€{compoundBonus.toLocaleString()}</span>
        </div>

        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-0.5">Doubling Period</span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300">{doublingYears} yrs</div>
          <span className="text-[11px] font-mono text-slate-400">{(years / Number(doublingYears)).toFixed(1)} doublings in {years} yrs</span>
        </div>
      </div>
    </div>
  );
};

// 2. BACTERIA CALCULATOR
const BacteriaCalc: React.FC = () => {
  const [initialCells, setInitialCells] = useState<number>(1);
  const [divisionMins, setDivisionMins] = useState<number>(20);
  const [hours, setHours] = useState<number>(6);

  const totalCycles = (hours * 60) / divisionMins;
  // Compute safe cell count
  const finalCells = Math.round(initialCells * Math.pow(2, totalCycles));
  const biomassGrams = finalCells * 1e-12; // ~1 picogram per E. coli cell

  return (
    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-teal-400 font-mono text-sm font-bold">
          <Calculator className="w-4 h-4" />
          <span>Microbial Binary Fission Calculator</span>
        </div>
        <span className="text-xs font-mono text-slate-400">N(t) = N_0 · 2^(t / d)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="text-xs font-mono text-slate-400 block mb-1.5">Starting Bacteria (N_0):</label>
          <input
            type="number"
            min="1"
            max="10000"
            value={initialCells}
            onChange={e => setInitialCells(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span>Division Interval (d):</span>
            <span className="text-teal-400 font-bold">{divisionMins} mins</span>
          </div>
          <input
            type="range"
            min="15"
            max="60"
            step="5"
            value={divisionMins}
            onChange={e => setDivisionMins(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400 mt-2"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span>Incubation Time (t):</span>
            <span className="text-cyan-400 font-bold">{hours} hours</span>
          </div>
          <input
            type="range"
            min="1"
            max="12"
            step="0.5"
            value={hours}
            onChange={e => setHours(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-900/90 rounded-xl border border-slate-800">
        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-0.5">Total Cell Population</span>
          <div className="text-xl sm:text-2xl font-black font-mono text-teal-400">
            {finalCells > 1e9 ? finalCells.toExponential(2) : finalCells.toLocaleString()} cells
          </div>
          <span className="text-[11px] font-mono text-slate-400">{totalCycles.toFixed(0)} division generations</span>
        </div>

        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-0.5">Estimated Biomass</span>
          <div className="text-xl sm:text-2xl font-black font-mono text-white">
            {biomassGrams < 0.001 
              ? `${(biomassGrams * 1e6).toFixed(1)} µg` 
              : biomassGrams < 1 
              ? `${(biomassGrams * 1000).toFixed(1)} mg` 
              : `${biomassGrams.toFixed(2)} g`}
          </div>
          <span className="text-[11px] font-mono text-slate-400">At ~1 pg/cell wet weight</span>
        </div>

        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-0.5">Growth Velocity</span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300">3.0 doublings / hr</div>
          <span className="text-[11px] font-mono text-slate-400">Exponential phase speed</span>
        </div>
      </div>
    </div>
  );
};

// 3. SOLAR ENERGY CALCULATOR
const SolarCalc: React.FC = () => {
  const [baseGw, setBaseGw] = useState<number>(2200);
  const [cagr, setCagr] = useState<number>(22.0);
  const [targetYear, setTargetYear] = useState<number>(2035);

  const yearsDiff = Math.max(0, targetYear - 2024);
  const projectedGw = Math.round(baseGw * Math.pow(1 + cagr / 100, yearsDiff));
  const estAnnualTwh = Math.round(projectedGw * 1.5); // ~1,500 full load hours/yr average
  const shareOfGlobalElectricity = Math.min(100, Math.round((estAnnualTwh / 32000) * 100)); // World uses ~30,000 TWh

  return (
    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-sm font-bold">
          <Calculator className="w-4 h-4" />
          <span>Wright’s Law Solar PV Capacity Projection</span>
        </div>
        <span className="text-xs font-mono text-slate-400">Cap(t) = Cap_2024 · (1 + r)^t</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="text-xs font-mono text-slate-400 block mb-1.5">2024 Baseline (GW):</label>
          <input
            type="number"
            value={baseGw}
            onChange={e => setBaseGw(Math.max(100, Number(e.target.value)))}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span>Annual CAGR:</span>
            <span className="text-amber-400 font-bold">+{cagr}% / yr</span>
          </div>
          <input
            type="range"
            min="5"
            max="35"
            step="1"
            value={cagr}
            onChange={e => setCagr(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 mt-2"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span>Target Year:</span>
            <span className="text-cyan-400 font-bold">{targetYear} (+{yearsDiff} yrs)</span>
          </div>
          <input
            type="range"
            min="2025"
            max="2050"
            value={targetYear}
            onChange={e => setTargetYear(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-900/90 rounded-xl border border-slate-800">
        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-0.5">Projected Global PV</span>
          <div className="text-xl sm:text-2xl font-black font-mono text-amber-400">
            {projectedGw.toLocaleString()} GW
          </div>
          <span className="text-[11px] font-mono text-slate-400">{(projectedGw / 1000).toFixed(1)} Terawatts</span>
        </div>

        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-0.5">Annual Generation</span>
          <div className="text-xl sm:text-2xl font-black font-mono text-white">
            ~{estAnnualTwh.toLocaleString()} TWh
          </div>
          <span className="text-[11px] font-mono text-slate-400">~{shareOfGlobalElectricity}% of global electricity demand</span>
        </div>

        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-0.5">Doubling Interval</span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-300">
            {(Math.log(2) / Math.log(1 + cagr / 100)).toFixed(1)} years
          </div>
          <span className="text-[11px] font-mono text-slate-400">Per 2x capacity cycle</span>
        </div>
      </div>
    </div>
  );
};

// 4. AI COMPUTE CALCULATOR
const AiComputeCalc: React.FC = () => {
  const [growthMultiplier, setGrowthMultiplier] = useState<number>(4.0);
  const [horizonYears, setHorizonYears] = useState<number>(6);

  const baselineLog10 = 26.2; // 2024 frontier ~10^26.2 FLOP
  const addedLog10 = horizonYears * Math.log10(growthMultiplier);
  const finalLog10 = (baselineLog10 + addedLog10).toFixed(1);
  const totalMultiplier = Math.pow(growthMultiplier, horizonYears);

  return (
    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm font-bold">
          <Calculator className="w-4 h-4" />
          <span>Frontier AI Training Compute Escalator</span>
        </div>
        <span className="text-xs font-mono text-slate-400">FLOP(t) = 10^26.2 · M^t</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span>Annual Expansion Factor:</span>
            <span className="text-cyan-400 font-bold">{growthMultiplier}× / year</span>
          </div>
          <input
            type="range"
            min="1.5"
            max="6"
            step="0.5"
            value={growthMultiplier}
            onChange={e => setGrowthMultiplier(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-2"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span>Timeline Horizon:</span>
            <span className="text-amber-400 font-bold">{horizonYears} years ({2024 + horizonYears})</span>
          </div>
          <input
            type="range"
            min="1"
            max="15"
            value={horizonYears}
            onChange={e => setHorizonYears(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-900/90 rounded-xl border border-slate-800">
        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-0.5">Compute Scale</span>
          <div className="text-xl sm:text-2xl font-black font-mono text-cyan-400">10^{finalLog10} FLOP</div>
          <span className="text-[11px] font-mono text-slate-400">+{addedLog10.toFixed(1)} orders of magnitude</span>
        </div>

        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-0.5">Scale Multiplier</span>
          <div className="text-xl sm:text-2xl font-black font-mono text-white">
            {totalMultiplier > 1000000 ? totalMultiplier.toExponential(1) : totalMultiplier.toLocaleString()}×
          </div>
          <span className="text-[11px] font-mono text-slate-400">vs 2024 frontier training run</span>
        </div>

        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-0.5">Doubling Cadence</span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300">
            {(12 * (Math.log(2) / Math.log(growthMultiplier))).toFixed(1)} months
          </div>
          <span className="text-[11px] font-mono text-slate-400">To double FLOP compute</span>
        </div>
      </div>
    </div>
  );
};

// 5. INFLATION CALCULATOR
const InflationCalc: React.FC = () => {
  const [initialCash, setInitialCash] = useState<number>(10000);
  const [inflationRate, setInflationRate] = useState<number>(3.5);
  const [years, setYears] = useState<number>(25);

  const remainingValue = Math.round(initialCash * Math.pow(1 - inflationRate / 100, years));
  const lostValue = initialCash - remainingValue;
  const percentLost = Math.round((lostValue / initialCash) * 100);
  const halvingYears = (Math.log(0.5) / Math.log(1 - inflationRate / 100)).toFixed(1);

  return (
    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-rose-400 font-mono text-sm font-bold">
          <Calculator className="w-4 h-4" />
          <span>Purchasing Power Decay Calculator</span>
        </div>
        <span className="text-xs font-mono text-slate-400">V(t) = V_0 · (1 - i)^t</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="text-xs font-mono text-slate-400 block mb-1.5">Initial Cash Stash (V_0):</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">€</span>
            <input
              type="number"
              value={initialCash}
              onChange={e => setInitialCash(Math.max(100, Number(e.target.value)))}
              className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm focus:border-rose-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span>Annual Inflation Rate:</span>
            <span className="text-rose-400 font-bold">{inflationRate}% / yr</span>
          </div>
          <input
            type="range"
            min="1"
            max="12"
            step="0.5"
            value={inflationRate}
            onChange={e => setInflationRate(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400 mt-2"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span>Time Horizon:</span>
            <span className="text-cyan-400 font-bold">{years} years</span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            value={years}
            onChange={e => setYears(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-900/90 rounded-xl border border-slate-800">
        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-0.5">Real Value Remaining</span>
          <div className="text-xl sm:text-2xl font-black font-mono text-rose-400">€{remainingValue.toLocaleString()}</div>
          <span className="text-[11px] font-mono text-slate-400">Lost {percentLost}% of purchasing power</span>
        </div>

        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-0.5">Purchasing Power Lost</span>
          <div className="text-xl sm:text-2xl font-black font-mono text-white">€{lostValue.toLocaleString()}</div>
          <span className="text-[11px] font-mono text-slate-400">Silently eroded without withdrawal</span>
        </div>

        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-0.5">Halving Time</span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300">{halvingYears} years</div>
          <span className="text-[11px] font-mono text-slate-400">To halve monetary buying capacity</span>
        </div>
      </div>
    </div>
  );
};

// 6. GENERIC / OTHER SPECIFIC CALCULATORS
const InternetAdoptionCalc: React.FC = () => {
  const [rate, setRate] = useState<number>(6.0);
  const [years, setYears] = useState<number>(10);
  const baseUsers = 5.5; // Billion
  const maxCap = 8.0; // Billion
  const projected = Math.min(maxCap, Number((baseUsers + (maxCap - baseUsers) * (1 - Math.exp(-0.12 * years))).toFixed(2)));

  return (
    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-blue-400 font-mono text-sm font-bold">
          <Calculator className="w-4 h-4" />
          <span>S-Curve Network Diffusion Estimator</span>
        </div>
        <span className="text-xs font-mono text-slate-400">Logistic Saturation Model</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span>Projection Window:</span>
            <span className="text-blue-400 font-bold">{years} years ({2024 + years})</span>
          </div>
          <input
            type="range"
            min="1"
            max="25"
            value={years}
            onChange={e => setYears(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-400 mt-2"
          />
        </div>
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase block">Connected Humans</span>
            <span className="text-2xl font-black font-mono text-blue-400">{projected} Billion</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-mono text-slate-400 uppercase block">Global Saturation</span>
            <span className="text-lg font-bold font-mono text-white">{Math.round((projected / 8.15) * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const GlobalDebtCalc: React.FC = () => {
  const [borrowingSpread, setBorrowingSpread] = useState<number>(2.5);
  const [years, setYears] = useState<number>(15);
  const baseDebt = 315; // $ Trillion
  const projectedDebt = Math.round(baseDebt * Math.pow(1 + borrowingSpread / 100, years));

  return (
    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-rose-400 font-mono text-sm font-bold">
          <Calculator className="w-4 h-4" />
          <span>Sovereign & Corporate Debt Compounding Estimator</span>
        </div>
        <span className="text-xs font-mono text-slate-400">D(t) = D_0 · (1 + r - g)^t</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span>Net Borrowing Rate (over GDP growth):</span>
            <span className="text-rose-400 font-bold">+{borrowingSpread}% / yr</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="6"
            step="0.5"
            value={borrowingSpread}
            onChange={e => setBorrowingSpread(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400 mt-2"
          />
        </div>
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase block">Projected Total Debt</span>
            <span className="text-2xl font-black font-mono text-rose-400">${projectedDebt} Trillion</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-mono text-slate-400 uppercase block">Debt Expansion</span>
            <span className="text-lg font-bold font-mono text-white">+${projectedDebt - baseDebt} Trillion</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AtmosphericCo2Calc: React.FC = () => {
  const [annualPpm, setAnnualPpm] = useState<number>(2.4);
  const [years, setYears] = useState<number>(25);
  const basePpm = 426;
  const finalPpm = Math.round(basePpm + annualPpm * years);

  return (
    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-sm font-bold">
          <Calculator className="w-4 h-4" />
          <span>Atmospheric CO₂ Stock Accumulation Calculator</span>
        </div>
        <span className="text-xs font-mono text-slate-400">Concentration = Base + Cumulative Net Flow</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span>Net Annual Accumulation:</span>
            <span className="text-amber-400 font-bold">+{annualPpm} ppm / yr</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3.5"
            step="0.1"
            value={annualPpm}
            onChange={e => setAnnualPpm(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 mt-2"
          />
        </div>
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase block">Projected Atmospheric Level</span>
            <span className="text-2xl font-black font-mono text-amber-400">{finalPpm} ppm</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-mono text-slate-400 uppercase block">Above Pre-Industrial</span>
            <span className="text-lg font-bold font-mono text-white">+{finalPpm - 280} ppm</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PopulationCalc: React.FC = () => {
  const [rate, setRate] = useState<number>(0.8);
  const [years, setYears] = useState<number>(25);
  const base = 8.15;
  const finalPop = (base * Math.pow(1 + rate / 100, years)).toFixed(2);

  return (
    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-violet-400 font-mono text-sm font-bold">
          <Calculator className="w-4 h-4" />
          <span>Human Demographic Compounding Calculator</span>
        </div>
        <span className="text-xs font-mono text-slate-400">P(t) = P_0 · (1 + r)^t</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span>Global Net Growth Rate:</span>
            <span className="text-violet-400 font-bold">+{rate}% / yr</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.5"
            step="0.1"
            value={rate}
            onChange={e => setRate(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-400 mt-2"
          />
        </div>
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase block">Projected Population</span>
            <span className="text-2xl font-black font-mono text-violet-400">{finalPop} Billion</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-mono text-slate-400 uppercase block">Total Net Increase</span>
            <span className="text-lg font-bold font-mono text-white">+{(Number(finalPop) - base).toFixed(2)}B</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const SmartphonesCalc: React.FC = () => {
  const [annualUnits, setAnnualUnits] = useState<number>(80);
  const [years, setYears] = useState<number>(10);
  const base = 4.88;
  const finalUnits = Math.min(6.5, Number((base + (annualUnits / 1000) * years).toFixed(2)));

  return (
    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-blue-400 font-mono text-sm font-bold">
          <Calculator className="w-4 h-4" />
          <span>Smartphone Global Penetration Estimator</span>
        </div>
        <span className="text-xs font-mono text-slate-400">Diffusion into saturation</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span>Projection Horizon:</span>
            <span className="text-blue-400 font-bold">{years} years</span>
          </div>
          <input
            type="range"
            min="1"
            max="25"
            value={years}
            onChange={e => setYears(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-400 mt-2"
          />
        </div>
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase block">Active Smartphones</span>
            <span className="text-2xl font-black font-mono text-blue-400">{finalUnits} Billion</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-mono text-slate-400 uppercase block">Adult Penetration</span>
            <span className="text-lg font-bold font-mono text-white">{Math.round((finalUnits / 6.0) * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const GenericExponentialCalc: React.FC<{ phenomenon: Phenomenon }> = ({ phenomenon }) => {
  const [rate, setRate] = useState<number>(phenomenon.growthRatePercent);
  const [t, setT] = useState<number>(10);
  const baseVal = phenomenon.historicalData[phenomenon.historicalData.length - 1].value;
  const mult = Math.pow(1 + Math.abs(rate) / 100, t);
  const finalVal = Math.round(baseVal * mult);

  return (
    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-bold">
          <Calculator className="w-4 h-4" />
          <span>{phenomenon.title} Exponential Calculator</span>
        </div>
        <span className="text-xs font-mono text-slate-400">{phenomenon.formula}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span>Compounding Periods (t):</span>
            <span className="text-emerald-400 font-bold">{t} {phenomenon.growthPeriod}</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            value={t}
            onChange={e => setT(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 mt-2"
          />
        </div>
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase block">Calculated Result</span>
            <span className="text-2xl font-black font-mono text-emerald-400">{finalVal.toLocaleString()} {phenomenon.unit}</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-mono text-slate-400 uppercase block">Scale Multiplier</span>
            <span className="text-lg font-bold font-mono text-white">{mult.toFixed(1)}×</span>
          </div>
        </div>
      </div>
    </div>
  );
};
