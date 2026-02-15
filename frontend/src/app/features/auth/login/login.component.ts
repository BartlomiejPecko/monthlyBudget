import { Component, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

import { TranslatePipe } from '../../../core/pipes/translate.pipe';   
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="auth-page">
      <div class="auth-left">
        <div class="brand-pattern"></div>
        <div class="brand-content">
          <h1 class="brand-title">monthlyBudget<span>.app</span></h1>
          <p class="brand-sub">{{ 'auth.brand_sub_login' | t }}</p>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-form-wrapper">
          <h2>{{ 'auth.login.title' | t }}</h2>
          <p class="subtitle">{{ 'auth.login.subtitle' | t }}</p>

          @if (error()) {
            <div class="error-msg">{{ error() }}</div>
          }

          <form (ngSubmit)="onSubmit()" class="auth-form">
            <div class="field">
              <label for="email">{{ 'auth.login.email' | t }}</label>
              <input
                id="email"
                type="email"
                [(ngModel)]="email"
                name="email"
                placeholder="jan@example.com"
                required
              />
            </div>

            <div class="field">
              <label for="email">{{ 'auth.login.email' | t }}</label>
              <input
                id="password"
                type="password"
                [(ngModel)]="password"
                name="password"
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" class="btn-primary" [disabled]="loading()">
              {{ (loading() ? 'auth.login.loading' : 'auth.login.submit') | t  }}
            </button>
          </form>

          <p class="switch-link">{{ 'auth.login.no_account' | t }} 
          <a routerLink="/register">{{ 'auth.login.register_link' | t }}</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      min-height: 100vh;
    }

    .auth-left {
      flex: 1;
      background: var(--accent);
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: flex-end;
      padding: 60px;
    }

    .brand-pattern {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 40%),
        radial-gradient(circle at 60% 80%, rgba(0,0,0,0.1) 0%, transparent 40%);
    }

    .brand-content {
      position: relative;
      z-index: 1;
    }

    .brand-title {
      font-family: var(--font-display);
      font-size: 48px;
      color: white;
      margin-bottom: 12px;

      span { opacity: 0.5; }
    }

    .brand-sub {
      font-size: 18px;
      color: rgba(255,255,255,0.8);
      line-height: 1.6;
    }

    .auth-right {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      background: var(--bg);
    }

    .auth-form-wrapper {
      width: 100%;
      max-width: 400px;
    }

    h2 {
      font-family: var(--font-display);
      font-size: 32px;
      margin-bottom: 8px;
    }

    .subtitle {
      color: var(--text-muted);
      font-size: 14px;
      margin-bottom: 32px;
    }

    .error-msg {
      background: rgba(224, 122, 95, 0.12);
      color: var(--accent);
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 13px;
      margin-bottom: 20px;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-muted);
    }

    input {
      padding: 14px 16px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: var(--bg-input);
      color: var(--text);
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;

      &::placeholder { color: var(--text-dim); }
      &:focus { border-color: var(--accent); }
    }

    .btn-primary {
      padding: 14px;
      border: none;
      border-radius: 12px;
      background: var(--accent);
      color: white;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.1s;
      box-shadow: 0 4px 16px var(--accent-shadow);
      margin-top: 4px;

      &:hover { opacity: 0.9; }
      &:active { transform: scale(0.98); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .switch-link {
      text-align: center;
      margin-top: 28px;
      font-size: 14px;
      color: var(--text-muted);

      a {
        color: var(--accent);
        font-weight: 600;
        &:hover { text-decoration: underline; }
      }
    }

    @media (max-width: 768px) {
      .auth-left { display: none; }
    }
  `],
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.loading.set(true);
    this.error.set('');

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Nieprawidłowy email lub hasło');
      },
    });
  }
}