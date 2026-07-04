import React from "react";
import { View, Text, Pressable } from "react-native";

type TransactionType = "spent" | "income";

interface TransactionTypeTabsProps {
  activeTab: TransactionType;
  onTabChange: (tab: TransactionType) => void;
}

export default function TransactionTypeTabs({
  activeTab,
  onTabChange,
}: TransactionTypeTabsProps) {
  return (
    <View className="flex-row bg-slate-800 p-1.5 rounded-2xl border border-slate-700/50 mb-6">
      {/* Spent tab */}
      <Pressable
        onPress={() => onTabChange("spent")}
        className={`flex-1 py-3 rounded-xl items-center justify-center ${
          activeTab === "spent"
            ? "bg-slate-700 border border-slate-600"
            : "bg-transparent"
        }`}
      >
        <Text
          className={`font-semibold text-sm ${
            activeTab === "spent" ? "text-rose-400" : "text-slate-400"
          }`}
        >
          Spent
        </Text>
      </Pressable>

      {/* Income tab */}
      <Pressable
        onPress={() => onTabChange("income")}
        className={`flex-1 py-3 rounded-xl items-center justify-center ${
          activeTab === "income" ? "bg-emerald-500" : "bg-transparent"
        }`}
      >
        <Text
          className={`font-semibold text-sm ${
            activeTab === "income" ? "text-slate-900" : "text-slate-400"
          }`}
        >
          Income
        </Text>
      </Pressable>
    </View>
  );
}
