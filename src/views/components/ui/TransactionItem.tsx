import React from "react";
import { View, Text, Pressable } from "react-native";
import { APP_CONFIG } from "../../../core/constants";
import { formatAmount, formatDate } from "../../../core/helpers";
import { MappedTransaction } from "../../../models/types";

interface TransactionItemProps {
  transaction: MappedTransaction;
  isLast: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (transaction: MappedTransaction) => void;
}

export default function TransactionItem({
  transaction,
  isLast,
  onDelete,
  onEdit,
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
        {transaction.notes && (
          <Text
            className="text-slate-400 text-xs mt-0.5 italic"
            numberOfLines={1}
          >
            📝 {transaction.notes}
          </Text>
        )}
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

      {/* Optional Edit button */}
      {onEdit && (
        <Pressable
          onPress={() => onEdit(transaction)}
          hitSlop={8}
          className="ml-3 w-7 h-7 rounded-lg bg-slate-700/60 active:bg-emerald-500/20 items-center justify-center border border-slate-600"
        >
          <Text className="text-emerald-400 text-xs font-bold leading-none">
            ✏️
          </Text>
        </Pressable>
      )}

      {/* Optional delete button */}
      {onDelete && (
        <Pressable
          onPress={() => onDelete(transaction.id)}
          hitSlop={8}
          className="ml-2 w-7 h-7 rounded-lg bg-slate-700/60 active:bg-rose-500/20 items-center justify-center border border-slate-600"
        >
          <Text className="text-rose-400 text-xs font-bold leading-none">
            ×
          </Text>
        </Pressable>
      )}
    </View>
  );
}
