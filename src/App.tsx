import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroLinearVsCompound } from './components/HeroLinearVsCompound';
import { CategoryFilter } from './components/CategoryFilter';
import { PhenomenonCard } from './components/PhenomenonCard';
import { FastestLeaderboard } from './components/FastestLeaderboard';
import { WorldIn2050View } from './components/WorldIn2050View';
import { UniversalCalculator } from './components/UniversalCalculator';
import { PhenomenonPageView } from './components/PhenomenonPageView';
import { ConceptPageView } from './components/ConceptPageView';
import { SEODirectory } from './components/SEODirectory';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import { LiveWorldTicker } from './components/LiveWorldTicker';
import { BankCompoundExploration } from './components/BankCompoundExploration';
import { getTodayPuzzle } from './data/dailyPuzzles';
import { CategoryId, Phenomenon } from './types';
import { PHENOMENA } from './data/phenomena';
import { Search, Sparkles, Globe, Brain, ArrowRight } from 'lucide-react';
import { parsePath, navigateTo, getPhenomenonPath, RouteState } from './utils/routing';
import { updatePageSEO } from './utils/seo';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<RouteState>(() => {
    if (typeof window !== 'undefined') {
      return parsePath(window.location.pathname);
    }
    return { type: 'home', path: '/' };
  });

  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDailyChallengeOpen, setIsDailyChallengeOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).has('challenge');
    }
    return false;
  });

  const { puzzle: todayPuzzle, dayNumber: todayDayNumber } = useMemo(() => getTodayPuzzle(), []);

  // Handle browser popstate (Back/Forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(parsePath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update homepage SEO whenever on home route
  useEffect(() => {
    if (currentRoute.type === 'home') {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://compound.world';
      updatePageSEO({
        title: 'COMPOUND — What Exponential Things Shape the World?',
        description: 'Explore real-world exponential phenomena: compound interest, bacterial division, solar adoption, frontier AI compute, global debt, and atmospheric CO₂. Interactive kinetic simulations, custom calculators, and verified empirical datasets.',
        path: '/',
        keywords: [
          'compound interest',
          'exponential growth',
          'bacteria growth',
          'solar energy growth',
          'ai compute scaling',
          'rule of 72',
          'doubling time',
          's-curve saturation',
          'purchasing power inflation'
        ],
        ogType: 'website',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          'name': 'COMPOUND — The Exponential World',
          'url': origin,
          'description': 'An interactive exploration of real-world compounding phenomena across money, biology, technology, energy, and the planet.',
        },
      });
    }
  }, [currentRoute.type]);

  // Navigate to a specific path
  const handleNavigatePath = useCallback((path: string) => {
    navigateTo(path);
    setCurrentRoute(parsePath(path));
  }, []);

  // Navigate to phenomenon page
  const handleSelectPhenomenon = useCallback((phenomenon: Phenomenon) => {
    const path = getPhenomenonPath(phenomenon);
    navigateTo(path);
    setCurrentRoute({
      type: 'phenomenon',
      phenomenon,
      path,
    });
  }, []);

  const handleNavigateToPhenomenonById = useCallback((phenomenonId: string) => {
    const found = PHENOMENA.find(p => p.id === phenomenonId);
    if (found) {
      handleSelectPhenomenon(found);
    }
  }, [handleSelectPhenomenon]);

  // Navigate to home
  const handleNavigateHome = useCallback(() => {
    navigateTo('/');
    setCurrentRoute({ type: 'home', path: '/' });
  }, []);

  // Category counts
  const phenomenaCounts = useMemo(() => {
    const counts: Record<CategoryId, number> = {
      all: PHENOMENA.length,
      money: 0,
      people: 0,
      biology: 0,
      energy: 0,
      technology: 0,
      planet: 0,
      society: 0,
    };

    PHENOMENA.forEach(p => {
      if (counts[p.category] !== undefined) {
        counts[p.category]++;
      }
    });

    return counts;
  }, []);

  // Filtered phenomena
  const filteredPhenomena = useMemo(() => {
    return PHENOMENA.filter(p => {
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const scrollToExplore = () => {
    if (currentRoute.type !== 'home') {
      handleNavigateHome();
      setTimeout(() => {
        const el = document.getElementById('explore-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      const el = document.getElementById('explore-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300 font-sans flex flex-col justify-between">
      {/* Navigation Header with Clean Routing */}
      <Navbar
        onNavigateHome={handleNavigateHome}
        onNavigatePath={handleNavigatePath}
        onOpenDailyChallenge={() => setIsDailyChallengeOpen(true)}
        isHome={currentRoute.type === 'home'}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentRoute.type === 'phenomenon' && currentRoute.phenomenon && (
          <PhenomenonPageView
            phenomenon={currentRoute.phenomenon}
            onNavigateHome={handleNavigateHome}
            onSelectPhenomenon={handleSelectPhenomenon}
          />
        )}

        {currentRoute.type === 'concept' && currentRoute.conceptId && (
          <ConceptPageView
            conceptId={currentRoute.conceptId}
            onNavigateHome={handleNavigateHome}
            onSelectPhenomenon={handleSelectPhenomenon}
          />
        )}

        {currentRoute.type === 'home' && (
          <div>
            {/* Hero Section with Interactive Linear vs Compound Comparison */}
            <HeroLinearVsCompound onExploreClick={scrollToExplore} />

            {/* Real-time Ticking World Accrual Ticker */}
            <LiveWorldTicker />

            {/* Financial & Banking Compound Exploration */}
            <BankCompoundExploration onOpenPhenomenon={handleNavigateToPhenomenonById} />

            {/* Daily Exponential Intuition Hook Banner */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-4">
              <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-emerald-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-amber-500/5">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
                        Daily 60-Sec Challenge #{todayDayNumber}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">• {todayPuzzle.topic}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      {todayPuzzle.title}: Can your brain outsmart the exponential curve?
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setIsDailyChallengeOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold font-mono transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/10 shrink-0 cursor-pointer active:scale-95 self-stretch sm:self-auto justify-center"
                >
                  <span>Play 60-Sec Challenge</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Explore The 10 Phenomena Section */}
            <section id="explore-section" className="py-12 border-b border-slate-800/80 bg-slate-950/40">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
                {/* Filter Bar */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <CategoryFilter
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    phenomenaCounts={phenomenaCounts}
                  />
                </div>

                {/* Search bar & Live Filter Count */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search bacteria, solar, AI compute, debt..."
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div className="text-xs font-mono text-slate-400 flex items-center gap-2 self-end sm:self-center">
                    <span>Showing {filteredPhenomena.length} of {PHENOMENA.length} empirical phenomena</span>
                    {selectedCategory !== 'all' && (
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className="text-emerald-400 hover:underline text-[11px]"
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid of Phenomena Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredPhenomena.map(phenomenon => (
                    <PhenomenonCard
                      key={phenomenon.id}
                      phenomenon={phenomenon}
                      onSelect={handleSelectPhenomenon}
                    />
                  ))}
                </div>

                {filteredPhenomena.length === 0 && (
                  <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
                    <p className="text-slate-400 text-sm font-mono">No phenomena matched your search query.</p>
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSearchQuery('');
                      }}
                      className="mt-3 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* What Compounds Fastest? Leaderboard + Rule of 72 */}
            <div id="fastest-section">
              <FastestLeaderboard onSelectPhenomenon={handleSelectPhenomenon} />
            </div>

            {/* The World in 2050: Historical Data vs Mathematical Projections */}
            <div id="world-2050-section">
              <WorldIn2050View onOpenStory={handleSelectPhenomenon} />
            </div>

            {/* Universal Cross-Domain Compound Calculator */}
            <div id="universal-calculator-section">
              <UniversalCalculator />
            </div>
          </div>
        )}
      </main>

      {/* Footer & Comprehensive Crawlable Sitemap Directory */}
      <footer className="py-16 border-t border-slate-800 bg-slate-950 text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          {/* Crawlable Sitemap & Directory */}
          <SEODirectory onNavigate={handleNavigatePath} />

          {/* Philosophical Epilogue */}
          <div className="text-center max-w-2xl mx-auto space-y-4 pt-6 border-t border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center font-mono font-bold text-lg">
              C
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Some things grow. Some things compound. Some things accelerate.
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-mono">
              The human mind evolved to predict the trajectory of a thrown stone: a simple linear path. But the modern world is shaped by recursive feedback loops. Understanding compounding is the key to understanding the future.
            </p>
            <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-mono text-slate-500">
              <span>Verified data sources: World Bank • Our World in Data • IEA • UN DESA • NOAA • Epoch AI</span>
              <span className="hidden sm:inline">•</span>
              <span>All 10 phenomena indexed with canonical URLs</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 60-Second Daily Exponential Intuition Challenge Modal */}
      <DailyChallengeModal
        isOpen={isDailyChallengeOpen}
        onClose={() => setIsDailyChallengeOpen(false)}
        onNavigateToPhenomenon={handleNavigateToPhenomenonById}
      />
    </div>
  );
}
