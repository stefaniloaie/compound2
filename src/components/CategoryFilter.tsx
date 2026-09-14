import React from 'react';
import { 
  Sparkles, Coins, Dna, Cpu, Zap, Users, Globe2, Share2 
} from 'lucide-react';
import { CategoryId, CategoryMeta } from '../types';
import { CATEGORIES } from '../data/phenomena';

interface CategoryFilterProps {
  selectedCategory: CategoryId;
  onSelectCategory: (cat: CategoryId) => void;
  phenomenaCounts: Record<CategoryId, number>;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-3.5 h-3.5" />,
  Coins: <Coins className="w-3.5 h-3.5" />,
  Dna: <Dna className="w-3.5 h-3.5" />,
  Cpu: <Cpu className="w-3.5 h-3.5" />,
  Zap: <Zap className="w-3.5 h-3.5" />,
  Users: <Users className="w-3.5 h-3.5" />,
  Globe2: <Globe2 className="w-3.5 h-3.5" />,
  Share2: <Share2 className="w-3.5 h-3.5" />,
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  phenomenaCounts,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            What Do You Want To Explore?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Select a domain to observe its exponential compounding engine.
          </p>
        </div>
      </div>

      {/* Horizontal pill list */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        {CATEGORIES.map((cat: CategoryMeta) => {
          const isSelected = selectedCategory === cat.id;
          const count = phenomenaCounts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              id={`cat-filter-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-slate-100 text-slate-950 border-white font-semibold shadow-md shadow-white/5'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span className={isSelected ? 'text-slate-950' : cat.color}>
                {ICON_MAP[cat.icon]}
              </span>
              <span>{cat.name}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  isSelected
                    ? 'bg-slate-300 text-slate-900'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
