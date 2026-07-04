import { useState, useMemo, useCallback } from "react";
import { Alert, Clipboard, Linking } from "react-native";
import { ExpenseRepository } from "../models/ExpenseRepository";
import { Category, Transaction } from "../models/types";
import { useExpense } from "./useExpenseController";
import { APP_CONFIG } from "../core/constants";
import { formatAmount } from "../core/helpers";

// ── Backup payload shape ───────────────────────────────────────────────────────

export interface BackupPayload {
  version: number;
  exportedAt: string;
  categories: Category[];
  transactions: Transaction[];
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSettingsController() {
  const { categories, transactions, refreshData } = useExpense();

  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isStatsExpanded, setIsStatsExpanded] = useState<boolean>(false);

  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastSuccess, setLastSuccess] = useState<string | null>(null);

  // ── Database statistics ────────────────────────────────────────────────────
  const dbStats = useMemo(() => {
    const totalSpent = transactions
      .filter((t) => t.type === "spent")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      transactionCount: transactions.length,
      categoryCount: categories.length,
      totalSpent,
      totalIncome,
      formattedSpent: `${APP_CONFIG.currencySymbol}${formatAmount(totalSpent)}`,
      formattedIncome: `${APP_CONFIG.currencySymbol}${formatAmount(totalIncome)}`,
    };
  }, [transactions, categories]);

  // ── Export ─────────────────────────────────────────────────────────────────
  const [exportJson, setExportJson] = useState<string>("");

  const buildExport = useCallback(async () => {
    setIsBusy(true);
    setLastError(null);
    try {
      const data = await ExpenseRepository.exportData();
      const payload: BackupPayload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        categories: data.categories,
        transactions: data.transactions,
      };
      const json = JSON.stringify(payload, null, 2);
      setExportJson(json);
      setIsExportModalOpen(true);
    } catch {
      setLastError("Failed to build export.");
    } finally {
      setIsBusy(false);
    }
  }, []);

  const copyToClipboard = useCallback(() => {
    Clipboard.setString(exportJson);
    setLastSuccess("Backup copied to clipboard!");
    setTimeout(() => setLastSuccess(null), 3000);
  }, [exportJson]);

  // ── Import ─────────────────────────────────────────────────────────────────
  const importFromJson = useCallback(
    async (rawJson: string) => {
      setIsBusy(true);
      setLastError(null);
      try {
        const payload = JSON.parse(rawJson) as Partial<BackupPayload>;

        // Validate shape
        if (
          !Array.isArray(payload.categories) ||
          !Array.isArray(payload.transactions)
        ) {
          throw new Error(
            'Invalid backup format. Expected "categories" and "transactions" arrays.',
          );
        }

        // Validate category rows
        for (const cat of payload.categories) {
          if (!cat.name || !cat.icon || !cat.type) {
            throw new Error("Malformed category entry in backup.");
          }
        }

        // Validate transaction rows
        for (const tx of payload.transactions) {
          if (tx.amount === undefined || !tx.type || !tx.categoryId) {
            throw new Error("Malformed transaction entry in backup.");
          }
        }

        // Strip auto-increment IDs so the DB assigns new ones cleanly
        const cats = payload.categories.map(({ id: _id, ...rest }) => rest);
        const txs = payload.transactions.map(({ id: _id, ...rest }) => rest);

        await ExpenseRepository.importData(cats, txs);
        await refreshData();

        setIsImportModalOpen(false);
        setLastSuccess("Data imported successfully!");
        setTimeout(() => setLastSuccess(null), 3000);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Import failed.";
        setLastError(msg);
      } finally {
        setIsBusy(false);
      }
    },
    [refreshData],
  );

  // ── Reset ──────────────────────────────────────────────────────────────────
  const resetDatabase = useCallback(() => {
    Alert.alert(
      "Reset All Data",
      "This will permanently delete all your transactions and custom categories. Default categories will be restored.\n\nThis action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Are you absolutely sure?",
              'Type "RESET" in your mind and tap confirm to proceed.',
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Confirm Reset",
                  style: "destructive",
                  onPress: async () => {
                    setIsBusy(true);
                    setLastError(null);
                    try {
                      await ExpenseRepository.resetDatabase();
                      await refreshData();
                      setLastSuccess("Database reset successfully.");
                      setTimeout(() => setLastSuccess(null), 3000);
                    } catch {
                      setLastError("Failed to reset database.");
                    } finally {
                      setIsBusy(false);
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  }, [refreshData]);

  // ── LinkedIn ───────────────────────────────────────────────────────────────
  const openLinkedIn = useCallback(() => {
    Linking.openURL("https://www.linkedin.com/in/marcplarisan/").catch(() => {
      Alert.alert(
        "Could not open LinkedIn",
        "Please check your internet connection.",
      );
    });
  }, []);

  return {
    // Modals
    isExportModalOpen,
    setIsExportModalOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    // Dev bio card expansion
    isStatsExpanded,
    setIsStatsExpanded,
    // Status
    isBusy,
    lastError,
    setLastError,
    lastSuccess,
    // Stats
    dbStats,
    // Export
    exportJson,
    buildExport,
    copyToClipboard,
    // Import
    importFromJson,
    // Actions
    resetDatabase,
    openLinkedIn,
  };
}
