import { useCallback, useMemo, useState } from "react";
import { useExpense } from "./useExpenseController";
import { MappedTransaction } from "../models/types";

// ── Types ─────────────────────────────────────────────────────────────────────

export type StatsTimeframe = "30_days" | "90_days" | "ytd";
export type DonutCategoryLimit = 3 | 5 | "all";
export type DonutTransactionType = "spent" | "income";

export interface HeatmapDay {
  date: Date;
  dateKey: string; // "YYYY-MM-DD"
  count: number;
  total: number;
  level: 0 | 1 | 2 | 3 | 4; // 0=empty, 4=highest activity
}

export interface DonutSubCategory {
  category: string;
  emoji: string;
  amount: number;
  percentage: number;
}

export interface DonutFilterCategoryOption {
  category: string;
  emoji: string;
  amount: number;
}

export interface DonutSegment {
  category: string;
  emoji: string;
  amount: number;
  percentage: number;
  // SVG circle stroke-dasharray values
  strokeDasharray: string;
  strokeDashoffset: number;
  color: string;
  isOthers?: boolean;
  subCategories?: DonutSubCategory[];
}

export interface TrendPoint {
  label: string; // "Week 1", "Jan", etc.
  income: number;
  expenses: number;
  // Normalized SVG coords (0–1 space; caller scales to chart dims)
  xNorm: number;
  yIncomeNorm: number;
  yExpensesNorm: number;
}

// ── Segment color palettes ────────────────────────────────────────────────────
// Emerald excluded from expense palette (reserved for income)
const SEGMENT_COLORS = [
  "#f43f5e", // rose-500
  "#a855f7", // purple-500
  "#f59e0b", // amber-500
  "#3b82f6", // blue-500
  "#ec4899", // pink-500
  "#14b8a6", // teal-500
  "#f97316", // orange-500
  "#6366f1", // indigo-500
];

const INCOME_SEGMENT_COLORS = [
  "#10b981", // emerald-500
  "#14b8a6", // teal-500
  "#06b6d4", // cyan-500
  "#3b82f6", // blue-500
  "#84cc16", // lime-500
  "#a855f7", // purple-500
  "#f59e0b", // amber-500
  "#6366f1", // indigo-500
];

const OTHERS_SEGMENT_COLOR = "#64748b"; // slate-500
const OTHERS_EMOJI = "📦";

// ── Donut geometry ─────────────────────────────────────────────────────────────

const DONUT_RADIUS = 54;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

// ── Date helpers ──────────────────────────────────────────────────────────────

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function subtractDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

// ── Donut aggregation helpers ─────────────────────────────────────────────────

export function groupTransactionsByCategory(
  txs: MappedTransaction[],
): DonutFilterCategoryOption[] {
  const grouped: Record<string, { amount: number; emoji: string }> = {};
  for (const tx of txs) {
    if (!grouped[tx.category]) {
      grouped[tx.category] = { amount: 0, emoji: tx.emoji };
    }
    grouped[tx.category].amount += tx.amount;
  }

  return Object.entries(grouped)
    .sort((a, b) => b[1].amount - a[1].amount)
    .map(([category, { amount, emoji }]) => ({
      category,
      emoji,
      amount,
    }));
}

export function buildDonutSegments(
  txs: MappedTransaction[],
  donutLimit: DonutCategoryLimit,
  donutType: DonutTransactionType,
): DonutSegment[] {
  const sorted = groupTransactionsByCategory(txs);
  const total = sorted.reduce((sum, item) => sum + item.amount, 0);
  if (total === 0) return [];

  // Roll remaining categories into "Others" only when 2+ categories remain beyond the limit
  const shouldGroupOthers =
    donutLimit !== "all" &&
    sorted.length > donutLimit &&
    sorted.length - donutLimit >= 2;

  type RawSlice = {
    category: string;
    emoji: string;
    amount: number;
    isOthers?: boolean;
    subCategories?: DonutSubCategory[];
  };

  const slices: RawSlice[] = [];
  if (shouldGroupOthers) {
    const topEntries = sorted.slice(0, donutLimit);
    const otherEntries = sorted.slice(donutLimit);

    for (const item of topEntries) {
      slices.push(item);
    }

    const othersAmount = otherEntries.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const subCategories: DonutSubCategory[] = otherEntries.map((item) => ({
      category: item.category,
      emoji: item.emoji,
      amount: item.amount,
      percentage: (item.amount / total) * 100,
    }));

    slices.push({
      category: "Others",
      emoji: OTHERS_EMOJI,
      amount: othersAmount,
      isOthers: true,
      subCategories,
    });
  } else {
    slices.push(...sorted);
  }

  const palette =
    donutType === "income" ? INCOME_SEGMENT_COLORS : SEGMENT_COLORS;

  // Build SVG donut segments via stroke-dashoffset
  let cumulativeOffset = 0; // starts at top (-90° rotation handled via SVG transform)
  return slices.map((slice, i) => {
    const percentage = (slice.amount / total) * 100;
    const dash = (percentage / 100) * DONUT_CIRCUMFERENCE;
    const gap = DONUT_CIRCUMFERENCE - dash;
    const strokeDashoffset = DONUT_CIRCUMFERENCE - cumulativeOffset;
    cumulativeOffset += dash;

    return {
      category: slice.category,
      emoji: slice.emoji,
      amount: slice.amount,
      percentage,
      strokeDasharray: `${dash} ${gap}`,
      strokeDashoffset,
      color: slice.isOthers
        ? OTHERS_SEGMENT_COLOR
        : palette[i % palette.length],
      isOthers: slice.isOthers,
      subCategories: slice.subCategories,
    };
  });
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useStatsController() {
  const { transactions } = useExpense();

  const [timeframe, setTimeframeState] = useState<StatsTimeframe>("30_days");
  const [donutLimit, setDonutLimitState] = useState<DonutCategoryLimit>(5);
  const [donutType, setDonutTypeState] =
    useState<DonutTransactionType>("spent");
  const [excludedCategories, setExcludedCategories] = useState<string[]>([]);
  const [selectedDonutIndex, setSelectedDonutIndex] = useState<number>(0);
  const [selectedTrendIndex, setSelectedTrendIndex] = useState<number | null>(
    null,
  );

  // ── Timeframe window ───────────────────────────────────────────────────────
  const windowStart = useMemo<Date>(() => {
    const now = new Date();
    const today = startOfDay(now);
    switch (timeframe) {
      case "30_days":
        return subtractDays(today, 29);
      case "90_days":
        return subtractDays(today, 89);
      case "ytd":
        return new Date(now.getFullYear(), 0, 1);
      default:
        return subtractDays(today, 29);
    }
  }, [timeframe]);

  // ── Transactions within the selected window ────────────────────────────────
  const windowTransactions = useMemo<MappedTransaction[]>(() => {
    return transactions.filter((tx) => tx.date >= windowStart);
  }, [transactions, windowStart]);

  // ── Heatmap: always last 180 days regardless of timeframe selector ─────────
  const heatmapDays = useMemo<HeatmapDay[]>(() => {
    const today = startOfDay(new Date());
    const start = subtractDays(today, 179);

    // Build lookup map of dateKey → { count, total }
    const map: Record<string, { count: number; total: number }> = {};
    for (const tx of transactions) {
      if (tx.date < start) continue;
      const key = toDateKey(tx.date);
      if (!map[key]) map[key] = { count: 0, total: 0 };
      map[key].count += 1;
      if (tx.type === "spent") map[key].total += tx.amount;
    }

    // Determine max count for level scaling
    const counts = Object.values(map).map((v) => v.count);
    const maxCount = counts.length > 0 ? Math.max(...counts) : 1;

    const days: HeatmapDay[] = [];
    const cursor = new Date(start);
    while (cursor <= today) {
      const key = toDateKey(cursor);
      const data = map[key] ?? { count: 0, total: 0 };
      const ratio = maxCount > 0 ? data.count / maxCount : 0;
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (ratio > 0)
        level = ratio <= 0.25 ? 1 : ratio <= 0.5 ? 2 : ratio <= 0.75 ? 3 : 4;

      days.push({
        date: new Date(cursor),
        dateKey: key,
        count: data.count,
        total: data.total,
        level,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  }, [transactions]);

  // ── Donut source transactions & category options (before exclusions) ───────
  const windowTypeTransactions = useMemo<MappedTransaction[]>(
    () => windowTransactions.filter((tx) => tx.type === donutType),
    [windowTransactions, donutType],
  );

  const donutUnfilteredTotal = useMemo<number>(
    () => windowTypeTransactions.reduce((s, tx) => s + tx.amount, 0),
    [windowTypeTransactions],
  );

  const availableDonutCategories = useMemo<DonutFilterCategoryOption[]>(
    () => groupTransactionsByCategory(windowTypeTransactions),
    [windowTypeTransactions],
  );

  const activeExcludedCategories = useMemo<string[]>(() => {
    const availableSet = new Set(
      availableDonutCategories.map((c) => c.category),
    );
    return excludedCategories.filter((c) => availableSet.has(c));
  }, [availableDonutCategories, excludedCategories]);

  // ── Donut filtered total & segments (Top-N grouping + "Others") ────────────
  const filteredDonutTransactions = useMemo<MappedTransaction[]>(() => {
    if (activeExcludedCategories.length === 0) return windowTypeTransactions;
    const excludedSet = new Set(activeExcludedCategories);
    return windowTypeTransactions.filter((tx) => !excludedSet.has(tx.category));
  }, [windowTypeTransactions, activeExcludedCategories]);

  const donutFilteredTotal = useMemo<number>(
    () => filteredDonutTransactions.reduce((s, tx) => s + tx.amount, 0),
    [filteredDonutTransactions],
  );

  const donutSegments = useMemo<DonutSegment[]>(
    () => buildDonutSegments(filteredDonutTransactions, donutLimit, donutType),
    [filteredDonutTransactions, donutLimit, donutType],
  );

  // ── Filter & selection handlers ────────────────────────────────────────────
  const setTimeframe = useCallback((nextTimeframe: StatsTimeframe) => {
    setTimeframeState(nextTimeframe);
    setSelectedDonutIndex(0);
  }, []);

  const setDonutLimit = useCallback((nextLimit: DonutCategoryLimit) => {
    setDonutLimitState(nextLimit);
    setSelectedDonutIndex(0);
  }, []);

  const setDonutType = useCallback((nextType: DonutTransactionType) => {
    setDonutTypeState(nextType);
    setExcludedCategories([]);
    setSelectedDonutIndex(0);
  }, []);

  const toggleExcludeCategory = useCallback((category: string) => {
    setExcludedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
    setSelectedDonutIndex(0);
  }, []);

  const clearExcludedCategories = useCallback(() => {
    setExcludedCategories([]);
    setSelectedDonutIndex(0);
  }, []);

  const resetDonutFilters = useCallback(() => {
    setDonutLimitState(5);
    setExcludedCategories([]);
    setSelectedDonutIndex(0);
  }, []);

  // Clamp selection so index never points out-of-bounds after filter/data changes
  const safeSelectedDonutIndex = useMemo<number>(() => {
    if (donutSegments.length === 0) return -1;
    if (selectedDonutIndex === -1) return -1;
    if (selectedDonutIndex < 0 || selectedDonutIndex >= donutSegments.length)
      return 0;
    return selectedDonutIndex;
  }, [donutSegments.length, selectedDonutIndex]);

  const handleSelectDonutSegment = useCallback(
    (index: number) => {
      if (index < 0 || index >= donutSegments.length) return;
      setSelectedDonutIndex((prev) => {
        const currentSafe =
          prev === -1
            ? -1
            : prev < 0 || prev >= donutSegments.length
              ? 0
              : prev;
        return currentSafe === index ? -1 : index;
      });
    },
    [donutSegments.length],
  );

  // ── Cash flow trend intervals ──────────────────────────────────────────────
  const trendPoints = useMemo<TrendPoint[]>(() => {
    const now = new Date();

    // Determine interval strategy based on timeframe
    type Interval = { label: string; start: Date; end: Date };
    const intervals: Interval[] = [];

    if (timeframe === "30_days") {
      // Weekly intervals over last 30 days (4 weeks + remainder)
      const today = startOfDay(now);
      for (let w = 3; w >= 0; w--) {
        const end = new Date(today);
        end.setDate(today.getDate() - w * 7);
        const start = new Date(end);
        start.setDate(end.getDate() - 6);
        if (w === 3) {
          start.setTime(windowStart.getTime());
        }
        intervals.push({
          label: `Wk ${4 - w}`,
          start,
          end: new Date(
            end.getFullYear(),
            end.getMonth(),
            end.getDate(),
            23,
            59,
            59,
          ),
        });
      }
    } else if (timeframe === "90_days") {
      // Monthly intervals over last 3 months
      for (let m = 2; m >= 0; m--) {
        const start = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const end = new Date(
          now.getFullYear(),
          now.getMonth() - m + 1,
          0,
          23,
          59,
          59,
        );
        const label = start.toLocaleString("en-US", { month: "short" });
        intervals.push({ label, start, end });
      }
    } else {
      // YTD: monthly intervals Jan–current
      for (let m = 0; m <= now.getMonth(); m++) {
        const start = new Date(now.getFullYear(), m, 1);
        const end = new Date(now.getFullYear(), m + 1, 0, 23, 59, 59);
        const label = start.toLocaleString("en-US", { month: "short" });
        intervals.push({ label, start, end });
      }
    }

    // Aggregate per interval
    const raw = intervals.map(({ label, start, end }) => {
      const txs = transactions.filter(
        (tx) => tx.date >= start && tx.date <= end,
      );
      const income = txs
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);
      const expenses = txs
        .filter((t) => t.type === "spent")
        .reduce((s, t) => s + t.amount, 0);
      return { label, income, expenses };
    });

    // Normalize Y values to 0–1 space for SVG
    const maxVal = Math.max(...raw.flatMap((r) => [r.income, r.expenses]), 1);
    return raw.map((r, i) => ({
      label: r.label,
      income: r.income,
      expenses: r.expenses,
      xNorm: raw.length > 1 ? i / (raw.length - 1) : 0.5,
      yIncomeNorm: r.income / maxVal,
      yExpensesNorm: r.expenses / maxVal,
    }));
  }, [transactions, timeframe, windowStart]);

  // ── Summary totals for selected window ────────────────────────────────────
  const windowTotalIncome = useMemo(
    () =>
      windowTransactions
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0),
    [windowTransactions],
  );

  const windowTotalExpenses = useMemo(
    () =>
      windowTransactions
        .filter((t) => t.type === "spent")
        .reduce((s, t) => s + t.amount, 0),
    [windowTransactions],
  );

  const windowNet = windowTotalIncome - windowTotalExpenses;

  // ── Derived donut center text ──────────────────────────────────────────────
  const selectedSegment =
    safeSelectedDonutIndex >= 0
      ? (donutSegments[safeSelectedDonutIndex] ?? null)
      : null;

  // ── Expose ────────────────────────────────────────────────────────────────
  return {
    timeframe,
    setTimeframe,
    heatmapDays,
    donutSegments,
    selectedDonutIndex: safeSelectedDonutIndex,
    setSelectedDonutIndex: handleSelectDonutSegment,
    selectedSegment,
    donutLimit,
    setDonutLimit,
    donutType,
    setDonutType,
    availableDonutCategories,
    excludedCategories: activeExcludedCategories,
    toggleExcludeCategory,
    clearExcludedCategories,
    resetDonutFilters,
    donutFilteredTotal,
    donutUnfilteredTotal,
    donutHasTransactionsForType: donutUnfilteredTotal > 0,
    trendPoints,
    selectedTrendIndex,
    setSelectedTrendIndex,
    windowTotalIncome,
    windowTotalExpenses,
    windowNet,
    // constants reused in charts
    DONUT_RADIUS,
    DONUT_CIRCUMFERENCE,
  };
}
