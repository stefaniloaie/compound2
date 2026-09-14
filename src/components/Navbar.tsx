import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Zap, Globe, Calculator, Layers, Brain, Flame } from 'lucide-react';

interface NavbarProps {
  onNavigateHome: () => void;
  onNavigatePath: (path: string) => void;
  onOpenDailyChallenge?: () => void;
  isHome: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigateHome,
  onNavigatePath,
  onOpenDailyChallenge,
  isHome,
}) => {
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('compound_daily_progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.streak) setStreak(parsed.streak);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string, hashId?: string) => {
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    if (isHome && hashId) {
      const el = document.getElementById(hashId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    onNavigatePath(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <a
          href="/"
          onClick={e => {
            if (e.metaKey || e.ctrlKey) return;
            e.preventDefault();
            onNavigateHome();
          }}
          className="flex items-center gap-3 cursor-pointer group no-underline"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold font-mono text-base shadow-sm group-hover:bg-emerald-500/20 transition-colors">
            C
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight text-white font-sans flex items-center gap-1.5">
              <span>COMPOUND</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <div className="text-[10px] font-mono text-slate-400 tracking-wider uppercase -mt-0.5">
              The Exponential World
            </div>
          </div>
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300 font-mono">
          <a
            href="/#explore-section"
            onClick={e => handleNavClick(e, '/', 'explore-section')}
            className="hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            <span>Phenomena</span>
          </a>
          <a
            href="/what-compounds-fastest"
            onClick={e => handleNavClick(e, '/what-compounds-fastest', 'fastest-section')}
            className="hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            <span>Fastest Compounding</span>
          </a>
          <a
            href="/world-in-2050"
            onClick={e => handleNavClick(e, '/world-in-2050', 'world-2050-section')}
            className="hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <span>World in 2050</span>
          </a>
          <a
            href="/universal-calculator"
            onClick={e => handleNavClick(e, '/universal-calculator', 'universal-calculator-section')}
            className="hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            <span>Universal Calculator</span>
          </a>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-2">
          {onOpenDailyChallenge && (
            <button
              onClick={onOpenDailyChallenge}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Daily 60-Second Exponential Intuition Challenge"
            >
              <Brain className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline font-semibold">Daily Challenge</span>
              {streak > 0 ? (
                <span className="flex items-center gap-0.5 px-1.5 py-0.2 bg-amber-500/20 rounded-full text-[10px] font-bold text-amber-300">
                  <Flame className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  {streak}
                </span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
          )}

          <a
            href="/#explore-section"
            onClick={e => {
              if (e.metaKey || e.ctrlKey) return;
              e.preventDefault();
              if (isHome) {
                const el = document.getElementById('explore-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              } else {
                onNavigateHome();
              }
            }}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold font-sans transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/10 no-underline cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explore Stories</span>
          </a>
        </div>
      </div>
    </header>
  );
};

