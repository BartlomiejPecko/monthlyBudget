import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  //private readonly API = 'http://localhost:8080/api/auth';
  private readonly API = '/api/auth';
  private readonly TOKEN_KEY = 'budget_token';
  private readonly EMAIL_KEY = 'budget_email';

  private _isLoggedIn = signal(this.hasToken());
  private _email = signal(localStorage.getItem(this.EMAIL_KEY) || '');

  isLoggedIn = this._isLoggedIn.asReadonly();
  email = this._email.asReadonly();

  constructor(private http: HttpClient, private router: Router) {}

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, req).pipe(
      tap(res => this.handleAuth(res))
    );
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register`, req).pipe(
      tap(res => this.handleAuth(res))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.EMAIL_KEY);
    this._isLoggedIn.set(false);
    this._email.set('');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private handleAuth(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.EMAIL_KEY, res.email);
    this._isLoggedIn.set(true);
    this._email.set(res.email);
  }
}