import React from "react";
import { View, Text, Pressable } from "react-native";

interface DbStats {
  transactionCount: number;
  categoryCount: number;
  formattedSpent: string;
  formattedIncome: string;
}

interface DevBioCardProps {
  isExpanded: boolean;
  onToggle: () => void;
  dbStats: DbStats;
}

export default function DevBioCard({
  isExpanded,
  onToggle,
  dbStats,
}: DevBioCardProps) {
  return (
    <View className="mx-5 mb-4 rounded-2xl border border-emerald-500/30 bg-slate-800/60 overflow-hidden">
      {/* Emerald top accent line */}
      <View className="h-0.5 bg-emerald-500/60 w-full" />

      <View className="px-4 pt-4 pb-4">
        {/* Badge + name row */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
            <Text className="text-emerald-400 text-[9px] font-bold uppercase tracking-widest">
              Developer
            </Text>
          </View>
          <Text className="text-slate-500 text-[10px]">v1.0.0</Text>
        </View>

        {/* Name */}
        <Text className="text-slate-100 text-xl font-bold tracking-wide mb-0.5">
          Marc Plarisan
        </Text>
        <Text className="text-slate-400 text-xs font-medium mb-3">
          Lead Creator & Core Dev
        </Text>

        {/* Tech stack badges */}
        <View className="flex-row flex-wrap gap-1.5 mb-3">
          {["Expo", "SQLite", "Drizzle", "NativeWind", "React Native"].map((tech) => (
            <View
              key={tech}
              className="bg-slate-700/80 border border-slate-600/40 px-2 py-0.5 rounded-full"
            >
              <Text className="text-slate-400 text-[9px] font-medium">{tech}</Text>
            </View>
          ))}
        </View>

        {/* Expand/Collapse database stats */}
        <Pressable
          onPress={onToggle}
          className="flex-row items-center justify-between bg-slate-900/60 border border-slate-700/40 rounded-xl px-3 py-2.5 active:bg-slate-700/40"
        >
          <Text className="text-slate-400 text-xs font-semibold">
            Database Statistics
          </Text>
          <Text className="text-emerald-400 text-xs font-bold">
            {isExpanded ? "▲ Hide" : "▼ Show"}
          </Text>
        </Pressable>

        {/* Stats panel */}
        {isExpanded && (
          <View className="mt-2 bg-slate-900/60 border border-slate-700/40 rounded-xl px-3 py-3">
            <View className="flex-row justify-between mb-2">
              <View className="items-center flex-1">
                <Text className="text-emerald-400 text-base font-bold">
                  {dbStats.transactionCount}
                </Text>
                <Text className="text-slate-500 text-[10px] mt-0.5">Transactions</Text>
              </View>
              <View className="w-px bg-slate-700/60" />
              <View className="items-center flex-1">
                <Text className="text-slate-100 text-base font-bold">
                  {dbStats.categoryCount}
                </Text>
                <Text className="text-slate-500 text-[10px] mt-0.5">Categories</Text>
              </View>
            </View>
            <View className="h-px bg-slate-700/40 mb-2" />
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-rose-400 text-xs font-bold">
                  {dbStats.formattedSpent}
                </Text>
                <Text className="text-slate-500 text-[10px] mt-0.5">Total Spent</Text>
              </View>
              <View className="w-px bg-slate-700/60" />
              <View className="items-center flex-1">
                <Text className="text-emerald-400 text-xs font-bold">
                  {dbStats.formattedIncome}
                </Text>
                <Text className="text-slate-500 text-[10px] mt-0.5">Total Income</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
