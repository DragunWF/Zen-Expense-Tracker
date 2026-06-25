import { useState, useEffect, useMemo, useCallback } from "react";
import { ExpenseRepository } from "../models/ExpenseRepository";
import { Category, MappedTransaction } from "../models/types";

export function useExpenseController() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<MappedTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load all categories and transactions, mapping database items to presentation items
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, txs] = await Promise.all([
        ExpenseRepository.getCategories(),
        ExpenseRepository.getTransactions(),
      ]);

      setCategories(cats);

      // Map raw Transaction objects (integer IDs, expense/income types)
      // to UI-ready MappedTransaction objects (string IDs, spent/income types, categories, emojis)
      const mapped: MappedTransaction[] = txs.map((t) => {
        const cat = cats.find((c) => c.id === t.categoryId);
        return {
          id: String(t.id),
          emoji: cat ? cat.icon : "📌",
          category: cat ? cat.name : "Unknown",
          type: t.type === "expense" ? "spent" : "income",
          amount: t.amount,
          date: new Date(t.createdAt),
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

  // Compute income and expenses summary aggregates
  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === "spent")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Log a new transaction, mapping UI transaction types to schema categories
  const logTransaction = useCallback(
    async (amount: number, type: "spent" | "income", categoryId: number) => {
      const dbType = type === "spent" ? "expense" : "income";
      try {
        await ExpenseRepository.insertTransaction({
          amount,
          type: dbType,
          notes: null,
          categoryId,
        });
        await loadData();
      } catch (err: any) {
        setError(err.message || "Failed to log transaction.");
      }
    },
    [loadData],
  );

  // Add a new custom category
  const addCategory = useCallback(
    async (name: string, type: "spent" | "income") => {
      const dbType = type === "spent" ? "expense" : "income";
      try {
        await ExpenseRepository.insertCategory({
          name,
          icon: "📌", // default custom category emoji
          type: dbType,
        });
        await loadData();
      } catch (err: any) {
        setError(err.message || "Failed to add category.");
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
    addCategory,
    refreshData: loadData,
  };
}
export type ExpenseController = ReturnType<typeof useExpenseController>;
