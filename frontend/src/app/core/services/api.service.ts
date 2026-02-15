import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account, AccountRequest } from '../models/account.model';
import { Category, CategoryRequest } from '../models/category.model';
import { Expense, ExpenseRequest } from '../models/expense.model';
import { Goal, GoalRequest } from '../models/goal.model';
import { Income, IncomeRequest } from '../models/income.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  //private base = 'http://localhost:8080/api';
  private base = '/api';
  constructor(private http: HttpClient) {}

  // ─── Accounts ──────────────────────────
  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.base}/accounts`);
  }

  getAccount(id: number): Observable<Account> {
    return this.http.get<Account>(`${this.base}/accounts/${id}`);
  }

  createAccount(req: AccountRequest): Observable<Account> {
    return this.http.post<Account>(`${this.base}/accounts`, req);
  }

  updateAccount(id: number, req: AccountRequest): Observable<Account> {
    return this.http.put<Account>(`${this.base}/accounts/${id}`, req);
  }

  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/accounts/${id}`);
  }

  // ─── Categories ────────────────────────
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.base}/categories`);
  }

  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.base}/categories/${id}`);
  }

  createCategory(req: CategoryRequest): Observable<Category> {
    return this.http.post<Category>(`${this.base}/categories`, req);
  }

  updateCategory(id: number, req: CategoryRequest): Observable<Category> {
    return this.http.put<Category>(`${this.base}/categories/${id}`, req);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/categories/${id}`);
  }

  // ─── Expenses ──────────────────────────
  getExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.base}/expenses`);
  }

  getExpense(id: number): Observable<Expense> {
    return this.http.get<Expense>(`${this.base}/expenses/${id}`);
  }

  createExpense(req: ExpenseRequest): Observable<Expense> {
    return this.http.post<Expense>(`${this.base}/expenses`, req);
  }

  updateExpense(id: number, req: ExpenseRequest): Observable<Expense> {
    return this.http.put<Expense>(`${this.base}/expenses/${id}`, req);
  }

  deleteExpense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/expenses/${id}`);
  }

  // ─── Goals ─────────────────────────────
  getGoals(): Observable<Goal[]> {
    return this.http.get<Goal[]>(`${this.base}/goals`);
  }

  getGoal(id: number): Observable<Goal> {
    return this.http.get<Goal>(`${this.base}/goals/${id}`);
  }

  createGoal(req: GoalRequest): Observable<Goal> {
    return this.http.post<Goal>(`${this.base}/goals`, req);
  }

  updateGoal(id: number, req: GoalRequest): Observable<Goal> {
    return this.http.put<Goal>(`${this.base}/goals/${id}`, req);
  }

  deleteGoal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/goals/${id}`);
  }

  getIncomes(): Observable<Income[]> {
    return this.http.get<Income[]>(`${this.base}/incomes`);
  }

  getIncome(id: number): Observable<Income> {
    return this.http.get<Income>(`${this.base}/incomes/${id}`);
  }

  createIncome(req: IncomeRequest): Observable<Income> {
    return this.http.post<Income>(`${this.base}/incomes`, req);
  }

  updateIncome(id: number, req: IncomeRequest): Observable<Income> {
    return this.http.put<Income>(`${this.base}/incomes/${id}`, req);
  }

  deleteIncome(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/incomes/${id}`);
  }
}
