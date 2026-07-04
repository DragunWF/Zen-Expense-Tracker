import React from "react";
import { View, Text, Pressable } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { APP_CONFIG } from "../../core/constants";
import { formatAmount } from "../../core/helpers";

interface BalanceCardProps {
  netProfit: number;
  isProfitHidden: boolean;
  onToggleVisibility: () => void;
}

export default function BalanceCard({
  netProfit,
  isProfitHidden,
  onToggleVisibility,
}: BalanceCardProps) {
  const isPositive = netProfit >= 0;

  return (
    <View className="bg-slate-800/50 border border-slate-700/40 rounded-3xl p-6 mb-4">
      <View className="flex-row justify-between items-center w-full mb-1">
        <Text className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
          Profit
        </Text>
        <Pressable
          onPress={onToggleVisibility}
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
          className={`${isPositive ? "text-emerald-400" : "text-rose-400"} text-5xl font-extrabold tracking-tight mt-1`}
        >
          {isProfitHidden
            ? "••••••"
            : `${APP_CONFIG.currencySymbol}${formatAmount(netProfit)}`}
        </Text>
        <View
          className={`h-px w-16 ${isPositive ? "bg-emerald-500/30" : "bg-rose-500/30"} mt-3`}
        />
      </View>
    </View>
  );
}
