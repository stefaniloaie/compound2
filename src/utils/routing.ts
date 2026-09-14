import { PHENOMENA } from '../data/phenomena';
import { Phenomenon } from '../types';

// Map of phenomenon ID to preferred canonical slug
export const PHENOMENON_SLUGS: Record<string, string> = {
  'compound-interest': '/compound-interest',
  'bacteria': '/bacteria-growth',
  'solar-energy': '/solar-energy-growth',
  'ai-compute': '/ai-adoption',
  'internet-adoption': '/internet-adoption',
  'global-debt': '/debt-growth',
  'atmospheric-co2': '/atmospheric-co2',
  'world-population': '/population-growth',
  'smartphones': '/smartphones-growth',
  'inflation-halving': '/inflation-decay',
};

// Reverse map: slug -> phenomenon ID (including aliases)
export const SLUG_TO_PHENOMENON_ID: Record<string, string> = {
  // Primary slugs
  '/compound-interest': 'compound-interest',
  '/bacteria-growth': 'bacteria',
  '/solar-energy-growth': 'solar-energy',
  '/ai-adoption': 'ai-compute',
  '/internet-adoption': 'internet-adoption',
  '/debt-growth': 'global-debt',
  '/atmospheric-co2': 'atmospheric-co2',
  '/population-growth': 'world-population',
  '/smartphones-growth': 'smartphones',
  '/inflation-decay': 'inflation-halving',

  // Common SEO Aliases & Direct ID slugs
  '/bacteria': 'bacteria',
  '/solar-energy': 'solar-energy',
  '/ai-compute': 'ai-compute',
  '/global-debt': 'global-debt',
  '/world-population': 'world-population',
  '/smartphones': 'smartphones',
  '/inflation': 'inflation-halving',
  '/exponential-growth': 'ai-compute',
  '/doubling-time': 'bacteria',
};

export type ConceptPageId = 
  | 'linear-vs-exponential'
  | 'rule-of-72'
  | 'world-in-2050'
  | 'what-compounds-fastest'
  | 'universal-calculator';

export const CONCEPT_SLUGS: Record<string, ConceptPageId> = {
  '/linear-vs-exponential': 'linear-vs-exponential',
  '/rule-of-72': 'rule-of-72',
  '/world-in-2050': 'world-in-2050',
  '/what-compounds-fastest': 'what-compounds-fastest',
  '/universal-calculator': 'universal-calculator',
};

export interface RouteState {
  type: 'home' | 'phenomenon' | 'concept';
  phenomenon?: Phenomenon;
  conceptId?: ConceptPageId;
  path: string;
}

export function parsePath(pathname: string): RouteState {
  // Clean path (strip trailing slash if not root)
  const normalized = pathname === '/' ? '/' : pathname.replace(/\/+$/, '').toLowerCase();

  // Check if it's a phenomenon slug
  const phenId = SLUG_TO_PHENOMENON_ID[normalized];
  if (phenId) {
    const found = PHENOMENA.find(p => p.id === phenId);
    if (found) {
      return {
        type: 'phenomenon',
        phenomenon: found,
        path: PHENOMENON_SLUGS[found.id] || normalized,
      };
    }
  }

  // Check if it's a concept page
  const conceptId = CONCEPT_SLUGS[normalized];
  if (conceptId) {
    return {
      type: 'concept',
      conceptId,
      path: normalized,
    };
  }

  // Fallback to Home
  return {
    type: 'home',
    path: '/',
  };
}

export function getPhenomenonPath(phenomenon: Phenomenon): string {
  return PHENOMENON_SLUGS[phenomenon.id] || `/${phenomenon.id}`;
}

export function navigateTo(path: string) {
  if (typeof window === 'undefined') return;
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
