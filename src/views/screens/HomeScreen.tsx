import React, { useMemo, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useExpense } from "../../controllers/useExpenseController";
import DashboardHeader from "../components/DashboardHeader";
import DateFilterDropdown from "../components/DateFilterDropdown";
import BalanceCard from "../components/BalanceCard";
import SummaryCard from "../components/SummaryCard";
import RecentActivityList from "../components/RecentActivityList";

export default function HomeScreen() {
  const {
    filteredTransactions: transactions,
    totalIncome,
    totalExpenses,
    isProfitHidden,
    isIncomeHidden,
    isExpensesHidden,
    toggleProfitVisibility,
    toggleIncomeVisibility,
    toggleExpensesVisibility,
    activeDateFilter,
    setDateFilter,
  } = useExpense();

  const [isFilterDropdownOpen, setIsFilterDropdownOpen] =
    useState<boolean>(false);

  // Compute net profit
  const netProfit = useMemo(
    () => totalIncome - totalExpenses,
    [totalIncome, totalExpenses],
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar style="light" />

      {isFilterDropdownOpen && (
        <Pressable
          className="absolute top-0 left-0 right-0 bottom-0 z-40 bg-transparent"
          onPress={() => setIsFilterDropdownOpen(false)}
        />
      )}

      {/* Main scroll area */}
      <View className="flex-1">
        <ScrollView
          className="flex-1 px-5"
          contentContainerClassName="pb-28 pt-4"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <DashboardHeader
            activeDateFilter={activeDateFilter}
            onToggleDropdown={() => setIsFilterDropdownOpen((prev) => !prev)}
          />

          {/* ── Top Section: Dashboard ── */}
          <View className="mb-6">
            {/* Net Profit Card */}
            <BalanceCard
              netProfit={netProfit}
              isProfitHidden={isProfitHidden}
              onToggleVisibility={toggleProfitVisibility}
            />

            {/* Summary Cards */}
            <View className="flex-row justify-between">
              <SummaryCard
                title="Total Income"
                amount={totalIncome}
                isHidden={isIncomeHidden}
                onToggleVisibility={toggleIncomeVisibility}
                type="income"
              />
              <SummaryCard
                title="Total Expenses"
                amount={totalExpenses}
                isHidden={isExpensesHidden}
                onToggleVisibility={toggleExpensesVisibility}
                type="expense"
              />
            </View>
          </View>

          {/* ── Middle Section: Recent Activity ── */}
          <RecentActivityList transactions={transactions} />
        </ScrollView>
      </View>

      {/* Dropdown Menu - rendered outside ScrollView at the root level to ensure touch compatibility on Android/iOS */}
      <DateFilterDropdown
        visible={isFilterDropdownOpen}
        activeFilter={activeDateFilter}
        onSelectFilter={setDateFilter}
        onClose={() => setIsFilterDropdownOpen(false)}
      />
    </SafeAreaView>
  );
}
