import { useState, useEffect, useMemo, useCallback, createContext, useContext } from "react";
import { ExpenseRepository } from "../models/ExpenseRepository";
import { Category, MappedTransaction } from "../models/types";

export type DateFilterType =
  | "today"
  | "last_7_days"
  | "month"
  | "year"
  | "all_time";

export function useExpenseController() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<MappedTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // States for hiding balance cards
  const [isProfitHidden, setIsProfitHidden] = useState<boolean>(false);
  const [isIncomeHidden, setIsIncomeHidden] = useState<boolean>(false);
  const [isExpensesHidden, setIsExpensesHidden] = useState<boolean>(false);

  // State for active date filter
  const [activeDateFilter, setActiveDateFilter] =
    useState<DateFilterType>("month");

  const toggleProfitVisibility = useCallback(() => {
    setIsProfitHidden((prev) => {
      const next = !prev;
      ExpenseRepository.setHomePreference("isProfitHidden", String(next)).catch(console.error);
      return next;
    });
  }, []);

  const toggleIncomeVisibility = useCallback(() => {
    setIsIncomeHidden((prev) => {
      const next = !prev;
      ExpenseRepository.setHomePreference("isIncomeHidden", String(next)).catch(console.error);
      return next;
    });
  }, []);

  const toggleExpensesVisibility = useCallback(() => {
    setIsExpensesHidden((prev) => {
      const next = !prev;
      ExpenseRepository.setHomePreference("isExpensesHidden", String(next)).catch(console.error);
      return next;
    });
  }, []);

  const setDateFilter = useCallback((filter: DateFilterType) => {
    setActiveDateFilter(filter);
    ExpenseRepository.setHomePreference("activeDateFilter", filter).catch(console.error);
  }, []);

  // Load all categories and transactions, mapping database items to presentation items
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, txs, prefs] = await Promise.all([
        ExpenseRepository.getCategories(),
        ExpenseRepository.getTransactions(),
        ExpenseRepository.getHomePreferences(),
      ]);

      setCategories(cats);

      setActiveDateFilter(prefs.activeDateFilter as DateFilterType);
      setIsProfitHidden(prefs.isProfitHidden);
      setIsIncomeHidden(prefs.isIncomeHidden);
      setIsExpensesHidden(prefs.isExpensesHidden);

      // Map raw Transaction objects (integer IDs, expense/income types)
      // to UI-ready MappedTransaction objects (string IDs, spent/income types, categories, emojis)
      const mapped: MappedTransaction[] = txs.map((t) => {
        const cat = cats.find((c) => c.id === t.categoryId);

        // SQLite CURRENT_TIMESTAMP format is: YYYY-MM-DD HH:MM:SS
        // Hermes/JSC require standard ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ
        // So we replace the space with 'T' and append 'Z' to treat it as UTC.
        let txDate: Date;
        if (
          t.createdAt &&
          t.createdAt.includes(" ") &&
          !t.createdAt.includes("T")
        ) {
          txDate = new Date(t.createdAt.replace(" ", "T") + "Z");
        } else {
          txDate = new Date(t.createdAt);
        }

        return {
          id: String(t.id),
          emoji: cat ? cat.icon : "📌",
          category: cat ? cat.name : "Unknown",
          categoryId: t.categoryId,
          type: t.type === "expense" ? "spent" : "income",
          amount: t.amount,
          date: txDate,
          notes: t.notes,
        };
      });

      setTransactions(mapped);
    } catch (err: any) {
      setError(err.message || "Failed to load expense tracker data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter categories by type (spent/income) formatted for the UI
  const spentCategories = useMemo(() => {
    return categories.filter((c) => c.type === "expense");
  }, [categories]);

  const incomeCategories = useMemo(() => {
    return categories.filter((c) => c.type === "income");
  }, [categories]);

  // Filtered transactions selector
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfLast7Days = new Date(
      startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000,
    );

    return transactions.filter((tx) => {
      const txDate = tx.date;
      if (!txDate || isNaN(txDate.getTime())) {
        return false;
      }
      switch (activeDateFilter) {
        case "today":
          return (
            txDate.getFullYear() === now.getFullYear() &&
            txDate.getMonth() === now.getMonth() &&
            txDate.getDate() === now.getDate()
          );
        case "last_7_days":
          return txDate.getTime() >= startOfLast7Days.getTime();
        case "month":
          return (
            txDate.getFullYear() === now.getFullYear() &&
            txDate.getMonth() === now.getMonth()
          );
        case "year":
          return txDate.getFullYear() === now.getFullYear();
        case "all_time":
        default:
          return true;
      }
    });
  }, [transactions, activeDateFilter]);

  // Compute income and expenses summary aggregates
  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalExpenses = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === "spent")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  // Log a new transaction, mapping UI transaction types to schema categories
  const logTransaction = useCallback(
    async (amount: number, type: "spent" | "income", categoryId: number, notes: string | null = null) => {
      const dbType = type === "spent" ? "expense" : "income";
      try {
        await ExpenseRepository.insertTransaction({
          amount,
          type: dbType,
          notes,
          categoryId,
        });
        await loadData();
      } catch (err: any) {
        setError(err.message || "Failed to log transaction.");
      }
    },
    [loadData],
  );

  // Edit an existing transaction
  const editTransaction = useCallback(
    async (id: string, amount: number, categoryId: number, date: Date, notes: string | null = null) => {
      try {
        const isoString = date.toISOString();
        const createdAt = isoString.replace("T", " ").slice(0, 19);
        await ExpenseRepository.updateTransaction(Number(id), {
          amount,
          categoryId,
          createdAt,
          notes,
        });
        await loadData();
      } catch (err: any) {
        setError(err.message || "Failed to edit transaction.");
      }
    },
    [loadData],
  );

  // Add a new custom category
  const addCategory = useCallback(
    async (name: string, icon: string, type: "spent" | "income") => {
      const dbType = type === "spent" ? "expense" : "income";
      try {
        await ExpenseRepository.insertCategory({
          name,
          icon, // Use the dynamically passed icon
          type: dbType,
        });
        await loadData();
      } catch (err: any) {
        setError(err.message || "Failed to add category.");
      }
    },
    [loadData],
  );

  // Update an existing category
  const updateCategory = useCallback(
    async (id: number, name: string, icon: string) => {
      try {
        await ExpenseRepository.updateCategory(id, name, icon);
        await loadData();
      } catch (err: any) {
        setError(err.message || "Failed to update category.");
      }
    },
    [loadData],
  );

  // Delete an existing category
  const deleteCategory = useCallback(
    async (categoryId: number) => {
      try {
        await ExpenseRepository.deleteCategory(categoryId);
        await loadData();
      } catch (err: any) {
        setError(err.message || "Failed to delete category.");
      }
    },
    [loadData],
  );

  // Initial load on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    categories,
    spentCategories,
    incomeCategories,
    transactions,
    totalIncome,
    totalExpenses,
    loading,
    error,
    logTransaction,
    editTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshData: loadData,
    isProfitHidden,
    isIncomeHidden,
    isExpensesHidden,
    toggleProfitVisibility,
    toggleIncomeVisibility,
    toggleExpensesVisibility,
    activeDateFilter,
    setDateFilter,
    filteredTransactions,
  };
}
export type ExpenseController = ReturnType<typeof useExpenseController>;

export const ExpenseContext = createContext<ExpenseController | null>(null);

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpense must be used within an ExpenseProvider");
  }
  return context;
};
