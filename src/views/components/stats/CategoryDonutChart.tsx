import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { DonutSegment } from "../../../controllers/useStatsController";
import { APP_CONFIG } from "../../../core/constants";
import { formatAmount } from "../../../core/helpers";

interface CategoryDonutChartProps {
  segments: DonutSegment[];
  selectedIndex: number;
  onSelectSegment: (index: number) => void;
  totalExpenses: number;
}

const DONUT_RADIUS = 54;
const DONUT_SIZE = 148; // viewBox width/height
const CENTER = DONUT_SIZE / 2;

export default function CategoryDonutChart({
  segments,
  selectedIndex,
  onSelectSegment,
  totalExpenses,
}: CategoryDonutChartProps) {
  const selectedSeg = segments[selectedIndex] ?? null;

  if (segments.length === 0) {
    return (
      <View className="mx-5 mb-4 bg-slate-800/40 border border-slate-700/40 rounded-2xl px-4 pt-4 pb-4 items-center">
        <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4 self-start">
          Expenses by Category
        </Text>
        <Text className="text-4xl mb-2">💸</Text>
        <Text className="text-slate-400 text-sm text-center">
          No expense data for this period.
        </Text>
      </View>
    );
  }

  return (
    <View className="mx-5 mb-4 bg-slate-800/40 border border-slate-700/40 rounded-2xl px-4 pt-4 pb-4">
      {/* Section label */}
      <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">
        Expenses by Category
      </Text>

      {/* Donut + Legend side-by-side */}
      <View className="flex-row items-center">
        {/* SVG Donut */}
        <View style={{ width: DONUT_SIZE, height: DONUT_SIZE }}>
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
                  />
                );
              })}
            </G>
          </Svg>

          {/* Center label overlay (absolute positioned in the SVG space) */}
          <View
            className="absolute items-center justify-center"
            style={{
              top: CENTER - 30,
              left: CENTER - 30,
              width: 60,
              height: 60,
            }}
          >
            {selectedSeg ? (
              <>
                <Text
                  className="text-slate-100 text-xs font-bold text-center leading-tight"
                  numberOfLines={1}
                >
                  {selectedSeg.category}
                </Text>
                <Text className="text-emerald-400 text-sm font-bold mt-0.5">
                  {Math.round(selectedSeg.percentage)}%
                </Text>
              </>
            ) : (
              <>
                <Text className="text-slate-400 text-[9px]">Total</Text>
                <Text className="text-slate-100 text-xs font-bold mt-0.5">
                  {APP_CONFIG.currencySymbol}
                  {formatAmount(totalExpenses)}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Scrollable legend */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1, maxHeight: DONUT_SIZE }}
          contentContainerStyle={{ gap: 6, paddingLeft: 12 }}
        >
          {segments.map((seg, i) => {
            const isActive = i === selectedIndex;
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
                <View
                  className="w-2.5 h-2.5 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <Text
                  className="text-slate-200 text-xs flex-1 font-medium"
                  numberOfLines={1}
                >
                  {seg.emoji} {seg.category}
                </Text>
                <Text className="text-slate-400 text-[10px] font-semibold ml-1">
                  {Math.round(seg.percentage)}%
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Selected segment detail */}
      {selectedSeg && (
        <View className="mt-3 bg-slate-900/60 border border-slate-700/40 rounded-xl px-3 py-2 flex-row justify-between items-center">
          <Text className="text-slate-300 text-xs font-semibold">
            {selectedSeg.emoji} {selectedSeg.category}
          </Text>
          <Text className="text-rose-400 text-xs font-bold">
            {APP_CONFIG.currencySymbol}
            {formatAmount(selectedSeg.amount)}
          </Text>
        </View>
      )}
    </View>
  );
}
