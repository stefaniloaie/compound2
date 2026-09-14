import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, FastForward, Sparkles, PlusCircle, Activity, AlertTriangle } from 'lucide-react';
import { SimulationType } from '../types';

export interface SimulationCanvasProps {
  type?: SimulationType;
  simulationType?: SimulationType;
  title?: string;
  accentColor?: string;
  growthRateText?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  generation: number;
  age: number;
  splitTimer: number;
  pulsePhase: number;
}

interface GridCell {
  x: number;
  y: number;
  w: number;
  h: number;
  active: boolean;
  generation: number;
}

interface NetworkNode {
  x: number;
  y: number;
  layer: number;
  connections: number[];
}

interface NetworkPulse {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number;
  speed: number;
}

interface ClickRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  color: string;
}

interface DebtBlock {
  id: number;
  sector: number; // 0: Sovereign, 1: Corporate, 2: Financial, 3: Household
  valueTrillion: number;
  x: number;
  y: number;
  targetY: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  isLanded: boolean;
  squash: number; // 1 = normal, 0.7 = compressed on landing
  label: string;
}

interface DebtArcParticle {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  progress: number;
  speed: number;
  color: string;
}

interface HudMetrics {
  count: number;
  generation: number;
  nutrient: number;
  fps: number;
  debtTotalTrillion?: number;
  debtRatio?: number;
  debtAnnualInterest?: number;
}

const DEBT_SECTORS = [
  { name: 'Sovereign (Gov)', shortName: 'Gov', color: '#f59e0b', share: 0.33, desc: 'Treasuries & Deficits' },
  { name: 'Corporate Credit', shortName: 'Corp', color: '#fb923c', share: 0.28, desc: 'Bonds & Commercial' },
  { name: 'Financial Sector', shortName: 'Bank', color: '#818cf8', share: 0.21, desc: 'Interbank Liabilities' },
  { name: 'Household Debt', shortName: 'House', color: '#f43f5e', share: 0.18, desc: 'Mortgages & Consumer' },
];

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  type,
  simulationType,
  title = 'Simulation',
  accentColor = '#10b981',
  growthRateText,
}) => {
  const rawType: SimulationType = type || simulationType || 'bacteria-petri';

  // Dedicated check: if type is debt-accumulation OR if the title refers to Debt, trigger the debt engine
  const isDebtMode =
    rawType === 'debt-accumulation' ||
    (title && title.toLowerCase().includes('debt'));

  const activeType: SimulationType = isDebtMode ? 'debt-accumulation' : rawType;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [hudMetrics, setHudMetrics] = useState<HudMetrics>({
    count: 2,
    generation: 1,
    nutrient: 100,
    fps: 60,
    debtTotalTrillion: 315,
    debtRatio: 300,
    debtAnnualInterest: 18.2,
  });
  const [interactionHint, setInteractionHint] = useState<string>('');

  // Visibility flag for IntersectionObserver & Page Visibility API
  const isVisibleRef = useRef<boolean>(true);
  const isRunningRef = useRef<boolean>(true);
  isRunningRef.current = isRunning;

  const speedRef = useRef<number>(1);
  speedRef.current = speedMultiplier;

  // Mutable state for physics & rendering (zero React re-renders during loop)
  const simState = useRef<{
    width: number;
    height: number;
    dpr: number;
    particles: Particle[];
    gridCells: GridCell[];
    networkNodes: NetworkNode[];
    pulses: NetworkPulse[];
    ripples: ClickRipple[];
    debtBlocks: DebtBlock[];
    debtArcs: DebtArcParticle[];
    debtNextSpawnTimer: number;
    debtCompoundingCycle: number;
    generation: number;
    maxCapacity: number;
    nutrient: number;
    lastFrameTime: number;
    frameCount: number;
    fpsCounterTimer: number;
    lastHudUpdate: number;
    measuredFps: number;
    initialized: boolean;
  }>({
    width: 600,
    height: 360,
    dpr: 1,
    particles: [],
    gridCells: [],
    networkNodes: [],
    pulses: [],
    ripples: [],
    debtBlocks: [],
    debtArcs: [],
    debtNextSpawnTimer: 45,
    debtCompoundingCycle: 1,
    generation: 1,
    maxCapacity: 100,
    nutrient: 100,
    lastFrameTime: performance.now(),
    frameCount: 0,
    fpsCounterTimer: performance.now(),
    lastHudUpdate: performance.now(),
    measuredFps: 60,
    initialized: false,
  });

  // Re-seed simulation entities
  const initEntities = useCallback((simType: SimulationType, w: number, h: number) => {
    const state = simState.current;
    state.generation = 1;
    state.ripples = [];
    state.pulses = [];
    state.debtBlocks = [];
    state.debtArcs = [];
    state.debtNextSpawnTimer = 40;
    state.debtCompoundingCycle = 1;

    const safeW = Math.max(w, 280);
    const safeH = Math.max(h, 180);

    if (simType === 'debt-accumulation') {
      // 4 sector columns of debt liabilities towering over bedrock productive GDP
      const margin = Math.max(24, Math.floor(safeW * 0.08));
      const availW = safeW - margin * 2;
      const colW = Math.min(88, Math.max(50, Math.floor((availW - 3 * 16) / 4)));
      const colSpacing = (availW - colW * 4) / 3;
      const gdpY = safeH - 46;
      const blockH = 14;

      const initialBlocks: DebtBlock[] = [];
      let blockId = 1;

      // Seed baseline Year 2000 distribution (~$87 Trillion total = ~18 blocks of $5T each)
      // Sector counts: Gov: 6, Corp: 5, Bank: 4, House: 3
      const sectorCounts = [6, 5, 4, 3];
      const sectorLabels = ['US/EU Sov. Bond', 'Corp Syndicated', 'Interbank Repo', 'Mortgages 30Y'];

      for (let s = 0; s < 4; s++) {
        const colX = margin + s * (colW + colSpacing);
        const count = sectorCounts[s];
        for (let k = 0; k < count; k++) {
          const targetY = gdpY - (k + 1) * (blockH + 2);
          initialBlocks.push({
            id: blockId++,
            sector: s,
            valueTrillion: 5,
            x: colX,
            y: targetY,
            targetY: targetY,
            vy: 0,
            width: colW,
            height: blockH,
            color: DEBT_SECTORS[s].color,
            isLanded: true,
            squash: 1.0,
            label: sectorLabels[s],
          });
        }
      }

      state.debtBlocks = initialBlocks;
      state.maxCapacity = 72; // max ~72 blocks = $440 Trillion towering pile
      state.particles = [];
      setInteractionHint('Click columns to issue new bond tranches · Watch interest obligations compound');
    } else if (simType === 'bacteria-petri') {
      state.particles = [
        {
          x: safeW / 2 - 14,
          y: safeH / 2,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
          size: 7.5,
          color: '#14b8a6',
          generation: 1,
          age: 0,
          splitTimer: 80,
          pulsePhase: 0,
        },
        {
          x: safeW / 2 + 14,
          y: safeH / 2,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
          size: 7.5,
          color: '#2dd4bf',
          generation: 1,
          age: 0,
          splitTimer: 110,
          pulsePhase: Math.PI / 2,
        },
      ];
      state.maxCapacity = 90;
      state.nutrient = 100;
      setInteractionHint('Click petri dish to add nutrient drops & seed bacteria');
    } else if (simType === 'money-flow') {
      // Compound interest capital flow with robust continuous fluid circulation
      const initialCoins: Particle[] = [];
      for (let i = 0; i < 4; i++) {
        initialCoins.push({
          x: safeW / 2 + (i - 1.5) * 25,
          y: safeH - 85,
          vx: (Math.random() - 0.5) * 2.5,
          vy: -3.5 - Math.random() * 2,
          size: 6,
          color: '#10b981',
          generation: 1,
          age: 0,
          splitTimer: 35 + i * 20,
          pulsePhase: Math.random() * Math.PI,
        });
      }
      state.particles = initialCoins;
      state.maxCapacity = 100;
      setInteractionHint('Click reservoir to deposit new compounding capital');
    } else if (simType === 'solar-grid') {
      const cols = 18;
      const rows = 10;
      const margin = 16;
      const cellW = (safeW - margin * 2) / cols;
      const cellH = (safeH - margin * 2) / rows;
      const cells: GridCell[] = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const isProgenitor = r === Math.floor(rows / 2) && (c === Math.floor(cols / 2) || c === Math.floor(cols / 2) + 1);
          cells.push({
            x: margin + c * cellW,
            y: margin + r * cellH,
            w: cellW,
            h: cellH,
            active: isProgenitor,
            generation: isProgenitor ? 1 : 0,
          });
        }
      }
      state.gridCells = cells;
      state.particles = [];
      state.maxCapacity = cols * rows;
      setInteractionHint('Click grid cells to install photovoltaic arrays & trigger cascade');
    } else if (simType === 'network-nodes') {
      const rootX = safeW / 2;
      const rootY = safeH / 2;
      state.networkNodes = [
        { x: rootX, y: rootY, layer: 0, connections: [1, 2] },
        { x: rootX - 45, y: rootY - 25, layer: 1, connections: [0] },
        { x: rootX + 45, y: rootY + 25, layer: 1, connections: [0] },
      ];
      state.particles = [];
      state.maxCapacity = 45;
      setInteractionHint('Click canvas to deploy interconnected network nodes');
    } else if (simType === 'co2-atmosphere') {
      const initialCO2: Particle[] = [];
      for (let i = 0; i < 15; i++) {
        initialCO2.push({
          x: Math.random() * safeW,
          y: safeH - 50 - Math.random() * (safeH - 100),
          vx: (Math.random() - 0.5) * 1.0,
          vy: (Math.random() - 0.5) * 0.7,
          size: 4 + Math.random() * 2,
          color: '#f43f5e',
          generation: 1,
          age: 0,
          splitTimer: 70,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
      state.particles = initialCO2;
      state.maxCapacity = 75;
      setInteractionHint('Click to emit industrial greenhouse forcing particles');
    } else if (simType === 'population-cluster') {
      const initialPop: Particle[] = [];
      const centerX = safeW / 2;
      const centerY = safeH / 2;
      for (let i = 0; i < 6; i++) {
        initialPop.push({
          x: centerX + (Math.random() - 0.5) * 35,
          y: centerY + (Math.random() - 0.5) * 35,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          size: 4.5,
          color: '#8b5cf6',
          generation: 1,
          age: 0,
          splitTimer: 80,
          pulsePhase: Math.random() * Math.PI,
        });
      }
      state.particles = initialPop;
      state.maxCapacity = 80;
      setInteractionHint('Click to seed new demographic generational clusters');
    } else {
      // inflation-decay
      const coins: Particle[] = [];
      const cols = 12;
      const rows = 5;
      const startX = Math.max(25, (safeW - cols * 32) / 2);
      const startY = Math.max(35, (safeH - rows * 32) / 2);

      for (let i = 0; i < 60; i++) {
        const c = i % cols;
        const r = Math.floor(i / cols);
        coins.push({
          x: startX + c * 32,
          y: startY + r * 32,
          vx: (Math.random() - 0.5) * 0.1,
          vy: (Math.random() - 0.5) * 0.1,
          size: 7.5,
          color: '#eab308',
          generation: 1,
          age: 0,
          splitTimer: 0,
          pulsePhase: 0,
        });
      }
      state.particles = coins;
      state.maxCapacity = 60;
      setInteractionHint('Click canvas to inject fresh currency units against inflation');
    }

    state.initialized = true;

    // Instant HUD sync
    const totalDebt = 87 + state.debtBlocks.length * 5;
    const debtRatio = Math.round((totalDebt / 105) * 100);
    const debtInterest = Number(((totalDebt * 0.058)).toFixed(1));

    setHudMetrics({
      count:
        simType === 'debt-accumulation'
          ? state.debtBlocks.length
          : simType === 'solar-grid'
          ? state.gridCells.filter(c => c.active).length
          : simType === 'network-nodes'
          ? state.networkNodes.length
          : state.particles.length,
      generation: 1,
      nutrient: state.nutrient,
      fps: 60,
      debtTotalTrillion: totalDebt,
      debtRatio: debtRatio,
      debtAnnualInterest: debtInterest,
    });
  }, []);

  // Helper: spawn a falling debt block into a specific sector
  const spawnDebtBlock = useCallback((sectorIdx: number, w: number, h: number) => {
    const state = simState.current;
    if (state.debtBlocks.length >= state.maxCapacity) return;

    const margin = Math.max(24, Math.floor(w * 0.08));
    const availW = w - margin * 2;
    const colW = Math.min(88, Math.max(50, Math.floor((availW - 3 * 16) / 4)));
    const colSpacing = (availW - colW * 4) / 3;
    const gdpY = h - 46;
    const blockH = 14;

    const s = Math.max(0, Math.min(3, sectorIdx));
    const colX = margin + s * (colW + colSpacing);

    // Find current landed stack height in this sector
    const sectorBlocks = state.debtBlocks.filter(b => b.sector === s && b.isLanded);
    const stackHeight = sectorBlocks.length;
    const targetY = gdpY - (stackHeight + 1) * (blockH + 2);

    const labels = [
      'Treasury +$5T',
      'Corp Note +$5T',
      'Bank Liab. +$5T',
      'Mortgage +$5T',
    ];

    state.debtBlocks.push({
      id: Date.now() + Math.random(),
      sector: s,
      valueTrillion: 5,
      x: colX,
      y: -20 - Math.random() * 30,
      targetY: targetY,
      vy: 3.2 + Math.random() * 2.0,
      width: colW,
      height: blockH,
      color: DEBT_SECTORS[s].color,
      isLanded: false,
      squash: 1.0,
      label: labels[s],
    });
  }, []);

  // Reset handler
  const resetSimulation = useCallback(() => {
    const state = simState.current;
    initEntities(activeType, state.width, state.height);
  }, [activeType, initEntities]);

  // Burst / Add Seed handler
  const triggerBurst = useCallback(() => {
    const state = simState.current;
    const w = state.width;
    const h = state.height;

    state.ripples.push({
      x: w / 2,
      y: h / 2,
      radius: 4,
      maxRadius: Math.min(w, h) / 2,
      opacity: 1,
      color: accentColor || '#10b981',
    });

    if (activeType === 'debt-accumulation') {
      // Injects multi-tranche emergency stimulus across sectors
      for (let s = 0; s < 4; s++) {
        spawnDebtBlock(s, w, h);
      }
      state.debtCompoundingCycle += 1;
      state.generation = state.debtCompoundingCycle;
    } else if (activeType === 'bacteria-petri') {
      const newB: Particle[] = [];
      for (let i = 0; i < 4; i++) {
        if (state.particles.length + newB.length < state.maxCapacity) {
          newB.push({
            x: w / 2 + (Math.random() - 0.5) * 30,
            y: h / 2 + (Math.random() - 0.5) * 30,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            size: 7.5,
            color: '#2dd4bf',
            generation: state.generation + 1,
            age: 0,
            splitTimer: 60,
            pulsePhase: Math.random() * Math.PI,
          });
        }
      }
      state.particles.push(...newB);
      state.generation += 1;
    } else if (activeType === 'money-flow') {
      const newCoins: Particle[] = [];
      for (let i = 0; i < 6; i++) {
        if (state.particles.length + newCoins.length < state.maxCapacity) {
          newCoins.push({
            x: w / 2 + (Math.random() - 0.5) * 80,
            y: h - 70,
            vx: (Math.random() - 0.5) * 3,
            vy: -4 - Math.random() * 2.5,
            size: 6,
            color: '#10b981',
            generation: state.generation + 1,
            age: 0,
            splitTimer: 40,
            pulsePhase: 0,
          });
        }
      }
      state.particles.push(...newCoins);
      state.generation += 1;
    } else if (activeType === 'solar-grid') {
      const inactive = state.gridCells.filter(c => !c.active);
      const toAct = Math.min(inactive.length, 6);
      for (let i = 0; i < toAct; i++) {
        const target = inactive[Math.floor(Math.random() * inactive.length)];
        if (target) target.active = true;
      }
      state.generation += 1;
    } else if (activeType === 'network-nodes') {
      if (state.networkNodes.length < state.maxCapacity && state.networkNodes.length > 0) {
        const parentIdx = Math.floor(Math.random() * state.networkNodes.length);
        const parent = state.networkNodes[parentIdx];
        const newIdx = state.networkNodes.length;
        const angle = Math.random() * Math.PI * 2;
        const dist = 30 + Math.random() * 35;
        const newNode: NetworkNode = {
          x: Math.max(25, Math.min(w - 25, parent.x + Math.cos(angle) * dist)),
          y: Math.max(25, Math.min(h - 25, parent.y + Math.sin(angle) * dist)),
          layer: parent.layer + 1,
          connections: [parentIdx],
        };
        parent.connections.push(newIdx);
        state.networkNodes.push(newNode);
        state.generation += 1;
      }
    } else if (activeType === 'co2-atmosphere') {
      for (let i = 0; i < 5; i++) {
        if (state.particles.length < state.maxCapacity) {
          state.particles.push({
            x: Math.random() * w,
            y: h - 50,
            vx: (Math.random() - 0.5) * 1.2,
            vy: -1.2 - Math.random() * 1.2,
            size: 4.5,
            color: '#f43f5e',
            generation: state.generation + 1,
            age: 0,
            splitTimer: 50,
            pulsePhase: 0,
          });
        }
      }
      state.generation += 1;
    } else if (activeType === 'population-cluster') {
      for (let i = 0; i < 4; i++) {
        if (state.particles.length < state.maxCapacity) {
          state.particles.push({
            x: w / 2 + (Math.random() - 0.5) * 60,
            y: h / 2 + (Math.random() - 0.5) * 60,
            vx: (Math.random() - 0.5) * 0.9,
            vy: (Math.random() - 0.5) * 0.9,
            size: 4.5,
            color: '#a78bfa',
            generation: state.generation + 1,
            age: 0,
            splitTimer: 70,
            pulsePhase: 0,
          });
        }
      }
      state.generation += 1;
    } else {
      for (let i = 0; i < 8; i++) {
        if (state.particles.length < 60) {
          state.particles.push({
            x: 35 + Math.random() * (w - 70),
            y: 35 + Math.random() * (h - 70),
            vx: (Math.random() - 0.5) * 0.1,
            vy: (Math.random() - 0.5) * 0.1,
            size: 7.5,
            color: '#facc15',
            generation: 1,
            age: 0,
            splitTimer: 0,
            pulsePhase: 0,
          });
        }
      }
    }
  }, [accentColor, activeType, spawnDebtBlock]);

  // Canvas Click / Touch Handler
  const handleCanvasInteraction = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const state = simState.current;
    const w = state.width;
    const h = state.height;

    state.ripples.push({
      x: clickX,
      y: clickY,
      radius: 3,
      maxRadius: 35,
      opacity: 1,
      color: accentColor || '#10b981',
    });

    if (activeType === 'debt-accumulation') {
      // Find sector closest to clickX
      const margin = Math.max(24, Math.floor(w * 0.08));
      const availW = w - margin * 2;
      const colW = Math.min(88, Math.max(50, Math.floor((availW - 3 * 16) / 4)));
      const colSpacing = (availW - colW * 4) / 3;

      let closestSector = 0;
      let minSectorDist = 999999;
      for (let s = 0; s < 4; s++) {
        const colCenterX = margin + s * (colW + colSpacing) + colW / 2;
        const dist = Math.abs(clickX - colCenterX);
        if (dist < minSectorDist) {
          minSectorDist = dist;
          closestSector = s;
        }
      }

      spawnDebtBlock(closestSector, w, h);
    } else if (activeType === 'bacteria-petri') {
      const newCells: Particle[] = [];
      for (let i = 0; i < 2; i++) {
        if (state.particles.length + newCells.length < state.maxCapacity) {
          newCells.push({
            x: clickX + (Math.random() - 0.5) * 10,
            y: clickY + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 1.2,
            vy: (Math.random() - 0.5) * 1.2,
            size: 7.5,
            color: '#2dd4bf',
            generation: state.generation + 1,
            age: 0,
            splitTimer: 70,
            pulsePhase: Math.random() * Math.PI,
          });
        }
      }
      if (newCells.length > 0) state.particles.push(...newCells);
    } else if (activeType === 'money-flow') {
      const newCoins: Particle[] = [];
      for (let i = 0; i < 4; i++) {
        if (state.particles.length + newCoins.length < state.maxCapacity) {
          newCoins.push({
            x: clickX + (Math.random() - 0.5) * 20,
            y: clickY,
            vx: (Math.random() - 0.5) * 3,
            vy: -3.5 - Math.random() * 2,
            size: 6,
            color: '#10b981',
            generation: state.generation + 1,
            age: 0,
            splitTimer: 35,
            pulsePhase: 0,
          });
        }
      }
      if (newCoins.length > 0) state.particles.push(...newCoins);
    } else if (activeType === 'solar-grid') {
      for (const cell of state.gridCells) {
        if (
          clickX >= cell.x &&
          clickX <= cell.x + cell.w &&
          clickY >= cell.y &&
          clickY <= cell.y + cell.h
        ) {
          cell.active = true;
          break;
        }
      }
    } else if (activeType === 'network-nodes') {
      if (state.networkNodes.length < state.maxCapacity && state.networkNodes.length > 0) {
        let closestIdx = 0;
        let minDist = 999999;
        state.networkNodes.forEach((n, idx) => {
          const d = Math.hypot(n.x - clickX, n.y - clickY);
          if (d < minDist) {
            minDist = d;
            closestIdx = idx;
          }
        });

        const newNodeIdx = state.networkNodes.length;
        const newNode: NetworkNode = {
          x: clickX,
          y: clickY,
          layer: (state.networkNodes[closestIdx]?.layer || 0) + 1,
          connections: [closestIdx],
        };
        state.networkNodes[closestIdx]?.connections.push(newNodeIdx);
        state.networkNodes.push(newNode);
      }
    } else if (activeType === 'co2-atmosphere') {
      for (let i = 0; i < 3; i++) {
        if (state.particles.length < state.maxCapacity) {
          state.particles.push({
            x: clickX + (Math.random() - 0.5) * 12,
            y: clickY + (Math.random() - 0.5) * 12,
            vx: (Math.random() - 0.5) * 1.2,
            vy: -1 - Math.random() * 1.2,
            size: 4.5,
            color: '#f43f5e',
            generation: state.generation,
            age: 0,
            splitTimer: 50,
            pulsePhase: 0,
          });
        }
      }
    } else if (activeType === 'population-cluster') {
      for (let i = 0; i < 2; i++) {
        if (state.particles.length < state.maxCapacity) {
          state.particles.push({
            x: clickX + (Math.random() - 0.5) * 15,
            y: clickY + (Math.random() - 0.5) * 15,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            size: 4.5,
            color: '#8b5cf6',
            generation: state.generation,
            age: 0,
            splitTimer: 70,
            pulsePhase: 0,
          });
        }
      }
    } else if (activeType === 'inflation-decay') {
      for (let i = 0; i < 3; i++) {
        if (state.particles.length < 60) {
          state.particles.push({
            x: clickX + (Math.random() - 0.5) * 15,
            y: clickY + (Math.random() - 0.5) * 15,
            vx: (Math.random() - 0.5) * 0.1,
            vy: (Math.random() - 0.5) * 0.1,
            size: 7.5,
            color: '#facc15',
            generation: 1,
            age: 0,
            splitTimer: 0,
            pulsePhase: 0,
          });
        }
      }
    }
  };

  // IntersectionObserver: automatically pauses canvas when off-screen
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        isVisibleRef.current = entry ? entry.isIntersecting : true;
      },
      { threshold: 0.05 }
    );

    observer.observe(container);

    // Page Visibility API: pause when browser tab is inactive
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // ResizeObserver setup with DPI clamping (max 2)
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.floor(rect.width || container.clientWidth || 600);
      const h = Math.floor(rect.height || container.clientHeight || 360);

      if (w <= 0 || h <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      simState.current.width = w;
      simState.current.height = h;
      simState.current.dpr = dpr;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);

      if (!simState.current.initialized || (simState.current.particles.length === 0 && simState.current.debtBlocks.length === 0)) {
        initEntities(activeType, w, h);
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [activeType, initEntities]);

  // Re-seed when activeType changes
  useEffect(() => {
    const state = simState.current;
    initEntities(activeType, state.width, state.height);
  }, [activeType, initEntities]);

  // 60 FPS Kinetic Simulation Loop with ZERO per-frame setState calls
  useEffect(() => {
    let animId: number;

    const render = (timestamp: number) => {
      // If offscreen or tab hidden, sleep loop with low-overhead check
      if (!isVisibleRef.current) {
        animId = requestAnimationFrame(render);
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) {
        animId = requestAnimationFrame(render);
        return;
      }

      const state = simState.current;
      const w = state.width;
      const h = state.height;
      const dpr = state.dpr;

      if (w <= 0 || h <= 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      // FPS tracking
      state.frameCount++;
      if (timestamp - state.fpsCounterTimer >= 500) {
        const elapsed = (timestamp - state.fpsCounterTimer) / 1000;
        state.measuredFps = Math.min(60, Math.max(30, Math.round(state.frameCount / elapsed)));
        state.frameCount = 0;
        state.fpsCounterTimer = timestamp;
      }

      // Physics update (when playing)
      if (isRunningRef.current) {
        const steps = Math.min(3, speedRef.current);
        for (let s = 0; s < steps; s++) {
          updatePhysics(state, activeType, w, h);
        }
      }

      // Throttled HUD update: only 4 times per second (prevents React churn)
      if (timestamp - state.lastHudUpdate >= 250) {
        state.lastHudUpdate = timestamp;

        if (activeType === 'debt-accumulation') {
          const landedCount = state.debtBlocks.filter(b => b.isLanded).length;
          // Baseline $87T in 2000, each block represents $5T incremental debt
          const totalDebt = 87 + landedCount * 5;
          const debtRatio = Math.round((totalDebt / 105) * 100);
          const annualInterest = Number(((totalDebt * 0.058)).toFixed(1));

          setHudMetrics({
            count: totalDebt,
            generation: state.debtCompoundingCycle,
            nutrient: 100,
            fps: state.measuredFps,
            debtTotalTrillion: totalDebt,
            debtRatio: debtRatio,
            debtAnnualInterest: annualInterest,
          });
        } else {
          const currentCount =
            activeType === 'solar-grid'
              ? state.gridCells.filter(c => c.active).length
              : activeType === 'network-nodes'
              ? state.networkNodes.length
              : state.particles.length;

          setHudMetrics({
            count: currentCount,
            generation: state.generation,
            nutrient: state.nutrient,
            fps: state.measuredFps,
          });
        }
      }

      // High-performance canvas drawing
      ctx.save();
      ctx.scale(dpr, dpr);

      // Clean background fill (fast opaque fill)
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);

      drawSimulationFast(ctx, state, activeType, w, h);
      drawRipplesFast(ctx, state);

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeType, spawnDebtBlock]);

  // Fast Physics step
  const updatePhysics = (
    state: typeof simState.current,
    simType: SimulationType,
    w: number,
    h: number
  ) => {
    if (simType === 'debt-accumulation') {
      // 1. Falling debt blocks physics
      for (let i = 0; i < state.debtBlocks.length; i++) {
        const b = state.debtBlocks[i];
        if (!b.isLanded) {
          b.vy += 0.25; // gravity
          b.y += b.vy;

          if (b.y >= b.targetY) {
            b.y = b.targetY;
            b.vy = 0;
            b.isLanded = true;
            b.squash = 0.7; // squash on landing impact

            // Subtle shockwave ripple at landing position
            state.ripples.push({
              x: b.x + b.width / 2,
              y: b.targetY + b.height / 2,
              radius: 2,
              maxRadius: 20,
              opacity: 0.8,
              color: b.color,
            });
          }
        } else {
          // Recover squash smoothly
          if (b.squash < 1.0) {
            b.squash = Math.min(1.0, b.squash + 0.06);
          }
        }
      }

      // 2. Compounding interest rollover clock (Debt Spiral Engine: r > g)
      state.debtNextSpawnTimer--;
      if (state.debtNextSpawnTimer <= 0) {
        state.debtNextSpawnTimer = 55 + Math.floor(Math.random() * 25);
        state.debtCompoundingCycle++;

        if (state.debtBlocks.length < state.maxCapacity) {
          // Sector weighting based on highest debt accumulation
          const sectorToSpawn = Math.floor(Math.random() * 4);
          spawnDebtBlock(sectorToSpawn, w, h);

          // Spawn interest arc stream (obligation rollover)
          const landedInSector = state.debtBlocks.filter(b => b.sector === sectorToSpawn && b.isLanded);
          const topBlock = landedInSector[landedInSector.length - 1];
          if (topBlock) {
            state.debtArcs.push({
              startX: topBlock.x + topBlock.width / 2,
              startY: topBlock.y,
              currentX: topBlock.x + topBlock.width / 2,
              currentY: topBlock.y,
              targetX: topBlock.x + topBlock.width / 2 + (Math.random() - 0.5) * 40,
              targetY: Math.max(30, topBlock.y - 70 - Math.random() * 40),
              progress: 0,
              speed: 0.04 + Math.random() * 0.02,
              color: '#facc15',
            });
          }
        }
      }

      // 3. Update interest arcs
      for (let i = state.debtArcs.length - 1; i >= 0; i--) {
        const arc = state.debtArcs[i];
        arc.progress += arc.speed;
        arc.currentX = arc.startX + (arc.targetX - arc.startX) * arc.progress;
        // Quadratic arc curve
        const arcHeight = 45;
        arc.currentY = arc.startY + (arc.targetY - arc.startY) * arc.progress - Math.sin(arc.progress * Math.PI) * arcHeight;

        if (arc.progress >= 1) {
          state.debtArcs.splice(i, 1);
        }
      }
    } else if (simType === 'bacteria-petri') {
      const centerX = w / 2;
      const centerY = h / 2;
      const radius = Math.min(w, h) / 2 - 20;

      const newParticles: Particle[] = [];
      const currentCount = state.particles.length;
      const capacityFactor = Math.max(0, 1 - currentCount / state.maxCapacity);

      for (let i = 0; i < state.particles.length; i++) {
        const p = state.particles[i];
        p.age++;
        p.x += p.vx;
        p.y += p.vy;

        // Circular boundary bounce
        const dx = p.x - centerX;
        const dy = p.y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > radius - p.size) {
          const invDist = 1 / (dist || 1);
          const normalX = dx * invDist;
          const normalY = dy * invDist;
          p.x = centerX + normalX * (radius - p.size);
          const dot = p.vx * normalX + p.vy * normalY;
          p.vx -= 2 * dot * normalX;
          p.vy -= 2 * dot * normalY;
        }

        // Slight brownian dampening
        p.vx += (Math.random() - 0.5) * 0.12;
        p.vy += (Math.random() - 0.5) * 0.12;
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Binary fission
        p.splitTimer--;
        if (
          p.splitTimer <= 0 &&
          currentCount + newParticles.length < state.maxCapacity &&
          Math.random() < capacityFactor * 0.75
        ) {
          p.splitTimer = 130 + Math.random() * 60;
          newParticles.push({
            x: p.x + (Math.random() - 0.5) * 6,
            y: p.y + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 1.2,
            vy: (Math.random() - 0.5) * 1.2,
            size: 7.5,
            color: '#2dd4bf',
            generation: p.generation + 1,
            age: 0,
            splitTimer: 130 + Math.random() * 60,
            pulsePhase: Math.random() * Math.PI,
          });
        }
      }

      if (newParticles.length > 0) {
        state.particles.push(...newParticles);
        state.generation = Math.min(25, state.generation + 1);
        state.nutrient = Math.max(4, Math.round(capacityFactor * 100));
      }
    } else if (simType === 'money-flow') {
      const newCoins: Particle[] = [];
      // Dividends continually spawn from accumulated compounding capital pool
      if (Math.random() < 0.14 && state.particles.length < state.maxCapacity) {
        newCoins.push({
          x: w / 2 + (Math.random() - 0.5) * 140,
          y: h - 70,
          vx: (Math.random() - 0.5) * 3,
          vy: -4 - Math.random() * 2.5,
          size: 5.5,
          color: '#10b981',
          generation: Math.floor(state.particles.length / 15) + 1,
          age: 0,
          splitTimer: 45,
          pulsePhase: 0,
        });
      }

      for (let i = 0; i < state.particles.length; i++) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity
        p.age++;

        // Floor bounce with circulation recharge (prevents freezing)
        if (p.y >= h - 48) {
          p.y = h - 48;
          p.vy = -Math.abs(p.vy) * 0.7;
          if (Math.abs(p.vy) < 0.8) {
            p.vy = -3.2 - Math.random() * 2.2;
            p.vx = (Math.random() - 0.5) * 3;
          }
        }
        if (p.x < 20 || p.x > w - 20) {
          p.vx = -p.vx;
        }

        // Compounding dividend in flight
        p.splitTimer--;
        if (p.splitTimer <= 0 && state.particles.length + newCoins.length < state.maxCapacity) {
          p.splitTimer = 99999;
          newCoins.push({
            x: p.x,
            y: p.y,
            vx: (Math.random() - 0.5) * 2.5,
            vy: -2.8,
            size: p.size,
            color: '#34d399',
            generation: p.generation + 1,
            age: 0,
            splitTimer: 99999,
            pulsePhase: 0,
          });
        }
      }

      if (newCoins.length > 0) {
        state.particles.push(...newCoins);
        state.generation = Math.min(30, Math.floor(state.particles.length / 12) + 1);
      }
    } else if (simType === 'solar-grid') {
      const activeCount = state.gridCells.filter(c => c.active).length;
      if (activeCount < state.gridCells.length && Math.random() < 0.15) {
        const unactivated = state.gridCells.filter(c => !c.active);
        const toActivate = Math.min(unactivated.length, Math.max(1, Math.floor(activeCount * 0.12)));
        for (let i = 0; i < toActivate; i++) {
          const candidate = unactivated[Math.floor(Math.random() * unactivated.length)];
          if (candidate) candidate.active = true;
        }
        state.generation = Math.min(25, Math.floor(activeCount / 8) + 1);
      }
    } else if (simType === 'network-nodes') {
      if (state.networkNodes.length < state.maxCapacity && Math.random() < 0.2) {
        const parentIdx = Math.floor(Math.random() * state.networkNodes.length);
        const parent = state.networkNodes[parentIdx];
        if (parent) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 28 + Math.random() * 36;
          const nx = Math.max(25, Math.min(w - 25, parent.x + Math.cos(angle) * dist));
          const ny = Math.max(25, Math.min(h - 25, parent.y + Math.sin(angle) * dist));

          const newIdx = state.networkNodes.length;
          const newNode: NetworkNode = {
            x: nx,
            y: ny,
            layer: parent.layer + 1,
            connections: [parentIdx],
          };
          parent.connections.push(newIdx);
          state.networkNodes.push(newNode);

          state.pulses.push({
            fromX: parent.x,
            fromY: parent.y,
            toX: nx,
            toY: ny,
            progress: 0,
            speed: 0.05 + Math.random() * 0.04,
          });

          state.generation = Math.min(20, Math.floor(state.networkNodes.length / 8) + 1);
        }
      }

      for (let i = state.pulses.length - 1; i >= 0; i--) {
        const pulse = state.pulses[i];
        pulse.progress += pulse.speed;
        if (pulse.progress >= 1) {
          state.pulses.splice(i, 1);
        }
      }
    } else if (simType === 'co2-atmosphere') {
      if (state.particles.length < state.maxCapacity && Math.random() < 0.18) {
        state.particles.push({
          x: Math.random() * w,
          y: h - 45,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -1.0 - Math.random() * 1.2,
          size: 4 + Math.random() * 2,
          color: '#f43f5e',
          generation: 1,
          age: 0,
          splitTimer: 80,
          pulsePhase: 0,
        });
        state.generation = Math.min(30, Math.floor(state.particles.length / 10) + 1);
      }

      for (let i = 0; i < state.particles.length; i++) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 30) {
          p.y = 30;
          p.vy = -p.vy * 0.8;
        }
        if (p.y > h - 40) {
          p.y = h - 40;
          p.vy = -p.vy * 0.8;
        }
      }
    } else if (simType === 'population-cluster') {
      if (state.particles.length < state.maxCapacity && Math.random() < 0.16) {
        const parent = state.particles[Math.floor(Math.random() * state.particles.length)];
        if (parent) {
          state.particles.push({
            x: parent.x + (Math.random() - 0.5) * 30,
            y: parent.y + (Math.random() - 0.5) * 30,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            size: 4.5,
            color: '#a78bfa',
            generation: parent.generation + 1,
            age: 0,
            splitTimer: 90,
            pulsePhase: 0,
          });
          state.generation = Math.min(25, Math.floor(state.particles.length / 12) + 1);
        }
      }

      for (let i = 0; i < state.particles.length; i++) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 20 || p.x > w - 20) p.vx = -p.vx;
        if (p.y < 20 || p.y > h - 20) p.vy = -p.vy;
      }
    } else if (simType === 'inflation-decay') {
      if (state.particles.length > 5 && Math.random() < 0.05) {
        state.particles.pop();
        state.generation = Math.min(30, 60 - state.particles.length);
      }
    }

    // Ripples
    for (let i = state.ripples.length - 1; i >= 0; i--) {
      const rip = state.ripples[i];
      rip.radius += 2.0;
      rip.opacity = Math.max(0, 1 - rip.radius / rip.maxRadius);
      if (rip.opacity <= 0) {
        state.ripples.splice(i, 1);
      }
    }
  };

  // High-performance batch renderer
  const drawSimulationFast = (
    ctx: CanvasRenderingContext2D,
    state: typeof simState.current,
    simType: SimulationType,
    w: number,
    h: number
  ) => {
    if (simType === 'debt-accumulation') {
      const margin = Math.max(24, Math.floor(w * 0.08));
      const availW = w - margin * 2;
      const colW = Math.min(88, Math.max(50, Math.floor((availW - 3 * 16) / 4)));
      const colSpacing = (availW - colW * 4) / 3;
      const gdpY = h - 46;
      const gdpH = 34;

      // 1. Dotted Danger Threshold Lines across Debt Stacks
      // 100% GDP = ~gdpY - 50, 200% = ~gdpY - 110, 300% = ~gdpY - 170, 400% = ~gdpY - 230
      const thresholdY300 = Math.max(55, gdpY - 170);
      const thresholdY200 = Math.max(95, gdpY - 110);
      const thresholdY100 = Math.max(140, gdpY - 55);

      // 100% Line
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(margin - 10, thresholdY100);
      ctx.lineTo(w - margin + 10, thresholdY100);
      ctx.stroke();

      ctx.fillStyle = 'rgba(16, 185, 129, 0.5)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText('100% GDP ($105T)', margin - 8, thresholdY100 - 4);

      // 200% Line
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.3)';
      ctx.beginPath();
      ctx.moveTo(margin - 10, thresholdY200);
      ctx.lineTo(w - margin + 10, thresholdY200);
      ctx.stroke();

      ctx.fillStyle = 'rgba(234, 179, 8, 0.6)';
      ctx.fillText('200% GDP ($210T)', margin - 8, thresholdY200 - 4);

      // 300% Line (Current Record 2024 Threshold)
      ctx.strokeStyle = '#f59e0b';
      ctx.setLineDash([6, 3]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(margin - 10, thresholdY300);
      ctx.lineTo(w - margin + 10, thresholdY300);
      ctx.stroke();
      ctx.setLineDash([]); // reset

      // 300% Badge
      ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
      ctx.fillRect(w - margin - 150, thresholdY300 - 16, 155, 15);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.fillText('2024 RECORD BURDEN: 333%', w - margin - 146, thresholdY300 - 5);

      // 2. Sector Column Guide Tracks
      for (let s = 0; s < 4; s++) {
        const colX = margin + s * (colW + colSpacing);
        ctx.fillStyle = 'rgba(30, 41, 59, 0.3)';
        ctx.fillRect(colX, 35, colW, gdpY - 35);
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.2)';
        ctx.strokeRect(colX, 35, colW, gdpY - 35);

        // Sector header tag
        ctx.fillStyle = DEBT_SECTORS[s].color;
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.fillText(DEBT_SECTORS[s].shortName, colX + 4, 30);
      }

      // 3. Draw Stacked & Falling Debt Blocks
      for (let i = 0; i < state.debtBlocks.length; i++) {
        const b = state.debtBlocks[i];
        const squashH = b.height * b.squash;
        const renderY = b.y + (b.height - squashH);

        // Block Body
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x + 1, renderY, b.width - 2, squashH);

        // Highlight line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(b.x + 2, renderY + 1);
        ctx.lineTo(b.x + b.width - 2, renderY + 1);
        ctx.stroke();

        // Label if wide enough
        if (b.width >= 55) {
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 8px "JetBrains Mono", monospace';
          ctx.fillText('+$5T', b.x + 4, renderY + squashH - 3);
        }
      }

      // 4. Compounding Interest Arc Particles
      for (let i = 0; i < state.debtArcs.length; i++) {
        const arc = state.debtArcs[i];
        ctx.fillStyle = arc.color;
        ctx.beginPath();
        ctx.arc(arc.currentX, arc.currentY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Trail spark
        ctx.fillStyle = 'rgba(250, 204, 21, 0.3)';
        ctx.beginPath();
        ctx.arc(arc.currentX, arc.currentY, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Productive Bedrock: REAL GLOBAL GDP BASE
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fillRect(margin - 12, gdpY, availW + 24, gdpH);

      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.strokeRect(margin - 12, gdpY, availW + 24, gdpH);

      // Grid stripes inside GDP base
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.18)';
      ctx.lineWidth = 1;
      for (let x = margin - 12; x <= margin + availW + 12; x += 18) {
        ctx.beginPath();
        ctx.moveTo(x, gdpY);
        ctx.lineTo(x, gdpY + gdpH);
        ctx.stroke();
      }

      ctx.fillStyle = '#22d3ee';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText('BEDROCK: REAL WORLD PRODUCTIVE GDP · $105 TRILLION', margin, gdpY + 18);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText('Real output capacity straining under $315T+ debt refinancing rollover', margin, gdpY + 30);
    } else if (simType === 'bacteria-petri') {
      const centerX = w / 2;
      const centerY = h / 2;
      const radius = Math.min(w, h) / 2 - 20;

      // Outer dish circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.4)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Nutrient broth highlight
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Batch draw bacteria glow halos (translucent ring)
      ctx.fillStyle = 'rgba(20, 184, 166, 0.2)';
      ctx.beginPath();
      for (let i = 0; i < state.particles.length; i++) {
        const p = state.particles[i];
        ctx.moveTo(p.x + p.size * 1.5, p.y);
        ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
      }
      ctx.fill();

      // Draw cell capsules
      for (let i = 0; i < state.particles.length; i++) {
        const p = state.particles[i];
        ctx.fillStyle = p.generation > 8 ? '#38bdf8' : '#2dd4bf';
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size, p.size * 0.6, Math.atan2(p.vy, p.vx), 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (simType === 'money-flow') {
      // Vault floor
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.fillRect(20, h - 38, w - 40, 26);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1;
      ctx.strokeRect(20, h - 38, w - 40, 26);

      ctx.fillStyle = '#6ee7b7';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(
        `CAPITAL ACCRUAL RESERVOIR: $${(state.particles.length * 480).toLocaleString()}`,
        30,
        h - 22
      );

      // Coins batch halo
      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.beginPath();
      for (let i = 0; i < state.particles.length; i++) {
        const p = state.particles[i];
        ctx.moveTo(p.x + p.size * 1.4, p.y);
        ctx.arc(p.x, p.y, p.size * 1.4, 0, Math.PI * 2);
      }
      ctx.fill();

      // Coin cores
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      for (let i = 0; i < state.particles.length; i++) {
        const p = state.particles[i];
        ctx.moveTo(p.x + p.size, p.y);
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }
      ctx.fill();
    } else if (simType === 'solar-grid') {
      for (let i = 0; i < state.gridCells.length; i++) {
        const c = state.gridCells[i];
        if (c.active) {
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(c.x + 1, c.y + 1, c.w - 2, c.h - 2);
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(c.x + c.w * 0.5, c.y);
          ctx.lineTo(c.x + c.w * 0.5, c.y + c.h);
          ctx.stroke();
        } else {
          ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
          ctx.fillRect(c.x + 1, c.y + 1, c.w - 2, c.h - 2);
          ctx.strokeStyle = 'rgba(71, 85, 105, 0.25)';
          ctx.strokeRect(c.x + 1, c.y + 1, c.w - 2, c.h - 2);
        }
      }
    } else if (simType === 'network-nodes') {
      // Lines
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.beginPath();
      for (let i = 0; i < state.networkNodes.length; i++) {
        const node = state.networkNodes[i];
        for (let j = 0; j < node.connections.length; j++) {
          const target = state.networkNodes[node.connections[j]];
          if (target) {
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(target.x, target.y);
          }
        }
      }
      ctx.stroke();

      // Pulses
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      for (let i = 0; i < state.pulses.length; i++) {
        const pulse = state.pulses[i];
        const px = pulse.fromX + (pulse.toX - pulse.fromX) * pulse.progress;
        const py = pulse.fromY + (pulse.toY - pulse.fromY) * pulse.progress;
        ctx.moveTo(px + 2.5, py);
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      }
      ctx.fill();

      // Nodes
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      for (let i = 0; i < state.networkNodes.length; i++) {
        const node = state.networkNodes[i];
        const r = node.layer === 0 ? 6 : 4;
        ctx.moveTo(node.x + r, node.y);
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      }
      ctx.fill();
    } else if (simType === 'co2-atmosphere') {
      ctx.fillStyle = 'rgba(244, 63, 94, 0.12)';
      ctx.fillRect(0, h - 35, w, 35);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h - 35);
      ctx.lineTo(w, h - 35);
      ctx.stroke();

      ctx.fillStyle = '#fda4af';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText('PLANETARY SURFACE EMISSIONS', 20, h - 14);

      // CO2 particles
      ctx.fillStyle = 'rgba(244, 63, 94, 0.25)';
      ctx.beginPath();
      for (let i = 0; i < state.particles.length; i++) {
        const p = state.particles[i];
        ctx.moveTo(p.x + p.size * 1.5, p.y);
        ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
      }
      ctx.fill();

      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      for (let i = 0; i < state.particles.length; i++) {
        const p = state.particles[i];
        ctx.moveTo(p.x + p.size, p.y);
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }
      ctx.fill();
    } else if (simType === 'population-cluster') {
      ctx.fillStyle = 'rgba(139, 92, 246, 0.25)';
      ctx.beginPath();
      for (let i = 0; i < state.particles.length; i++) {
        const p = state.particles[i];
        ctx.moveTo(p.x + p.size * 1.4, p.y);
        ctx.arc(p.x, p.y, p.size * 1.4, 0, Math.PI * 2);
      }
      ctx.fill();

      ctx.fillStyle = '#a78bfa';
      ctx.beginPath();
      for (let i = 0; i < state.particles.length; i++) {
        const p = state.particles[i];
        ctx.moveTo(p.x + p.size, p.y);
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }
      ctx.fill();
    } else if (simType === 'inflation-decay') {
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      for (let i = 0; i < state.particles.length; i++) {
        const p = state.particles[i];
        ctx.moveTo(p.x + p.size, p.y);
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }
      ctx.fill();

      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillText(
        `Purchasing Units Remaining: ${state.particles.length} / 60`,
        24,
        h - 16
      );
    }
  };

  // Ripples draw
  const drawRipplesFast = (ctx: CanvasRenderingContext2D, state: typeof simState.current) => {
    for (let i = 0; i < state.ripples.length; i++) {
      const rip = state.ripples[i];
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
      ctx.strokeStyle = rip.color;
      ctx.globalAlpha = rip.opacity;
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }
  };

  return (
    <div
      id="simulation-canvas-container"
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/90 shadow-2xl transition-all"
    >
      {/* Top HUD bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800/80 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono tracking-wider uppercase text-slate-200 font-semibold flex items-center gap-1.5">
            <span>Kinetic 60 FPS Visual Simulation</span>
            {title && <span className="text-slate-500 font-normal hidden sm:inline">· {title}</span>}
          </span>
        </div>

        {/* Live Metrics */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono">
          {/* FPS Badge */}
          <div className="bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span className="font-bold">{hudMetrics.fps} FPS</span>
          </div>

          {activeType === 'debt-accumulation' ? (
            <>
              <div className="bg-slate-800/80 px-2.5 py-1 rounded border border-amber-500/30 text-slate-200 flex items-center gap-1">
                <span className="text-slate-400">Total Debt:</span>
                <span className="font-bold text-amber-400">${hudMetrics.debtTotalTrillion}T</span>
              </div>

              <div className="bg-slate-800/80 px-2.5 py-1 rounded border border-rose-500/30 text-slate-200 flex items-center gap-1">
                <span className="text-slate-400">Debt/GDP:</span>
                <span className={`font-bold ${Number(hudMetrics.debtRatio) >= 300 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {hudMetrics.debtRatio}%
                </span>
              </div>

              <div className="bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700/60 text-slate-200 hidden md:flex items-center gap-1">
                <span className="text-slate-400">Interest:</span>
                <span className="font-bold text-yellow-300">${hudMetrics.debtAnnualInterest}T/yr</span>
              </div>
            </>
          ) : (
            <>
              <div className="bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700/60 text-slate-200">
                <span className="text-slate-400 mr-1.5">Count:</span>
                <span className="font-bold text-emerald-400">{hudMetrics.count.toLocaleString()}</span>
              </div>

              {activeType === 'bacteria-petri' && (
                <div className="bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700/60 text-slate-200">
                  <span className="text-slate-400 mr-1.5">Nutrient:</span>
                  <span className={`font-bold ${hudMetrics.nutrient < 20 ? 'text-rose-400' : 'text-teal-400'}`}>
                    {hudMetrics.nutrient}%
                  </span>
                </div>
              )}

              <div className="bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700/60 text-slate-200">
                <span className="text-slate-400 mr-1.5">Cycles:</span>
                <span className="font-bold text-cyan-400">{hudMetrics.generation}</span>
              </div>
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            id="sim-burst-btn"
            onClick={triggerBurst}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title={activeType === 'debt-accumulation' ? 'Issue new debt tranche across sectors' : 'Inject new seed entities to trigger compounding burst'}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{activeType === 'debt-accumulation' ? 'Issue Debt' : 'Add Seed'}</span>
          </button>

          <button
            id="sim-play-pause-btn"
            onClick={() => setIsRunning(!isRunning)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
            title={isRunning ? 'Pause Simulation' : 'Resume Simulation'}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            id="sim-speed-btn"
            onClick={() => setSpeedMultiplier(prev => (prev === 1 ? 2 : prev === 2 ? 3 : 1))}
            className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            title="Cycle Speed"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{speedMultiplier}x</span>
          </button>

          <button
            id="sim-reset-btn"
            onClick={resetSimulation}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full h-80 sm:h-96 bg-slate-950 select-none">
        <canvas
          ref={canvasRef}
          onPointerDown={handleCanvasInteraction}
          className="w-full h-full block cursor-crosshair touch-none"
        />

        {/* Ambient overlay caption with interaction hint */}
        <div className="absolute bottom-2.5 left-4 right-4 pointer-events-none flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5 bg-slate-950/85 px-2.5 py-1 rounded-lg backdrop-blur border border-slate-800/80">
            {activeType === 'debt-accumulation' ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{interactionHint || 'Click canvas to interact & inject entities'}</span>
          </div>

          {growthRateText && (
            <div className="hidden sm:inline-flex items-center gap-1 bg-slate-950/85 px-2.5 py-1 rounded-lg backdrop-blur border border-slate-800/80 text-cyan-400">
              <span>Cadence: 2× in {growthRateText}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
