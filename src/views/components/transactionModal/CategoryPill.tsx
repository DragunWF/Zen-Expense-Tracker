import React from "react";
import { View, Text, Pressable } from "react-native";
import { Category } from "../../../models/types";

interface CategoryPillProps {
  category: Category;
  isEditMode: boolean;
  onPress: () => void;
  onEditPress: () => void;
  onDeletePress: () => void;
}

export default function CategoryPill({
  category,
  isEditMode,
  onPress,
  onEditPress,
  onDeletePress,
}: CategoryPillProps) {
  const isOther = category.name === "Other";

  return (
    <Pressable
      onPress={() => {
        if (!isEditMode) {
          onPress();
        }
      }}
      className={`w-[48%] mb-3 flex-row items-center justify-between p-3 rounded-2xl bg-slate-800 border ${
        isEditMode
          ? "border-slate-700/50"
          : "border-slate-700/50 active:bg-emerald-500/20 active:border-emerald-500"
      }`}
    >
      <View className="flex-row items-center flex-1 mr-1">
        <Text className="text-xl mr-2">{category.icon}</Text>
        <Text
          className="text-slate-200 font-semibold text-sm flex-1"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {category.name}
        </Text>
      </View>

      {isEditMode && !isOther && (
        <View className="flex-row items-center gap-1.5">
          {/* Edit Action Button */}
          <Pressable
            onPress={onEditPress}
            className="w-7 h-7 bg-slate-700 active:bg-emerald-500/20 rounded-lg items-center justify-center border border-slate-600"
            hitSlop={4}
          >
            <Text className="text-[10px]">✏️</Text>
          </Pressable>

          {/* Delete Action Button */}
          <Pressable
            onPress={onDeletePress}
            className="w-7 h-7 bg-slate-750 active:bg-rose-500/20 rounded-lg items-center justify-center border border-slate-700"
            hitSlop={4}
          >
            <Text className="text-rose-400 font-bold text-xs leading-none">
              ×
            </Text>
          </Pressable>
        </View>
      )}
      {isEditMode && isOther && (
        <View className="w-7 h-7 items-center justify-center opacity-40">
          <Text className="text-[10px]">🔒</Text>
        </View>
      )}
    </Pressable>
  );
}
