import React, { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { APP_CONFIG } from "../../core/constants";
import { MappedTransaction } from "../../models/types";

// Props interface for the presentational screen view
export interface HomeScreenProps {
  transactions: MappedTransaction[];
  totalIncome: number;
  totalExpenses: number;
}

// ── Helpers ──
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatAmount(value: number): string {
  return value.toLocaleString("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function HomeScreen({
  transactions,
  totalIncome,
  totalExpenses,
}: HomeScreenProps) {
  // Compute net profit
  const netProfit = useMemo(
    () => totalIncome - totalExpenses,
    [totalIncome, totalExpenses],
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar style="light" />

      {/* Main scroll area */}
      <View className="flex-1">
        <ScrollView
          className="flex-1 px-5"
          contentContainerClassName="pb-28 pt-4"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View className="flex-row justify-between items-center mb-6">
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
            <View className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 items-center justify-center">
              <Text className="text-emerald-400 font-bold text-sm">EL</Text>
            </View>
          </View>

          {/* ── Top Section: Dashboard ── */}
          <View className="mb-6">
            {/* Net Profit Card */}
            <View className="bg-slate-800/50 border border-slate-700/40 rounded-3xl p-6 items-center mb-4">
              <Text className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
                Profit
              </Text>
              <Text className="text-emerald-400 text-5xl font-extrabold tracking-tight mt-1">
                {APP_CONFIG.currencySymbol}
                {formatAmount(netProfit)}
              </Text>
              <View className="h-px w-16 bg-emerald-500/30 mt-3" />
            </View>

            {/* Summary Cards */}
            <View className="flex-row justify-between">
              <View className="w-[48%] bg-slate-800 rounded-2xl p-4 border border-slate-700/40">
                <Text className="text-slate-400 text-xs font-medium mb-1">
                  Total Income
                </Text>
                <Text className="text-emerald-400 text-xl font-bold">
                  {APP_CONFIG.currencySymbol}
                  {formatAmount(totalIncome)}
                </Text>
              </View>
              <View className="w-[48%] bg-slate-800 rounded-2xl p-4 border border-slate-700/40">
                <Text className="text-slate-400 text-xs font-medium mb-1">
                  Total Expenses
                </Text>
                <Text className="text-rose-400 text-xl font-bold">
                  {APP_CONFIG.currencySymbol}
                  {formatAmount(totalExpenses)}
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
    </SafeAreaView>
  );
}
