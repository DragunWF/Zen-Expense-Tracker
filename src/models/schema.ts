import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// --- CATEGORIES TABLE ---
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
});

// --- TRANSACTIONS TABLE ---
export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  amount: real("amount").notNull(),

  // Classifies whether the flow of money is coming in or going out
  type: text("type", { enum: ["income", "expense"] }).notNull(),

  // Optional text notes column for transaction specifics
  notes: text("notes"),

  categoryId: integer("category_id")
    .references(() => categories.id)
    .notNull(),

  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
