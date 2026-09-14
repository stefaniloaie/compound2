import React, { useState } from 'react';
import { Zap, Clock, Calculator, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';
import { Phenomenon } from '../types';
import { PHENOMENA } from '../data/phenomena';
import { getPhenomenonPath } from '../utils/routing';

interface FastestLeaderboardProps {
  onSelectPhenomenon: (phenomenon: Phenomenon) => void;
}

export const FastestLeaderboard: React.FC<FastestLeaderboardProps> = ({
  onSelectPhenomenon,
}) => {
  // Sort by growthSpeedRank
  const sortedPhenomena = [...PHENOMENA].sort(
    (a, b) => a.growthSpeedRank - b.growthSpeedRank
  );

  // Rule of 72 interactive sandbox
  const [ruleRate, setRuleRate] = useState<number>(7.2);
  const doublingTimeYears = (72 / Math.max(0.1, ruleRate)).toFixed(1);

  return (
    <section id="fastest-section" className="py-16 border-b border-slate-800/80 bg-slate-950/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono mb-3 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Velocity Comparison</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              What Compounds Fastest?
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Comparing raw percentages across different domains can be misleading without temporal context. The universal equalizer is <strong className="text-slate-200">Doubling Time</strong>: how long it takes a system to multiply its entire scale by two.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 p-3 rounded-xl">
            <span className="text-emerald-400 font-bold block mb-0.5">Speed Spectrum:</span>
            <span>20 minutes (Microbiology) → 82+ years (Demographics)</span>
          </div>
        </div>

        {/* Leaderboard Table & Velocity Matrix */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400 bg-slate-950/60">
                  <th className="py-3.5 px-4 sm:px-6">Rank & Phenomenon</th>
                  <th className="py-3.5 px-4">Domain</th>
                  <th className="py-3.5 px-4">Doubling Period</th>
                  <th className="py-3.5 px-4">Growth Rate</th>
                  <th className="py-3.5 px-4 text-right">Interactive Story</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm font-sans">
                {sortedPhenomena.map((item, idx) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectPhenomenon(item)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    {/* Rank + Title */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {item.title}
                          </div>
                          <div className="text-xs text-slate-400 line-clamp-1 font-mono">
                            {item.baseUnit}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Domain */}
                    <td className="py-4 px-4">
                      <span className="capitalize text-xs font-mono text-slate-300 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60">
                        {item.category}
                      </span>
                    </td>

                    {/* Doubling Period */}
                    <td className="py-4 px-4">
                      <div className="font-mono font-bold text-amber-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{item.doublingTimeText}</span>
                      </div>
                    </td>

                    {/* Growth Rate with period */}
                    <td className="py-4 px-4 font-mono">
                      <span className={item.growthRatePercent < 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {item.growthRatePercent > 0 ? `+${item.growthRatePercent}%` : `${item.growthRatePercent}%`}
                      </span>
                      <span className="text-slate-400 text-xs ml-1 font-normal">
                        ({item.growthPeriod})
                      </span>
                    </td>

                    {/* Explore Link */}
                    <td className="py-4 px-4 text-right">
                      <a
                        href={getPhenomenonPath(item)}
                        onClick={e => {
                          if (e.metaKey || e.ctrlKey) return;
                          e.preventDefault();
                          onSelectPhenomenon(item);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-emerald-400 transition-colors no-underline"
                      >
                        <span>Simulate</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* The Rule of 72 Interactive Explainer Sandbox */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 mb-1">
                <Calculator className="w-4 h-4" />
                <span>Mental Model Sandbox</span>
              </div>
              <h3 className="text-2xl font-bold text-white">
                The Rule of 72: Instant Mental Doubling
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                Divide 72 by any annual percentage growth rate (<span className="font-mono text-slate-200">r</span>) to instantly determine how many years it takes for that system to double in size: <span className="font-mono text-emerald-400 font-bold">T_double ≈ 72 / r</span>.
              </p>
            </div>

            {/* Interactive Result Card */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center gap-4 shrink-0">
              <div className="text-right">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Growth Rate: {ruleRate}%</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                  {doublingTimeYears} Years
                </div>
                <div className="text-[11px] font-mono text-slate-400">to double 100% in scale</div>
              </div>
            </div>
          </div>

          {/* Slider input */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="rule72-rate" className="text-xs font-mono text-slate-300">
                Adjust Annual Rate: <span className="text-emerald-400 font-bold">{ruleRate}% / year</span>
              </label>
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-slate-500 mr-1 text-[11px]">Examples:</span>
                {[
                  { label: 'Inflation 3%', val: 3 },
                  { label: 'Stock 7%', val: 7.2 },
                  { label: 'Tech 24%', val: 24 },
                  { label: 'Solar 28%', val: 28.8 },
                ].map(ex => (
                  <button
                    key={ex.label}
                    onClick={() => setRuleRate(ex.val)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            <input
              id="rule72-rate"
              type="range"
              min="1"
              max="50"
              step="0.5"
              value={ruleRate}
              onChange={e => setRuleRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />

            {/* Visual Doubling Progression */}
            <div className="mt-6 pt-5 border-t border-slate-800/80">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
                Compounding Ladder (At {ruleRate}% / yr):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center font-mono">
                {[
                  { step: '0 yrs', scale: '1×', note: 'Start' },
                  { step: `${doublingTimeYears} yrs`, scale: '2×', note: '1st Doubling' },
                  { step: `${(Number(doublingTimeYears) * 2).toFixed(1)} yrs`, scale: '4×', note: '2nd Doubling' },
                  { step: `${(Number(doublingTimeYears) * 3).toFixed(1)} yrs`, scale: '8×', note: '3rd Doubling' },
                  { step: `${(Number(doublingTimeYears) * 4).toFixed(1)} yrs`, scale: '16×', note: '4th Doubling' },
                  { step: `${(Number(doublingTimeYears) * 5).toFixed(1)} yrs`, scale: '32×', note: '5th Doubling' },
                ].map((st, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <div className="text-xs text-slate-400">{st.step}</div>
                    <div className="text-base font-extrabold text-emerald-400 my-0.5">{st.scale}</div>
                    <div className="text-[10px] text-slate-400">{st.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
