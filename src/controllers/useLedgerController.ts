import {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { ExpenseRepository } from "../models/ExpenseRepository";
import { MappedTransaction } from "../models/types";
import { useExpense } from "./useExpenseController";

// ── Filter & List Types ───────────────────────────────────────────────────────

export type LedgerDateFilter =
  | "today"
  | "this_week"
  | "this_month"
  | "last_month"
  | "all_time";

export type LedgerTypeFilter = "all" | "spent" | "income";

export interface LedgerDateHeaderItem {
  type: "header";
  key: string;
  label: string;
  totalIncome: number;
  totalExpenses: number;
}

export interface LedgerTransactionRowItem {
  type: "row";
  transaction: MappedTransaction;
}

export type LedgerListItem = LedgerDateHeaderItem | LedgerTransactionRowItem;

const PAGE_SIZE = 15;

// ── Date & Grouping Helpers ───────────────────────────────────────────────────

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getDateLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const txDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (txDay.getTime() === today.getTime()) return "TODAY";
  if (txDay.getTime() === yesterday.getTime()) return "YESTERDAY";
  return date
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

export function buildDailyTotalsMap(
  transactions: MappedTransaction[],
): Record<string, { totalIncome: number; totalExpenses: number }> {
  const totals: Record<string, { totalIncome: number; totalExpenses: number }> =
    {};

  for (const tx of transactions) {
    const key = toDateKey(tx.date);
    if (!totals[key]) {
      totals[key] = { totalIncome: 0, totalExpenses: 0 };
    }
    if (tx.type === "income") {
      totals[key].totalIncome += tx.amount;
    } else {
      totals[key].totalExpenses += tx.amount;
    }
  }

  return totals;
}

export function buildLedgerListItems(
  visibleTransactions: MappedTransaction[],
  dailyTotalsByDate: Record<
    string,
    { totalIncome: number; totalExpenses: number }
  >,
): LedgerListItem[] {
  const items: LedgerListItem[] = [];
  let lastDateKey = "";

  for (const tx of visibleTransactions) {
    const dateKey = toDateKey(tx.date);
    if (dateKey !== lastDateKey) {
      const dayTotals = dailyTotalsByDate[dateKey] ?? {
        totalIncome: 0,
        totalExpenses: 0,
      };
      items.push({
        type: "header",
        key: `header-${dateKey}-${items.length}`,
        label: getDateLabel(tx.date),
        totalIncome: dayTotals.totalIncome,
        totalExpenses: dayTotals.totalExpenses,
      });
      lastDateKey = dateKey;
    }
    items.push({ type: "row", transaction: tx });
  }

  return items;
}

// ── Helper: date range resolver ───────────────────────────────────────────────

function resolveDateRange(filter: LedgerDateFilter): {
  start: Date | null;
  end: Date | null;
} {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  switch (filter) {
    case "today":
      return { start: startOfToday, end: null };

    case "this_week": {
      const dayOfWeek = now.getDay(); // 0=Sun
      const start = new Date(startOfToday);
      start.setDate(start.getDate() - dayOfWeek);
      return { start, end: null };
    }

    case "this_month":
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: null,
      };

    case "last_month": {
      const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { start: firstOfLastMonth, end: lastOfLastMonth };
    }

    case "all_time":
    default:
      return { start: null, end: null };
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useLedgerController() {
  // Consume unified data from ExpenseContext
  const {
    categories: allCategories,
    transactions: allTransactions,
    loading,
    error,
    refreshData,
    editTransaction,
  } = useExpense();

  // ── Filter states ────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<LedgerDateFilter>("this_month");
  const [typeFilter, setTypeFilter] = useState<LedgerTypeFilter>("all");
  const [activeCategoryIds, setActiveCategoryIds] = useState<Set<number>>(new Set());

  // ── Pagination ───────────────────────────────────────────────────────────────
  const [pageLimit, setPageLimit] = useState<number>(PAGE_SIZE);

  // Reset page limit whenever filters change
  useEffect(() => {
    setPageLimit(PAGE_SIZE);
  }, [searchQuery, dateFilter, typeFilter, activeCategoryIds]);

  // ── Derived: filtered full list ───────────────────────────────────────────────
  const filteredTransactions = useMemo(() => {
    const { start, end } = resolveDateRange(dateFilter);
    const query = searchQuery.trim().toLowerCase();

    return allTransactions.filter((tx) => {
      // 1. Date range
      if (start && tx.date < start) return false;
      if (end && tx.date > end) return false;

      // 2. Type filter
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;

      // 3. Category filter (empty set = show all)
      if (activeCategoryIds.size > 0) {
        // MappedTransaction.id is a string; we need the numeric categoryId.
        // We re-derive it by matching category name + emoji against allCategories.
        const matchingCat = allCategories.find(
          (c) => c.name === tx.category && c.icon === tx.emoji,
        );
        if (!matchingCat || !activeCategoryIds.has(matchingCat.id)) return false;
      }

      // 4. Search (category name)
      if (query) {
        const matchesCategory = tx.category.toLowerCase().includes(query);
        if (!matchesCategory) return false;
      }

      return true;
    });
  }, [allTransactions, allCategories, searchQuery, dateFilter, typeFilter, activeCategoryIds]);

  // ── Totals for stats card ─────────────────────────────────────────────────────
  const totalIncome = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions],
  );

  const totalExpenses = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === "spent")
        .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions],
  );

  // ── Paginated slice ───────────────────────────────────────────────────────────
  const visibleTransactions = useMemo(
    () => filteredTransactions.slice(0, pageLimit),
    [filteredTransactions, pageLimit],
  );

  // Compute daily totals from the full filtered set so pagination boundaries
  // never produce partial daily totals on visible headers.
  const dailyTotalsByDate = useMemo(
    () => buildDailyTotalsMap(filteredTransactions),
    [filteredTransactions],
  );

  const ledgerListItems = useMemo<LedgerListItem[]>(
    () => buildLedgerListItems(visibleTransactions, dailyTotalsByDate),
    [visibleTransactions, dailyTotalsByDate],
  );

  const totalCount = filteredTransactions.length;
  const visibleCount = visibleTransactions.length;
  const hasMore = visibleCount < totalCount;

  const loadMore = useCallback(() => {
    setPageLimit((prev) => prev + PAGE_SIZE);
  }, []);

  // ── Category filter helpers ───────────────────────────────────────────────────
  const toggleCategoryFilter = useCallback((categoryId: number) => {
    setActiveCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  const clearCategoryFilters = useCallback(() => {
    setActiveCategoryIds(new Set());
  }, []);

  // ── Transaction deletion ──────────────────────────────────────────────────────
  const deleteTransaction = useCallback(
    async (transactionId: string) => {
      try {
        await ExpenseRepository.deleteTransaction(Number(transactionId));
        await refreshData();
      } catch (err: unknown) {
        // Log locally
      }
    },
    [refreshData],
  );

  // ── Expose ────────────────────────────────────────────────────────────────────
  return {
    // Data
    allCategories,
    visibleTransactions,
    ledgerListItems,
    loading,
    error,

    // Filters
    searchQuery,
    setSearchQuery,
    dateFilter,
    setDateFilter,
    typeFilter,
    setTypeFilter,
    activeCategoryIds,
    toggleCategoryFilter,
    clearCategoryFilters,

    // Pagination
    visibleCount,
    totalCount,
    hasMore,
    loadMore,

    // Summaries
    totalIncome,
    totalExpenses,

    // Actions
    deleteTransaction,
    editTransaction,
    refreshData,
  };
}
