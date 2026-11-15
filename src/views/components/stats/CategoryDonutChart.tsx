import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import {
  DonutCategoryLimit,
  DonutFilterCategoryOption,
  DonutSegment,
  DonutTransactionType,
} from "../../../controllers/useStatsController";
import { APP_CONFIG } from "../../../core/constants";
import { formatAmount, formatPercentage } from "../../../core/helpers";
import DonutFilterBar from "./DonutFilterBar";
import DonutExcludeModal from "./DonutExcludeModal";
import DonutSelectionDetail from "./DonutSelectionDetail";

interface CategoryDonutChartProps {
  segments: DonutSegment[];
  selectedIndex: number;
  onSelectSegment: (index: number) => void;
  filteredTotal: number;
  hasTransactionsForType: boolean;
  donutLimit: DonutCategoryLimit;
  onSelectLimit: (limit: DonutCategoryLimit) => void;
  donutType: DonutTransactionType;
  onSelectType: (type: DonutTransactionType) => void;
  availableCategories: DonutFilterCategoryOption[];
  excludedCategories: string[];
  onToggleExclude: (category: string) => void;
  onClearExcluded: () => void;
  onResetFilters: () => void;
}

const DONUT_RADIUS = 54;
const DONUT_SIZE = 148; // viewBox width/height
const CENTER = DONUT_SIZE / 2;

export default function CategoryDonutChart({
  segments,
  selectedIndex,
  onSelectSegment,
  filteredTotal,
  hasTransactionsForType,
  donutLimit,
  onSelectLimit,
  donutType,
  onSelectType,
  availableCategories,
  excludedCategories,
  onToggleExclude,
  onClearExcluded,
  onResetFilters,
}: CategoryDonutChartProps) {
  const [isExcludeModalVisible, setIsExcludeModalVisible] = useState(false);

  const selectedSeg = selectedIndex >= 0 ? segments[selectedIndex] ?? null : null;
  const centerPercentColor =
    donutType === "spent" ? "text-rose-400" : "text-emerald-400";

  return (
    <View className="mx-5 mb-4 bg-slate-800/40 border border-slate-700/40 rounded-2xl px-4 pt-4 pb-4">
      <DonutFilterBar
        donutLimit={donutLimit}
        onSelectLimit={onSelectLimit}
        donutType={donutType}
        onSelectType={onSelectType}
        excludedCount={excludedCategories.length}
        hasCategoriesToExclude={availableCategories.length > 0}
        onOpenExcludeModal={() => setIsExcludeModalVisible(true)}
      />

      {!hasTransactionsForType ? (
        <View className="items-center py-4">
          <Text className="text-4xl mb-2">
            {donutType === "spent" ? "💸" : "💰"}
          </Text>
          <Text className="text-slate-400 text-sm text-center">
            {donutType === "spent"
              ? "No expense data for this period."
              : "No income data for this period."}
          </Text>
        </View>
      ) : segments.length === 0 ? (
        <View className="items-center py-4">
          <Text className="text-3xl mb-2">🙈</Text>
          <Text className="text-slate-300 text-sm text-center font-medium mb-3">
            All categories are currently hidden.
          </Text>
          <Pressable
            onPress={onResetFilters}
            className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 active:bg-emerald-500/30"
          >
            <Text className="text-emerald-400 text-xs font-semibold">
              Reset filters
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* Donut + Legend side-by-side */}
          <View className="flex-row items-center">
            {/* SVG Donut */}
            <View className="w-[148px] h-[148px] relative">
              <Svg
                width={DONUT_SIZE}
                height={DONUT_SIZE}
                viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
              >
                {/* Background track */}
                <Circle
                  cx={CENTER}
                  cy={CENTER}
                  r={DONUT_RADIUS}
                  fill="transparent"
                  stroke="#1e293b"
                  strokeWidth={22}
                />
                {/* Rotate so segments start from top (-90°) */}
                <G rotation="-90" origin={`${CENTER}, ${CENTER}`}>
                  {segments.map((seg, i) => {
                    const isSelected = i === selectedIndex;
                    return (
                      <Circle
                        key={seg.category}
                        cx={CENTER}
                        cy={CENTER}
                        r={DONUT_RADIUS}
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth={isSelected ? 26 : 20}
                        strokeDasharray={seg.strokeDasharray}
                        strokeDashoffset={seg.strokeDashoffset}
                        opacity={selectedIndex === -1 || isSelected ? 1 : 0.35}
                        onPress={() => onSelectSegment(i)}
                      />
                    );
                  })}
                </G>
              </Svg>

              {/* Center label overlay */}
              <View className="absolute inset-0 items-center justify-center pointer-events-none">
                <View className="w-[72px] items-center justify-center">
                  {selectedSeg ? (
                    <>
                      <Text
                        className="text-slate-100 text-xs font-bold text-center leading-tight"
                        numberOfLines={1}
                      >
                        {selectedSeg.category}
                      </Text>
                      <Text className={`text-sm font-bold mt-0.5 ${centerPercentColor}`}>
                        {formatPercentage(selectedSeg.percentage)}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text className="text-slate-400 text-[9px]">
                        {excludedCategories.length > 0 ? "Filtered" : "Total"}
                      </Text>
                      <Text
                        className="text-slate-100 text-xs font-bold mt-0.5 text-center"
                        numberOfLines={1}
                      >
                        {APP_CONFIG.currencySymbol}
                        {formatAmount(filteredTotal)}
                      </Text>
                    </>
                  )}
                </View>
              </View>
            </View>

            {/* Scrollable legend */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="flex-1 max-h-[148px]"
              contentContainerClassName="gap-1.5 pl-3"
            >
              {segments.map((seg, i) => {
                const isActive = i === selectedIndex;
                const percentLabel = formatPercentage(seg.percentage);

                return (
                  <Pressable
                    key={seg.category}
                    onPress={() => onSelectSegment(i)}
                    className={`flex-row items-center rounded-xl px-2 py-1.5 ${
                      isActive
                        ? "bg-slate-700/60"
                        : "bg-transparent active:bg-slate-700/30"
                    }`}
                  >
                    <View className="mr-2 flex-shrink-0">
                      <Svg width={10} height={10} viewBox="0 0 10 10">
                        <Circle cx={5} cy={5} r={5} fill={seg.color} />
                      </Svg>
                    </View>
                    <Text
                      className="text-slate-200 text-xs flex-1 font-medium"
                      numberOfLines={1}
                    >
                      {seg.emoji} {seg.category}
                    </Text>
                    <Text className="text-slate-400 text-[10px] font-semibold ml-1">
                      {percentLabel}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <DonutSelectionDetail
            selectedSegment={selectedSeg}
            donutType={donutType}
            onShowAll={() => onSelectLimit("all")}
          />
        </>
      )}

      <DonutExcludeModal
        visible={isExcludeModalVisible}
        donutType={donutType}
        availableCategories={availableCategories}
        excludedCategories={excludedCategories}
        onToggleExclude={onToggleExclude}
        onClearExcluded={onClearExcluded}
        onClose={() => setIsExcludeModalVisible(false)}
      />
    </View>
  );
}
