import React from 'react';
import { 
  ArrowUpRight, Clock, Dna, Sun, Cpu, TrendingUp, Globe, CreditCard, Factory, Users, Smartphone, Percent
} from 'lucide-react';
import { Phenomenon } from '../types';
import { CATEGORIES } from '../data/phenomena';
import { getPhenomenonPath } from '../utils/routing';

interface PhenomenonCardProps {
  phenomenon: Phenomenon;
  onSelect: (phenomenon: Phenomenon) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Microscope: <Dna className="w-4 h-4" />,
  Sun: <Sun className="w-4 h-4" />,
  Cpu: <Cpu className="w-4 h-4" />,
  TrendingUp: <TrendingUp className="w-4 h-4" />,
  Globe: <Globe className="w-4 h-4" />,
  CreditCard: <CreditCard className="w-4 h-4" />,
  Factory: <Factory className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  Smartphone: <Smartphone className="w-4 h-4" />,
  Percent: <Percent className="w-4 h-4" />,
};

export const PhenomenonCard: React.FC<PhenomenonCardProps> = ({
  phenomenon,
  onSelect,
}) => {
  const catMeta = CATEGORIES.find(c => c.id === phenomenon.category);
  const path = getPhenomenonPath(phenomenon);

  // Micro SVG sparkline from historical data points
  const points = phenomenon.historicalData;
  const values = points.map(p => p.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const sparkWidth = 120;
  const sparkHeight = 36;
  const sparkPath = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * sparkWidth;
      const y = sparkHeight - ((p.value - minVal) / range) * (sparkHeight - 8) - 4;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey) return; // Allow new tab
    e.preventDefault();
    onSelect(phenomenon);
  };

  return (
    <a
      id={`phenomenon-card-${phenomenon.id}`}
      href={path}
      onClick={handleClick}
      className="group relative bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-0.5 no-underline block"
    >
      {/* Top row: Category & Speed rank */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono border ${
              catMeta?.badgeBg || 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {ICON_MAP[phenomenon.icon] || <TrendingUp className="w-3 h-3" />}
            <span className="capitalize">{phenomenon.category}</span>
          </span>

          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800/60">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>2× in {phenomenon.doublingTimeText}</span>
          </div>
        </div>

        {/* Title and Subtitle */}
        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors tracking-tight mb-1.5 flex items-center justify-between">
          <span>{phenomenon.title}</span>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {phenomenon.subtitle}
        </p>
      </div>

      {/* Bottom row: Sparkline & Key Numbers */}
      <div className="pt-4 border-t border-slate-800/60 flex items-end justify-between gap-2">
        <div>
          <div className="text-[10px] font-mono text-slate-400 uppercase">Growth Rate</div>
          <div className="text-sm font-extrabold font-mono text-emerald-400">
            {phenomenon.growthRatePercent > 0 ? `+${phenomenon.growthRatePercent}%` : `${phenomenon.growthRatePercent}%`}
            <span className="text-[10px] text-slate-400 font-normal ml-1">
              /{phenomenon.growthPeriod.replace('annual compound growth', 'yr').replace('current annual rate', 'yr')}
            </span>
          </div>
        </div>

        {/* Sparkline curve */}
        <div className="w-28 h-9 select-none">
          <svg viewBox={`0 0 ${sparkWidth} ${sparkHeight}`} className="w-full h-full overflow-visible">
            <path
              d={sparkPath}
              fill="none"
              stroke={phenomenon.growthRatePercent < 0 ? '#f43f5e' : '#10b981'}
              strokeWidth="2"
            />
            {/* End dot */}
            {points.length > 0 && (
              <circle
                cx={sparkWidth}
                cy={sparkHeight - ((points[points.length - 1].value - minVal) / range) * (sparkHeight - 8) - 4}
                r="3"
                fill={phenomenon.growthRatePercent < 0 ? '#f43f5e' : '#10b981'}
              />
            )}
          </svg>
        </div>
      </div>
    </a>
  );
};
