import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "../models/schema";

const expoDb = openDatabaseSync("expense_log.db");
export const db = drizzle(expoDb, { schema });
