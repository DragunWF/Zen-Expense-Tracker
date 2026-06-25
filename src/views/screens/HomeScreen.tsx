import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { APP_CONFIG } from "../../core/constants";

export default function HomeScreen() {
  const [amount, setAmount] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"spent" | "income">("spent");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories =
    activeTab === "spent"
      ? [
          { id: "food", name: "Food", icon: "🍔" },
          { id: "transport", name: "Transport", icon: "🚗" },
          { id: "utilities", name: "Utilities", icon: "⚡" },
          { id: "entertainment", name: "Entertainment", icon: "🎬" },
          { id: "shopping", name: "Shopping", icon: "🛍️" },
          { id: "custom", name: "Custom", icon: "⚙️" },
        ]
      : [
          { id: "salary", name: "Salary", icon: "💼" },
          { id: "freelance", name: "Freelance", icon: "💻" },
          { id: "investments", name: "Investments", icon: "📈" },
          { id: "gifts", name: "Gifts", icon: "🎁" },
          { id: "side_hustle", name: "Side Hustle", icon: "🚀" },
          { id: "custom", name: "Custom", icon: "⚙️" },
        ];

  const handleLogTransaction = () => {
    // Empty function for now as requested
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              className="px-6 py-4"
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <View className="flex-row justify-between items-center mb-6">
                <View>
                  <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                  <Text className="text-slate-100 text-2xl font-bold mt-0.5">
                    Dashboard
                  </Text>
                </View>
                <View className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700/50 items-center justify-center">
                  <Text className="text-emerald-400 font-bold text-sm">EL</Text>
                </View>
              </View>

              {/* Top Section (Compact Balance & Summaries) */}
              <View className="mb-6">
                {/* Profit Balance Card */}
                <View className="bg-slate-800/40 border border-slate-800 rounded-3xl p-5 items-center mb-4">
                  <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    Profit
                  </Text>
                  <Text className="text-emerald-400 text-4xl font-extrabold mt-1">
                    {APP_CONFIG.currencySymbol}10,000
                  </Text>
                </View>

                {/* Summary Boxes */}
                <View className="flex-row justify-between">
                  {/* Left Box: Total Income */}
                  <View className="w-[48%] bg-slate-800 rounded-2xl p-4 border border-slate-700/30">
                    <Text className="text-slate-400 text-xs font-medium">
                      Total Income
                    </Text>
                    <Text className="text-emerald-500 text-lg font-bold mt-1">
                      {APP_CONFIG.currencySymbol}15,000
                    </Text>
                  </View>

                  {/* Right Box: Total Expenses */}
                  <View className="w-[48%] bg-slate-800 rounded-2xl p-4 border border-slate-700/30">
                    <Text className="text-slate-400 text-xs font-medium">
                      Total Expenses
                    </Text>
                    <Text className="text-rose-500 text-lg font-bold mt-1">
                      {APP_CONFIG.currencySymbol}5,000
                    </Text>
                  </View>
                </View>
              </View>

              {/* Lower Section (Thumb-Optimized Interaction) */}
              <View className="flex-1 justify-end pb-4">
                {/* Amount Input */}
                <View className="mb-5">
                  <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Amount ({APP_CONFIG.currencySymbol})
                  </Text>
                  <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor="#64748B"
                    keyboardType="decimal-pad"
                    className="bg-slate-800 text-slate-100 px-4 py-4 rounded-2xl text-xl font-bold border border-slate-700/50"
                  />
                </View>

                {/* Quick Action Toggles */}
                <View className="flex-row bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/50 mb-5">
                  <Pressable
                    onPress={() => {
                      setActiveTab("spent");
                      setSelectedCategory(null);
                    }}
                    className={`flex-1 py-3.5 rounded-xl items-center justify-center transition-all ${
                      activeTab === "spent"
                        ? "bg-slate-700 border border-slate-600/50"
                        : "bg-transparent"
                    }`}
                  >
                    <Text
                      className={`font-semibold text-sm ${
                        activeTab === "spent"
                          ? "text-emerald-400"
                          : "text-slate-400"
                      }`}
                    >
                      Spent
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setActiveTab("income");
                      setSelectedCategory(null);
                    }}
                    className={`flex-1 py-3.5 rounded-xl items-center justify-center transition-all ${
                      activeTab === "income"
                        ? "bg-emerald-500"
                        : "bg-transparent"
                    }`}
                  >
                    <Text
                      className={`font-semibold text-sm ${
                        activeTab === "income"
                          ? "text-slate-950"
                          : "text-slate-400"
                      }`}
                    >
                      Income
                    </Text>
                  </Pressable>
                </View>

                {/* Quick Add Grid */}
                <View className="mb-6">
                  <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                    Select Category
                  </Text>
                  <View className="flex-row flex-wrap justify-between">
                    {categories.map((category) => {
                      const isActive = selectedCategory === category.id;
                      return (
                        <Pressable
                          key={category.id}
                          onPress={() => setSelectedCategory(category.id)}
                          className={`w-[48%] mb-3 flex-row items-center p-4 rounded-2xl border transition-all ${
                            isActive
                              ? "bg-emerald-500/10 border-emerald-400"
                              : "bg-slate-800 border-slate-700/50"
                          }`}
                        >
                          <Text className="text-2xl mr-3">{category.icon}</Text>
                          <Text
                            className={`font-semibold text-sm ${
                              isActive ? "text-emerald-400" : "text-slate-200"
                            }`}
                          >
                            {category.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Log Button */}
                <Pressable
                  onPress={handleLogTransaction}
                  className="w-full bg-emerald-500 active:bg-emerald-600 py-4 rounded-2xl items-center justify-center shadow-lg shadow-emerald-500/10"
                >
                  <Text className="text-slate-950 font-bold text-base">
                    {activeTab === "spent" ? "Log Expense" : "Log Income"}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaView>
  );
}
