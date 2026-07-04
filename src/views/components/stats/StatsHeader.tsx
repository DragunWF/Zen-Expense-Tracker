import React from "react";
import { View, Text, Pressable } from "react-native";
import { StatsTimeframe } from "../../../controllers/useStatsController";

interface StatsHeaderProps {
  timeframe: StatsTimeframe;
  onSelectTimeframe: (t: StatsTimeframe) => void;
}

const TABS: { value: StatsTimeframe; label: string }[] = [
  { value: "30_days", label: "30 Days" },
  { value: "90_days", label: "90 Days" },
  { value: "ytd", label: "Year" },
];

export default function StatsHeader({
  timeframe,
  onSelectTimeframe,
}: StatsHeaderProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <View className="px-5 pt-4 pb-3">
      {/* Title row */}
      <View className="mb-4">
        <Text className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
          {today}
        </Text>
        <Text className="text-slate-100 text-2xl font-bold mt-0.5">
          Analytics
        </Text>
      </View>

      {/* Timeframe segmented control */}
      <View className="flex-row bg-slate-800 p-1 rounded-xl border border-slate-700/50">
        {TABS.map((tab) => {
          const isActive = timeframe === tab.value;
          return (
            <Pressable
              key={tab.value}
              onPress={() => onSelectTimeframe(tab.value)}
              className={`flex-1 py-2 rounded-lg items-center ${
                isActive
                  ? "bg-emerald-500/20 border border-emerald-500/40"
                  : "bg-transparent active:bg-slate-700/40"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  isActive ? "text-emerald-400" : "text-slate-400"
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
