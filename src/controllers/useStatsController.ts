import { useMemo, useState } from "react";
import { useExpense } from "./useExpenseController";
import { MappedTransaction } from "../models/types";
import { APP_CONFIG } from "../core/constants";
import { formatAmount } from "../core/helpers";

// ── Types ─────────────────────────────────────────────────────────────────────

export type StatsTimeframe = "30_days" | "90_days" | "ytd";

export interface HeatmapDay {
  date: Date;
  dateKey: string; // "YYYY-MM-DD"
  count: number;
  total: number;
  level: 0 | 1 | 2 | 3 | 4; // 0=empty, 4=highest activity
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

// ── Segment color palette (emerald excluded — reserved for income) ─────────────
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

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useStatsController() {
  const { transactions, categories } = useExpense();

  const [timeframe, setTimeframe] = useState<StatsTimeframe>("30_days");
  const [selectedDonutIndex, setSelectedDonutIndex] = useState<number>(0);
  const [selectedTrendIndex, setSelectedTrendIndex] = useState<number | null>(null);

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

  // ── Heatmap: always last 90 days regardless of timeframe selector ──────────
  const heatmapDays = useMemo<HeatmapDay[]>(() => {
    const today = startOfDay(new Date());
    const start = subtractDays(today, 89);

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
      if (ratio > 0) level = ratio <= 0.25 ? 1 : ratio <= 0.5 ? 2 : ratio <= 0.75 ? 3 : 4;

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

  // ── Donut segments: expense breakdown by category ──────────────────────────
  const donutSegments = useMemo<DonutSegment[]>(() => {
    const expenseTxs = windowTransactions.filter((tx) => tx.type === "spent");
    const totalSpent = expenseTxs.reduce((s, tx) => s + tx.amount, 0);
    if (totalSpent === 0) return [];

    // Group by category
    const grouped: Record<string, { amount: number; emoji: string }> = {};
    for (const tx of expenseTxs) {
      if (!grouped[tx.category]) {
        grouped[tx.category] = { amount: 0, emoji: tx.emoji };
      }
      grouped[tx.category].amount += tx.amount;
    }

    // Sort descending
    const sorted = Object.entries(grouped).sort((a, b) => b[1].amount - a[1].amount);

    // Build SVG donut segments via stroke-dashoffset
    let cumulativeOffset = 0; // starts at top (90° rotation handled via SVG transform)
    return sorted.map(([category, { amount, emoji }], i) => {
      const percentage = (amount / totalSpent) * 100;
      const dash = (percentage / 100) * DONUT_CIRCUMFERENCE;
      const gap = DONUT_CIRCUMFERENCE - dash;
      const strokeDashoffset = DONUT_CIRCUMFERENCE - cumulativeOffset;
      cumulativeOffset += dash;

      return {
        category,
        emoji,
        amount,
        percentage,
        strokeDasharray: `${dash} ${gap}`,
        strokeDashoffset,
        color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
      };
    });
  }, [windowTransactions]);

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
          end: new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59),
        });
      }
    } else if (timeframe === "90_days") {
      // Monthly intervals over last 3 months
      for (let m = 2; m >= 0; m--) {
        const start = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - m + 1, 0, 23, 59, 59);
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
      const txs = transactions.filter((tx) => tx.date >= start && tx.date <= end);
      const income = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const expenses = txs.filter((t) => t.type === "spent").reduce((s, t) => s + t.amount, 0);
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
    () => windowTransactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
    [windowTransactions],
  );

  const windowTotalExpenses = useMemo(
    () => windowTransactions.filter((t) => t.type === "spent").reduce((s, t) => s + t.amount, 0),
    [windowTransactions],
  );

  const windowNet = windowTotalIncome - windowTotalExpenses;

  // ── Derived donut center text ──────────────────────────────────────────────
  const selectedSegment = donutSegments[selectedDonutIndex] ?? null;

  // ── Expose ────────────────────────────────────────────────────────────────
  return {
    timeframe,
    setTimeframe,
    heatmapDays,
    donutSegments,
    selectedDonutIndex,
    setSelectedDonutIndex,
    selectedSegment,
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
