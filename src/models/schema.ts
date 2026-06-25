import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// --- CATEGORIES TABLE ---
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
});

// --- EXPENSES (TRANSACTIONS) TABLE ---
export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  amount: real("amount").notNull(),
  categoryId: integer("category_id")
    .references(() => categories.id)
    .notNull(),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
