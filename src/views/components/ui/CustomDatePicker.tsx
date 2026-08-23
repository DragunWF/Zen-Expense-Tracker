import React from "react";
import { View, Text, Pressable } from "react-native";

interface CustomDatePickerProps {
  date: Date;
  onChange: (date: Date) => void;
}

export default function CustomDatePicker({
  date,
  onChange,
}: CustomDatePickerProps) {
  const adjustDate = (days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    onChange(newDate);
  };

  const adjustMonth = (months: number) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    onChange(newDate);
  };

  return (
    <View className="items-center mb-6 mt-4">
      <Text className="text-slate-500 text-sm font-medium mb-3">
        Transaction Date
      </Text>

      <View className="flex-row items-center justify-between w-full px-4 mb-2">
        <Pressable
          onPress={() => adjustMonth(-1)}
          className="bg-slate-800 w-10 h-10 rounded-full items-center justify-center border border-slate-700/50 active:bg-slate-700"
        >
          <Text className="text-slate-300 text-lg font-bold">{"<<"}</Text>
        </Pressable>

        <Pressable
          onPress={() => adjustDate(-1)}
          className="bg-slate-800 w-10 h-10 rounded-full items-center justify-center border border-slate-700/50 active:bg-slate-700"
        >
          <Text className="text-slate-300 text-lg font-bold">{"<"}</Text>
        </Pressable>

        <View className="flex-1 items-center">
          <Text className="text-slate-100 text-lg font-bold">
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        </View>

        <Pressable
          onPress={() => adjustDate(1)}
          className="bg-slate-800 w-10 h-10 rounded-full items-center justify-center border border-slate-700/50 active:bg-slate-700"
        >
          <Text className="text-slate-300 text-lg font-bold">{">"}</Text>
        </Pressable>

        <Pressable
          onPress={() => adjustMonth(1)}
          className="bg-slate-800 w-10 h-10 rounded-full items-center justify-center border border-slate-700/50 active:bg-slate-700"
        >
          <Text className="text-slate-300 text-lg font-bold">{">>"}</Text>
        </Pressable>
      </View>
      <Pressable onPress={() => onChange(new Date())} className="p-2">
        <Text className="text-emerald-400 text-sm font-semibold">
          Set to Today
        </Text>
      </Pressable>
    </View>
  );
}
