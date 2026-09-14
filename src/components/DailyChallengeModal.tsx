import React, { useState, useEffect } from 'react';
import { X, Sparkles, Flame, CheckCircle2, AlertCircle, Share2, ArrowRight, Clock, Trophy, HelpCircle } from 'lucide-react';
import { getTodayPuzzle, DailyPuzzle } from '../data/dailyPuzzles';

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPhenomenon?: (phenomenonId: string) => void;
}

interface UserProgress {
  lastCompletedDay: number;
  streak: number;
  bestStreak: number;
  totalSolved: number;
  selectedOptionIndex?: number;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  isOpen,
  onClose,
  onNavigateToPhenomenon,
}) => {
  const { puzzle, dayNumber } = getTodayPuzzle();

  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem('compound_daily_progress');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return {
      lastCompletedDay: -1,
      streak: 0,
      bestStreak: 0,
      totalSolved: 0,
    };
  });

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');

  const isAlreadySolvedToday = progress.lastCompletedDay === dayNumber;

  // Initialize selected option if solved today
  useEffect(() => {
    if (isAlreadySolvedToday && progress.selectedOptionIndex !== undefined) {
      setSelectedIdx(progress.selectedOptionIndex);
    } else if (!isAlreadySolvedToday) {
      setSelectedIdx(null);
    }
  }, [isAlreadySolvedToday, progress.selectedOptionIndex, dayNumber]);

  // Countdown timer to midnight UTC
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setUTCHours(24, 0, 0, 0);
      const diffMs = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
      setTimeLeftStr(`${hours}h ${mins}m ${secs}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectOption = (idx: number) => {
    if (selectedIdx !== null || isAlreadySolvedToday) return;

    setSelectedIdx(idx);
    const chosen = puzzle.options[idx];
    const wasCorrect = chosen.isCorrect;

    const newStreak = wasCorrect
      ? (progress.lastCompletedDay === dayNumber - 1 ? progress.streak + 1 : 1)
      : 0;

    const updated: UserProgress = {
      lastCompletedDay: dayNumber,
      streak: newStreak,
      bestStreak: Math.max(progress.bestStreak, newStreak),
      totalSolved: wasCorrect ? progress.totalSolved + 1 : progress.totalSolved,
      selectedOptionIndex: idx,
    };

    setProgress(updated);
    try {
      localStorage.setItem('compound_daily_progress', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleShareResult = async () => {
    const chosen = selectedIdx !== null ? puzzle.options[selectedIdx] : null;
    const isCorrect = chosen?.isCorrect;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://compound.world';

    const shareText = `🧠 COMPOUND Daily Intuition #${dayNumber}
${isCorrect ? '✅ Solved correctly!' : '💡 Learned something new!'}
🔥 Current Streak: ${progress.streak} days
"${puzzle.title}" — Test your linear vs exponential intuition:
${origin}`;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    } catch {
      // fallback
    }
  };

  const selectedOption = selectedIdx !== null ? puzzle.options[selectedIdx] : null;
  const isAnswered = selectedIdx !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-emerald-500/5 text-slate-100 p-5 sm:p-7 space-y-6">
        {/* Header with Title & Streak */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold tracking-wider uppercase">
                Daily Intuition #{dayNumber}
              </span>
              <span className="text-xs font-mono text-slate-400">{puzzle.topic}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {puzzle.title}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Streak indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 font-mono text-xs font-bold" title={`Current streak: ${progress.streak} days`}>
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{progress.streak}</span>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Question Prompt */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>The 60-Second Challenge</span>
          </div>
          <p className="text-sm sm:text-base text-slate-200 font-sans leading-relaxed">
            {puzzle.question}
          </p>
        </div>

        {/* 4 Multiple Choice Options */}
        <div className="space-y-2.5">
          {puzzle.options.map((option, idx) => {
            const isSelected = selectedIdx === idx;
            let btnStyle = 'border-slate-800 bg-slate-950/40 hover:bg-slate-800/60 text-slate-200 hover:border-slate-700';

            if (isAnswered) {
              if (option.isCorrect) {
                btnStyle = 'border-emerald-500/80 bg-emerald-950/40 text-emerald-300 font-semibold shadow-sm shadow-emerald-500/10';
              } else if (isSelected && !option.isCorrect) {
                btnStyle = 'border-rose-500/80 bg-rose-950/40 text-rose-300';
              } else {
                btnStyle = 'border-slate-800/50 bg-slate-950/20 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-sans transition-all flex items-center justify-between gap-3 ${btnStyle} ${!isAnswered ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-800/80 border border-slate-700/60 font-mono text-xs flex items-center justify-center font-bold text-slate-300 shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option.label}</span>
                </div>

                {isAnswered && option.isCorrect && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                {isAnswered && isSelected && !option.isCorrect && (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Revealed Breakdown after selection */}
        {isAnswered && selectedOption && (
          <div className="space-y-4 pt-2 animate-fadeIn">
            {/* Outcome Banner */}
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${selectedOption.isCorrect ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-rose-950/40 border-rose-500/40 text-rose-200'}`}>
              {selectedOption.isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
                <div className="font-bold font-mono uppercase tracking-wider">
                  {selectedOption.isCorrect ? 'Superb Intuition!' : 'The Linear Intuition Trap'}
                </div>
                <div>{selectedOption.explanation}</div>
              </div>
            </div>

            {/* Cognitive Contrast: Linear Trap vs Exponential Reality */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
                <span className="text-amber-400 uppercase tracking-wider font-semibold block text-[10px]">The Linear Trap</span>
                <p className="text-slate-300 leading-relaxed">{puzzle.linearTrap}</p>
              </div>
              <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
                <span className="text-cyan-400 uppercase tracking-wider font-semibold block text-[10px]">Exponential Reality</span>
                <p className="text-slate-300 leading-relaxed">{puzzle.exponentialReality}</p>
              </div>
            </div>

            {/* Formula note */}
            <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400">
              <span className="text-emerald-400 font-bold mr-1.5">The Math:</span>
              <span>{puzzle.mathExplanation}</span>
            </div>

            {/* Actions: Share Result & Link to Phenomenon */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareResult}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/10 active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedToast ? 'Copied to Clipboard!' : 'Share Your Result'}</span>
                </button>

                {puzzle.phenomenonIdLink && onNavigateToPhenomenon && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToPhenomenon(puzzle.phenomenonIdLink!);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Inspect Simulation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Next Challenge Countdown */}
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Next challenge in {timeLeftStr}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer info when not answered */}
        {!isAnswered && (
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1 border-t border-slate-800/60">
            <span>A new empirical curve puzzle unlocks every 24 hours</span>
            <span>Takes &lt; 60 seconds</span>
          </div>
        )}
      </div>
    </div>
  );
};
