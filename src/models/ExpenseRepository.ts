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

        // System Default Fallbacks
        { name: "Other", icon: "📦", type: "expense" },
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
};
