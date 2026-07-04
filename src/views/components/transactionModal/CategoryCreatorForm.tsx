import React from "react";
import { View, Text, TextInput, Pressable } from "react-native";

interface CategoryCreatorFormProps {
  visible: boolean;
  categoryName: string;
  onChangeCategoryName: (name: string) => void;
  selectedIcon: string;
  onTriggerIconPicker: () => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

export default function CategoryCreatorForm({
  visible,
  categoryName,
  onChangeCategoryName,
  selectedIcon,
  onTriggerIconPicker,
  onSave,
  onCancel,
  isEditing,
}: CategoryCreatorFormProps) {
  if (!visible) return null;

  return (
    <View className="flex-row items-center mt-1 mb-3 bg-slate-800 border border-slate-600 rounded-2xl px-3 py-3">
      <Pressable
        onPress={onTriggerIconPicker}
        className="bg-slate-700/80 border border-slate-600 rounded-xl px-3 py-2 mr-3 flex-row items-center"
      >
        <Text className="text-base mr-1">{selectedIcon}</Text>
        <Text className="text-slate-400 text-[10px]">▼</Text>
      </Pressable>
      <TextInput
        value={categoryName}
        onChangeText={onChangeCategoryName}
        placeholder={isEditing ? "Edit category..." : "Category name..."}
        placeholderTextColor="#64748B"
        autoFocus
        className="flex-1 text-slate-100 font-medium text-sm mr-2"
        onSubmitEditing={onSave}
        returnKeyType="done"
      />
      {isEditing && (
        <Pressable onPress={onCancel} className="mr-2 px-1 py-1">
          <Text className="text-slate-400 text-lg">×</Text>
        </Pressable>
      )}
      <Pressable
        onPress={onSave}
        className="bg-emerald-500 active:bg-emerald-600 px-4 py-2 rounded-xl"
      >
        <Text className="text-slate-900 font-bold text-sm">
          {isEditing ? "Save" : "Add"}
        </Text>
      </Pressable>
    </View>
  );
}
