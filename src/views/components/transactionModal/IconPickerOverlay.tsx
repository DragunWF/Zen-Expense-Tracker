import React from "react";
import { View, Text, Pressable, ScrollView, Modal } from "react-native";
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
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable className="flex-1 bg-black/60 justify-end" onPress={onClose}>
        {/* Sheet container */}
        <Pressable
          className="bg-slate-900 rounded-t-3xl px-5 pt-3 pb-10 border-t border-slate-700/50 flex flex-col h-[520px]"
          onPress={() => {
            /* swallows touch to avoid backdrop click close */
          }}
        >
          {/* Drag handle indicator */}
          <View className="w-10 h-1 rounded-full bg-slate-700 self-center mb-5" />

          {/* Header */}
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-slate-100 text-lg font-bold">
              Select Category Icon
            </Text>
            <Pressable
              onPress={onClose}
              className="px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700/50 active:bg-slate-700"
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
            className="flex-1"
          >
            <View className="flex-row flex-wrap gap-2.5 pb-5">
              {CATEGORY_ICONS.map((emoji, index) => (
                <Pressable
                  key={index}
                  onPress={() => onSelectIcon(emoji)}
                  className="w-[17%] aspect-square items-center justify-center bg-slate-800 rounded-2xl active:bg-emerald-500/20 active:border active:border-emerald-500 border border-slate-700/30"
                >
                  <View className="flex-1 w-full h-full items-center justify-center">
                    <Text
                      style={{ includeFontPadding: false }}
                      className="text-3xl text-center"
                    >
                      {emoji}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
