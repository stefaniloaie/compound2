import React, { useState } from 'react';
import { Building2, PiggyBank, CreditCard, ShieldAlert, ArrowRight, Percent, RefreshCw, Info } from 'lucide-react';

interface BankProductPreset {
  id: string;
  name: string;
  category: 'deposit' | 'lending';
  rate: number;
  compoundingFrequency: 'annually' | 'monthly' | 'daily';
  freqPerYear: number;
  defaultPrincipal: number;
  defaultYears: number;
  monthlyContribution: number;
  description: string;
  badge: string;
  badgeColor: string;
}

const BANK_PRESETS: BankProductPreset[] = [
  {
    id: 'hysa',
    name: 'High-Yield Savings (HYSA)',
    category: 'deposit',
    rate: 4.5,
    compoundingFrequency: 'monthly',
    freqPerYear: 12,
    defaultPrincipal: 10000,
    defaultYears: 10,
    monthlyContribution: 200,
    description: 'FDIC-insured cash account paying monthly compound yield on your balance and monthly deposits.',
    badge: 'You Earn Compound Yield',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  {
    id: 'cd',
    name: 'Bank Certificate of Deposit (CD)',
    category: 'deposit',
    rate: 5.1,
    compoundingFrequency: 'monthly',
    freqPerYear: 12,
    defaultPrincipal: 25000,
    defaultYears: 5,
    monthlyContribution: 0,
    description: 'Fixed term lock-in offering guaranteed monthly compounding interest sheltered from rate drops.',
    badge: 'Guaranteed Compound Interest',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  },
  {
    id: 'credit_card',
    name: 'Credit Card Revolving Debt',
    category: 'lending',
    rate: 24.5,
    compoundingFrequency: 'daily',
    freqPerYear: 365,
    defaultPrincipal: 6000,
    defaultYears: 5,
    monthlyContribution: 0,
    description: 'Credit cards calculate compound finance charges DAILY. Unpaid interest snowballs aggressively against the borrower.',
    badge: 'The Bank Compounds Against You',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  },
  {
    id: 'mortgage',
    name: 'Bank Fixed Mortgage (Bank Perspective)',
    category: 'lending',
    rate: 6.8,
    compoundingFrequency: 'monthly',
    freqPerYear: 12,
    defaultPrincipal: 350000,
    defaultYears: 30,
    monthlyContribution: 0,
    description: 'In the first 10 years of an amortized loan, the vast majority of your monthly payment is pure bank interest revenue.',
    badge: 'Amortized Interest Machine',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
];

export const BankCompoundExploration: React.FC<{
  onOpenPhenomenon?: (id: string) => void;
}> = ({ onOpenPhenomenon }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('hysa');
  const [principal, setPrincipal] = useState<number>(10000);
  const [annualRate, setAnnualRate] = useState<number>(4.5);
  const [years, setYears] = useState<number>(10);
  const [frequency, setFrequency] = useState<'annually' | 'monthly' | 'daily'>('monthly');
  const [monthlyAddition, setMonthlyAddition] = useState<number>(200);

  const selectedPreset = BANK_PRESETS.find(p => p.id === selectedPresetId) || BANK_PRESETS[0];

  const handleSelectPreset = (preset: BankProductPreset) => {
    setSelectedPresetId(preset.id);
    setPrincipal(preset.defaultPrincipal);
    setAnnualRate(preset.rate);
    setYears(preset.defaultYears);
    setFrequency(preset.compoundingFrequency);
    setMonthlyAddition(preset.monthlyContribution);
  };

  // Compounding math with monthly additions:
  // n = compounding periods per year
  const n = frequency === 'daily' ? 365 : frequency === 'monthly' ? 12 : 1;
  const r = annualRate / 100;

  // Calculate annual data series
  const yearlyData = [];
  let totalDeposited = principal;

  for (let t = 0; t <= years; t++) {
    // FV of lump sum: P * (1 + r/n)^(n*t)
    const lumpSumFV = principal * Math.pow(1 + r / n, n * t);

    // FV of annuity (monthly contribution compounded at monthly rate r_monthly = r/12)
    let annuityFV = 0;
    const months = t * 12;
    if (monthlyAddition > 0 && months > 0) {
      const rm = r / 12;
      annuityFV = monthlyAddition * ((Math.pow(1 + rm, months) - 1) / rm);
    }

    const currentTotal = Math.round(lumpSumFV + annuityFV);
    const cumulativeDeposits = principal + monthlyAddition * 12 * t;
    const compoundInterestGained = Math.max(0, currentTotal - cumulativeDeposits);

    // Flat linear comparison (Simple interest with no compounding of interest)
    const flatInterest = (principal * r * t) + (monthlyAddition * 12 * t * (r * (t / 2)));
    const flatTotal = Math.round(cumulativeDeposits + flatInterest);

    yearlyData.push({
      year: t,
      deposits: cumulativeDeposits,
      total: currentTotal,
      interest: compoundInterestGained,
      flatTotal,
    });
  }

  const finalYearData = yearlyData[yearlyData.length - 1];
  const totalBalance = finalYearData.total;
  const totalPrincipalDeposited = finalYearData.deposits;
  const totalInterest = finalYearData.interest;

  // Effective Annual Rate (APY) = (1 + r/n)^n - 1
  const apy = ((Math.pow(1 + r / n, n) - 1) * 100).toFixed(2);
  const apyDelta = (Number(apy) - annualRate).toFixed(2);

  return (
    <section className="py-12 border-b border-slate-800/80 bg-gradient-to-b from-slate-950/40 via-slate-900/30 to-slate-950/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-amber-400 uppercase">
              <Building2 className="w-4 h-4" />
              <span>Banking & Financial Compounding Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
              How Banks Compound For You — And Against You
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mt-1.5">
              Explore how fractional banking, High-Yield Savings Accounts (HYSA), Certificates of Deposit (CD),
              and daily credit card revolving interest exploit exponential compounding.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-mono text-slate-300">
            <Percent className="w-3.5 h-3.5 text-emerald-400" />
            <span>Nominal Rate: <strong className="text-white">{annualRate}%</strong></span>
            <span className="text-slate-600">→</span>
            <span>APY Yield: <strong className="text-emerald-400">{apy}%</strong></span>
          </div>
        </div>

        {/* Bank Product Preset Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BANK_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-amber-500/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${preset.badgeColor}`}>
                      {preset.badge}
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      {preset.rate}%
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 mb-1">{preset.name}</h3>
                  <p className="text-[12px] text-slate-400 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Frequency:</span>
                  <span className="text-slate-300 capitalize font-medium">{preset.compoundingFrequency}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Calculator Workspace */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Input Controls (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Bank Simulation Parameters
                </span>
                <button
                  onClick={() => handleSelectPreset(selectedPreset)}
                  className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                  title="Reset to preset defaults"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Initial Capital / Balance */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <label className="text-slate-400">Starting Balance / Principal</label>
                  <span className="text-white font-bold">${principal.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="100000"
                  step="500"
                  value={principal}
                  onChange={e => setPrincipal(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* Annual Interest Rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <label className="text-slate-400">Annual Interest Rate (APR)</label>
                  <span className="text-amber-400 font-bold">{annualRate}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="35"
                  step="0.1"
                  value={annualRate}
                  onChange={e => setAnnualRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* Monthly Deposit Contribution */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <label className="text-slate-400">Monthly Contribution / Deposit</label>
                  <span className="text-emerald-400 font-bold">${monthlyAddition}/mo</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={monthlyAddition}
                  onChange={e => setMonthlyAddition(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* Compounding Frequency Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 block">
                  Bank Compounding Frequency:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['annually', 'monthly', 'daily'] as const).map(freq => (
                    <button
                      key={freq}
                      onClick={() => setFrequency(freq)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono capitalize transition-all cursor-pointer ${
                        frequency === freq
                          ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Years */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <label className="text-slate-400">Duration Period</label>
                  <span className="text-white font-bold">{years} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={years}
                  onChange={e => setYears(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>

            {/* Results Display & Breakdown (7 Cols) */}
            <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/90 rounded-xl p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400 block">Total Capital In</span>
                  <span className="text-lg sm:text-xl font-bold font-mono text-slate-200">
                    ${totalPrincipalDeposited.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">Principal + monthly</span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400 block">Compound Interest</span>
                  <span className={`text-lg sm:text-xl font-bold font-mono ${
                    selectedPreset.category === 'deposit' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    ${totalInterest.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                    {((totalInterest / (totalPrincipalDeposited || 1)) * 100).toFixed(0)}% gain
                  </span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400 block">Final Total Balance</span>
                  <span className="text-lg sm:text-xl font-bold font-mono text-amber-400">
                    ${totalBalance.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                    {frequency} compounding
                  </span>
                </div>
              </div>

              {/* Visual Proportion Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>Balance Composition</span>
                  <span>
                    Deposits: {((totalPrincipalDeposited / totalBalance) * 100).toFixed(0)}% | Interest: {((totalInterest / totalBalance) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${(totalPrincipalDeposited / totalBalance) * 100}%` }}
                    className="h-full bg-slate-600 transition-all duration-300"
                    title={`Deposited Capital: $${totalPrincipalDeposited.toLocaleString()}`}
                  />
                  <div
                    style={{ width: `${(totalInterest / totalBalance) * 100}%` }}
                    className={`h-full transition-all duration-300 ${
                      selectedPreset.category === 'deposit' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    title={`Compounded Interest: $${totalInterest.toLocaleString()}`}
                  />
                </div>
              </div>

              {/* The Banking Secret: APR vs APY Insight */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 font-mono font-bold">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>The Banking Math: Why Frequency Matters (APY vs APR)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  When a bank offers <strong className="text-white">{annualRate}% APR</strong> compounding{' '}
                  <strong className="text-white">{frequency}</strong>, the actual annual percentage yield (APY) is{' '}
                  <strong className="text-emerald-400">{apy}%</strong> (+{apyDelta}% extra from interest earning interest on itself).
                  {selectedPreset.category === 'lending' && (
                    <span className="text-rose-300 block mt-1">
                      ⚠️ On revolving credit card debt, banks compound daily. If you carry a balance, you pay compound interest on yesterday’s unpaid interest 365 times a year.
                    </span>
                  )}
                </p>
              </div>

              {/* Action Button to Deep-Dive */}
              {onOpenPhenomenon && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => onOpenPhenomenon('compound-interest')}
                    className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 font-bold cursor-pointer group"
                  >
                    <span>Open Full 100-Year Wealth Compounding Engine</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
