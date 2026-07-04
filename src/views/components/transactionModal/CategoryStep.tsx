import React, { useState, useCallback } from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { Category } from "../../../models/types";
import { APP_CONFIG } from "../../../core/constants";
import { formatAmount } from "../../../core/helpers";
import CategoryPill from "./CategoryPill";
import CategoryCreatorForm from "./CategoryCreatorForm";
import IconPickerOverlay from "./IconPickerOverlay";

interface CategoryStepProps {
  categories: Category[];
  parsedAmount: number;
  onBack: () => void;
  onSelectCategory: (category: Category) => void;
  onAddCategory: (name: string, icon: string) => Promise<void>;
  onUpdateCategory: (id: number, name: string, icon: string) => Promise<void>;
  onDeleteCategory: (id: number) => Promise<void>;
}

export default function CategoryStep({
  categories,
  parsedAmount,
  onBack,
  onSelectCategory,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoryStepProps) {
  // Category inline creation & edit states
  const [showNewCatInput, setShowNewCatInput] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedIcon, setSelectedIcon] = useState<string>("📌");
  const [showIconPicker, setShowIconPicker] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleSaveCategory = useCallback(async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    if (editingCategory) {
      await onUpdateCategory(editingCategory.id, trimmed, selectedIcon);
    } else {
      await onAddCategory(trimmed, selectedIcon);
    }
    setNewCategoryName("");
    setSelectedIcon("📌");
    setShowNewCatInput(false);
    setEditingCategory(null);
  }, [
    newCategoryName,
    selectedIcon,
    editingCategory,
    onAddCategory,
    onUpdateCategory,
  ]);

  const handleDeleteCategory = useCallback(
    (category: Category) => {
      Alert.alert(
        "Delete Category",
        `Are you sure you want to delete "${category.name}"?\n\nTransactions using this category will be moved to "Other".`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              await onDeleteCategory(category.id);
            },
          },
        ],
      );
    },
    [onDeleteCategory],
  );

  return (
    <View>
      {/* Header */}
      <View className="flex-row items-center mb-5">
        <Pressable
          onPress={onBack}
          className="h-8 w-8 rounded-full bg-slate-800 items-center justify-center mr-3"
        >
          <Text className="text-slate-300 text-base">←</Text>
        </Pressable>
        <Text className="text-slate-100 text-lg font-bold flex-1">
          Select Category
        </Text>
        {!isEditMode && (
          <Text className="text-emerald-400 font-bold text-sm mr-4">
            {APP_CONFIG.currencySymbol}
            {formatAmount(parsedAmount)}
          </Text>
        )}
        <Pressable
          onPress={() => setIsEditMode((prev) => !prev)}
          className={`px-3 py-1.5 rounded-full border ${
            isEditMode
              ? "bg-emerald-500/20 border-emerald-500/50"
              : "bg-slate-800 border-slate-700/50"
          }`}
        >
          <Text
            className={`font-semibold text-xs ${
              isEditMode ? "text-emerald-400" : "text-slate-300"
            }`}
          >
            {isEditMode ? "Done" : "Edit"}
          </Text>
        </Pressable>
      </View>

      {/* Category Grid */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row flex-wrap justify-between">
          {/* Real categories */}
          {categories.map((cat) => (
            <CategoryPill
              key={cat.id}
              category={cat}
              isEditMode={isEditMode}
              onPress={() => onSelectCategory(cat)}
              onEditPress={() => {
                setEditingCategory(cat);
                setNewCategoryName(cat.name);
                setSelectedIcon(cat.icon);
                setShowNewCatInput(true);
              }}
              onDeletePress={() => handleDeleteCategory(cat)}
            />
          ))}

          {/* "+ Add New" dashed pill */}
          {!isEditMode && (
            <Pressable
              onPress={() => {
                setEditingCategory(null);
                setNewCategoryName("");
                setSelectedIcon("📌");
                setShowNewCatInput(true);
              }}
              className="w-[48%] mb-3 flex-row items-center justify-center p-3.5 rounded-2xl border border-dashed border-slate-600"
            >
              <Text className="text-slate-500 font-semibold text-sm">
                + Add New
              </Text>
            </Pressable>
          )}
        </View>

        {/* Done Editing Full-width Button */}
        {isEditMode && (
          <Pressable
            onPress={() => {
              setIsEditMode(false);
              setEditingCategory(null);
              setShowNewCatInput(false);
            }}
            className="mt-2 w-full bg-slate-700 active:bg-slate-600 py-3.5 rounded-xl items-center justify-center"
          >
            <Text className="text-slate-200 font-bold text-sm">
              Done Editing
            </Text>
          </Pressable>
        )}

        {/* Inline category creator form */}
        <CategoryCreatorForm
          visible={showNewCatInput}
          categoryName={newCategoryName}
          onChangeCategoryName={setNewCategoryName}
          selectedIcon={selectedIcon}
          onTriggerIconPicker={() => setShowIconPicker(true)}
          onSave={handleSaveCategory}
          onCancel={() => {
            setEditingCategory(null);
            setShowNewCatInput(false);
            setNewCategoryName("");
            setSelectedIcon("📌");
          }}
          isEditing={editingCategory !== null}
        />
      </ScrollView>

      {/* Icon Picker Overlay */}
      <IconPickerOverlay
        visible={showIconPicker}
        onClose={() => setShowIconPicker(false)}
        onSelectIcon={(icon) => {
          setSelectedIcon(icon);
          setShowIconPicker(false);
        }}
      />
    </View>
  );
}
