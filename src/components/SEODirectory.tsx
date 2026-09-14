import React from 'react';
import { Phenomenon } from '../types';
import { PHENOMENA, CATEGORIES } from '../data/phenomena';
import { getPhenomenonPath } from '../utils/routing';
import { Globe, Layers, ArrowUpRight } from 'lucide-react';

interface SEODirectoryProps {
  onNavigate: (path: string) => void;
}

export const SEODirectory: React.FC<SEODirectoryProps> = ({ onNavigate }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    // Allow standard Ctrl/Cmd + click to open in new tab
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    onNavigate(path);
  };

  const conceptLinks = [
    { title: 'Linear vs. Exponential Scrubber', path: '/linear-vs-exponential', desc: 'Interactive comparison between +10 and +10%' },
    { title: 'Rule of 72 Calculator & Sandbox', path: '/rule-of-72', desc: 'Mental math formula for instant doubling times' },
    { title: 'What Compounds Fastest? Leaderboard', path: '/what-compounds-fastest', desc: 'Global doubling velocity ranking' },
    { title: 'The World in 2050 Scenarios', path: '/world-in-2050', desc: 'Historical data vs mathematical projections' },
    { title: 'Universal Cross-Domain Calculator', path: '/universal-calculator', desc: 'One equation across money, biology, and energy' },
  ];

  return (
    <nav aria-label="Exploration Directory" className="pt-12 border-t border-slate-800/80">
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400 mb-6">
        <Globe className="w-4 h-4 text-emerald-400" />
        <span>Sitemap & Exploration Directory</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Concepts Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
            Interactive Engines
          </h4>
          <ul className="space-y-2">
            {conceptLinks.map(link => (
              <li key={link.path}>
                <a
                  href={link.path}
                  onClick={e => handleClick(e, link.path)}
                  className="group block"
                >
                  <span className="text-xs font-medium text-slate-300 group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                    <span>{link.title}</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                  <span className="text-[11px] text-slate-400 block line-clamp-1">
                    {link.desc}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Phenomena By Categories */}
        {['money', 'biology', 'technology'].map(catId => {
          const cat = CATEGORIES.find(c => c.id === catId);
          const phenomenaInCat = PHENOMENA.filter(p => p.category === catId);

          return (
            <div key={catId} className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                {cat?.name || catId}
              </h4>
              <ul className="space-y-2">
                {phenomenaInCat.map(p => {
                  const path = getPhenomenonPath(p);
                  return (
                    <li key={p.id}>
                      <a
                        href={path}
                        onClick={e => handleClick(e, path)}
                        className="group block"
                      >
                        <span className="text-xs font-medium text-slate-300 group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                          <span>{p.title}</span>
                          <span className="text-[10px] font-mono text-amber-400/90 ml-1">2× in {p.doublingTimeText}</span>
                        </span>
                        <span className="text-[11px] text-slate-400 block line-clamp-1">
                          {p.subtitle}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Second Row of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6 pt-6 border-t border-slate-800/40">
        {['energy', 'people', 'planet'].map(catId => {
          const cat = CATEGORIES.find(c => c.id === catId);
          const phenomenaInCat = PHENOMENA.filter(p => p.category === catId);

          return (
            <div key={catId} className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                {cat?.name || catId}
              </h4>
              <ul className="space-y-2">
                {phenomenaInCat.map(p => {
                  const path = getPhenomenonPath(p);
                  return (
                    <li key={p.id}>
                      <a
                        href={path}
                        onClick={e => handleClick(e, path)}
                        className="group block"
                      >
                        <span className="text-xs font-medium text-slate-300 group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                          <span>{p.title}</span>
                          <span className="text-[10px] font-mono text-amber-400/90 ml-1">2× in {p.doublingTimeText}</span>
                        </span>
                        <span className="text-[11px] text-slate-400 block line-clamp-1">
                          {p.subtitle}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </nav>
  );
};
