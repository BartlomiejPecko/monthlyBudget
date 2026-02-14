import { Component } from '@angular/core';

import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <nav class="sidebar">
        <div class="logo">monthlyBudget<span>.app</span></div>
    
        <div class="nav-links">
          @for (item of navItems; track item) {
            <a [routerLink]="item.path" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">{{ item.icon }}</span>
              {{ item.label }}
            </a>
          }
        </div>
    
        <div class="sidebar-bottom">
          <button class="nav-item" (click)="toggleTheme()">
            <span class="nav-icon">{{ theme.isDark() ? '☀' : '☾' }}</span>
            {{ theme.isDark() ? 'Tryb jasny' : 'Tryb ciemny' }}
          </button>
    
          <div class="user-card">
            <div class="user-label">Zalogowany jako</div>
            <div class="user-email">{{ auth.email() }}</div>
          </div>
    
          <button class="nav-item logout" (click)="auth.logout()">
            <span class="nav-icon">⏻</span>
            Log out
          </button>
        </div>
      </nav>
    
      <main class="content">
        <router-outlet />
      </main>
    </div>
    `,
  styles: [`
    .shell {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 240px;
      background: var(--bg-nav);
      border-right: 1px solid var(--border);
      padding: 32px 16px;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
    }

    .logo {
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 700;
      color: var(--accent);
      padding: 0 16px 28px;
      letter-spacing: -0.5px;

      span { opacity: 0.4; }
    }

    .nav-links {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border: none;
      border-radius: 12px;
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 14px;
      font-weight: 400;
      font-family: inherit;
      text-align: left;
      transition: all 0.2s;
      width: 100%;

      &:hover {
        background: var(--hover);
        color: var(--text);
      }

      &.active {
        background: var(--accent-soft);
        color: var(--accent);
        font-weight: 600;
      }
    }

    .nav-icon {
      font-size: 16px;
      width: 20px;
      text-align: center;
    }

    .sidebar-bottom {
      margin-top: auto;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .user-card {
      padding: 16px;
      border-radius: 14px;
      background: var(--accent-soft);
      margin: 8px 0;
    }

    .user-label {
      font-size: 11px;
      color: var(--text-muted);
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .user-email {
      font-size: 13px;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .logout {
      color: var(--accent);
      &:hover { background: var(--accent-soft); }
    }

    .content {
      flex: 1;
      padding: 32px 40px;
      overflow-y: auto;
      max-height: 100vh;
    }

    @media (max-width: 768px) {
      .sidebar { display: none; }
      .content { padding: 20px; }
    }
  `],
})
export class ShellComponent {
  navItems = [
    { path: '/dashboard', icon: '◉', label: 'Dashboard' },
    { path: '/expenses', icon: '↗', label: 'Expenses' },
    { path: '/accounts', icon: '◎', label: 'Accounts' },
    { path: '/categories', icon: '▦', label: 'Categories' },
    { path: '/goals', icon: '◈', label: 'Goals' },
  ];

  constructor(
    public auth: AuthService,
    public theme: ThemeService,
  ) {}

  toggleTheme() {
    this.theme.toggle();
  }
}