export interface DailyPuzzle {
  id: number;
  title: string;
  topic: string;
  question: string;
  options: {
    label: string;
    value: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  linearTrap: string;
  exponentialReality: string;
  mathExplanation: string;
  phenomenonIdLink?: string;
}

export const DAILY_PUZZLES: DailyPuzzle[] = [
  {
    id: 1,
    title: 'The Water Lily Lake',
    topic: 'Geometric Doubling',
    question: 'A water lily patch doubles in surface area every single day. If it takes 30 days for the patch to completely cover the entire lake, on which day was the lake only 25% covered?',
    options: [
      {
        label: 'Day 7.5',
        value: '7.5',
        isCorrect: false,
        explanation: 'Day 7.5 is 25% of 30 days — the classic linear trap of dividing time instead of compounding power.',
      },
      {
        label: 'Day 15',
        value: '15',
        isCorrect: false,
        explanation: 'Day 15 is halfway in time, but in doubling, the lake is less than 0.003% covered on Day 15!',
      },
      {
        label: 'Day 28',
        value: '28',
        isCorrect: true,
        explanation: 'Correct! If it covers 100% on Day 30, it covered 50% on Day 29, and exactly 25% on Day 28.',
      },
      {
        label: 'Day 29',
        value: '29',
        isCorrect: false,
        explanation: 'On Day 29 the lake was 50% covered (one day before 100%).',
      },
    ],
    linearTrap: 'Our brains assume coverage scales evenly with days (30 days / 4 = ~7.5 days).',
    exponentialReality: 'For 27 out of 30 days, 87% of the lake still looks completely empty and peaceful. 75% of the total growth occurs in just the final 48 hours.',
    mathExplanation: 'Working backwards: Day 30 = 100% (2⁰). Day 29 = 50% (2⁻¹). Day 28 = 25% (2⁻²).',
    phenomenonIdLink: 'bacteria',
  },
  {
    id: 2,
    title: 'The Doubling Penny vs. $1,000,000',
    topic: 'Compound Wealth',
    question: 'Would you rather receive $1,000,000 upfront today in cash, or a magic penny that doubles in value every day for 30 days?',
    options: [
      {
        label: '$1,000,000 upfront',
        value: '1m',
        isCorrect: false,
        explanation: '$1,000,000 feels huge, but on Day 30 the penny is worth over $5.3 Million!',
      },
      {
        label: 'The Doubling Penny ($5.36M)',
        value: 'penny',
        isCorrect: true,
        explanation: 'Correct! 1¢ × 2²⁹ = $5,368,709.12 on day 30.',
      },
      {
        label: 'They are roughly equal (~$1.1M)',
        value: 'equal',
        isCorrect: false,
        explanation: 'The penny beats $1M by more than 5-fold!',
      },
      {
        label: 'Depends on inflation',
        value: 'inflation',
        isCorrect: false,
        explanation: 'A 536% difference dwarfs any monthly inflation effect.',
      },
    ],
    linearTrap: 'After 10 days, the penny is only worth $5.12. By Day 20, it is only $5,242. It feels hopelessly behind $1M for 70% of the duration.',
    exponentialReality: 'Day 28 reaches $1.34M, Day 29 reaches $2.68M, and Day 30 finishes at $5,368,709.',
    mathExplanation: 'Formula: Final = $0.01 · 2²⁹ = $5,368,709.12. Compounding yields more in the final 2 days ($4M) than in all previous 28 days combined.',
    phenomenonIdLink: 'compound-interest',
  },
  {
    id: 3,
    title: 'Folding Paper to the Moon',
    topic: 'Exponential Scaling',
    question: 'If you take an ordinary sheet of paper (0.1 mm thick) and could fold it in half 42 times, how thick would it become?',
    options: [
      {
        label: 'As tall as a 10-story building (~30 meters)',
        value: 'building',
        isCorrect: false,
        explanation: '30 folds reaches ~100 km (outer space), so 42 folds is vastly further.',
      },
      {
        label: 'Mount Everest height (~8,848 meters)',
        value: 'everest',
        isCorrect: false,
        explanation: 'Everest is crossed in just 27 folds (~13.4 km).',
      },
      {
        label: 'From Earth to the Moon (~384,000 km)',
        value: 'moon',
        isCorrect: true,
        explanation: 'Correct! 0.1 mm × 2⁴² = ~439,804 km, exceeding the distance to the Moon!',
      },
      {
        label: 'Across the Pacific Ocean (~10,000 km)',
        value: 'pacific',
        isCorrect: false,
        explanation: 'Far further — 42 folds surpasses the Moon.',
      },
    ],
    linearTrap: 'Paper feels paper-thin, so 42 seems like a very small number to produce astronomical scales.',
    exponentialReality: 'Each fold multiplies the thickness by 2. 2⁴² is approximately 4.4 trillion times the initial thickness.',
    mathExplanation: '0.0001 m × 2⁴² = 439,804,651 meters = ~439,800 km. Average Earth-Moon distance is 384,400 km.',
    phenomenonIdLink: 'ai-compute',
  },
  {
    id: 4,
    title: 'Warren Buffett’s Secret 99%',
    topic: 'Compound Tenure',
    question: 'Warren Buffett is worth over $130 Billion. What percentage of his lifetime accumulated net worth was generated AFTER his 50th birthday?',
    options: [
      {
        label: 'About 50%',
        value: '50',
        isCorrect: false,
        explanation: 'At age 50, Buffett had ~$300 Million — less than 1% of his current net worth.',
      },
      {
        label: 'About 75%',
        value: '75',
        isCorrect: false,
        explanation: 'Even 75% dramatically underestimates the snowball effect of longevity.',
      },
      {
        label: 'Over 99%',
        value: '99',
        isCorrect: true,
        explanation: 'Correct! Over 99% of his total wealth was accumulated after age 50, and 95%+ after age 65.',
      },
      {
        label: 'About 30%',
        value: '30',
        isCorrect: false,
        explanation: 'His earliest decades were laying the groundwork, but compounding did the heavy lifting late.',
      },
    ],
    linearTrap: 'We assume legendary investors make steady fortunes in their 30s and 40s.',
    exponentialReality: 'Buffett is an extraordinary investor, but his true secret weapon was time. He began investing at age 10 and compounded uninterrupted for 80+ years.',
    mathExplanation: 'If he retired at age 60 with $3 Billion, few people would know his name today. The steep slope of the exponential curve is backloaded.',
    phenomenonIdLink: 'compound-interest',
  },
  {
    id: 5,
    title: 'Bacteria in the Flask at 11:59 AM',
    topic: 'Biological Carrying Capacity',
    question: 'A single bacterium placed in a flask doubles every minute. At exactly 12:00 noon, the flask is 100% completely full. At what time was the flask still 50% empty?',
    options: [
      {
        label: '11:30 AM',
        value: '1130',
        isCorrect: false,
        explanation: 'At 11:30 AM (30 minutes in), the bacteria occupied less than 0.0000001% of the flask.',
      },
      {
        label: '11:45 AM',
        value: '1145',
        isCorrect: false,
        explanation: 'At 11:45 AM, the flask was still over 99.99% empty!',
      },
      {
        label: '11:59 AM',
        value: '1159',
        isCorrect: true,
        explanation: 'Correct! Since it doubles every minute, one minute before noon (11:59 AM) it was 50% full.',
      },
      {
        label: '11:55 AM',
        value: '1155',
        isCorrect: false,
        explanation: 'At 11:55 AM, the flask was only 3.125% full (96.8% empty).',
      },
    ],
    linearTrap: 'If a problem seems invisible at 11:55 AM, linear observers conclude there is plenty of time left.',
    exponentialReality: 'At 11:55 AM (5 minutes before total ecological exhaustion), 96.9% of the flask is still empty space. Warning bells usually sound far too late.',
    mathExplanation: 'Time to exhaustion: 12:00 = 100%, 11:59 = 50%, 11:58 = 25%, 11:57 = 12.5%, 11:56 = 6.25%, 11:55 = 3.125%.',
    phenomenonIdLink: 'bacteria',
  },
  {
    id: 6,
    title: 'The Silent Thief: 3.5% Inflation',
    topic: 'Exponential Decay',
    question: 'If annual inflation averages 3.5% per year, how many years does it take for your cash savings to lose half (50%) of their real purchasing power?',
    options: [
      {
        label: 'About 10 years',
        value: '10',
        isCorrect: false,
        explanation: 'In 10 years at 3.5%, cash loses ~29% of value, not 50%.',
      },
      {
        label: 'About 20 years',
        value: '20',
        isCorrect: true,
        explanation: 'Correct! By the Rule of 70 (70 / 3.5 = 20), purchasing power halves every 20 years.',
      },
      {
        label: 'About 35 years',
        value: '35',
        isCorrect: false,
        explanation: 'In 35 years, cash has lost ~70% of purchasing power.',
      },
      {
        label: 'About 50 years',
        value: '50',
        isCorrect: false,
        explanation: 'In 50 years, $100 buys what $17 bought initially.',
      },
    ],
    linearTrap: '3.5% sounds tiny — like pocket change that you would barely notice in daily groceries.',
    exponentialReality: 'Compounded over a typical 40-year working career, two doubling/halving cycles occur: your cash purchasing power shrinks to 25% of its initial value.',
    mathExplanation: 'Rule of 70 / 72: Doubling or halving time T ≈ 70 / r. 70 / 3.5% = 20.0 years. (1 - 0.035)²⁰ = 0.490 (~49%).',
    phenomenonIdLink: 'inflation-halving',
  },
  {
    id: 7,
    title: 'Solar PV: The 22-Year Miracle',
    topic: 'Wright’s Law & Energy',
    question: 'In 2004, the entire world had roughly 3 Gigawatts (GW) of solar PV capacity. In 2024, what was the total installed capacity?',
    options: [
      {
        label: 'Around 50 GW (16× growth)',
        value: '50',
        isCorrect: false,
        explanation: '50 GW was already surpassed by 2011.',
      },
      {
        label: 'Around 250 GW (80× growth)',
        value: '250',
        isCorrect: false,
        explanation: '250 GW was reached in 2016.',
      },
      {
        label: 'Over 2,000 GW (650× growth)',
        value: '2000',
        isCorrect: true,
        explanation: 'Correct! Solar crossed 2,000 GW in 2024, growing over 650-fold in 20 years.',
      },
      {
        label: 'Around 800 GW (260× growth)',
        value: '800',
        isCorrect: false,
        explanation: '800 GW was crossed in 2021.',
      },
    ],
    linearTrap: 'Energy agencies consistently predicted linear adoption curves that undershot real deployment by 400% to 800%.',
    exponentialReality: 'Solar follows Swanson’s Law: every doubling of cumulative manufactured volume reduces module cost by ~20%, fueling an accelerating adoption cycle.',
    mathExplanation: 'Capacity compounded at an annualized CAGR of ~28.5% for two full decades: 3 GW × (1 + 0.285)²⁰ ≈ 2,050 GW.',
    phenomenonIdLink: 'solar-energy',
  },
  {
    id: 8,
    title: 'Global Debt Outgrowing the World',
    topic: 'Leverage Compounding',
    question: 'Global debt reached $315 Trillion in 2024. How does this compare to the total annual economic production (Gross Domestic Product) of all countries combined ($105 Trillion)?',
    options: [
      {
        label: 'Debt is roughly equal to Global GDP (100%)',
        value: '100',
        isCorrect: false,
        explanation: 'Debt surpassed 100% of global GDP decades ago.',
      },
      {
        label: 'Debt is roughly 200% of Global GDP',
        value: '200',
        isCorrect: false,
        explanation: '200% was passed in the early 2000s.',
      },
      {
        label: 'Debt is 333% of Global GDP (3.3× total world output)',
        value: '333',
        isCorrect: true,
        explanation: 'Correct! Global liabilities ($315T) are more than 3 times greater than everything produced on Earth in an entire year ($105T).',
      },
      {
        label: 'Debt is 500% of Global GDP',
        value: '500',
        isCorrect: false,
        explanation: 'Not 500% yet globally, though Japan has crossed 260% sovereign debt-to-GDP.',
      },
    ],
    linearTrap: 'People expect borrowing to be tightly bounded by income or collateral.',
    exponentialReality: 'When borrowing interest rate exceeds economic output growth rate (r > g), refinancing requires issuing more debt just to pay interest on old debt.',
    mathExplanation: '$315 Trillion / $105 Trillion = 300% to 333%. At an average 4% interest rate, global interest payments alone consume ~$12.6 Trillion every single year.',
    phenomenonIdLink: 'global-debt',
  },
  {
    id: 9,
    title: 'AI Frontier Compute: 5-Month Doubling',
    topic: 'Technological Hyper-Scaling',
    question: 'Between 2012 (AlexNet) and 2024 (GPT-4 / Gemini Ultra), how many times did the training compute of leading frontier AI models multiply?',
    options: [
      {
        label: 'About 1,000 times',
        value: '1000',
        isCorrect: false,
        explanation: 'AlexNet was ~10¹⁷ FLOPs. Frontier models now exceed 10²⁵ FLOPs.',
      },
      {
        label: 'About 100,000 times',
        value: '100000',
        isCorrect: false,
        explanation: 'Still far too small for a 5-month doubling cadence.',
      },
      {
        label: 'Over 100,000,000 times (100 Million-fold)',
        value: '100m',
        isCorrect: true,
        explanation: 'Correct! Training compute grew from ~10¹⁷ FLOPs to ~10²⁵+ FLOPs — an increase of over 100 million-fold in 12 years.',
      },
      {
        label: 'About 10,000 times',
        value: '10000',
        isCorrect: false,
        explanation: 'Standard Moore’s law would yield ~64× in 12 years, but AI compute expanded by specialized clustering.',
      },
    ],
    linearTrap: 'We are used to Moore’s Law (doubling every 18-24 months). A 5-month doubling speed defies intuition.',
    exponentialReality: 'In 12 years with a 5-month doubling period, there are nearly 29 doublings: 2²⁹ ≈ 536 million times!',
    mathExplanation: '2²⁹ = 536,870,912. The explosion was driven by both hardware (GPUs/TPUs) and immense capital clustering ($100M+ clusters).',
    phenomenonIdLink: 'ai-compute',
  },
  {
    id: 10,
    title: 'The Emperor’s Rice on a Chessboard',
    topic: 'Ancient Compounding Lore',
    question: 'The inventor of chess asked the Emperor for 1 grain of rice on square 1, 2 grains on square 2, 4 on square 3, doubling on each of the 64 squares. How much rice does square 64 alone hold?',
    options: [
      {
        label: 'About 1 truckload (~10 tons)',
        value: 'truck',
        isCorrect: false,
        explanation: '10 tons is crossed around square 30.',
      },
      {
        label: 'Enough to fill an Olympic swimming pool',
        value: 'pool',
        isCorrect: false,
        explanation: 'A swimming pool is passed around square 40.',
      },
      {
        label: 'More than 1,000 times the entire world’s annual rice harvest',
        value: 'world',
        isCorrect: true,
        explanation: 'Correct! 2⁶³ grains weighs over 460 Billion metric tons — exceeding 1,000 years of global rice production.',
      },
      {
        label: 'About the cargo capacity of the world’s largest container ship',
        value: 'ship',
        isCorrect: false,
        explanation: 'A container ship holds ~200,000 tons. 2⁶³ grains is over 460 Billion tons.',
      },
    ],
    linearTrap: 'The first row of the chessboard holds only 255 grains of rice — barely a teaspoon. The Emperor agreed without calculating.',
    exponentialReality: 'By square 32 (halfway), it was 4 billion grains (~100 tons). The entire second half of the chessboard bankrupts the planet.',
    mathExplanation: 'Total grains = 2⁶⁴ - 1 ≈ 1.84 × 10¹⁹ grains. At ~0.025 grams per grain, total mass exceeds 460 Billion tonnes. Annual world rice crop is ~0.5 Billion tonnes.',
    phenomenonIdLink: 'compound-interest',
  },
];

export function getTodayPuzzle(): { puzzle: DailyPuzzle; dayNumber: number } {
  // Epoch anchored to 2026-01-01
  const epoch = new Date('2026-01-01T00:00:00Z').getTime();
  const now = Date.now();
  const dayNumber = Math.max(1, Math.floor((now - epoch) / (1000 * 60 * 60 * 24)) + 1);
  const puzzleIndex = (dayNumber - 1) % DAILY_PUZZLES.length;
  return {
    puzzle: DAILY_PUZZLES[puzzleIndex],
    dayNumber,
  };
}
