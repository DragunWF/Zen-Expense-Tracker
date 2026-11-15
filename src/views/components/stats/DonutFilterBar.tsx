import React from "react";
import { View, Text, Pressable } from "react-native";
import {
  DonutCategoryLimit,
  DonutTransactionType,
} from "../../../controllers/useStatsController";

interface DonutFilterBarProps {
  donutLimit: DonutCategoryLimit;
  onSelectLimit: (limit: DonutCategoryLimit) => void;
  donutType: DonutTransactionType;
  onSelectType: (type: DonutTransactionType) => void;
  excludedCount: number;
  hasCategoriesToExclude: boolean;
  onOpenExcludeModal: () => void;
}

const LIMIT_OPTIONS: { value: DonutCategoryLimit; label: string }[] = [
  { value: 3, label: "Top 3" },
  { value: 5, label: "Top 5" },
  { value: "all", label: "All" },
];

const TYPE_OPTIONS: { value: DonutTransactionType; label: string }[] = [
  { value: "spent", label: "Spent" },
  { value: "income", label: "Income" },
];

/**
 * Filter bar for the Category Donut Chart (Top-N presets, type toggle, and exclude trigger).
 */
export default function DonutFilterBar({
  donutLimit,
  onSelectLimit,
  donutType,
  onSelectType,
  excludedCount,
  hasCategoriesToExclude,
  onOpenExcludeModal,
}: DonutFilterBarProps) {
  const title =
    donutType === "spent" ? "Expenses by Category" : "Income by Category";

  return (
    <View className="mb-4 gap-2.5">
      {/* Row 1: Title + Top-N preset segmented control */}
      <View className="flex-row items-center justify-between gap-2">
        <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex-shrink">
          {title}
        </Text>

        <View className="flex-row bg-slate-900/70 p-0.5 rounded-lg border border-slate-700/50">
          {LIMIT_OPTIONS.map((opt) => {
            const isActive = donutLimit === opt.value;
            return (
              <Pressable
                key={String(opt.value)}
                onPress={() => onSelectLimit(opt.value)}
                className={`px-2 py-1 rounded-md ${
                  isActive
                    ? "bg-emerald-500/20 border border-emerald-500/40"
                    : "bg-transparent active:bg-slate-700/40"
                }`}
              >
                <Text
                  className={`text-[10px] font-semibold ${
                    isActive ? "text-emerald-400" : "text-slate-400"
                  }`}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Row 2: Type toggle + Exclude categories trigger */}
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row bg-slate-900/70 p-0.5 rounded-lg border border-slate-700/50">
          {TYPE_OPTIONS.map((opt) => {
            const isActive = donutType === opt.value;
            const activeColors =
              opt.value === "spent"
                ? "bg-rose-500/20 border border-rose-500/40"
                : "bg-emerald-500/20 border border-emerald-500/40";
            const activeText =
              opt.value === "spent" ? "text-rose-400" : "text-emerald-400";

            return (
              <Pressable
                key={opt.value}
                onPress={() => onSelectType(opt.value)}
                className={`px-2.5 py-1 rounded-md ${
                  isActive ? activeColors : "bg-transparent active:bg-slate-700/40"
                }`}
              >
                <Text
                  className={`text-[10px] font-semibold ${
                    isActive ? activeText : "text-slate-400"
                  }`}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={onOpenExcludeModal}
          disabled={!hasCategoriesToExclude}
          className={`flex-row items-center px-2.5 py-1 rounded-lg border ${
            !hasCategoriesToExclude
              ? "bg-slate-900/40 border-slate-800 opacity-50"
              : excludedCount > 0
                ? "bg-amber-500/15 border-amber-500/40 active:bg-amber-500/25"
                : "bg-slate-900/70 border-slate-700/50 active:bg-slate-700/40"
          }`}
        >
          <Text
            className={`text-[10px] font-semibold ${
              excludedCount > 0 ? "text-amber-300" : "text-slate-300"
            }`}
          >
            {excludedCount > 0 ? `Excluded (${excludedCount})` : "Filter Categories"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

