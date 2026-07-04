import { useState, useMemo, useCallback } from "react";
import { Alert, Linking } from "react-native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
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

// ── Validation helpers ────────────────────────────────────────────────────────

function validateBackupPayload(payload: unknown): BackupPayload {
  if (typeof payload !== "object" || payload === null) {
    throw new Error("Invalid backup: root must be a JSON object.");
  }

  const p = payload as Record<string, unknown>;

  if (!Array.isArray(p.categories)) {
    throw new Error('Invalid backup: missing "categories" array.');
  }
  if (!Array.isArray(p.transactions)) {
    throw new Error('Invalid backup: missing "transactions" array.');
  }

  for (const cat of p.categories as unknown[]) {
    const c = cat as Record<string, unknown>;
    if (!c.name || !c.icon || !c.type) {
      throw new Error("Malformed category entry: missing name, icon, or type.");
    }
  }

  for (const tx of p.transactions as unknown[]) {
    const t = tx as Record<string, unknown>;
    if (t.amount === undefined || !t.type || !t.categoryId) {
      throw new Error("Malformed transaction entry: missing amount, type, or categoryId.");
    }
  }

  return payload as BackupPayload;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSettingsController() {
  const { categories, transactions, refreshData } = useExpense();

  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [lastSuccess, setLastSuccess] = useState<string | null>(null);

  const flashSuccess = (msg: string) => {
    setLastSuccess(msg);
    setTimeout(() => setLastSuccess(null), 3000);
  };

  // ── Database statistics (kept for future use, not displayed by default) ────
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

  // ── Export to file ─────────────────────────────────────────────────────────
  const exportToFile = useCallback(async () => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      // 1. Fetch raw data from SQLite
      const data = await ExpenseRepository.exportData();
      const payload: BackupPayload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        categories: data.categories,
        transactions: data.transactions,
      };

      // 2. Write to a temporary cached file using the v2 File class
      const backupFile = new File(Paths.cache, "expense-log-backup.json");
      backupFile.write(JSON.stringify(payload, null, 2));

      // 3. Check sharing is available (not available in some simulators)
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (!isSharingAvailable) {
        Alert.alert(
          "Sharing Unavailable",
          "Your device does not support the native share sheet.",
        );
        return;
      }

      // 4. Open the native OS share sheet with the file URI
      await Sharing.shareAsync(backupFile.uri, {
        mimeType: "application/json",
        dialogTitle: "Save Expense-Log Backup",
        UTI: "public.json",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Export failed.";
      Alert.alert("Export Failed", msg);
    } finally {
      setIsBusy(false);
    }
  }, [isBusy]);

  // ── Import from file ───────────────────────────────────────────────────────
  const importFromFile = useCallback(async () => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      // 1. Open native document picker — JSON files only
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
        multiple: false,
      });

      // User cancelled
      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];

      // 2. Read file content using the v2 File class
      const pickedFile = new File(asset.uri);
      const raw = await pickedFile.text();

      // 3. Parse and validate
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new Error("The selected file contains invalid JSON.");
      }

      const payload = validateBackupPayload(parsed);

      // 4. Strip auto-increment IDs so the DB assigns new ones cleanly
      const cats = payload.categories.map(({ id: _id, ...rest }) => rest);
      const txs = payload.transactions.map(({ id: _id, ...rest }) => rest);

      // 5. Atomic write inside a SQLite transaction
      await ExpenseRepository.importData(cats, txs);

      // 6. Refresh global context so all screens update
      await refreshData();

      flashSuccess("Backup restored successfully!");
      Alert.alert(
        "Import Successful",
        `Restored ${payload.categories.length} categories and ${payload.transactions.length} transactions.`,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Import failed.";
      Alert.alert("Import Failed", msg);
    } finally {
      setIsBusy(false);
    }
  }, [isBusy, refreshData]);

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
              "All transaction history will be lost permanently.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Confirm Reset",
                  style: "destructive",
                  onPress: async () => {
                    setIsBusy(true);
                    try {
                      await ExpenseRepository.resetDatabase();
                      await refreshData();
                      flashSuccess("App data reset successfully.");
                    } catch {
                      Alert.alert("Reset Failed", "Could not reset the database.");
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
    isBusy,
    lastSuccess,
    dbStats,
    exportToFile,
    importFromFile,
    resetDatabase,
    openLinkedIn,
  };
}
