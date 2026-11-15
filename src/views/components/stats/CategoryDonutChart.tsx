import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";
import {
  DONUT_CENTER,
  DONUT_RADIUS,
  DONUT_SIZE,
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
                  cx={DONUT_CENTER}
                  cy={DONUT_CENTER}
                  r={DONUT_RADIUS}
                  fill="transparent"
                  stroke="#1e293b"
                  strokeWidth={22}
                />

                {/* Bounded clickable slices */}
                {segments.map((seg, i) => {
                  const isSelected = i === selectedIndex;
                  const opacity = selectedIndex === -1 || isSelected ? 1 : 0.35;

                  if (seg.isFullCircle) {
                    return (
                      <Circle
                        key={seg.category}
                        cx={DONUT_CENTER}
                        cy={DONUT_CENTER}
                        r={DONUT_RADIUS}
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth={isSelected ? 26 : 20}
                        opacity={opacity}
                        onPress={() => onSelectSegment(i)}
                      />
                    );
                  }

                  const isThinSlice = seg.endAngle - seg.startAngle < 10;

                  return (
                    <G key={seg.category}>
                      <Path
                        d={isSelected ? seg.selectedArcPath : seg.arcPath}
                        fill={seg.color}
                        opacity={opacity}
                        onPress={() => onSelectSegment(i)}
                      />
                      <Path
                        d={seg.hitArcPath}
                        fill="rgba(0,0,0,0.001)"
                        stroke={isThinSlice ? "rgba(0,0,0,0.001)" : "none"}
                        strokeWidth={isThinSlice ? 6 : 0}
                        onPress={() => onSelectSegment(i)}
                      />
                    </G>
                  );
                })}
              </Svg>

              {/* Center label overlay (tap to clear active selection) */}
              <View
                pointerEvents="box-none"
                className="absolute inset-0 items-center justify-center"
              >
                <Pressable
                  disabled={selectedIndex === -1}
                  onPress={() => {
                    if (selectedIndex !== -1) {
                      onSelectSegment(selectedIndex);
                    }
                  }}
                  className="w-[68px] h-[68px] rounded-full items-center justify-center active:bg-slate-800/40"
                >
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
                </Pressable>
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
