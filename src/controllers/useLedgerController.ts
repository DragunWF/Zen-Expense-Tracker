import {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { ExpenseRepository } from "../models/ExpenseRepository";
import { Category, MappedTransaction } from "../models/types";

// ── Filter Types ──────────────────────────────────────────────────────────────

export type LedgerDateFilter =
  | "today"
  | "this_week"
  | "this_month"
  | "last_month"
  | "all_time";

export type LedgerTypeFilter = "all" | "spent" | "income";

const PAGE_SIZE = 15;

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
  // ── Raw data ────────────────────────────────────────────────────────────────
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allTransactions, setAllTransactions] = useState<MappedTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ── Filter states ────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<LedgerDateFilter>("this_month");
  const [typeFilter, setTypeFilter] = useState<LedgerTypeFilter>("all");
  const [activeCategoryIds, setActiveCategoryIds] = useState<Set<number>>(new Set());

  // ── Pagination ───────────────────────────────────────────────────────────────
  const [pageLimit, setPageLimit] = useState<number>(PAGE_SIZE);

  // ── Data loading ─────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, txs] = await Promise.all([
        ExpenseRepository.getCategories(),
        ExpenseRepository.getTransactions(),
      ]);

      setAllCategories(cats);

      // Map raw Transaction → MappedTransaction (same logic as useExpenseController)
      const mapped: MappedTransaction[] = txs.map((t) => {
        const cat = cats.find((c) => c.id === t.categoryId);

        let txDate: Date;
        if (t.createdAt && t.createdAt.includes(" ") && !t.createdAt.includes("T")) {
          txDate = new Date(t.createdAt.replace(" ", "T") + "Z");
        } else {
          txDate = new Date(t.createdAt);
        }

        return {
          id: String(t.id),
          emoji: cat ? cat.icon : "📌",
          category: cat ? cat.name : "Unknown",
          type: t.type === "expense" ? "spent" : "income",
          amount: t.amount,
          date: txDate,
        };
      });

      setAllTransactions(mapped);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load ledger data.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset page limit whenever filters change
  useEffect(() => {
    setPageLimit(PAGE_SIZE);
  }, [searchQuery, dateFilter, typeFilter, activeCategoryIds]);

  // ── Derived: filtered full list ───────────────────────────────────────────────
  const filteredTransactions = useMemo<MappedTransaction[]>(() => {
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

      // 4. Search (category name or notes — notes not in MappedTransaction, match category)
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
        await loadData();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to delete transaction.";
        setError(message);
      }
    },
    [loadData],
  );

  // ── Expose ────────────────────────────────────────────────────────────────────
  return {
    // Data
    allCategories,
    visibleTransactions,
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
    refreshData: loadData,
  };
}
