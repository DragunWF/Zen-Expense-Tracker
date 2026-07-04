import React, { useState, useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { HeatmapDay } from "../../../controllers/useStatsController";
import { APP_CONFIG } from "../../../core/constants";
import { formatAmount } from "../../../core/helpers";

interface ActivityHeatmapProps {
  days: HeatmapDay[];
}

// Map level (0–4) → NativeWind background class
const LEVEL_BG: Record<number, string> = {
  0: "bg-slate-800",
  1: "bg-emerald-500/20",
  2: "bg-emerald-500/40",
  3: "bg-emerald-500/70",
  4: "bg-emerald-500",
};

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function ActivityHeatmap({ days }: ActivityHeatmapProps) {
  const [selectedDay, setSelectedDay] = useState<HeatmapDay | null>(null);

  // Pad the days array so the first day aligns to the correct day-of-week column
  const { weeks, paddedCount } = useMemo(() => {
    if (days.length === 0) return { weeks: [], paddedCount: 0 };
    const firstDow = days[0].date.getDay(); // 0=Sun
    // Build a flat array with nulls prepended for alignment
    const flat: (HeatmapDay | null)[] = [
      ...Array(firstDow).fill(null),
      ...days,
    ];
    // Pad end to complete the last week
    while (flat.length % 7 !== 0) flat.push(null);
    // Chunk into columns (each column = one week, 7 rows)
    const cols: (HeatmapDay | null)[][] = [];
    for (let i = 0; i < flat.length; i += 7) {
      cols.push(flat.slice(i, i + 7));
    }
    return { weeks: cols, paddedCount: flat.length };
  }, [days]);

  const formatTooltipDate = (date: Date): string =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <View className="mx-5 mb-4 bg-slate-800/40 border border-slate-700/40 rounded-2xl px-4 pt-4 pb-3">
      {/* Section label */}
      <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">
        Activity · Last 180 Days
      </Text>

      {/* Day-of-week labels */}
      <View className="flex-row mb-1.5">
        {/* Spacer to align labels with grid columns */}
        <View className="flex-col justify-between mr-1" style={{ width: 10 }}>
          {DAY_LABELS.map((d, i) => (
            <Text key={i} className="text-slate-600 text-[8px] h-3 leading-3">
              {i % 2 === 0 ? d : ""}
            </Text>
          ))}
        </View>

        {/* Heatmap grid */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: "row", gap: 2 }}
        >
          {weeks.map((week, wi) => (
            <View key={wi} className="flex-col" style={{ gap: 2 }}>
              {week.map((day, di) => {
                if (!day) {
                  return (
                    <View
                      key={`empty-${wi}-${di}`}
                      className="rounded-sm bg-transparent"
                      style={{ width: 11, height: 11 }}
                    />
                  );
                }
                const isSelected = selectedDay?.dateKey === day.dateKey;
                const bgClass = LEVEL_BG[day.level];
                return (
                  <Pressable
                    key={day.dateKey}
                    onPress={() =>
                      setSelectedDay((prev) =>
                        prev?.dateKey === day.dateKey ? null : day,
                      )
                    }
                    className={`rounded-sm ${bgClass} ${
                      isSelected ? "opacity-100" : "opacity-90"
                    }`}
                    style={{ width: 11, height: 11 }}
                  />
                );
              })}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Legend */}
      <View className="flex-row items-center mt-2">
        <Text className="text-slate-500 text-[9px] mr-2">Less</Text>
        {[0, 1, 2, 3, 4].map((l) => (
          <View
            key={l}
            className={`rounded-sm mr-0.5 ${LEVEL_BG[l]}`}
            style={{ width: 10, height: 10 }}
          />
        ))}
        <Text className="text-slate-500 text-[9px] ml-2">More</Text>
      </View>

      {/* Selected day tooltip */}
      {selectedDay && (
        <View className="mt-3 bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2">
          <Text className="text-slate-300 text-xs font-semibold mb-0.5">
            {formatTooltipDate(selectedDay.date)}
          </Text>
          {selectedDay.count === 0 ? (
            <Text className="text-slate-500 text-xs">
              No transactions logged
            </Text>
          ) : (
            <View className="flex-row items-center gap-3">
              <Text className="text-slate-400 text-xs">
                <Text className="text-slate-200 font-bold">
                  {selectedDay.count}
                </Text>{" "}
                {selectedDay.count === 1 ? "transaction" : "transactions"}
              </Text>
              {selectedDay.total > 0 && (
                <Text className="text-rose-400 text-xs font-bold">
                  {APP_CONFIG.currencySymbol}
                  {formatAmount(selectedDay.total)} spent
                </Text>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}
