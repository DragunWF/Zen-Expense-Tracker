import React, { useState } from "react";
import "./core/global.css";
import { StatusBar } from "expo-status-bar";
import { View, Text, Settings } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HomeScreen from "./views/screens/HomeScreen";
import LedgerScreen from "./views/screens/LedgerScreen";
import SettingsScreen from "./views/screens/SettingsScreen";
import StatsScreen from "./views/screens/StatsScreen";
import TabBar from "./views/navigation/TabBar";
import AddTransactionModal from "./views/components/AddTransactionModal";
import { useExpenseController } from "./controllers/useExpenseController";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("Home");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Controller hook providing unified logic and data state
  const controller = useExpenseController();

  const handleAddPress = () => {
    if (activeTab === "Home") {
      setIsAddModalOpen(true);
    } else if (activeTab === "Ledger") {
      setActiveTab("Home");
      setIsAddModalOpen(true);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Home":
        return (
          <HomeScreen
            transactions={controller.transactions}
            totalIncome={controller.totalIncome}
            totalExpenses={controller.totalExpenses}
          />
        );
      case "Ledger":
        return <LedgerScreen />;
      case "Stats":
        return <StatsScreen />;
      case "Settings":
        return <SettingsScreen />;
      default:
        return (
          <HomeScreen
            transactions={controller.transactions}
            totalIncome={controller.totalIncome}
            totalExpenses={controller.totalExpenses}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-slate-900">
        {renderContent()}

        {/* Global tab navigator styled with NativeWind */}
        <TabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAddPress={handleAddPress}
        />

        {/* Global transaction creation form modal */}
        <AddTransactionModal
          visible={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          spentCategories={controller.spentCategories}
          incomeCategories={controller.incomeCategories}
          onAddCategory={controller.addCategory}
          onLogTransaction={controller.logTransaction}
        />

        <StatusBar style="light" />
      </View>
    </SafeAreaProvider>
  );
}
