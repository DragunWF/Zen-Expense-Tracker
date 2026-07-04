import React from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { APP_CONFIG } from "../../core/constants";
import TransactionTypeTabs from "./TransactionTypeTabs";

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
          placeholder="0.00"
          placeholderTextColor="#475569"
          keyboardType="decimal-pad"
          className="text-slate-100 text-5xl font-extrabold text-center w-full h-20 py-0 leading-[60px]"
        />
      </View>

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
