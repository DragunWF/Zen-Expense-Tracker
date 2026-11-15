import React from "react";
import { View, Text, Pressable } from "react-native";
import {
  DonutSegment,
  DonutTransactionType,
} from "../../../controllers/useStatsController";
import { APP_CONFIG } from "../../../core/constants";
import { formatAmount, formatPercentage } from "../../../core/helpers";

interface DonutSelectionDetailProps {
  selectedSegment: DonutSegment | null;
  donutType: DonutTransactionType;
  onShowAll: () => void;
}

/**
 * Detail panel under the donut chart, including drill-down breakdown for "Others".
 */
export default function DonutSelectionDetail({
  selectedSegment,
  donutType,
  onShowAll,
}: DonutSelectionDetailProps) {
  if (!selectedSegment) {
    return (
      <Text className="mt-3 text-slate-500 text-[11px] text-center">
        Tap a category in the legend to inspect details
      </Text>
    );
  }

  const amountColorClass =
    donutType === "spent" ? "text-rose-400" : "text-emerald-400";

  if (selectedSegment.isOthers && selectedSegment.subCategories?.length) {
    return (
      <View className="mt-3 bg-slate-900/60 border border-slate-700/40 rounded-xl px-3 py-2.5">
        {/* Header row */}
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-row items-center flex-1">
            <Text className="text-slate-200 text-xs font-semibold">
              {selectedSegment.emoji} {selectedSegment.category}
            </Text>
            <Text className="text-slate-400 text-[10px] ml-1.5">
              ({selectedSegment.subCategories.length} categories)
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Text className={`text-xs font-bold ${amountColorClass}`}>
              {APP_CONFIG.currencySymbol}
              {formatAmount(selectedSegment.amount)}
            </Text>
            <Pressable
              onPress={onShowAll}
              className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/40 active:bg-emerald-500/25"
            >
              <Text className="text-emerald-400 text-[10px] font-semibold">
                Show all
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Rolled-up sub-categories list */}
        <View className="mt-2 pt-2 border-t border-slate-700/40 gap-1.5">
          {selectedSegment.subCategories.map((sub) => (
            <View
              key={sub.category}
              className="flex-row items-center justify-between"
            >
              <Text
                className="text-slate-300 text-[11px] flex-1 pr-2"
                numberOfLines={1}
              >
                {sub.emoji} {sub.category}
              </Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-slate-500 text-[10px] font-semibold">
                  {formatPercentage(sub.percentage)}
                </Text>
                <Text className="text-slate-300 text-[11px] font-semibold">
                  {APP_CONFIG.currencySymbol}
                  {formatAmount(sub.amount)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View className="mt-3 bg-slate-900/60 border border-slate-700/40 rounded-xl px-3 py-2 flex-row justify-between items-center">
      <Text className="text-slate-300 text-xs font-semibold flex-1 pr-2" numberOfLines={1}>
        {selectedSegment.emoji} {selectedSegment.category}
      </Text>
      <View className="flex-row items-center gap-2">
        <Text className="text-slate-400 text-[10px] font-semibold">
          {formatPercentage(selectedSegment.percentage)}
        </Text>
        <Text className={`text-xs font-bold ${amountColorClass}`}>
          {APP_CONFIG.currencySymbol}
          {formatAmount(selectedSegment.amount)}
        </Text>
      </View>
    </View>
  );
}
