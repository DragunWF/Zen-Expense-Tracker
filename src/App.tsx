import React, { useState } from "react";
import "./core/global.css";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./views/screens/HomeScreen";
import LedgerScreen from "./views/screens/LedgerScreen";
import SettingsScreen from "./views/screens/SettingsScreen";
import StatsScreen from "./views/screens/StatsScreen";
import TabBar from "./views/navigation/TabBar";
import AddTransactionModal from "./views/components/AddTransactionModal";
import { useExpenseController } from "./controllers/useExpenseController";

const Tab = createBottomTabNavigator();

export default function App() {
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Controller hook providing unified logic and data state
  const controller = useExpenseController();

  const handleAddPress = () => {
    setIsAddModalOpen(true);
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <View className="flex-1 bg-slate-900">
          <Tab.Navigator
            tabBar={(props) => <TabBar {...props} onAddPress={handleAddPress} />}
            screenOptions={{
              headerShown: false,
            }}
          >
            <Tab.Screen name="Home">
              {() => (
                <HomeScreen
                  transactions={controller.transactions}
                  totalIncome={controller.totalIncome}
                  totalExpenses={controller.totalExpenses}
                />
              )}
            </Tab.Screen>
            <Tab.Screen name="Ledger" component={LedgerScreen} />
            <Tab.Screen name="Stats" component={StatsScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
          </Tab.Navigator>

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
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
