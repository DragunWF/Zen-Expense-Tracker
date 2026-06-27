import { db } from "../core/database";
import { categories, transactions } from "./schema";
import { eq, desc } from "drizzle-orm";
import { Category, Transaction } from "./types";

export const ExpenseRepository = {
  // Fetch all categories, optionally filtered by type
  async getCategories(type?: "income" | "expense"): Promise<Category[]> {
    let result = await db.select().from(categories);

    // Seed default categories if none exist
    if (result.length === 0) {
      const defaultCategories: Omit<Category, "id">[] = [
        // Expense Categories
        { name: "Food", icon: "🍔", type: "expense" },
        { name: "Transport", icon: "🚗", type: "expense" },
        { name: "Utilities", icon: "⚡", type: "expense" },
        { name: "Entertainment", icon: "🎬", type: "expense" },
        { name: "Shopping", icon: "🛍️", type: "expense" },
        { name: "Health", icon: "💊", type: "expense" },

        // Income Categories
        { name: "Salary", icon: "💼", type: "income" },
        { name: "Freelance", icon: "💻", type: "income" },
        { name: "Investments", icon: "📈", type: "income" },
        { name: "Gifts", icon: "🎁", type: "income" },
        { name: "Side Hustle", icon: "🚀", type: "income" },
        { name: "Rental", icon: "🏠", type: "income" },
      ];

      await db.insert(categories).values(defaultCategories);
      result = await db.select().from(categories);
    }

    if (type) {
      return result.filter((cat) => cat.type === type);
    }
    return result;
  },

  // Insert a new category
  async insertCategory(category: Omit<Category, "id">): Promise<Category> {
    const [inserted] = await db.insert(categories).values(category).returning();
    return inserted;
  },

  // Fetch all transactions ordered by date/createdAt descending
  async getTransactions(): Promise<Transaction[]> {
    return db.select().from(transactions).orderBy(desc(transactions.createdAt));
  },

  // Insert a new transaction
  async insertTransaction(
    tx: Omit<Transaction, "id" | "createdAt">,
  ): Promise<Transaction> {
    const [inserted] = await db
      .insert(transactions)
      .values({
        amount: tx.amount,
        type: tx.type,
        notes: tx.notes,
        categoryId: tx.categoryId,
      })
      .returning();
    return inserted;
  },
};
