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
} from "react-native";
import { Category } from "../../models/types";
import { APP_CONFIG } from "../../core/constants";

type TransactionType = "spent" | "income";

export interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  spentCategories: Category[];
  incomeCategories: Category[];
  onAddCategory: (name: string, type: TransactionType) => Promise<void>;
  onLogTransaction: (
    amount: number,
    type: TransactionType,
    categoryId: number,
  ) => Promise<void>;
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
  onLogTransaction,
}: AddTransactionModalProps) {
  // ── Step 1: amount & type ──
  const [amount, setAmount] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TransactionType>("spent");
  const [modalStep, setModalStep] = useState<1 | 2>(1);

  // ── Step 2: category inline creation ──
  const [showNewCatInput, setShowNewCatInput] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>("");

  // Reset inputs when modal becomes visible
  useEffect(() => {
    if (visible) {
      setAmount("");
      setModalStep(1);
      setShowNewCatInput(false);
      setNewCategoryName("");
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
  }, []);

  const handleAddCategory = useCallback(async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    await onAddCategory(trimmed, activeTab);
    setNewCategoryName("");
    setShowNewCatInput(false);
  }, [newCategoryName, activeTab, onAddCategory]);

  const handleLogTransaction = useCallback(
    async (category: Category) => {
      if (!amountIsValid) return;
      await onLogTransaction(parsedAmount, activeTab, category.id);
      onClose();
    },
    [amountIsValid, parsedAmount, activeTab, onLogTransaction, onClose],
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
            className="bg-slate-900 rounded-t-3xl px-5 pt-3 pb-10 border-t border-slate-700/50"
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
                  <Text className="text-slate-500 text-sm font-medium mb-2">
                    Enter amount ({APP_CONFIG.currencySymbol})
                  </Text>
                  <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor="#475569"
                    keyboardType="decimal-pad"
                    className="text-slate-100 text-5xl font-extrabold text-center w-full"
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
                  {/* Inline amount reminder */}
                  <Text className="text-emerald-400 font-bold text-sm">
                    {APP_CONFIG.currencySymbol}
                    {formatAmount(parsedAmount)}
                  </Text>
                </View>

                {/* Category Grid */}
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                >
                  <View className="flex-row flex-wrap justify-between">
                    {/* Real categories */}
                    {currentCategories.map((cat) => (
                      <Pressable
                        key={cat.id}
                        onPress={() => handleLogTransaction(cat)}
                        className="w-[48%] mb-3 flex-row items-center p-3.5 rounded-2xl bg-slate-800 border border-slate-700/50 active:bg-emerald-500/20 active:border-emerald-500"
                      >
                        <Text className="text-xl mr-2.5">{cat.icon}</Text>
                        <Text className="text-slate-200 font-semibold text-sm flex-1">
                          {cat.name}
                        </Text>
                      </Pressable>
                    ))}

                    {/* "+ Add New" dashed pill */}
                    <Pressable
                      onPress={() => setShowNewCatInput(true)}
                      className="w-[48%] mb-3 flex-row items-center justify-center p-3.5 rounded-2xl border border-dashed border-slate-600"
                    >
                      <Text className="text-slate-500 font-semibold text-sm">
                        + Add New
                      </Text>
                    </Pressable>
                  </View>

                  {/* Inline category creator */}
                  {showNewCatInput && (
                    <View className="flex-row items-center mt-1 mb-3 bg-slate-800 border border-slate-600 rounded-2xl px-4 py-3">
                      <Text className="text-base mr-2">📌</Text>
                      <TextInput
                        value={newCategoryName}
                        onChangeText={setNewCategoryName}
                        placeholder="Category name..."
                        placeholderTextColor="#64748B"
                        autoFocus
                        className="flex-1 text-slate-100 font-medium text-sm mr-3"
                        onSubmitEditing={handleAddCategory}
                        returnKeyType="done"
                      />
                      <Pressable
                        onPress={handleAddCategory}
                        className="bg-emerald-500 active:bg-emerald-600 px-4 py-2 rounded-xl"
                      >
                        <Text className="text-slate-900 font-bold text-sm">
                          Add
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
