export interface Category {
  id: number;
  name: string;
  icon: string;
  type: "income" | "expense";
}

export interface Transaction {
  id: number;
  amount: number;
  type: "income" | "expense";
  notes: string | null;
  categoryId: number;
  createdAt: string;
}

export interface MappedTransaction {
  id: string;
  emoji: string;
  category: string;
  type: "spent" | "income";
  amount: number;
  date: Date;
}

export interface UserPreference {
  key: string;
  value: string;
}

export interface HomePreferences {
  activeDateFilter: "today" | "last_7_days" | "month" | "year" | "all_time";
  isProfitHidden: boolean;
  isIncomeHidden: boolean;
  isExpensesHidden: boolean;
}
