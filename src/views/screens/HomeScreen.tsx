import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { APP_CONFIG } from "../../core/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TransactionType = "spent" | "income";

interface Category {
  id: string;
  emoji: string;
  name: string;
}

interface MockTransaction {
  id: string;
  emoji: string;
  category: string;
  type: TransactionType;
  amount: number;
  date: Date;
}

// ---------------------------------------------------------------------------
// Initial mock data
// ---------------------------------------------------------------------------

const INITIAL_SPENT_CATEGORIES: Category[] = [
  { id: "food", emoji: "🍔", name: "Food" },
  { id: "transport", emoji: "🚗", name: "Transport" },
  { id: "utilities", emoji: "⚡", name: "Utilities" },
  { id: "entertainment", emoji: "🎬", name: "Entertainment" },
  { id: "shopping", emoji: "🛍️", name: "Shopping" },
  { id: "health", emoji: "💊", name: "Health" },
];

const INITIAL_INCOME_CATEGORIES: Category[] = [
  { id: "salary", emoji: "💼", name: "Salary" },
  { id: "freelance", emoji: "💻", name: "Freelance" },
  { id: "investments", emoji: "📈", name: "Investments" },
  { id: "gifts", emoji: "🎁", name: "Gifts" },
  { id: "side_hustle", emoji: "🚀", name: "Side Hustle" },
  { id: "rental", emoji: "🏠", name: "Rental" },
];

const INITIAL_TRANSACTIONS: MockTransaction[] = [
  {
    id: "seed_1",
    emoji: "💼",
    category: "Salary",
    type: "income",
    amount: 15000,
    date: new Date("2026-06-20"),
  },
  {
    id: "seed_2",
    emoji: "🍔",
    category: "Food",
    type: "spent",
    amount: 3000,
    date: new Date("2026-06-22"),
  },
  {
    id: "seed_3",
    emoji: "🚗",
    category: "Transport",
    type: "spent",
    amount: 2000,
    date: new Date("2026-06-24"),
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatAmount(value: number): string {
  return value.toLocaleString("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

// ---------------------------------------------------------------------------
// Screen Component
// ---------------------------------------------------------------------------

export default function HomeScreen() {
  // ── Dashboard aggregates ──────────────────────────────────────────────────
  const [totalIncome, setTotalIncome] = useState<number>(15000);
  const [totalExpenses, setTotalExpenses] = useState<number>(5000);
  const [transactions, setTransactions] =
    useState<MockTransaction[]>(INITIAL_TRANSACTIONS);

  // ── Modal visibility & step ───────────────────────────────────────────────
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);

  // ── Step 1: amount & type ─────────────────────────────────────────────────
  const [amount, setAmount] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TransactionType>("spent");

  // ── Step 2: category lists (mutable to allow custom additions) ────────────
  const [spentCategories, setSpentCategories] = useState<Category[]>(
    INITIAL_SPENT_CATEGORIES,
  );
  const [incomeCategories, setIncomeCategories] = useState<Category[]>(
    INITIAL_INCOME_CATEGORIES,
  );

  // ── Inline category creator ───────────────────────────────────────────────
  const [showNewCatInput, setShowNewCatInput] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>("");

  // ── Derived ───────────────────────────────────────────────────────────────
  const netProfit = useMemo(
    () => totalIncome - totalExpenses,
    [totalIncome, totalExpenses],
  );

  const currentCategories: Category[] =
    activeTab === "spent" ? spentCategories : incomeCategories;

  const parsedAmount = parseFloat(amount.replace(/,/g, ""));
  const amountIsValid = !isNaN(parsedAmount) && parsedAmount > 0;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const openModal = useCallback(() => {
    setAmount("");
    setModalStep(1);
    setShowNewCatInput(false);
    setNewCategoryName("");
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setShowNewCatInput(false);
    setNewCategoryName("");
  }, []);

  const handleTabChange = useCallback((tab: TransactionType) => {
    setActiveTab(tab);
    setShowNewCatInput(false);
    setNewCategoryName("");
  }, []);

  const handleAddCategory = useCallback(() => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    const newCat: Category = {
      id: `custom_${Date.now()}`,
      emoji: "📌",
      name: trimmed,
    };

    if (activeTab === "spent") {
      setSpentCategories((prev) => [...prev, newCat]);
    } else {
      setIncomeCategories((prev) => [...prev, newCat]);
    }

    setNewCategoryName("");
    setShowNewCatInput(false);
  }, [newCategoryName, activeTab]);

  const handleLogTransaction = useCallback(
    (category: Category) => {
      if (!amountIsValid) return;

      const newTx: MockTransaction = {
        id: `tx_${Date.now()}`,
        emoji: category.emoji,
        category: category.name,
        type: activeTab,
        amount: parsedAmount,
        date: new Date(),
      };

      setTransactions((prev) => [newTx, ...prev]);

      if (activeTab === "income") {
        setTotalIncome((prev) => prev + parsedAmount);
      } else {
        setTotalExpenses((prev) => prev + parsedAmount);
      }

      closeModal();
    },
    [amountIsValid, parsedAmount, activeTab, closeModal],
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar style="light" />

      {/* ─── Main scroll area + FAB container ─────────────────────────────── */}
      <View className="flex-1">
        <ScrollView
          className="flex-1 px-5"
          contentContainerClassName="pb-28 pt-4"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
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
            <View className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 items-center justify-center">
              <Text className="text-emerald-400 font-bold text-sm">EL</Text>
            </View>
          </View>

          {/* ── Top Section: Dashboard ─────────────────────────────────────── */}
          <View className="mb-6">
            {/* Net Profit Card */}
            <View className="bg-slate-800/50 border border-slate-700/40 rounded-3xl p-6 items-center mb-4">
              <Text className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
                Profit
              </Text>
              <Text className="text-emerald-400 text-5xl font-extrabold tracking-tight mt-1">
                {APP_CONFIG.currencySymbol}
                {formatAmount(netProfit)}
              </Text>
              <View className="h-px w-16 bg-emerald-500/30 mt-3" />
            </View>

            {/* Summary Cards */}
            <View className="flex-row justify-between">
              <View className="w-[48%] bg-slate-800 rounded-2xl p-4 border border-slate-700/40">
                <Text className="text-slate-400 text-xs font-medium mb-1">
                  Total Income
                </Text>
                <Text className="text-emerald-400 text-xl font-bold">
                  {APP_CONFIG.currencySymbol}
                  {formatAmount(totalIncome)}
                </Text>
              </View>
              <View className="w-[48%] bg-slate-800 rounded-2xl p-4 border border-slate-700/40">
                <Text className="text-slate-400 text-xs font-medium mb-1">
                  Total Expenses
                </Text>
                <Text className="text-rose-400 text-xl font-bold">
                  {APP_CONFIG.currencySymbol}
                  {formatAmount(totalExpenses)}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Middle Section: Mini-Ledger ───────────────────────────────── */}
          <View>
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">
              Recent Activity
            </Text>

            <View className="bg-slate-800/40 border border-slate-700/40 rounded-2xl overflow-hidden">
              {transactions.length === 0 ? (
                <View className="py-10 items-center">
                  <Text className="text-slate-500 text-sm">
                    No transactions yet.
                  </Text>
                </View>
              ) : (
                transactions.map((tx, index) => (
                  <View
                    key={tx.id}
                    className={`flex-row items-center px-4 py-3.5 ${
                      index < transactions.length - 1
                        ? "border-b border-slate-700/30"
                        : ""
                    }`}
                  >
                    {/* Emoji badge */}
                    <View className="h-10 w-10 rounded-full bg-slate-700/60 items-center justify-center mr-3">
                      <Text className="text-lg">{tx.emoji}</Text>
                    </View>

                    {/* Category + date */}
                    <View className="flex-1">
                      <Text className="text-slate-100 font-semibold text-sm">
                        {tx.category}
                      </Text>
                      <Text className="text-slate-500 text-xs mt-0.5">
                        {formatDate(tx.date)}
                      </Text>
                    </View>

                    {/* Amount */}
                    <Text
                      className={`font-bold text-sm ${
                        tx.type === "income"
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {APP_CONFIG.currencySymbol}
                      {formatAmount(tx.amount)}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>

        {/* ── FAB ──────────────────────────────────────────────────────────── */}
        <Pressable
          onPress={openModal}
          className="absolute bottom-24 right-10 h-14 w-14 rounded-full bg-slate-950 border border-slate-800/80 active:bg-slate-900 items-center justify-center shadow-lg shadow-black/50"
        >
          <Text className="text-emerald-500 text-4xl font-light leading-none mt-[-2px]">
            +
          </Text>
        </Pressable>
      </View>

      {/* ─── Two-Step Modal Overlay ─────────────────────────────────────────── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
        statusBarTranslucent
      >
        {/* Backdrop — tap to dismiss */}
        <Pressable
          className="flex-1 bg-black/60 justify-end"
          onPress={closeModal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            {/* Sheet — intercept press so tapping inside doesn't close modal */}
            <Pressable
              className="bg-slate-900 rounded-t-3xl px-5 pt-3 pb-10 border-t border-slate-700/50"
              onPress={() => {
                /* intentionally swallows backdrop press */
              }}
            >
              {/* Drag handle */}
              <View className="w-10 h-1 rounded-full bg-slate-700 self-center mb-5" />

              {/* ─────────────────────────────────────────────────────────── */}
              {/* STEP 1 — Amount & Type                                      */}
              {/* ─────────────────────────────────────────────────────────── */}
              {modalStep === 1 && (
                <View>
                  <Text className="text-slate-100 text-lg font-bold text-center mb-5">
                    Log Transaction
                  </Text>

                  {/* Segmented Control */}
                  <View className="flex-row bg-slate-800 p-1.5 rounded-2xl border border-slate-700/50 mb-6">
                    {/* Spent tab */}
                    <Pressable
                      onPress={() => handleTabChange("spent")}
                      className={`flex-1 py-3 rounded-xl items-center justify-center ${
                        activeTab === "spent"
                          ? "bg-slate-700 border border-slate-600"
                          : "bg-transparent"
                      }`}
                    >
                      <Text
                        className={`font-semibold text-sm ${
                          activeTab === "spent"
                            ? "text-rose-400"
                            : "text-slate-400"
                        }`}
                      >
                        Spent
                      </Text>
                    </Pressable>

                    {/* Income tab */}
                    <Pressable
                      onPress={() => handleTabChange("income")}
                      className={`flex-1 py-3 rounded-xl items-center justify-center ${
                        activeTab === "income"
                          ? "bg-emerald-500"
                          : "bg-transparent"
                      }`}
                    >
                      <Text
                        className={`font-semibold text-sm ${
                          activeTab === "income"
                            ? "text-slate-900"
                            : "text-slate-400"
                        }`}
                      >
                        Income
                      </Text>
                    </Pressable>
                  </View>

                  {/* Amount input */}
                  <View className="items-center mb-8">
                    <Text className="text-slate-500 text-sm font-medium mb-2">
                      Enter amount ({APP_CONFIG.currencySymbol})
                    </Text>
                    <TextInput
                      value={amount}
                      onChangeText={setAmount}
                      placeholder="0.00"
                      placeholderTextColor="#475569"
                      keyboardType="decimal-pad"
                      className="text-slate-100 text-5xl font-extrabold text-center w-full"
                    />
                  </View>

                  {/* Select Category CTA */}
                  <Pressable
                    onPress={() => {
                      if (amountIsValid) setModalStep(2);
                    }}
                    disabled={!amountIsValid}
                    className={`w-full py-4 rounded-2xl items-center justify-center ${
                      amountIsValid
                        ? "bg-emerald-500 active:bg-emerald-600"
                        : "bg-slate-800 opacity-50"
                    }`}
                  >
                    <Text
                      className={`font-bold text-base ${
                        amountIsValid ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      Select Category →
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* ─────────────────────────────────────────────────────────── */}
              {/* STEP 2 — Category Selector                                  */}
              {/* ─────────────────────────────────────────────────────────── */}
              {modalStep === 2 && (
                <View>
                  {/* Step 2 header */}
                  <View className="flex-row items-center mb-5">
                    <Pressable
                      onPress={() => setModalStep(1)}
                      className="h-8 w-8 rounded-full bg-slate-800 items-center justify-center mr-3"
                    >
                      <Text className="text-slate-300 text-base">←</Text>
                    </Pressable>
                    <Text className="text-slate-100 text-lg font-bold flex-1">
                      Select Category
                    </Text>
                    {/* Inline amount reminder */}
                    <Text className="text-emerald-400 font-bold text-sm">
                      {APP_CONFIG.currencySymbol}
                      {formatAmount(parsedAmount)}
                    </Text>
                  </View>

                  {/* Category Grid */}
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled
                  >
                    <View className="flex-row flex-wrap justify-between">
                      {/* Real categories */}
                      {currentCategories.map((cat) => (
                        <Pressable
                          key={cat.id}
                          onPress={() => handleLogTransaction(cat)}
                          className="w-[48%] mb-3 flex-row items-center p-3.5 rounded-2xl bg-slate-800 border border-slate-700/50 active:bg-emerald-500/20 active:border-emerald-500"
                        >
                          <Text className="text-xl mr-2.5">{cat.emoji}</Text>
                          <Text className="text-slate-200 font-semibold text-sm flex-1">
                            {cat.name}
                          </Text>
                        </Pressable>
                      ))}

                      {/* "+ Add New" dashed pill */}
                      <Pressable
                        onPress={() => setShowNewCatInput(true)}
                        className="w-[48%] mb-3 flex-row items-center justify-center p-3.5 rounded-2xl border border-dashed border-slate-600"
                      >
                        <Text className="text-slate-500 font-semibold text-sm">
                          + Add New
                        </Text>
                      </Pressable>
                    </View>

                    {/* Inline category creator */}
                    {showNewCatInput && (
                      <View className="flex-row items-center mt-1 mb-3 bg-slate-800 border border-slate-600 rounded-2xl px-4 py-3">
                        <Text className="text-base mr-2">📌</Text>
                        <TextInput
                          value={newCategoryName}
                          onChangeText={setNewCategoryName}
                          placeholder="Category name..."
                          placeholderTextColor="#64748B"
                          autoFocus
                          className="flex-1 text-slate-100 font-medium text-sm mr-3"
                          onSubmitEditing={handleAddCategory}
                          returnKeyType="done"
                        />
                        <Pressable
                          onPress={handleAddCategory}
                          className="bg-emerald-500 active:bg-emerald-600 px-4 py-2 rounded-xl"
                        >
                          <Text className="text-slate-900 font-bold text-sm">
                            Add
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </ScrollView>
                </View>
              )}
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
