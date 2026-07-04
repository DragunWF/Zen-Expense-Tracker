import React from "react";
import { View, Text, Pressable } from "react-native";
import { LedgerDateFilter } from "../../../controllers/useLedgerController";

interface LedgerDateFilterDropdownProps {
  visible: boolean;
  activeFilter: LedgerDateFilter;
  onSelectFilter: (filter: LedgerDateFilter) => void;
  onClose: () => void;
}

const DATE_FILTER_OPTIONS: { value: LedgerDateFilter; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "all_time", label: "All Time" },
];

export default function LedgerDateFilterDropdown({
  visible,
  activeFilter,
  onSelectFilter,
  onClose,
}: LedgerDateFilterDropdownProps) {
  if (!visible) return null;

  return (
    <View className="absolute right-5 top-[110px] w-44 bg-slate-800 border border-slate-700/60 rounded-2xl shadow-2xl py-1.5 z-50">
      {DATE_FILTER_OPTIONS.map((option) => {
        const isActive = activeFilter === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => {
              onSelectFilter(option.value);
              onClose();
            }}
            className="flex-row items-center justify-between px-4 py-2.5 active:bg-slate-700/40"
          >
            <Text
              className={`text-xs ${
                isActive
                  ? "text-emerald-400 font-bold"
                  : "text-slate-300 font-medium"
              }`}
            >
              {option.label}
            </Text>
            {isActive && <Text className="text-emerald-400 text-xs">✓</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}
