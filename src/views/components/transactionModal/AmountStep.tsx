import React from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { APP_CONFIG } from "../../../core/constants";
import TransactionTypeTabs from "./TransactionTypeTabs";
import OperatorBar from "./OperatorBar";
import { safeEvaluate } from "../../../utils/calculator";

type TransactionType = "spent" | "income";

interface AmountStepProps {
  amount: string;
  onAmountChange: (amount: string) => void;
  activeTab: TransactionType;
  onTabChange: (tab: TransactionType) => void;
  onNext: () => void;
  isValid: boolean;
}

export default function AmountStep({
  amount,
  onAmountChange,
  activeTab,
  onTabChange,
  onNext,
  isValid,
}: AmountStepProps) {
  const [selection, setSelection] = React.useState({ start: 0, end: 0 });

  const handleOperatorPress = (op: string) => {
    // Default to appending to the end if no explicit selection has occurred
    const s = selection.start || amount.length;
    const e = selection.end || amount.length;
    
    // Fallback: if selection is mysteriously 0 but length is > 0, append to end.
    // (React Native text input selection can sometimes be 0 initially).
    const actualStart = (s === 0 && amount.length > 0) ? amount.length : s;
    const actualEnd = (e === 0 && amount.length > 0) ? amount.length : e;

    const before = amount.substring(0, actualStart);
    const after = amount.substring(actualEnd);
    onAmountChange(before + op + after);
  };

  const parsedPreview = safeEvaluate(amount);
  const showPreview = amount.length > 0 && /[+\-*/()]/.test(amount);
  return (
    <View>
      <Text className="text-slate-100 text-lg font-bold text-center mb-5">
        Log Transaction
      </Text>

      {/* Segmented Control */}
      <TransactionTypeTabs activeTab={activeTab} onTabChange={onTabChange} />

      {/* Amount input */}
      <View className="items-center mb-8">
        <Text className="text-slate-500 text-sm font-medium">
          Enter amount ({APP_CONFIG.currencySymbol})
        </Text>
        <TextInput
          value={amount}
          onChangeText={onAmountChange}
          onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
          placeholder="0.00"
          placeholderTextColor="#475569"
          keyboardType="decimal-pad"
          className="text-slate-100 text-5xl font-extrabold text-center w-full h-20 py-0 leading-[60px]"
        />
        {/* Live Preview */}
        {showPreview && (
          <Text className="text-emerald-400 text-lg font-bold mt-1">
            = {parsedPreview !== null ? parsedPreview : "..."}
          </Text>
        )}
      </View>

      <OperatorBar onPressOperator={handleOperatorPress} />

      {/* Select Category CTA */}
      <Pressable
        onPress={onNext}
        disabled={!isValid}
        className={`w-full py-4 rounded-2xl items-center justify-center ${
          isValid
            ? "bg-emerald-500 active:bg-emerald-600"
            : "bg-slate-800 opacity-50"
        }`}
      >
        <Text
          className={`font-bold text-base ${
            isValid ? "text-slate-900" : "text-slate-500"
          }`}
        >
          Select Category →
        </Text>
      </Pressable>
    </View>
  );
}
