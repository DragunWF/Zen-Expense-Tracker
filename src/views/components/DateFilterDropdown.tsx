import React from "react";
import { View, Text, Pressable } from "react-native";
import { Check } from "lucide-react-native";
import { DateFilterType } from "../../controllers/useExpenseController";

interface DateFilterDropdownProps {
  visible: boolean;
  activeFilter: DateFilterType;
  onSelectFilter: (filter: DateFilterType) => void;
  onClose: () => void;
}

export const FILTER_OPTIONS: { value: DateFilterType; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
  { value: "all_time", label: "All Time" },
];

export default function DateFilterDropdown({
  visible,
  activeFilter,
  onSelectFilter,
  onClose,
}: DateFilterDropdownProps) {
  if (!visible) return null;

  return (
    <View className="absolute right-5 top-[76px] w-40 bg-slate-800 border border-slate-700/60 rounded-2xl shadow-2xl py-1.5 z-50">
      {FILTER_OPTIONS.map((option) => {
        const isActive = activeFilter === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => {
              onSelectFilter(option.value);
              onClose();
            }}
            className="flex-row items-center justify-between px-3 py-2 active:bg-slate-700/40"
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
            {isActive && <Check size={12} color="#10b981" />}
          </Pressable>
        );
      })}
    </View>
  );
}
