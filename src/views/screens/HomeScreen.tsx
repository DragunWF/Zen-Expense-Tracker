import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Eye, EyeOff, ChevronDown, Check, Calendar } from "lucide-react-native";
import { APP_CONFIG } from "../../core/constants";
import {
  DateFilterType,
  useExpense,
} from "../../controllers/useExpenseController";
import { formatAmount, formatDate } from "../../core/helpers";

const FILTER_OPTIONS: { value: DateFilterType; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
  { value: "all_time", label: "All Time" },
];

function getFilterLabel(filter: DateFilterType): string {
  switch (filter) {
    case "today":
      return "Today";
    case "last_7_days":
      return "Last 7 Days";
    case "month":
      return "Month";
    case "year":
      return "Year";
    case "all_time":
      return "All Time";
    default:
      return "Month";
  }
}

export default function HomeScreen() {
  const {
    filteredTransactions: transactions,
    totalIncome,
    totalExpenses,
    isProfitHidden,
    isIncomeHidden,
    isExpensesHidden,
    toggleProfitVisibility,
    toggleIncomeVisibility,
    toggleExpensesVisibility,
    activeDateFilter,
    setDateFilter,
  } = useExpense();

  const [isFilterDropdownOpen, setIsFilterDropdownOpen] =
    useState<boolean>(false);

  // Compute net profit
  const netProfit = useMemo(
    () => totalIncome - totalExpenses,
    [totalIncome, totalExpenses],
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar style="light" />

      {isFilterDropdownOpen && (
        <Pressable
          className="absolute top-0 left-0 right-0 bottom-0 z-40 bg-transparent"
          onPress={() => setIsFilterDropdownOpen(false)}
        />
      )}

      {/* Main scroll area */}
      <View className="flex-1">
        <ScrollView
          className="flex-1 px-5"
          contentContainerClassName="pb-28 pt-4"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View className="flex-row justify-between items-center mb-6 z-50">
            <View>
              <Text className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
              <Text className="text-slate-100 text-2xl font-bold mt-0.5">
                Dashboard
              </Text>
            </View>
            <View className="relative">
              <Pressable
                onPress={() => setIsFilterDropdownOpen((prev) => !prev)}
                className="flex-row items-center bg-slate-800/90 border border-slate-700/80 px-4 py-2.5 rounded-full active:bg-slate-700/50"
              >
                <Calendar size={14} color="#10b981" className="mr-2" />
                <Text className="text-slate-200 text-sm font-semibold ml-1 mr-2">
                  {getFilterLabel(activeDateFilter)}
                </Text>
                <ChevronDown size={14} color="#94a3b8" />
              </Pressable>
            </View>
          </View>

          {/* ── Top Section: Dashboard ── */}
          <View className="mb-6">
            {/* Net Profit Card */}
            <View className="bg-slate-800/50 border border-slate-700/40 rounded-3xl p-6 mb-4">
              <View className="flex-row justify-between items-center w-full mb-1">
                <Text className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
                  Profit
                </Text>
                <Pressable
                  onPress={toggleProfitVisibility}
                  className="p-1 -mr-1 rounded-full active:bg-slate-700/50"
                  hitSlop={8}
                >
                  {isProfitHidden ? (
                    <EyeOff size={16} color="#64748b" />
                  ) : (
                    <Eye size={16} color="#94a3b8" />
                  )}
                </Pressable>
              </View>
              <View className="items-center">
                <Text
                  className={`${netProfit >= 0 ? "text-emerald-400" : "text-rose-400"} text-5xl font-extrabold tracking-tight mt-1`}
                >
                  {isProfitHidden
                    ? "••••••"
                    : `${APP_CONFIG.currencySymbol}${formatAmount(netProfit)}`}
                </Text>
                <View className="h-px w-16 bg-emerald-500/30 mt-3" />
              </View>
            </View>

            {/* Summary Cards */}
            <View className="flex-row justify-between">
              <View className="w-[48%] bg-slate-800 rounded-2xl p-4 border border-slate-700/40">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-slate-400 text-xs font-medium">
                    Total Income
                  </Text>
                  <Pressable
                    onPress={toggleIncomeVisibility}
                    className="p-0.5 rounded-full active:bg-slate-700/50"
                    hitSlop={8}
                  >
                    {isIncomeHidden ? (
                      <EyeOff size={14} color="#64748b" />
                    ) : (
                      <Eye size={14} color="#94a3b8" />
                    )}
                  </Pressable>
                </View>
                <Text className="text-emerald-400 text-xl font-bold">
                  {isIncomeHidden
                    ? "••••••"
                    : `${APP_CONFIG.currencySymbol}${formatAmount(totalIncome)}`}
                </Text>
              </View>
              <View className="w-[48%] bg-slate-800 rounded-2xl p-4 border border-slate-700/40">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-slate-400 text-xs font-medium">
                    Total Expenses
                  </Text>
                  <Pressable
                    onPress={toggleExpensesVisibility}
                    className="p-0.5 rounded-full active:bg-slate-700/50"
                    hitSlop={8}
                  >
                    {isExpensesHidden ? (
                      <EyeOff size={14} color="#64748b" />
                    ) : (
                      <Eye size={14} color="#94a3b8" />
                    )}
                  </Pressable>
                </View>
                <Text className="text-rose-400 text-xl font-bold">
                  {isExpensesHidden
                    ? "••••••"
                    : `${APP_CONFIG.currencySymbol}${formatAmount(totalExpenses)}`}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Middle Section: Recent Activity ── */}
          <View>
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">
              Recent Activity
            </Text>

            <View className="bg-slate-800/40 border border-slate-700/40 rounded-2xl overflow-hidden">
              {transactions.length === 0 ? (
                <View className="py-10 items-center">
                  <Text className="text-slate-500 text-sm">
                    No transactions logged yet.
                  </Text>
                </View>
              ) : (
                transactions.map((tx, index) => (
                  <View
                    key={tx.id}
                    className={`flex-row items-center px-4 py-3.5 ${
                      index < transactions.length - 1
                        ? "border-b border-slate-700/30"
                        : ""
                    }`}
                  >
                    {/* Emoji badge */}
                    <View className="h-10 w-10 rounded-full bg-slate-700/60 items-center justify-center mr-3">
                      <Text className="text-lg">{tx.emoji}</Text>
                    </View>

                    {/* Category + date */}
                    <View className="flex-1">
                      <Text className="text-slate-100 font-semibold text-sm">
                        {tx.category}
                      </Text>
                      <Text className="text-slate-500 text-xs mt-0.5">
                        {formatDate(tx.date)}
                      </Text>
                    </View>

                    {/* Amount */}
                    <Text
                      className={`font-bold text-sm ${
                        tx.type === "income"
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {APP_CONFIG.currencySymbol}
                      {formatAmount(tx.amount)}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Dropdown Menu - rendered outside ScrollView at the root level to ensure touch compatibility on Android/iOS */}
      {isFilterDropdownOpen && (
        <View className="absolute right-5 top-[76px] w-40 bg-slate-800 border border-slate-700/60 rounded-2xl shadow-2xl py-1.5 z-50">
          {FILTER_OPTIONS.map((option) => {
            const isActive = activeDateFilter === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  setDateFilter(option.value);
                  setIsFilterDropdownOpen(false);
                }}
                className="flex-row items-center justify-between px-3 py-2 active:bg-slate-700/40"
              >
                <Text
                  className={`text-xs ${
                    isActive
                      ? "text-emerald-400 font-bold"
                      : "text-slate-300 font-medium"
                  }`}
                >
                  {option.label}
                </Text>
                {isActive && <Check size={12} color="#10b981" />}
              </Pressable>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
}
