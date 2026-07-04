import React from "react";
import { View, Text, Pressable } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { APP_CONFIG } from "../../../core/constants";
import { formatAmount } from "../../../core/helpers";

interface SummaryCardProps {
  title: string;
  amount: number;
  isHidden: boolean;
  onToggleVisibility: () => void;
  type: "income" | "expense";
}

export default function SummaryCard({
  title,
  amount,
  isHidden,
  onToggleVisibility,
  type,
}: SummaryCardProps) {
  const isIncome = type === "income";

  return (
    <View className="w-[48%] bg-slate-800 rounded-2xl p-4 border border-slate-700/40">
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-slate-400 text-xs font-medium">
          {title}
        </Text>
        <Pressable
          onPress={onToggleVisibility}
          className="p-0.5 rounded-full active:bg-slate-700/50"
          hitSlop={8}
        >
          {isHidden ? (
            <EyeOff size={14} color="#64748b" />
          ) : (
            <Eye size={14} color="#94a3b8" />
          )}
        </Pressable>
      </View>
      <Text className={`${isIncome ? "text-emerald-400" : "text-rose-400"} text-xl font-bold`}>
        {isHidden
          ? "••••••"
          : `${APP_CONFIG.currencySymbol}${formatAmount(amount)}`}
      </Text>
    </View>
  );
}
