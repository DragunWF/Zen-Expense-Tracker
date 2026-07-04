import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import { Category } from "../../../models/types";

interface CategoryFilterSheetProps {
  visible: boolean;
  allCategories: Category[];
  activeCategoryIds: Set<number>;
  onToggleCategory: (id: number) => void;
  onClearAll: () => void;
  onClose: () => void;
}

export default function CategoryFilterSheet({
  visible,
  allCategories,
  activeCategoryIds,
  onToggleCategory,
  onClearAll,
  onClose,
}: CategoryFilterSheetProps) {
  const [sheetSearch, setSheetSearch] = useState<string>("");

  const expenseCategories = useMemo(
    () =>
      allCategories.filter(
        (c) =>
          c.type === "expense" &&
          c.name.toLowerCase().includes(sheetSearch.toLowerCase()),
      ),
    [allCategories, sheetSearch],
  );

  const incomeCategories = useMemo(
    () =>
      allCategories.filter(
        (c) =>
          c.type === "income" &&
          c.name.toLowerCase().includes(sheetSearch.toLowerCase()),
      ),
    [allCategories, sheetSearch],
  );

  const activeCount = activeCategoryIds.size;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable
        className="flex-1 bg-black/60 justify-end"
        onPress={onClose}
      >
        {/* Sheet */}
        <Pressable
          className="bg-slate-900 rounded-t-3xl px-5 pt-3 pb-10 border-t border-slate-700/50"
          onPress={() => {
            /* swallows backdrop tap */
          }}
        >
          {/* Drag handle */}
          <View className="w-10 h-1 rounded-full bg-slate-700 self-center mb-4" />

          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-slate-100 text-lg font-bold">
                Filter by Category
              </Text>
              {activeCount > 0 && (
                <Text className="text-slate-400 text-xs mt-0.5">
                  {activeCount} selected
                </Text>
              )}
            </View>
            <View className="flex-row items-center gap-2">
              {activeCount > 0 && (
                <Pressable
                  onPress={onClearAll}
                  className="px-3 py-1.5 rounded-full bg-slate-700/80 active:bg-slate-600"
                >
                  <Text className="text-slate-300 font-semibold text-xs">
                    Clear
                  </Text>
                </Pressable>
              )}
              <Pressable
                onPress={onClose}
                className="px-4 py-1.5 rounded-full bg-emerald-500 active:bg-emerald-600"
              >
                <Text className="text-slate-900 font-bold text-xs">
                  Apply
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Search bar inside the sheet */}
          <View className="flex-row items-center bg-slate-800 border border-slate-700/60 rounded-xl px-3 py-2.5 mb-4">
            <Text className="text-slate-400 mr-2 text-xs">🔍</Text>
            <TextInput
              value={sheetSearch}
              onChangeText={setSheetSearch}
              placeholder="Search categories..."
              placeholderTextColor="#475569"
              className="flex-1 text-slate-100 text-sm"
              autoCorrect={false}
            />
          </View>

          {/* Scrollable category grid */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={{ maxHeight: 360 }}
          >
            {/* Expense section */}
            {expenseCategories.length > 0 && (
              <View className="mb-4">
                <Text className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">
                  Expenses
                </Text>
                <View className="flex-row flex-wrap justify-between">
                  {expenseCategories.map((cat) => {
                    const isActive = activeCategoryIds.has(cat.id);
                    return (
                      <Pressable
                        key={cat.id}
                        onPress={() => onToggleCategory(cat.id)}
                        className={`w-[48%] mb-2 flex-row items-center p-3 rounded-2xl border ${
                          isActive
                            ? "bg-emerald-500/15 border-emerald-500/60"
                            : "bg-slate-800 border-slate-700/40 active:bg-slate-700/50"
                        }`}
                      >
                        <Text className="text-lg mr-2">{cat.icon}</Text>
                        <Text
                          className={`text-sm font-semibold flex-1 ${
                            isActive ? "text-emerald-400" : "text-slate-200"
                          }`}
                          numberOfLines={1}
                        >
                          {cat.name}
                        </Text>
                        {isActive && (
                          <Text className="text-emerald-400 text-xs font-bold ml-1">
                            ✓
                          </Text>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Income section */}
            {incomeCategories.length > 0 && (
              <View className="mb-2">
                <Text className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">
                  Income
                </Text>
                <View className="flex-row flex-wrap justify-between">
                  {incomeCategories.map((cat) => {
                    const isActive = activeCategoryIds.has(cat.id);
                    return (
                      <Pressable
                        key={cat.id}
                        onPress={() => onToggleCategory(cat.id)}
                        className={`w-[48%] mb-2 flex-row items-center p-3 rounded-2xl border ${
                          isActive
                            ? "bg-emerald-500/15 border-emerald-500/60"
                            : "bg-slate-800 border-slate-700/40 active:bg-slate-700/50"
                        }`}
                      >
                        <Text className="text-lg mr-2">{cat.icon}</Text>
                        <Text
                          className={`text-sm font-semibold flex-1 ${
                            isActive ? "text-emerald-400" : "text-slate-200"
                          }`}
                          numberOfLines={1}
                        >
                          {cat.name}
                        </Text>
                        {isActive && (
                          <Text className="text-emerald-400 text-xs font-bold ml-1">
                            ✓
                          </Text>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Empty state */}
            {expenseCategories.length === 0 && incomeCategories.length === 0 && (
              <View className="py-8 items-center">
                <Text className="text-slate-500 text-sm">
                  No categories match your search.
                </Text>
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
