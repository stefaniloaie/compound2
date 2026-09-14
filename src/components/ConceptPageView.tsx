import React, { useState, useEffect } from 'react';
import { ArrowLeft, Share2, Check, Sparkles, Calculator, Globe, TrendingUp, Layers } from 'lucide-react';
import { ConceptPageId } from '../utils/routing';
import { Phenomenon } from '../types';
import { PHENOMENA } from '../data/phenomena';
import { HeroLinearVsCompound } from './HeroLinearVsCompound';
import { FastestLeaderboard } from './FastestLeaderboard';
import { WorldIn2050View } from './WorldIn2050View';
import { UniversalCalculator } from './UniversalCalculator';
import { updatePageSEO } from '../utils/seo';

interface ConceptPageViewProps {
  conceptId: ConceptPageId;
  onNavigateHome: () => void;
  onSelectPhenomenon: (p: Phenomenon) => void;
}

export const ConceptPageView: React.FC<ConceptPageViewProps> = ({
  conceptId,
  onNavigateHome,
  onSelectPhenomenon,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const getConceptMeta = (id: ConceptPageId) => {
    switch (id) {
      case 'linear-vs-exponential':
        return {
          title: 'Linear vs. Exponential Growth: The Great Divergence',
          description: 'Explore the fundamental difference between linear additions (+10/year) and compound growth (+10%/year) with an interactive multi-decade scrubber.',
          path: '/linear-vs-exponential',
          headline: 'Linear vs. Exponential: How Feedback Loops Separate Reality',
        };
      case 'rule-of-72':
        return {
          title: 'Rule of 72 & Doubling Time Calculator',
          description: 'Calculate exact doubling times for any compounding rate using the mental math shortcut: Doubling Time ≈ 72 / Rate (%).',
          path: '/rule-of-72',
          headline: 'The Rule of 72: How Fast Does Anything Double?',
        };
      case 'world-in-2050':
        return {
          title: 'The World in 2050: Historical Data vs Mathematical Projections',
          description: 'A transparent comparison of verified historical milestones versus mathematical projections under bounded S-curves and unconstrained pure math.',
          path: '/world-in-2050',
          headline: 'The World in 2050: If Trends Continue...',
        };
      case 'what-compounds-fastest':
        return {
          title: 'What Compounds Fastest? Global Velocity Ranking',
          description: 'Ranking compounding phenomena by doubling time, from bacterial fission in 20 minutes to human demographic generations across 82 years.',
          path: '/what-compounds-fastest',
          headline: 'What Compounds Fastest? The Global Velocity Matrix',
        };
      case 'universal-calculator':
        return {
          title: 'Universal Cross-Domain Compound Equation Calculator',
          description: 'One equation across every domain: N(t) = N_0 · (1 + r)^t. Test compounding across Euros, bacterial cells, solar Gigawatts, and national debt.',
          path: '/universal-calculator',
          headline: 'Universal Compound Engine: One Formula, Infinite Worlds',
        };
    }
  };

  const meta = getConceptMeta(conceptId);

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://compound.world';

    updatePageSEO({
      title: meta.title,
      description: meta.description,
      path: meta.path,
      keywords: ['exponential growth', 'compound interest', 'rule of 72', 'doubling time', 'mathematical modeling'],
      ogType: 'website',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        'name': meta.title,
        'description': meta.description,
        'url': `${origin}${meta.path}`,
        'applicationCategory': 'EducationalApplication',
      },
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [conceptId]);

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}${meta.path}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    });
  };

  return (
    <div className="space-y-10">
      {/* Top Header & Breadcrumbs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
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
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </a>
            <span className="text-slate-600">/</span>
            <span className="text-emerald-400 font-bold">{meta.title}</span>
          </nav>

          <button
            onClick={handleCopyLink}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 border self-start sm:self-auto ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied!' : 'Share Page'}</span>
          </button>
        </div>
      </div>

      {/* Render the matching interactive experience */}
      {conceptId === 'linear-vs-exponential' && (
        <div>
          <HeroLinearVsCompound onExploreClick={() => onNavigateHome()} />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">The Cognitive Trap of Linear Thinking</h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-mono">
              Throughout evolutionary history, early humans relied exclusively on linear intuition: if a predator runs twice as fast, it covers twice the distance. But when feedback loops emerge—where output compounds into the next cycle's input—small percentages produce staggering separation that human intuition systematically underestimates.
            </p>
          </div>
        </div>
      )}

      {conceptId === 'rule-of-72' && (
        <FastestLeaderboard onSelectPhenomenon={onSelectPhenomenon} />
      )}

      {conceptId === 'what-compounds-fastest' && (
        <FastestLeaderboard onSelectPhenomenon={onSelectPhenomenon} />
      )}

      {conceptId === 'world-in-2050' && (
        <WorldIn2050View onOpenStory={onSelectPhenomenon} />
      )}

      {conceptId === 'universal-calculator' && (
        <UniversalCalculator />
      )}
    </div>
  );
};
