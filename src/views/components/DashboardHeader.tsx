import React from "react";
import { View, Text, Pressable } from "react-native";
import { Calendar, ChevronDown } from "lucide-react-native";
import { DateFilterType } from "../../controllers/useExpenseController";

interface DashboardHeaderProps {
  activeDateFilter: DateFilterType;
  onToggleDropdown: () => void;
}

export function getFilterLabel(filter: DateFilterType): string {
  switch (filter) {
    case "today":
      return "Today";
    case "last_7_days":
      return "Last 7 Days";
    case "month":
      return "Month";
    case "year":
      return "Year";
    case "all_time":
      return "All Time";
    default:
      return "Month";
  }
}

export default function DashboardHeader({
  activeDateFilter,
  onToggleDropdown,
}: DashboardHeaderProps) {
  const currentDateString = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <View className="flex-row justify-between items-center mb-6 z-50">
      <View>
        <Text className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
          {currentDateString}
        </Text>
        <Text className="text-slate-100 text-2xl font-bold mt-0.5">
          Dashboard
        </Text>
      </View>
      <View className="relative">
        <Pressable
          onPress={onToggleDropdown}
          className="flex-row items-center bg-slate-800/90 border border-slate-700/80 px-4 py-2.5 rounded-full active:bg-slate-700/50"
        >
          <Calendar size={14} color="#10b981" className="mr-2" />
          <Text className="text-slate-200 text-sm font-semibold ml-1 mr-2">
            {getFilterLabel(activeDateFilter)}
          </Text>
          <ChevronDown size={14} color="#94a3b8" />
        </Pressable>
      </View>
    </View>
  );
}
