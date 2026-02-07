export interface Expense {
  id: number;
  amount: number;
  description: string;
  date: string;
  isReturn: boolean;
  createdAt: string;
  accountId: number;
  accountName: string;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
}

export interface ExpenseRequest {
  amount: number;
  description?: string;
  date: string;
  isReturn?: boolean;
  accountId: number;
  categoryId: number;
}