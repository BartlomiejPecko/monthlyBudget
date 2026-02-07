import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Account, AccountRequest,
  Category, CategoryRequest,
  Expense, ExpenseRequest,
  Goal, GoalRequest,
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly BASE = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // --- Accounts ---
  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.BASE}/accounts`);
  }
  createAccount(req: AccountRequest): Observable<Account> {
    return this.http.post<Account>(`${this.BASE}/accounts`, req);
  }
  updateAccount(id: number, req: AccountRequest): Observable<Account> {
    return this.http.put<Account>(`${this.BASE}/accounts/${id}`, req);
  }
  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/accounts/${id}`);
  }

  // --- Categories ---
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.BASE}/categories`);
  }
  createCategory(req: CategoryRequest): Observable<Category> {
    return this.http.post<Category>(`${this.BASE}/categories`, req);
  }
  updateCategory(id: number, req: CategoryRequest): Observable<Category> {
    return this.http.put<Category>(`${this.BASE}/categories/${id}`, req);
  }
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/categories/${id}`);
  }

  // --- Expenses ---
  getExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.BASE}/expenses`);
  }
  createExpense(req: ExpenseRequest): Observable<Expense> {
    return this.http.post<Expense>(`${this.BASE}/expenses`, req);
  }
  updateExpense(id: number, req: ExpenseRequest): Observable<Expense> {
    return this.http.put<Expense>(`${this.BASE}/expenses/${id}`, req);
  }
  deleteExpense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/expenses/${id}`);
  }

  // --- Goals ---
  getGoals(): Observable<Goal[]> {
    return this.http.get<Goal[]>(`${this.BASE}/goals`);
  }
  createGoal(req: GoalRequest): Observable<Goal> {
    return this.http.post<Goal>(`${this.BASE}/goals`, req);
  }
  updateGoal(id: number, req: GoalRequest): Observable<Goal> {
    return this.http.put<Goal>(`${this.BASE}/goals/${id}`, req);
  }
  deleteGoal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/goals/${id}`);
  }
}