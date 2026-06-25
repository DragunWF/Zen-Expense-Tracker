import { Category, Transaction } from "./types";

// In-memory mock database store persisting for the lifecycle of the application run
let mockCategories: Category[] = [
  // Expense Categories
  { id: 1, name: "Food", icon: "🍔", type: "expense" },
  { id: 2, name: "Transport", icon: "🚗", type: "expense" },
  { id: 3, name: "Utilities", icon: "⚡", type: "expense" },
  { id: 4, name: "Entertainment", icon: "🎬", type: "expense" },
  { id: 5, name: "Shopping", icon: "🛍️", type: "expense" },
  { id: 6, name: "Health", icon: "💊", type: "expense" },

  // Income Categories
  { id: 7, name: "Salary", icon: "💼", type: "income" },
  { id: 8, name: "Freelance", icon: "💻", type: "income" },
  { id: 9, name: "Investments", icon: "📈", type: "income" },
  { id: 10, name: "Gifts", icon: "🎁", type: "income" },
  { id: 11, name: "Side Hustle", icon: "🚀", type: "income" },
  { id: 12, name: "Rental", icon: "🏠", type: "income" },
];

let mockTransactions: Transaction[] = [
  {
    id: 1,
    amount: 15000,
    type: "income",
    notes: "Initial salary payment",
    categoryId: 7, // Salary
    createdAt: "2026-06-20T00:00:00.000Z",
  },
  {
    id: 2,
    amount: 3000,
    type: "expense",
    notes: "Grocery run",
    categoryId: 1, // Food
    createdAt: "2026-06-22T00:00:00.000Z",
  },
  {
    id: 3,
    amount: 2000,
    type: "expense",
    notes: "Gas refill",
    categoryId: 2, // Transport
    createdAt: "2026-06-24T00:00:00.000Z",
  },
];

export const ExpenseRepository = {
  // Fetch all categories, optionally filtered by type
  async getCategories(type?: "income" | "expense"): Promise<Category[]> {
    // Simulate database delay
    await new Promise((resolve) => setTimeout(resolve, 50));
    if (type) {
      return mockCategories.filter((cat) => cat.type === type);
    }
    return [...mockCategories];
  },

  // Insert a new category
  async insertCategory(category: Omit<Category, "id">): Promise<Category> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const nextId =
      mockCategories.length > 0
        ? Math.max(...mockCategories.map((c) => c.id)) + 1
        : 1;
    const newCategory: Category = {
      ...category,
      id: nextId,
    };
    mockCategories.push(newCategory);
    return newCategory;
  },

  // Fetch all transactions ordered by date descending
  async getTransactions(): Promise<Transaction[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    // Sort descending by date
    return [...mockTransactions].sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
    );
  },

  // Insert a new transaction
  async insertTransaction(
    tx: Omit<Transaction, "id" | "createdAt">
  ): Promise<Transaction> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const nextId =
      mockTransactions.length > 0
        ? Math.max(...mockTransactions.map((t) => t.id)) + 1
        : 1;
    const newTx: Transaction = {
      ...tx,
      id: nextId,
      createdAt: new Date().toISOString(),
    };
    mockTransactions.push(newTx);
    return newTx;
  },
};
