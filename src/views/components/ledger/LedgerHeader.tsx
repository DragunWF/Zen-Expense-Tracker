import React from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { LedgerDateFilter } from "../../../controllers/useLedgerController";

interface LedgerHeaderProps {
  dateFilter: LedgerDateFilter;
  onToggleDateDropdown: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function getDateFilterLabel(filter: LedgerDateFilter): string {
  switch (filter) {
    case "today":
      return "Today";
    case "this_week":
      return "This Week";
    case "this_month":
      return "This Month";
    case "last_month":
      return "Last Month";
    case "all_time":
      return "All Time";
    default:
      return "This Month";
  }
}

export default function LedgerHeader({
  dateFilter,
  onToggleDateDropdown,
  searchQuery,
  onSearchChange,
}: LedgerHeaderProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <View className="px-5 pt-4 pb-2">
      {/* Title row */}
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
            {today}
          </Text>
          <Text className="text-slate-100 text-2xl font-bold mt-0.5">
            Ledger
          </Text>
        </View>

        {/* Date range picker button */}
        <Pressable
          onPress={onToggleDateDropdown}
          className="flex-row items-center bg-slate-800/90 border border-slate-700/80 px-3.5 py-2 rounded-full active:bg-slate-700/50"
        >
          {/* Calendar icon */}
          <View className="mr-1.5">
            <Text className="text-emerald-400 text-xs">📅</Text>
          </View>
          <Text className="text-slate-200 text-sm font-semibold mr-1">
            {getDateFilterLabel(dateFilter)}
          </Text>
          <Text className="text-slate-400 text-xs">▾</Text>
        </Pressable>
      </View>

      {/* Search bar */}
      <View className="flex-row items-center bg-slate-800 border border-slate-700/60 rounded-2xl px-4 py-3">
        <Text className="text-slate-400 mr-3 text-sm">🔍</Text>
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search by category..."
          placeholderTextColor="#475569"
          className="flex-1 text-slate-100 text-sm font-medium"
          returnKeyType="search"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => onSearchChange("")} hitSlop={8}>
            <Text className="text-slate-500 text-base">×</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
