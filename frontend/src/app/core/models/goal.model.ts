export interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  categoryId: number;
  categoryName: string;
  progressPercentage: number;
}

export interface GoalRequest {
  name: string;
  targetAmount: number;
  deadline?: string;
  categoryId?: number;
}