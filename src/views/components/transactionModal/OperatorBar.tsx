import React from "react";
import { View, Pressable, Text } from "react-native";

interface OperatorBarProps {
  onPressOperator: (operator: string) => void;
}

export default function OperatorBar({ onPressOperator }: OperatorBarProps) {
  const operators = ["+", "-", "*", "/", "(", ")"];

  return (
    <View className="flex-row justify-center items-center gap-2 mb-4">
      {operators.map((op) => (
        <Pressable
          key={op}
          onPress={() => onPressOperator(op)}
          className="bg-slate-800 w-12 h-12 rounded-xl items-center justify-center active:bg-slate-700 border border-slate-700/50"
        >
          <Text className="text-slate-200 text-2xl font-bold">{op}</Text>
        </Pressable>
      ))}
    </View>
  );
}
