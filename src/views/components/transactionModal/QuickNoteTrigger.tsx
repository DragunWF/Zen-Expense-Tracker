import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, Pressable, Keyboard } from "react-native";

interface QuickNoteTriggerProps {
  note: string;
  onNoteChange: (note: string) => void;
}

export default function QuickNoteTrigger({
  note,
  onNoteChange,
}: QuickNoteTriggerProps) {
  const handleClear = () => {
    onNoteChange("");
    Keyboard.dismiss();
  };

  return (
    <View className="flex-row items-center border border-slate-700/50 rounded-xl px-3 py-3 bg-slate-800/50 w-full">
      <Text className="text-slate-400 mr-2">📝</Text>
      <TextInput
        value={note}
        onChangeText={onNoteChange}
        placeholder="Add a quick note..."
        placeholderTextColor="#475569"
        maxLength={100}
        className="flex-1 text-slate-100 text-sm py-0 h-6"
        returnKeyType="done"
        onSubmitEditing={() => Keyboard.dismiss()}
      />
      {note.length > 0 && (
        <Pressable
          onPress={handleClear}
          hitSlop={10}
          className="ml-2 bg-slate-700 rounded-full w-5 h-5 items-center justify-center"
        >
          <Text className="text-slate-400 text-xs font-bold leading-none mt-[-2px]">
            ×
          </Text>
        </Pressable>
      )}
    </View>
  );
}
