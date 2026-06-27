import React, { useState } from "react";
import "./core/global.css";
import { StatusBar } from "expo-status-bar";
import { View, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./views/screens/HomeScreen";
import LedgerScreen from "./views/screens/LedgerScreen";
import SettingsScreen from "./views/screens/SettingsScreen";
import StatsScreen from "./views/screens/StatsScreen";
import TabBar from "./views/navigation/TabBar";
import AddTransactionModal from "./views/components/AddTransactionModal";
import { useExpenseController, ExpenseContext } from "./controllers/useExpenseController";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../drizzle/migrations";
import { db } from "./core/database";

const Tab = createBottomTabNavigator();

export default function App() {
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Controller hook providing unified logic and data state
  const controller = useExpenseController();
  const { success: migrationsLoaded, error: migrationError } = useMigrations(
    db,
    migrations,
  );

  const handleAddPress = () => {
    setIsAddModalOpen(true);
  };

  // Display loading screen if migrations are not loaded
  if (!migrationsLoaded) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center px-6">
        <Text className="text-emerald-400 text-lg font-bold">
          Initializing Database...
        </Text>
        {migrationError && (
          <Text className="text-rose-400 text-xs mt-2 text-center">
            {migrationError.message}
          </Text>
        )}
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <ExpenseContext.Provider value={controller}>
          <View className="flex-1 bg-slate-900">
            <Tab.Navigator
              tabBar={(props) => (
                <TabBar {...props} onAddPress={handleAddPress} />
              )}
              screenOptions={{
                headerShown: false,
              }}
            >
              <Tab.Screen name="Home" component={HomeScreen} />
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
        </ExpenseContext.Provider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
