import React, { useState, useEffect } from 'react';
import { DollarSign, Sun, Users, CloudRain, Activity, Info } from 'lucide-react';

export const LiveWorldTicker: React.FC = () => {
  // Compute seconds elapsed since midnight UTC
  const getSecondsSinceMidnight = () => {
    const now = new Date();
    const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    return (now.getTime() - midnight.getTime()) / 1000;
  };

  const [secondsToday, setSecondsToday] = useState<number>(getSecondsSinceMidnight());

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsToday(getSecondsSinceMidnight());
    }, 250); // update 4 times a second for smooth live feel

    return () => clearInterval(interval);
  }, []);

  // Rates per second:
  // 1. Debt Interest: $315T * 4.5% / (365 * 86400) = ~$449,480 / sec ($38.8 Billion/day)
  const debtInterestToday = Math.floor(secondsToday * 449480);

  // Format currency dynamically: < 1B in Millions, >= 1B in Billions
  const formatDebtInterest = (amount: number) => {
    if (amount >= 1_000_000_000) {
      return `$${(amount / 1_000_000_000).toFixed(2)}B`;
    }
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  };

  // 2. Solar PV: ~600 GW / year = ~19.02 kW / sec = ~0.01902 MW / sec
  const solarMwToday = Math.floor(secondsToday * 0.01902);

  // 3. New Internet Connected: ~180M / year = ~5.71 people / sec
  const internetUsersToday = Math.floor(secondsToday * 5.707);

  // 4. Atmospheric CO2 emitted: ~37.4B metric tonnes / year = ~1,185.9 tonnes / sec
  const co2TonnesToday = Math.floor(secondsToday * 1185.9);

  return (
    <div className="w-full bg-slate-950 border-y border-slate-800/80 py-2.5 px-4 overflow-x-auto text-xs font-mono select-none">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 sm:gap-6 min-w-max md:min-w-0">
        {/* Live Badge */}
        <div className="flex items-center gap-2 text-slate-400 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-bold tracking-wider uppercase text-[10px] text-slate-300">
            Real-Time Earth Accrual Today
          </span>
        </div>

        {/* 4 Live Tickers */}
        <div className="flex items-center gap-4 sm:gap-7 text-slate-300">
          {/* Debt Interest */}
          <a
            href="/phenomenon/global-debt"
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer group"
            title="Interest accumulating worldwide today on the $315 Trillion global debt (~$450,000 per second, ~$38.8 Billion/day). Click to inspect."
          >
            <span className="text-amber-400 font-semibold group-hover:underline">
              {formatDebtInterest(debtInterestToday)}
            </span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">Debt Interest</span>
          </a>

          {/* Solar Capacity */}
          <div className="flex items-center gap-1.5" title="Estimated newly connected solar photovoltaic capacity today (~600 GW/yr)">
            <Sun className="w-3 h-3 text-yellow-400" />
            <span className="text-yellow-400 font-semibold">+{solarMwToday.toLocaleString()} MW</span>
            <span className="text-slate-500 text-[11px] hidden sm:inline">Solar PV</span>
          </div>

          {/* Connected People */}
          <div className="flex items-center gap-1.5" title="New individuals gaining first-time internet access today">
            <Users className="w-3 h-3 text-cyan-400" />
            <span className="text-cyan-400 font-semibold">+{internetUsersToday.toLocaleString()}</span>
            <span className="text-slate-500 text-[11px] hidden sm:inline">Online Net</span>
          </div>

          {/* CO2 Emissions */}
          <div className="flex items-center gap-1.5" title="Global greenhouse gas emissions trapped in atmosphere today">
            <CloudRain className="w-3 h-3 text-rose-400" />
            <span className="text-rose-400 font-semibold">+{co2TonnesToday.toLocaleString()} t</span>
            <span className="text-slate-500 text-[11px] hidden sm:inline">CO₂ Added</span>
          </div>
        </div>
      </div>
    </div>
  );
};
