export interface Account {
  id: number;
  name: string;
  initialBalance: number;
  currentBalance: number;
}

export interface AccountRequest {
  name: string;
  initialBalance: number;
}