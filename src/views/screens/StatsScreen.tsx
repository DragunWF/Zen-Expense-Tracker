import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useStatsController } from "../../controllers/useStatsController";
import { APP_CONFIG } from "../../core/constants";
import { formatAmount } from "../../core/helpers";
import StatsHeader from "../components/stats/StatsHeader";
import ActivityHeatmap from "../components/stats/ActivityHeatmap";
import CategoryDonutChart from "../components/stats/CategoryDonutChart";
import CashFlowTrendChart from "../components/stats/CashFlowTrendChart";

export default function StatsScreen() {
  const {
    timeframe,
    setTimeframe,
    heatmapDays,
    donutSegments,
    selectedDonutIndex,
    setSelectedDonutIndex,
    trendPoints,
    windowTotalIncome,
    windowTotalExpenses,
    windowNet,
  } = useStatsController();

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header + timeframe selector */}
        <StatsHeader timeframe={timeframe} onSelectTimeframe={setTimeframe} />

        {/* Summary totals row */}
        <View className="flex-row mx-5 mb-5 gap-3">
          {/* Net balance */}
          <View className="flex-1 bg-slate-800/50 border border-slate-700/40 rounded-2xl px-3 py-3 items-center">
            <Text className="text-slate-500 text-[9px] uppercase tracking-widest font-semibold mb-1">
              Net
            </Text>
            <Text
              className={`text-base font-bold ${
                windowNet >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {windowNet >= 0 ? "+" : ""}
              {APP_CONFIG.currencySymbol}
              {formatAmount(Math.abs(windowNet))}
            </Text>
          </View>
          {/* Income */}
          <View className="flex-1 bg-slate-800/50 border border-slate-700/40 rounded-2xl px-3 py-3 items-center">
            <Text className="text-slate-500 text-[9px] uppercase tracking-widest font-semibold mb-1">
              Income
            </Text>
            <Text className="text-emerald-400 text-base font-bold">
              {APP_CONFIG.currencySymbol}
              {formatAmount(windowTotalIncome)}
            </Text>
          </View>
          {/* Expenses */}
          <View className="flex-1 bg-slate-800/50 border border-slate-700/40 rounded-2xl px-3 py-3 items-center">
            <Text className="text-slate-500 text-[9px] uppercase tracking-widest font-semibold mb-1">
              Spent
            </Text>
            <Text className="text-rose-400 text-base font-bold">
              {APP_CONFIG.currencySymbol}
              {formatAmount(windowTotalExpenses)}
            </Text>
          </View>
        </View>

        {/* Section 1: 90-day heatmap */}
        <ActivityHeatmap days={heatmapDays} />

        {/* Section 2: Category donut chart */}
        <CategoryDonutChart
          segments={donutSegments}
          selectedIndex={selectedDonutIndex}
          onSelectSegment={setSelectedDonutIndex}
          totalExpenses={windowTotalExpenses}
        />

        {/* Section 3: Cash flow trend chart */}
        <CashFlowTrendChart points={trendPoints} />
      </ScrollView>
    </SafeAreaView>
  );
}
