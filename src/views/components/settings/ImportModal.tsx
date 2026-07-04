import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";

interface ImportModalProps {
  visible: boolean;
  isBusy: boolean;
  lastError: string | null;
  onClearError: () => void;
  onImport: (json: string) => void;
  onClose: () => void;
}

export default function ImportModal({
  visible,
  isBusy,
  lastError,
  onClearError,
  onImport,
  onClose,
}: ImportModalProps) {
  const [rawInput, setRawInput] = useState<string>("");

  const handleClose = () => {
    setRawInput("");
    onClearError();
    onClose();
  };

  const handleImport = () => {
    if (!rawInput.trim()) return;
    onImport(rawInput.trim());
  };

  const isReady = rawInput.trim().length > 0 && !isBusy;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Pressable
        className="flex-1 bg-black/60 justify-end"
        onPress={handleClose}
      >
        <Pressable
          className="bg-slate-900 rounded-t-3xl px-5 pt-3 pb-10 border-t border-slate-700/50 h-[520px] flex flex-col"
          onPress={() => {
            /* swallow */
          }}
        >
          {/* Drag handle */}
          <View className="w-10 h-1 rounded-full bg-slate-700 self-center mb-5" />

          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-slate-100 text-lg font-bold">
                Restore Backup
              </Text>
              <Text className="text-slate-500 text-xs mt-0.5">
                Paste your JSON backup below.
              </Text>
            </View>
            <Pressable
              onPress={handleClose}
              className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700/50 active:bg-slate-700"
            >
              <Text className="text-slate-300 text-xs font-semibold">
                Cancel
              </Text>
            </Pressable>
          </View>

          {/* Warning notice */}
          <View className="mb-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
            <Text className="text-amber-400 text-[11px] font-semibold">
              ⚠️ This will replace all current data with the imported backup.
            </Text>
          </View>

          {/* JSON text input */}
          <TextInput
            value={rawInput}
            onChangeText={(t) => {
              setRawInput(t);
              if (lastError) onClearError();
            }}
            placeholder='{"version":1,"categories":[...],"transactions":[...]}'
            placeholderTextColor="#334155"
            multiline
            autoCorrect={false}
            autoCapitalize="none"
            className="flex-1 bg-slate-950 border border-slate-700/40 rounded-xl p-3 text-emerald-400/80 text-[11px] font-mono mb-4"
            textAlignVertical="top"
          />

          {/* Error message */}
          {lastError && (
            <View className="mb-3 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
              <Text className="text-rose-400 text-xs font-semibold">
                ✗ {lastError}
              </Text>
            </View>
          )}

          {/* Confirm button */}
          <Pressable
            onPress={handleImport}
            disabled={!isReady}
            className={`py-3.5 rounded-2xl items-center flex-row justify-center gap-2 ${
              isReady
                ? "bg-emerald-500 active:bg-emerald-600"
                : "bg-slate-800 border border-slate-700/50"
            }`}
          >
            {isBusy && <ActivityIndicator size="small" color="#0f172a" />}
            <Text
              className={`font-bold text-sm ${
                isReady ? "text-slate-900" : "text-slate-500"
              }`}
            >
              {isBusy ? "Importing..." : "Confirm Import"}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
