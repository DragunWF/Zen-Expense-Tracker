import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
} from "react-native";
import { Category, MappedTransaction } from "../../../models/types";
import { APP_CONFIG } from "../../../core/constants";
import CategoryStep from "./CategoryStep";
import CustomDatePicker from "../ui/CustomDatePicker";
import OperatorBar from "./OperatorBar";
import { safeEvaluate } from "../../../utils/calculator";

export interface EditTransactionModalProps {
  visible: boolean;
  transaction: MappedTransaction | null;
  onClose: () => void;
  categories: Category[]; // Pre-filtered by type matching the transaction
  onAddCategory: (
    name: string,
    icon: string,
    type: "spent" | "income",
  ) => Promise<void>;
  onUpdateCategory: (id: number, name: string, icon: string) => Promise<void>;
  onEditTransaction: (
    id: string,
    amount: number,
    categoryId: number,
    date: Date,
  ) => Promise<void>;
  onDeleteCategory: (categoryId: number) => Promise<void>;
}

export default function EditTransactionModal({
  visible,
  transaction,
  onClose,
  categories,
  onAddCategory,
  onUpdateCategory,
  onEditTransaction,
  onDeleteCategory,
}: EditTransactionModalProps) {
  // ── Step 1: amount & date ──
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  // Initialize form when modal becomes visible and transaction is present
  useEffect(() => {
    if (visible && transaction) {
      setAmount(transaction.amount.toString());
      setDate(transaction.date);
      setModalStep(1);
    }
  }, [visible, transaction]);

  // Derived properties
  const parsedAmount = safeEvaluate(amount);
  const amountIsValid = parsedAmount !== null && parsedAmount > 0;
  const showPreview = amount.length > 0 && /[+\-*/()]/.test(amount);

  const handleOperatorPress = (op: string) => {
    const s = selection.start || amount.length;
    const e = selection.end || amount.length;
    
    const actualStart = (s === 0 && amount.length > 0) ? amount.length : s;
    const actualEnd = (e === 0 && amount.length > 0) ? amount.length : e;

    const before = amount.substring(0, actualStart);
    const after = amount.substring(actualEnd);
    setAmount(before + op + after);
  };

  // Handlers
  const handleEditTransaction = useCallback(
    async (category: Category) => {
      if (!amountIsValid || !transaction || parsedAmount === null) return;
      await onEditTransaction(transaction.id, parsedAmount, category.id, date);
      onClose();
    },
    [
      amountIsValid,
      parsedAmount,
      transaction,
      date,
      onEditTransaction,
      onClose,
    ],
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

            {/* STEP 1 — Amount & Date */}
            {modalStep === 1 && (
              <View>
                <Text className="text-slate-100 text-lg font-bold text-center mb-5">
                  Edit Transaction
                </Text>

                {/* Amount input */}
                <View className="items-center mb-4">
                  <Text className="text-slate-500 text-sm font-medium">
                    Enter amount ({APP_CONFIG.currencySymbol})
                  </Text>
                  <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
                    placeholder="0.00"
                    placeholderTextColor="#475569"
                    keyboardType="decimal-pad"
                    className="text-slate-100 text-5xl font-extrabold text-center w-full h-20 py-0 leading-[60px]"
                  />
                  {/* Live Preview */}
                  {showPreview && (
                    <Text className="text-emerald-400 text-lg font-bold mt-1">
                      = {parsedAmount !== null ? parsedAmount : "..."}
                    </Text>
                  )}
                </View>

                <OperatorBar onPressOperator={handleOperatorPress} />

                {/* Date Picker */}
                <CustomDatePicker date={date} onChange={setDate} />

                {/* Select Category CTA */}
                <Pressable
                  onPress={() => setModalStep(2)}
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

            {/* STEP 2 — Category Selector */}
            {modalStep === 2 && transaction && parsedAmount !== null && (
              <CategoryStep
                categories={categories}
                parsedAmount={parsedAmount}
                onBack={() => setModalStep(1)}
                onSelectCategory={handleEditTransaction}
                onAddCategory={async (name, icon) => {
                  await onAddCategory(name, icon, transaction.type);
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
