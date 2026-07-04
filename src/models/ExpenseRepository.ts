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
        { name: "Transportation", icon: "🚗", type: "expense" },
        { name: "Other", icon: "📦", type: "expense" },

        // Income Categories
        { name: "Salary", icon: "💼", type: "income" },
        { name: "Allowance", icon: "💵", type: "income" },
        { name: "Bonus", icon: "🎁", type: "income" },
        { name: "Other", icon: "📦", type: "income" },
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

  // Delete a category and fallback its transactions to "Other"
  async deleteCategory(categoryId: number): Promise<void> {
    const allCategories = await db.select().from(categories);
    const targetCategory = allCategories.find((c) => c.id === categoryId);

    if (!targetCategory) {
      throw new Error("Category not found");
    }

    // Do not allow deleting the 'Other' category
    if (targetCategory.name === "Other") {
      throw new Error("Cannot delete the default 'Other' category");
    }

    // Find the default "Other" category for the matching type
    let fallbackCategory = allCategories.find(
      (c) => c.name === "Other" && c.type === targetCategory.type,
    );

    // If it somehow doesn't exist, create it on the fly
    if (!fallbackCategory) {
      const [inserted] = await db
        .insert(categories)
        .values({ name: "Other", icon: "📦", type: targetCategory.type })
        .returning();
      fallbackCategory = inserted;
    }

    // Run delete transaction
    await db.transaction(async (tx) => {
      // 1. Move all orphaned transactions to the fallback category
      await tx
        .update(transactions)
        .set({ categoryId: fallbackCategory!.id })
        .where(eq(transactions.categoryId, categoryId));

      // 2. Delete the actual category
      await tx.delete(categories).where(eq(categories.id, categoryId));
    });
  },

  async updateCategory(id: number, name: string, icon: string): Promise<void> {
    await db
      .update(categories)
      .set({ name, icon })
      .where(eq(categories.id, id));
  },

  // Delete a single transaction by its ID
  async deleteTransaction(transactionId: number): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, transactionId));
  },

  // Export: return raw rows for serialization
  async exportData(): Promise<{
    categories: Category[];
    transactions: Transaction[];
  }> {
    const cats = await db.select().from(categories);
    const txs = await db.select().from(transactions);
    return { categories: cats, transactions: txs };
  },

  // Import: atomically wipe and rewrite both tables preserving original IDs
  async importData(cats: Category[], txs: Transaction[]): Promise<void> {
    await db.transaction(async (trx) => {
      // Wipe in dependency order (transactions reference categories)
      await trx.delete(transactions);
      await trx.delete(categories);
      if (cats.length > 0) await trx.insert(categories).values(cats);
      if (txs.length > 0) await trx.insert(transactions).values(txs);
    });
  },

  // Reset: wipe all data and re-seed default categories
  async resetDatabase(): Promise<void> {
    const defaultCategories: Omit<Category, "id">[] = [
      // Expense Categories
      { name: "Food", icon: "🍔", type: "expense" },
      { name: "Transportation", icon: "🚗", type: "expense" },
      { name: "Other", icon: "📦", type: "expense" },

      // Income Categories
      { name: "Salary", icon: "💼", type: "income" },
      { name: "Allowance", icon: "💵", type: "income" },
      { name: "Bonus", icon: "🎁", type: "income" },
      { name: "Other", icon: "📦", type: "income" },
    ];

    await db.transaction(async (trx) => {
      await trx.delete(transactions);
      await trx.delete(categories);
      await trx.insert(categories).values(defaultCategories);
    });
  },
};
