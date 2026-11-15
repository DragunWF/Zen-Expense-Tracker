import React, { useMemo } from "react";
import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import {
  DonutFilterCategoryOption,
  DonutTransactionType,
} from "../../../controllers/useStatsController";
import { APP_CONFIG } from "../../../core/constants";
import { formatAmount } from "../../../core/helpers";

interface DonutExcludeModalProps {
  visible: boolean;
  donutType: DonutTransactionType;
  availableCategories: DonutFilterCategoryOption[];
  excludedCategories: string[];
  onToggleExclude: (category: string) => void;
  onClearExcluded: () => void;
  onClose: () => void;
}

/**
 * Bottom sheet modal for toggling categories excluded from the Stats donut chart.
 */
export default function DonutExcludeModal({
  visible,
  donutType,
  availableCategories,
  excludedCategories,
  onToggleExclude,
  onClearExcluded,
  onClose,
}: DonutExcludeModalProps) {
  const excludedSet = useMemo(
    () => new Set(excludedCategories),
    [excludedCategories],
  );
  const excludedCount = excludedCategories.length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable
        className="flex-1 bg-black/60 justify-end"
        onPress={onClose}
      >
        {/* Sheet */}
        <Pressable
          className="bg-slate-900 rounded-t-3xl px-5 pt-3 pb-10 border-t border-slate-700/50"
          onPress={() => {
            /* swallows backdrop tap */
          }}
        >
          {/* Drag handle */}
          <View className="w-10 h-1 rounded-full bg-slate-700 self-center mb-4" />

          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1 pr-2">
              <Text className="text-slate-100 text-lg font-bold">
                Filter {donutType === "spent" ? "Expense" : "Income"} Categories
              </Text>
              <Text className="text-slate-400 text-xs mt-0.5">
                Tap a category to hide or include it in the chart
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              {excludedCount > 0 && (
                <Pressable
                  onPress={onClearExcluded}
                  className="px-3 py-1.5 rounded-full bg-slate-700/80 active:bg-slate-600"
                >
                  <Text className="text-slate-300 font-semibold text-xs">
                    Reset
                  </Text>
                </Pressable>
              )}
              <Pressable
                onPress={onClose}
                className="px-4 py-1.5 rounded-full bg-emerald-500 active:bg-emerald-600"
              >
                <Text className="text-slate-900 font-bold text-xs">Done</Text>
              </Pressable>
            </View>
          </View>

          {excludedCount > 0 && (
            <Text className="text-amber-300 text-xs font-medium mb-3">
              {excludedCount}{" "}
              {excludedCount === 1 ? "category hidden" : "categories hidden"} ·
              Percentages recalculate from remaining total
            </Text>
          )}

          {/* Category toggle list */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="max-h-[340px] mt-2"
            contentContainerClassName="gap-2 pb-2"
          >
            {availableCategories.map((item) => {
              const isExcluded = excludedSet.has(item.category);
              return (
                <Pressable
                  key={item.category}
                  onPress={() => onToggleExclude(item.category)}
                  className={`flex-row items-center justify-between px-3.5 py-3 rounded-2xl border ${
                    isExcluded
                      ? "bg-slate-800/40 border-slate-700/30 opacity-60 active:bg-slate-800"
                      : "bg-slate-800 border-emerald-500/40 active:bg-slate-700/60"
                  }`}
                >
                  <View className="flex-row items-center flex-1 pr-3">
                    <Text className="text-lg mr-2.5">{item.emoji}</Text>
                    <View className="flex-1">
                      <Text
                        className={`text-sm font-semibold ${
                          isExcluded
                            ? "text-slate-400 line-through"
                            : "text-slate-100"
                        }`}
                        numberOfLines={1}
                      >
                        {item.category}
                      </Text>
                      <Text className="text-slate-400 text-xs mt-0.5">
                        {APP_CONFIG.currencySymbol}
                        {formatAmount(item.amount)}
                      </Text>
                    </View>
                  </View>

                  <View
                    className={`px-2.5 py-1 rounded-full ${
                      isExcluded ? "bg-slate-700/80" : "bg-emerald-500/20"
                    }`}
                  >
                    <Text
                      className={`text-[11px] font-semibold ${
                        isExcluded ? "text-slate-400" : "text-emerald-400"
                      }`}
                    >
                      {isExcluded ? "Hidden" : "Shown"}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

