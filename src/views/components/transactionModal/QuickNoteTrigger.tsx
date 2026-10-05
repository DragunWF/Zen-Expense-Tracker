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
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isExpanded]);

  const handleClear = () => {
    onNoteChange("");
    setIsExpanded(false);
    Keyboard.dismiss();
  };

  const handleBlur = () => {
    setIsExpanded(false);
  };

  if (isExpanded) {
    return (
      <View className="flex-row items-center border border-emerald-500 rounded-xl px-3 py-2 bg-slate-800/50">
        <Text className="text-slate-400 mr-2">💬</Text>
        <TextInput
          ref={inputRef}
          value={note}
          onChangeText={onNoteChange}
          onBlur={handleBlur}
          placeholder="Add a quick note..."
          placeholderTextColor="#475569"
          maxLength={100}
          className="flex-1 text-slate-100 text-sm py-0 h-6"
          returnKeyType="done"
          onSubmitEditing={handleBlur}
        />
        <Pressable onPress={handleClear} hitSlop={10} className="ml-2 bg-slate-700 rounded-full w-5 h-5 items-center justify-center">
          <Text className="text-slate-400 text-xs font-bold leading-none mt-[-2px]">×</Text>
        </Pressable>
      </View>
    );
  }

  if (note.trim().length > 0) {
    // Populated state preview
    return (
      <Pressable
        onPress={() => setIsExpanded(true)}
        className="flex-row items-center bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-1.5 self-center max-w-[80%]"
      >
        <Text className="text-emerald-400 text-xs mr-2">💬</Text>
        <Text className="text-emerald-400 text-sm font-medium" numberOfLines={1}>
          {note}
        </Text>
      </Pressable>
    );
  }

  // Idle state trigger
  return (
    <Pressable
      onPress={() => setIsExpanded(true)}
      className="flex-row items-center bg-slate-800/50 rounded-xl px-3 py-1.5 self-center"
    >
      <Text className="text-slate-500 text-sm font-medium">💬 Note</Text>
    </Pressable>
  );
}
