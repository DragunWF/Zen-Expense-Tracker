import React, { useState, useCallback, useMemo } from "react";
import { View, Text, Pressable, FlatList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  useLedgerController,
  LedgerTypeFilter,
} from "../../controllers/useLedgerController";
import { MappedTransaction } from "../../models/types";
import { useExpense } from "../../controllers/useExpenseController";
import LedgerHeader from "../components/ledger/LedgerHeader";
import LedgerDateFilterDropdown from "../components/ledger/LedgerDateFilterDropdown";
import LedgerStatsCard from "../components/ledger/LedgerStatsCard";
import CategoryFilterSheet from "../components/ledger/CategoryFilterSheet";
import TransactionItem from "../components/ui/TransactionItem";
import EditTransactionModal from "../components/transactionModal/EditTransactionModal";

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_TABS: { value: LedgerTypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "spent", label: "Spent" },
  { value: "income", label: "Income" },
];

// ── Date grouping helpers ─────────────────────────────────────────────────────

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

// ── FlatList item types ───────────────────────────────────────────────────────

type DateHeader = { type: "header"; label: string; key: string };
type TransactionRow = { type: "row"; transaction: MappedTransaction };
type ListItem = DateHeader | TransactionRow;

// ── Screen ────────────────────────────────────────────────────────────────────

export default function LedgerScreen() {
  const {
    allCategories,
    visibleTransactions,
    loading,
    searchQuery,
    setSearchQuery,
    dateFilter,
    setDateFilter,
    typeFilter,
    setTypeFilter,
    activeCategoryIds,
    toggleCategoryFilter,
    clearCategoryFilters,
    visibleCount,
    totalCount,
    hasMore,
    loadMore,
    totalIncome,
    totalExpenses,
    deleteTransaction,
    editTransaction,
  } = useLedgerController();

  const {
    spentCategories,
    incomeCategories,
    addCategory,
    updateCategory,
    deleteCategory: deleteCategoryFromDb,
  } = useExpense();

  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState<boolean>(false);
  const [isCategorySheetOpen, setIsCategorySheetOpen] =
    useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] =
    useState<MappedTransaction | null>(null);

  // ── Build grouped FlatList data ───────────────────────────────────────────
  const flatListData = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];
    let lastLabel = "";

    for (const tx of visibleTransactions) {
      const label = getDateLabel(tx.date);
      if (label !== lastLabel) {
        items.push({ type: "header", label, key: `header-${label}` });
        lastLabel = label;
      }
      items.push({ type: "row", transaction: tx });
    }
    return items;
  }, [visibleTransactions]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleDeleteTransaction = useCallback(
    (id: string) => {
      Alert.alert(
        "Delete Transaction",
        "Are you sure you want to delete this transaction?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteTransaction(id),
          },
        ],
      );
    },
    [deleteTransaction],
  );

  const handleEditTransaction = useCallback((tx: MappedTransaction) => {
    setEditingTransaction(tx);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: ListItem; index: number }) => {
      if (item.type === "header") {
        return (
          <View className="px-5 pt-5 pb-1.5">
            <Text className="text-slate-500 text-[10px] font-bold tracking-widest uppercase">
              {item.label}
            </Text>
          </View>
        );
      }

      // Find the next item to know if this is the last in its group
      const nextItem = flatListData[index + 1];
      const isLast = !nextItem || nextItem.type === "header";

      return (
        <View className="mx-5 bg-slate-800/40 border-x border-slate-700/40">
          <TransactionItem
            transaction={item.transaction}
            isLast={isLast}
            onDelete={handleDeleteTransaction}
            onEdit={handleEditTransaction}
          />
        </View>
      );
    },
    [flatListData, handleDeleteTransaction],
  );

  const keyExtractor = useCallback((item: ListItem, index: number) => {
    if (item.type === "header") return item.key;
    return `tx-${item.transaction.id}-${index}`;
  }, []);

  // ── "Load More" footer ────────────────────────────────────────────────────
  const ListFooter = useCallback(() => {
    if (!hasMore) return null;
    return (
      <Pressable
        onPress={loadMore}
        className="mx-5 mt-4 mb-6 py-3.5 rounded-2xl bg-slate-800 border border-slate-700/50 active:bg-slate-700/60 items-center"
      >
        <Text className="text-slate-300 font-semibold text-sm">Load More</Text>
        <Text className="text-slate-500 text-xs mt-0.5">
          {visibleCount} of {totalCount} shown
        </Text>
      </Pressable>
    );
  }, [hasMore, loadMore, visibleCount, totalCount]);

  // ── Empty list state ──────────────────────────────────────────────────────
  const ListEmpty = useCallback(() => {
    if (loading) return null;
    return (
      <View className="py-20 items-center px-10">
        <Text className="text-4xl mb-3">📭</Text>
        <Text className="text-slate-400 font-semibold text-base text-center">
          No transactions found
        </Text>
        <Text className="text-slate-500 text-sm text-center mt-1">
          Try adjusting your filters or date range.
        </Text>
      </View>
    );
  }, [loading]);

  // ── Active category count badge ───────────────────────────────────────────
  const activeCatCount = activeCategoryIds.size;

  // ── Backdrop dismiss for dropdown ─────────────────────────────────────────
  const Backdrop = () =>
    isDateDropdownOpen ? (
      <Pressable
        className="absolute inset-0 z-40"
        onPress={() => setIsDateDropdownOpen(false)}
      />
    ) : null;

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar style="light" />

      {/* Sticky header section */}
      <LedgerHeader
        dateFilter={dateFilter}
        onToggleDateDropdown={() => setIsDateDropdownOpen((p) => !p)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Type filter tabs + category filter button */}
      <View className="flex-row items-center px-5 pt-1 pb-3 gap-2">
        {/* All / Spent / Income segmented tabs */}
        <View className="flex-row flex-1 bg-slate-800 p-1 rounded-xl border border-slate-700/50">
          {TYPE_TABS.map((tab) => {
            const isActive = typeFilter === tab.value;
            return (
              <Pressable
                key={tab.value}
                onPress={() => setTypeFilter(tab.value)}
                className={`flex-1 py-2 rounded-lg items-center ${
                  isActive
                    ? tab.value === "spent"
                      ? "bg-rose-500/20 border border-rose-500/40"
                      : tab.value === "income"
                        ? "bg-emerald-500/20 border border-emerald-500/40"
                        : "bg-slate-700 border border-slate-600"
                    : "bg-transparent"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isActive
                      ? tab.value === "spent"
                        ? "text-rose-400"
                        : tab.value === "income"
                          ? "text-emerald-400"
                          : "text-slate-200"
                      : "text-slate-400"
                  }`}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Category filter pill */}
        <Pressable
          onPress={() => setIsCategorySheetOpen(true)}
          className={`flex-row items-center px-3 py-2.5 rounded-xl border ${
            activeCatCount > 0
              ? "bg-emerald-500/15 border-emerald-500/50"
              : "bg-slate-800 border-slate-700/50 active:bg-slate-700/50"
          }`}
        >
          <Text className="text-base">🏷️</Text>
          {activeCatCount > 0 && (
            <View className="ml-1.5 bg-emerald-500 rounded-full w-4 h-4 items-center justify-center">
              <Text className="text-slate-900 text-[9px] font-bold">
                {activeCatCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Stats card */}
      <LedgerStatsCard
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        visibleCount={visibleCount}
        totalCount={totalCount}
      />

      {/* Grouped transaction FlatList */}
      <View className="flex-1">
        <FlatList
          data={flatListData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListFooterComponent={ListFooter}
          ListEmptyComponent={ListEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          // Group borders: we close the rounded container per date group
          getItemLayout={undefined}
          removeClippedSubviews
          maxToRenderPerBatch={20}
          windowSize={10}
        />
      </View>

      {/* Date filter dropdown (absolute, z-50) */}
      <Backdrop />
      <LedgerDateFilterDropdown
        visible={isDateDropdownOpen}
        activeFilter={dateFilter}
        onSelectFilter={(f) => {
          setDateFilter(f);
          setIsDateDropdownOpen(false);
        }}
        onClose={() => setIsDateDropdownOpen(false)}
      />

      {/* Category bottom-sheet */}
      <CategoryFilterSheet
        visible={isCategorySheetOpen}
        allCategories={allCategories}
        activeCategoryIds={activeCategoryIds}
        onToggleCategory={toggleCategoryFilter}
        onClearAll={clearCategoryFilters}
        onClose={() => setIsCategorySheetOpen(false)}
      />

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        visible={!!editingTransaction}
        transaction={editingTransaction}
        onClose={() => setEditingTransaction(null)}
        categories={
          editingTransaction?.type === "spent"
            ? spentCategories
            : incomeCategories
        }
        onAddCategory={addCategory}
        onUpdateCategory={updateCategory}
        onDeleteCategory={deleteCategoryFromDb}
        onEditTransaction={editTransaction}
      />
    </SafeAreaView>
  );
}
