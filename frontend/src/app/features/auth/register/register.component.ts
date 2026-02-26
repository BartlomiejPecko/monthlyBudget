import { Component, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

import { TranslatePipe } from '../../../core/pipes/translate.pipe';   
import { GoogleSigninComponent } from '../../../shared/components/google-signin/google-signin.component';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslatePipe, GoogleSigninComponent],
  template: `
    <div class="auth-page">
      <div class="auth-left">
        <div class="brand-pattern"></div>
        <div class="brand-content">
          <h1 class="brand-title">monthlyBudget<span>.app</span></h1>
          <p class="brand-sub">{{ 'auth.brand_sub_register' | t }}</p>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-form-wrapper">
          <h2>{{ 'auth.register.title' | t }}</h2>
          <p class="subtitle">{{ 'auth.register.subtitle' | t }}</p>

          @if (error()) {
            <div class="error-msg">{{ error() }}</div>
          }

          <app-google-signin (credentialReceived)="onGoogleLogin($event)" />

          @if (googleError()) {
            <div class="error-msg" style="margin-top: 12px">{{ googleError() }}</div>
          }

          <div class="divider">
            <span>{{ 'auth.or' | t }}</span>
          </div>
          <div class="form-disabled-wrapper">
            <div class="disabled-badge">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" stroke-width="2.2" width="16" height="16">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              Tymczasowo niedostępne
            </div>

            <div class="auth-form disabled-form">
              <div class="field">
                <label>{{ 'auth.register.email' | t }}</label>
                <input type="email" placeholder="email@example.com" disabled />
              </div>

              <div class="field">
                <label>{{ 'auth.register.password' | t }}</label>
                <input type="password" placeholder="Min. 8 znaków, Aa1@" disabled />
                <span class="field-hint">8-36 znaków, wielka i mała litera, cyfra, znak specjalny</span>
              </div>

              <div class="field">
                <label>{{ 'auth.register.confirm_password' | t }}</label>
                <input type="password" placeholder="••••••••" disabled />
              </div>

              <button type="button" class="btn-primary" disabled>
                {{ 'auth.register.submit' | t }}
              </button>
            </div>
          </div>

          <p class="switch-link">{{ 'auth.register.has_account' | t }} 
            <a routerLink="/login">{{ 'auth.register.login_link' | t }}</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display: flex; min-height: 100vh; }

    .auth-left {
      flex: 1; background: var(--green); position: relative;
      overflow: hidden; display: flex; align-items: flex-end; padding: 60px;
    }

    .brand-pattern {
      position: absolute; inset: 0;
      background:
        radial-gradient(circle at 30% 40%, rgba(255,255,255,0.12) 0%, transparent 50%),
        radial-gradient(circle at 70% 70%, rgba(0,0,0,0.08) 0%, transparent 40%);
    }
    .brand-content { position: relative; z-index: 1; }
    .brand-title {
      font-family: var(--font-display); font-size: 48px; color: white; margin-bottom: 12px;
      span { opacity: 0.5; }
    }
    .brand-sub { font-size: 18px; color: rgba(255,255,255,0.8); line-height: 1.6; }

    .auth-right {
      flex: 1; display: flex; align-items: center;
      justify-content: center; padding: 40px; background: var(--bg);
    }
    .auth-form-wrapper { width: 100%; max-width: 400px; }

    h2 { font-family: var(--font-display); font-size: 32px; margin-bottom: 8px; }
    .subtitle { color: var(--text-muted); font-size: 14px; margin-bottom: 32px; }

    .error-msg {
      background: rgba(224,122,95,0.12); color: var(--accent);
      padding: 12px 16px; border-radius: 10px; font-size: 13px; margin-bottom: 20px;
    }

    .auth-form { display: flex; flex-direction: column; gap: 20px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    label { font-size: 13px; font-weight: 500; color: var(--text-muted); }

    .field-hint {
      font-size: 11px;
      color: var(--text-dim);
      margin-top: 2px;
    }

    input {
      padding: 14px 16px; border-radius: 12px; border: 1px solid var(--border);
      background: var(--bg-input); color: var(--text); font-size: 14px;
      outline: none; transition: border-color 0.2s;
      &::placeholder { color: var(--text-dim); }
      &:focus { border-color: var(--green); }
    }

    .btn-primary {
      padding: 14px; border: none; border-radius: 12px; background: var(--green);
      color: white; font-size: 15px; font-weight: 600; cursor: pointer;
      transition: opacity 0.2s, transform 0.1s;
      box-shadow: 0 4px 16px rgba(129,178,154,0.3); margin-top: 4px;
      &:hover { opacity: 0.9; }
      &:active { transform: scale(0.98); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .divider {
      display: flex;
      align-items: center;
      margin: 24px 0;
      gap: 16px;

      &::before, &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--border);
      }

      span {
        font-size: 13px;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    .switch-link {
      text-align: center; margin-top: 28px; font-size: 14px; color: var(--text-muted);
      a { color: var(--green); font-weight: 600; &:hover { text-decoration: underline; } }
    }

    /* Disabled form overlay */
    .form-disabled-wrapper {
      position: relative;
      pointer-events: none;
      user-select: none;
    }

    .disabled-form {
      opacity: 0.35;
      filter: grayscale(30%);
    }

    .disabled-form input {
      background: var(--border);
      color: var(--text-dim);
      cursor: not-allowed;
    }

    .disabled-form .btn-primary {
      background: var(--border);
      color: var(--text-dim);
      box-shadow: none;
      cursor: not-allowed;
    }

    .disabled-badge {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-2deg);
      z-index: 5;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(6px);
      color: white;
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.3px;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      pointer-events: none;
    }

    @media (max-width: 768px) { .auth-left { display: none; } }
  `],
})
export class RegisterComponent {
  loading = signal(false);
  error = signal('');
  googleError = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  onGoogleLogin(credential: string) {
    this.loading.set(true);
    this.error.set('');
    this.googleError.set('');

    this.auth.googleLogin(credential).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.googleError.set(err.error?.message || 'Google login failed');
      },
    });
  }
}