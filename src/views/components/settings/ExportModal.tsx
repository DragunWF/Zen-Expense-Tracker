import React from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";

interface ExportModalProps {
  visible: boolean;
  exportJson: string;
  onCopy: () => void;
  onClose: () => void;
  lastSuccess: string | null;
}

export default function ExportModal({
  visible,
  exportJson,
  onCopy,
  onClose,
  lastSuccess,
}: ExportModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable className="flex-1 bg-black/60 justify-end" onPress={onClose}>
        <Pressable
          className="bg-slate-900 rounded-t-3xl px-5 pt-3 pb-10 border-t border-slate-700/50 h-[560px] flex flex-col"
          onPress={() => {/* swallow */}}
        >
          {/* Drag handle */}
          <View className="w-10 h-1 rounded-full bg-slate-700 self-center mb-5" />

          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-slate-100 text-lg font-bold">Export Backup</Text>
              <Text className="text-slate-500 text-xs mt-0.5">
                Copy this JSON and save it somewhere safe.
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700/50 active:bg-slate-700"
            >
              <Text className="text-slate-300 text-xs font-semibold">Close</Text>
            </Pressable>
          </View>

          {/* JSON preview */}
          <ScrollView
            className="flex-1 bg-slate-950 border border-slate-700/40 rounded-xl p-3 mb-4"
            showsVerticalScrollIndicator={false}
          >
            <Text className="text-emerald-400/80 text-[10px] font-mono leading-4">
              {exportJson}
            </Text>
          </ScrollView>

          {/* Copy button */}
          <Pressable
            onPress={onCopy}
            className="bg-emerald-500 active:bg-emerald-600 py-3.5 rounded-2xl items-center"
          >
            <Text className="text-slate-900 font-bold text-sm">
              📋 Copy to Clipboard
            </Text>
          </Pressable>

          {/* Success indicator */}
          {lastSuccess && (
            <View className="mt-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2 items-center">
              <Text className="text-emerald-400 text-xs font-semibold">
                ✓ {lastSuccess}
              </Text>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
