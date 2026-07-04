import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { CATEGORY_ICONS } from "../../../core/constants";

interface IconPickerOverlayProps {
  visible: boolean;
  onClose: () => void;
  onSelectIcon: (emoji: string) => void;
}

export default function IconPickerOverlay({
  visible,
  onClose,
  onSelectIcon,
}: IconPickerOverlayProps) {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-slate-900 rounded-t-3xl px-5 pt-5 pb-10 z-50 flex flex-col">
      {/* Drag handle */}
      <View className="w-10 h-1 rounded-full bg-slate-700 self-center mb-5" />

      {/* Header */}
      <View className="flex-row justify-between items-center mb-5">
        <Text className="text-slate-100 text-lg font-bold">
          Select Category Icon
        </Text>
        <Pressable
          onPress={onClose}
          className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700/50 active:bg-slate-700"
        >
          <Text className="text-slate-300 font-semibold text-xs">
            Close
          </Text>
        </Pressable>
      </View>

      {/* Icons grid */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row flex-wrap justify-center gap-3 pb-5">
          {CATEGORY_ICONS.map((emoji, index) => (
            <Pressable
              key={index}
              onPress={() => onSelectIcon(emoji)}
              className="w-12 h-12 items-center justify-center bg-slate-800 rounded-full active:bg-emerald-500/20 active:border active:border-emerald-500 border border-transparent"
            >
              <Text className="text-2xl">{emoji}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
