import React, { useState, useCallback, useEffect } from "react";
import { safeEvaluate } from "../../../utils/calculator";
import {
  View,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Category } from "../../../models/types";
import AmountStep from "./AmountStep";
import CategoryStep from "./CategoryStep";

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
    notes: string | null,
  ) => Promise<void>;
  onDeleteCategory: (categoryId: number) => Promise<void>;
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
  const [note, setNote] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TransactionType>("spent");
  const [modalStep, setModalStep] = useState<1 | 2>(1);

  // Reset inputs when modal becomes visible
  useEffect(() => {
    if (visible) {
      setAmount("");
      setNote("");
      setModalStep(1);
    }
  }, [visible]);

  // Derived properties
  // Derived properties
  const currentCategories =
    activeTab === "spent" ? spentCategories : incomeCategories;
  const parsedAmount = safeEvaluate(amount);
  const amountIsValid = parsedAmount !== null && parsedAmount > 0;

  // Handlers
  const handleTabChange = useCallback((tab: TransactionType) => {
    setActiveTab(tab);
  }, []);

  const handleLogTransaction = useCallback(
    async (category: Category) => {
      if (!amountIsValid || parsedAmount === null) return;
      const trimmedNote = note.trim();
      await onLogTransaction(parsedAmount, activeTab, category.id, trimmedNote === "" ? null : trimmedNote);
      onClose();
    },
    [amountIsValid, parsedAmount, activeTab, note, onLogTransaction, onClose],
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

            {/* STEP 1 — Amount & Type */}
            {modalStep === 1 && (
              <AmountStep
                amount={amount}
                onAmountChange={setAmount}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                onNext={() => setModalStep(2)}
                isValid={amountIsValid}
                note={note}
                onNoteChange={setNote}
              />
            )}

            {/* STEP 2 — Category Selector */}
            {modalStep === 2 && parsedAmount !== null && (
              <CategoryStep
                categories={currentCategories}
                parsedAmount={parsedAmount}
                onBack={() => setModalStep(1)}
                onSelectCategory={handleLogTransaction}
                onAddCategory={async (name, icon) => {
                  await onAddCategory(name, icon, activeTab);
                }}
                onUpdateCategory={onUpdateCategory}
                onDeleteCategory={onDeleteCategory}
              />
            )}
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
