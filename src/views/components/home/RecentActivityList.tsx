import React from "react";
import { View, Text } from "react-native";
import { MappedTransaction } from "../../../models/types";
import TransactionItem from "../ui/TransactionItem";

interface RecentActivityListProps {
  transactions: MappedTransaction[];
}

export default function RecentActivityList({
  transactions,
}: RecentActivityListProps) {
  return (
    <View>
      <Text className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">
        Recent Activity
      </Text>

      <View className="bg-slate-800/40 border border-slate-700/40 rounded-2xl overflow-hidden">
        {transactions.length === 0 ? (
          <View className="py-10 items-center">
            <Text className="text-slate-500 text-sm">
              No transactions logged yet.
            </Text>
          </View>
        ) : (
          transactions.map((tx, index) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              isLast={index === transactions.length - 1}
            />
          ))
        )}
      </View>
    </View>
  );
}
