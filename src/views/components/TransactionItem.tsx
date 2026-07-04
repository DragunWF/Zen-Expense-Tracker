import React from "react";
import { View, Text } from "react-native";
import { APP_CONFIG } from "../../core/constants";
import { formatAmount, formatDate } from "../../core/helpers";

import { MappedTransaction } from "../../models/types";

interface TransactionItemProps {
  transaction: MappedTransaction;
  isLast: boolean;
}

export default function TransactionItem({
  transaction,
  isLast,
}: TransactionItemProps) {
  const isIncome = transaction.type === "income";

  return (
    <View
      className={`flex-row items-center px-4 py-3.5 ${
        !isLast ? "border-b border-slate-700/30" : ""
      }`}
    >
      {/* Emoji badge */}
      <View className="h-10 w-10 rounded-full bg-slate-700/60 items-center justify-center mr-3">
        <Text className="text-lg">{transaction.emoji}</Text>
      </View>

      {/* Category + date */}
      <View className="flex-1">
        <Text className="text-slate-100 font-semibold text-sm">
          {transaction.category}
        </Text>
        <Text className="text-slate-500 text-xs mt-0.5">
          {formatDate(transaction.date)}
        </Text>
      </View>

      {/* Amount */}
      <Text
        className={`font-bold text-sm ${
          isIncome ? "text-emerald-400" : "text-rose-400"
        }`}
      >
        {isIncome ? "+" : "-"}
        {APP_CONFIG.currencySymbol}
        {formatAmount(transaction.amount)}
      </Text>
    </View>
  );
}
