import React, { useState } from "react";
import "./core/global.css";
import { StatusBar } from "expo-status-bar";
import { View, Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import HomeScreen from "./views/screens/HomeScreen";
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
        return (
          <SafeAreaView className="flex-1 bg-slate-900 justify-center items-center px-6">
            <View className="items-center max-w-sm">
              <Text className="text-emerald-400 text-4xl mb-4 font-bold">
                📜
              </Text>
              <Text className="text-slate-100 text-2xl font-bold mb-2">
                Ledger
              </Text>
              <Text className="text-slate-400 text-center leading-6">
                Chronological record of all financial activity and easy
                filtering by category or type.
              </Text>
            </View>
          </SafeAreaView>
        );
      case "Stats":
        return (
          <SafeAreaView className="flex-1 bg-slate-900 justify-center items-center px-6">
            <View className="items-center max-w-sm">
              <Text className="text-emerald-400 text-4xl mb-4 font-bold">
                📈
              </Text>
              <Text className="text-slate-100 text-2xl font-bold mb-2">
                Stats & Analytics
              </Text>
              <Text className="text-slate-400 text-center leading-6">
                Visualizing expense distribution and cash flow trends with line
                and pie charts.
              </Text>
            </View>
          </SafeAreaView>
        );
      case "Settings":
        return (
          <SafeAreaView className="flex-1 bg-slate-900 justify-center items-center px-6">
            <View className="items-center max-w-sm">
              <Text className="text-emerald-400 text-4xl mb-4 font-bold">
                ⚙️
              </Text>
              <Text className="text-slate-100 text-2xl font-bold mb-2">
                Settings
              </Text>
              <Text className="text-slate-400 text-center leading-6">
                Adjust configurations, manage categories, and handle local
                SQLite database backups.
              </Text>
            </View>
          </SafeAreaView>
        );
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
