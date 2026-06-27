import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Category } from "../../models/types";
import { APP_CONFIG, CATEGORY_ICONS } from "../../core/constants";

type TransactionType = "spent" | "income";

export interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  spentCategories: Category[];
  incomeCategories: Category[];
  onAddCategory: (
    name: string,
    icon: string,
    type: TransactionType,
  ) => Promise<void>;
  onUpdateCategory: (id: number, name: string, icon: string) => Promise<void>;
  onLogTransaction: (
    amount: number,
    type: TransactionType,
    categoryId: number,
  ) => Promise<void>;
  onDeleteCategory: (categoryId: number) => Promise<void>;
}

function formatAmount(value: number): string {
  return value.toLocaleString("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function AddTransactionModal({
  visible,
  onClose,
  spentCategories,
  incomeCategories,
  onAddCategory,
  onUpdateCategory,
  onLogTransaction,
  onDeleteCategory,
}: AddTransactionModalProps) {
  // ── Step 1: amount & type ──
  const [amount, setAmount] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TransactionType>("spent");
  const [modalStep, setModalStep] = useState<1 | 2>(1);

  // ── Step 2: category inline creation ──
  const [showNewCatInput, setShowNewCatInput] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedIcon, setSelectedIcon] = useState<string>("📌");
  const [showIconPicker, setShowIconPicker] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Reset inputs when modal becomes visible
  useEffect(() => {
    if (visible) {
      setAmount("");
      setModalStep(1);
      setShowNewCatInput(false);
      setNewCategoryName("");
      setIsEditMode(false);
      setSelectedIcon("📌");
      setShowIconPicker(false);
      setEditingCategory(null);
    }
  }, [visible]);

  // Derived properties
  const currentCategories =
    activeTab === "spent" ? spentCategories : incomeCategories;
  const parsedAmount = parseFloat(amount.replace(/,/g, ""));
  const amountIsValid = !isNaN(parsedAmount) && parsedAmount > 0;

  // Handlers
  const handleTabChange = useCallback((tab: TransactionType) => {
    setActiveTab(tab);
    setShowNewCatInput(false);
    setNewCategoryName("");
    setEditingCategory(null);
  }, []);

  const handleSaveCategory = useCallback(async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    if (editingCategory) {
      await onUpdateCategory(editingCategory.id, trimmed, selectedIcon);
    } else {
      await onAddCategory(trimmed, selectedIcon, activeTab);
    }
    setNewCategoryName("");
    setSelectedIcon("📌");
    setShowNewCatInput(false);
    setEditingCategory(null);
  }, [
    newCategoryName,
    selectedIcon,
    activeTab,
    editingCategory,
    onAddCategory,
    onUpdateCategory,
  ]);

  const handleLogTransaction = useCallback(
    async (category: Category) => {
      if (!amountIsValid) return;
      await onLogTransaction(parsedAmount, activeTab, category.id);
      onClose();
    },
    [amountIsValid, parsedAmount, activeTab, onLogTransaction, onClose],
  );

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
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop — tap to dismiss */}
      <Pressable className="flex-1 bg-black/60 justify-end" onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Sheet container */}
          <Pressable
            className="bg-slate-900 rounded-t-3xl px-5 pt-3 pb-10 border-t border-slate-700/50 relative"
            onPress={() => {
              /* intentionally swallows backdrop press */
            }}
          >
            {/* Drag handle */}
            <View className="w-10 h-1 rounded-full bg-slate-700 self-center mb-5" />

            {/* ─────────────────────────────────────────────────────────── */}
            {/* STEP 1 — Amount & Type                                      */}
            {/* ─────────────────────────────────────────────────────────── */}
            {modalStep === 1 && (
              <View>
                <Text className="text-slate-100 text-lg font-bold text-center mb-5">
                  Log Transaction
                </Text>

                {/* Segmented Control */}
                <View className="flex-row bg-slate-800 p-1.5 rounded-2xl border border-slate-700/50 mb-6">
                  {/* Spent tab */}
                  <Pressable
                    onPress={() => handleTabChange("spent")}
                    className={`flex-1 py-3 rounded-xl items-center justify-center ${
                      activeTab === "spent"
                        ? "bg-slate-700 border border-slate-600"
                        : "bg-transparent"
                    }`}
                  >
                    <Text
                      className={`font-semibold text-sm ${
                        activeTab === "spent"
                          ? "text-rose-400"
                          : "text-slate-400"
                      }`}
                    >
                      Spent
                    </Text>
                  </Pressable>

                  {/* Income tab */}
                  <Pressable
                    onPress={() => handleTabChange("income")}
                    className={`flex-1 py-3 rounded-xl items-center justify-center ${
                      activeTab === "income"
                        ? "bg-emerald-500"
                        : "bg-transparent"
                    }`}
                  >
                    <Text
                      className={`font-semibold text-sm ${
                        activeTab === "income"
                          ? "text-slate-900"
                          : "text-slate-400"
                      }`}
                    >
                      Income
                    </Text>
                  </Pressable>
                </View>

                {/* Amount input */}
                <View className="items-center mb-8">
                  <Text className="text-slate-500 text-sm font-medium">
                    Enter amount ({APP_CONFIG.currencySymbol})
                  </Text>
                  <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor="#475569"
                    keyboardType="decimal-pad"
                    className="text-slate-100 text-5xl font-extrabold text-center w-full h-20 py-0 leading-[60px]"
                  />
                </View>

                {/* Select Category CTA */}
                <Pressable
                  onPress={() => {
                    if (amountIsValid) setModalStep(2);
                  }}
                  disabled={!amountIsValid}
                  className={`w-full py-4 rounded-2xl items-center justify-center ${
                    amountIsValid
                      ? "bg-emerald-500 active:bg-emerald-600"
                      : "bg-slate-800 opacity-50"
                  }`}
                >
                  <Text
                    className={`font-bold text-base ${
                      amountIsValid ? "text-slate-900" : "text-slate-500"
                    }`}
                  >
                    Select Category →
                  </Text>
                </Pressable>
              </View>
            )}

            {/* ─────────────────────────────────────────────────────────── */}
            {/* STEP 2 — Category Selector                                  */}
            {/* ─────────────────────────────────────────────────────────── */}
            {modalStep === 2 && (
              <View>
                {/* Step 2 header */}
                <View className="flex-row items-center mb-5">
                  <Pressable
                    onPress={() => setModalStep(1)}
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
                    {currentCategories.map((cat) => (
                      <Pressable
                        key={cat.id}
                        onPress={() => {
                          if (!isEditMode) {
                            handleLogTransaction(cat);
                          }
                        }}
                        className={`w-[48%] mb-3 flex-row items-center p-3.5 rounded-2xl bg-slate-800 border relative ${
                          isEditMode
                            ? "border-slate-700/50"
                            : "border-slate-700/50 active:bg-emerald-500/20 active:border-emerald-500"
                        }`}
                      >
                        <Text className="text-xl mr-2.5">{cat.icon}</Text>
                        <Text className="text-slate-200 font-semibold text-sm flex-1">
                          {cat.name}
                        </Text>

                        {isEditMode && cat.name !== "Other" && (
                          <>
                            {/* Edit Badge */}
                            <Pressable
                              onPress={() => {
                                setEditingCategory(cat);
                                setNewCategoryName(cat.name);
                                setSelectedIcon(cat.icon);
                                setShowNewCatInput(true);
                              }}
                              className="absolute -top-1.5 -left-1.5 bg-emerald-500 w-6 h-6 rounded-full items-center justify-center border-2 border-slate-900 z-10"
                              hitSlop={8}
                            >
                              <Text className="text-slate-900 font-bold text-[10px] leading-tight">
                                ✏️
                              </Text>
                            </Pressable>
                            {/* Delete Badge */}
                            <Pressable
                              onPress={() => handleDeleteCategory(cat)}
                              className="absolute -top-1.5 -right-1.5 bg-rose-500 w-6 h-6 rounded-full items-center justify-center border-2 border-slate-900 z-10"
                              hitSlop={8}
                            >
                              <Text className="text-slate-50 font-bold text-xs leading-tight mb-0.5">
                                -
                              </Text>
                            </Pressable>
                          </>
                        )}
                        {isEditMode && cat.name === "Other" && (
                          <View className="absolute top-2 right-2 opacity-50">
                            <Text className="text-[10px]">🔒</Text>
                          </View>
                        )}
                      </Pressable>
                    ))}

                    {/* "+ Add New" dashed pill */}
                    {!isEditMode && (
                      <Pressable
                        onPress={() => setShowNewCatInput(true)}
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

                  {/* Inline category creator */}
                  {showNewCatInput && (
                    <View className="flex-row items-center mt-1 mb-3 bg-slate-800 border border-slate-600 rounded-2xl px-3 py-3">
                      <Pressable
                        onPress={() => setShowIconPicker(true)}
                        className="bg-slate-700/80 border border-slate-600 rounded-xl px-3 py-2 mr-3 flex-row items-center"
                      >
                        <Text className="text-base mr-1">{selectedIcon}</Text>
                        <Text className="text-slate-400 text-[10px]">▼</Text>
                      </Pressable>
                      <TextInput
                        value={newCategoryName}
                        onChangeText={setNewCategoryName}
                        placeholder={
                          editingCategory
                            ? "Edit category..."
                            : "Category name..."
                        }
                        placeholderTextColor="#64748B"
                        autoFocus
                        className="flex-1 text-slate-100 font-medium text-sm mr-2"
                        onSubmitEditing={handleSaveCategory}
                        returnKeyType="done"
                      />
                      {editingCategory && (
                        <Pressable
                          onPress={() => {
                            setEditingCategory(null);
                            setShowNewCatInput(false);
                            setNewCategoryName("");
                            setSelectedIcon("📌");
                          }}
                          className="mr-2 px-1 py-1"
                        >
                          <Text className="text-slate-400 text-lg">×</Text>
                        </Pressable>
                      )}
                      <Pressable
                        onPress={handleSaveCategory}
                        className="bg-emerald-500 active:bg-emerald-600 px-4 py-2 rounded-xl"
                      >
                        <Text className="text-slate-900 font-bold text-sm">
                          {editingCategory ? "Save" : "Add"}
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}

            {/* Icon Picker Overlay (Replaces second modal to prevent React Native overlay bugs) */}
            {showIconPicker && (
              <View className="absolute inset-0 bg-slate-900 rounded-t-3xl px-5 pt-5 pb-10 z-50 flex flex-col">
                <View className="w-10 h-1 rounded-full bg-slate-700 self-center mb-5" />

                <View className="flex-row justify-between items-center mb-5">
                  <Text className="text-slate-100 text-lg font-bold">
                    Select Category Icon
                  </Text>
                  <Pressable
                    onPress={() => setShowIconPicker(false)}
                    className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700/50 active:bg-slate-700"
                  >
                    <Text className="text-slate-300 font-semibold text-xs">
                      Close
                    </Text>
                  </Pressable>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <View className="flex-row flex-wrap justify-center gap-3 pb-5">
                    {CATEGORY_ICONS.map((emoji, index) => (
                      <Pressable
                        key={index}
                        onPress={() => {
                          setSelectedIcon(emoji);
                          setShowIconPicker(false);
                        }}
                        className="w-12 h-12 items-center justify-center bg-slate-800 rounded-full active:bg-emerald-500/20 active:border active:border-emerald-500 border border-transparent"
                      >
                        <Text className="text-2xl">{emoji}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
