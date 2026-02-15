export interface Income {
  id: number;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
  accountId: number;
  accountName: string;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
}

export interface IncomeRequest {
  amount: number;
  description?: string;
  date: string;
  accountId: number;
  categoryId?: number;
}