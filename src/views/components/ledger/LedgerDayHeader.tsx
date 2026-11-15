import React from "react";
import { View, Text } from "react-native";
import { APP_CONFIG } from "../../../core/constants";
import { formatAmount } from "../../../core/helpers";

interface LedgerDayHeaderProps {
  label: string;
  totalIncome: number;
  totalExpenses: number;
}

/**
 * Date group header row displaying the formatted day label and non-zero daily totals.
 */
export default function LedgerDayHeader({
  label,
  totalIncome,
  totalExpenses,
}: LedgerDayHeaderProps) {
  const hasIncome = totalIncome > 0;
  const hasExpenses = totalExpenses > 0;

  return (
    <View className="flex-row items-center justify-between px-5 pt-5 pb-1.5 gap-3">
      <Text
        className="text-slate-500 text-[10px] font-bold tracking-widest uppercase flex-shrink"
        numberOfLines={1}
      >
        {label}
      </Text>

      {(hasIncome || hasExpenses) && (
        <View className="flex-row items-center gap-3 flex-shrink-0">
          {hasIncome && (
            <Text className="text-emerald-400 text-[11px] font-semibold">
              +{APP_CONFIG.currencySymbol}
              {formatAmount(totalIncome)}
            </Text>
          )}
          {hasExpenses && (
            <Text className="text-rose-400 text-[11px] font-semibold">
              -{APP_CONFIG.currencySymbol}
              {formatAmount(totalExpenses)}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

