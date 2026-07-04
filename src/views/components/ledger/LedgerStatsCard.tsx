import React from "react";
import { View, Text } from "react-native";
import { APP_CONFIG } from "../../../core/constants";
import { formatAmount } from "../../../core/helpers";

interface LedgerStatsCardProps {
  totalIncome: number;
  totalExpenses: number;
  visibleCount: number;
  totalCount: number;
}

export default function LedgerStatsCard({
  totalIncome,
  totalExpenses,
  visibleCount,
  totalCount,
}: LedgerStatsCardProps) {
  return (
    <View className="mx-5 mb-3 bg-slate-800/50 border border-slate-700/40 rounded-2xl px-4 py-3">
      <View className="flex-row justify-between items-center">
        {/* Transaction count */}
        <Text className="text-slate-400 text-xs font-medium">
          Showing{" "}
          <Text className="text-slate-200 font-bold">{visibleCount}</Text>
          {" "}of{" "}
          <Text className="text-slate-200 font-bold">{totalCount}</Text>
          {" "}transactions
        </Text>
      </View>

      {/* Income / Expense totals */}
      <View className="flex-row mt-2 gap-4">
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
          <Text className="text-slate-400 text-xs mr-1">In</Text>
          <Text className="text-emerald-400 text-xs font-bold">
            {APP_CONFIG.currencySymbol}{formatAmount(totalIncome)}
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-rose-500 mr-1.5" />
          <Text className="text-slate-400 text-xs mr-1">Out</Text>
          <Text className="text-rose-400 text-xs font-bold">
            {APP_CONFIG.currencySymbol}{formatAmount(totalExpenses)}
          </Text>
        </View>
      </View>
    </View>
  );
}
